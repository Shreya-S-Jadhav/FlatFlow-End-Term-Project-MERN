import Bill from '../models/Bill.js';
import Flat from '../models/Flat.js';

// Helper: Formats month string to readable name (e.g. "2026-10" -> "October 2026")
const formatPeriodName = (periodStr) => {
  if (!periodStr || !periodStr.includes('-')) return periodStr;
  const [year, month] = periodStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// @desc    Generate a single maintenance bill for a specific flat
// @route   POST /api/bills/admin/generate-single
// @access  Private (Admin only)
export const generateSingleBill = async (req, res, next) => {
  try {
    const { flatId, billingPeriod, dueDate, adjustments, adjustmentReason, notes } = req.body;

    if (!flatId || !billingPeriod || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Flat, billing period (YYYY-MM), and due date are required.',
      });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: 'Selected flat record not found.',
      });
    }

    // Check for existing bill in this billing period
    const existingBill = await Bill.findOne({ flat: flatId, billingPeriod: billingPeriod.trim() });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: `A maintenance bill for Flat ${flat.wing}-${flat.flatNumber} for period ${billingPeriod} already exists (${existingBill.billNumber}).`,
      });
    }

    const baseAmount = flat.maintenanceBaseAmount || 2500;
    const adj = Number(adjustments) || 0;
    const totalAmount = Math.max(0, baseAmount + adj);

    // Bill Number Format: BILL-YYYYMM-WINGFLAT (e.g. BILL-202610-A101)
    const cleanPeriod = billingPeriod.replace(/[^0-9]/g, '');
    const billNumber = `BILL-${cleanPeriod}-${flat.wing}${flat.flatNumber}`;

    const bill = await Bill.create({
      billNumber,
      flat: flat._id,
      billingPeriod: billingPeriod.trim(),
      billingPeriodName: formatPeriodName(billingPeriod.trim()),
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      baseAmount,
      adjustments: adj,
      adjustmentReason: adjustmentReason || '',
      totalAmount,
      status: 'unpaid',
      notes: notes || 'Monthly Society Maintenance',
    });

    await bill.populate('flat');

    return res.status(201).json({
      success: true,
      message: `Bill ${bill.billNumber} generated successfully.`,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk-generate monthly maintenance bills for all occupied flats
// @route   POST /api/bills/admin/generate-batch
// @access  Private (Admin only)
export const generateBatchBills = async (req, res, next) => {
  try {
    const { billingPeriod, dueDate, notes } = req.body;

    if (!billingPeriod || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Billing period (YYYY-MM) and due date are required for batch generation.',
      });
    }

    const flats = await Flat.find();
    if (flats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No flats registered in the society yet. Please add flats first.',
      });
    }

    const cleanPeriod = billingPeriod.replace(/[^0-9]/g, '');
    const periodName = formatPeriodName(billingPeriod.trim());

    let createdCount = 0;
    let skippedCount = 0;
    const createdBills = [];

    for (const flat of flats) {
      // Check if bill already exists for this flat & period
      const existing = await Bill.findOne({ flat: flat._id, billingPeriod: billingPeriod.trim() });
      if (existing) {
        skippedCount++;
        continue;
      }

      const baseAmount = flat.maintenanceBaseAmount || 2500;
      const billNumber = `BILL-${cleanPeriod}-${flat.wing}${flat.flatNumber}`;

      const newBill = await Bill.create({
        billNumber,
        flat: flat._id,
        billingPeriod: billingPeriod.trim(),
        billingPeriodName: periodName,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        baseAmount,
        adjustments: 0,
        totalAmount: baseAmount,
        status: 'unpaid',
        notes: notes || 'Monthly Society Maintenance',
      });

      createdCount++;
      createdBills.push(newBill);
    }

    return res.status(201).json({
      success: true,
      message: `Batch generation complete: ${createdCount} bills created, ${skippedCount} existing bills skipped safely.`,
      createdCount,
      skippedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all society bills (Admin view with search & filters)
// @route   GET /api/bills/admin/all
// @access  Private (Admin only)
export const getAdminBills = async (req, res, next) => {
  try {
    const { status, billingPeriod, search, sort = '-createdAt' } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (billingPeriod) {
      query.billingPeriod = billingPeriod;
    }

    if (search) {
      query.billNumber = { $regex: search.trim(), $options: 'i' };
    }

    let bills = await Bill.find(query).populate('flat').sort(sort);

    // Auto-sync overdue status in memory and persist if necessary
    const now = new Date();
    for (const b of bills) {
      if (b.status === 'unpaid' && now > b.dueDate) {
        b.status = 'overdue';
        await b.save();
      }
    }

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resident's own flat bills
// @route   GET /api/bills/my-bills
// @access  Private (Resident)
export const getMyBills = async (req, res, next) => {
  try {
    if (!req.user.flat) {
      return res.status(400).json({
        success: false,
        message: 'No flat is currently associated with your resident profile.',
      });
    }

    const { status } = req.query;
    const query = { flat: req.user.flat._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const bills = await Bill.find(query).populate('flat').sort({ dueDate: -1 });

    // Auto-sync overdue status
    const now = new Date();
    for (const b of bills) {
      if (b.status === 'unpaid' && now > b.dueDate) {
        b.status = 'overdue';
        await b.save();
      }
    }

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill by ID with authorization guard
// @route   GET /api/bills/:id
// @access  Private (Admin or Resident of that flat)
export const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('flat');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found.',
      });
    }

    // Role check: If resident, ensure the bill belongs to their assigned flat
    if (req.user.role === 'resident') {
      if (!req.user.flat || !bill.flat._id.equals(req.user.flat._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view bills for another flat.',
        });
      }
    }

    // Auto-sync overdue status
    if (bill.status === 'unpaid' && new Date() > bill.dueDate) {
      bill.status = 'overdue';
      await bill.save();
    }

    return res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};
