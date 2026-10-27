import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Dispute from '../models/Dispute.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// @desc    File a new billing dispute with optional evidence
// @route   POST /api/disputes
// @access  Private (Resident)
export const createDispute = async (req, res, next) => {
  try {
    const { billId, subject, description, priority } = req.body;

    if (!billId || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Bill reference, subject, and detailed description are required.',
      });
    }

    const bill = await Bill.findById(billId).populate('flat');
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Associated maintenance bill not found.',
      });
    }

    // Role check: Resident must own the flat
    if (req.user.role === 'resident') {
      if (!req.user.flat || !bill.flat._id.equals(req.user.flat._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot raise a dispute for another flat.',
        });
      }
    }

    // Unique dispute number: DISP-202610-A101-729
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const disputeNumber = `DISP-${bill.billNumber.replace('BILL-', '')}-${randomSuffix}`;

    const supportingDoc = req.file
      ? {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        }
      : {};

    const dispute = await Dispute.create({
      disputeNumber,
      bill: bill._id,
      flat: bill.flat._id,
      resident: req.user._id,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      supportingDocument: supportingDoc,
      status: 'open',
    });

    await dispute.populate(['flat', 'bill', 'resident']);

    // Send in-app notification to all society administrators
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: `New Billing Dispute: ${dispute.disputeNumber}`,
        message: `Resident of Flat ${bill.flat.wing}-${bill.flat.flatNumber} raised a dispute for bill ${bill.billNumber}.`,
        type: 'dispute_update',
        link: '/admin/disputes',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully. Society administrators have been notified.',
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all disputes submitted by resident's flat
// @route   GET /api/disputes/my-disputes
// @access  Private (Resident)
export const getMyDisputes = async (req, res, next) => {
  try {
    if (!req.user.flat) {
      return res.status(400).json({
        success: false,
        message: 'No flat currently associated with your resident profile.',
      });
    }

    const disputes = await Dispute.find({ flat: req.user.flat._id })
      .populate('bill')
      .populate('flat')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all society disputes (Admin view)
// @route   GET /api/disputes/admin/all
// @access  Private (Admin only)
export const getAdminDisputes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('bill')
      .populate('flat')
      .populate('resident', 'name email phone')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin resolves or updates status of a dispute
// @route   PATCH /api/disputes/admin/:id
// @access  Private (Admin only)
export const resolveDispute = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }

    const dispute = await Dispute.findById(req.params.id)
      .populate('bill')
      .populate('flat')
      .populate('resident');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute record not found.',
      });
    }

    dispute.status = status;
    if (adminResponse !== undefined) {
      dispute.adminResponse = adminResponse.trim();
    }

    if (status === 'resolved' || status === 'rejected') {
      dispute.resolvedBy = req.user._id;
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    // Send in-app notification directly to the resident
    await Notification.create({
      recipient: dispute.resident._id,
      title: `Dispute Update: ${dispute.disputeNumber}`,
      message: `Your dispute for bill ${dispute.bill?.billNumber} status is now: ${status.toUpperCase().replace('_', ' ')}.`,
      type: 'dispute_update',
      link: '/disputes',
    });

    return res.status(200).json({
      success: true,
      message: `Dispute marked as ${status}. Resident has been notified.`,
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Securely view private supporting evidence document
// @route   GET /api/disputes/document/:id
// @access  Private (Admin or Resident of that dispute)
export const getDisputeDocument = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute || !dispute.supportingDocument?.filename) {
      return res.status(404).json({
        success: false,
        message: 'Supporting document not found on this dispute.',
      });
    }

    // Role Guard: Only Admin or the Resident who filed this dispute can access
    if (req.user.role === 'resident' && !dispute.resident.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this document.',
      });
    }

    const filePath = path.join(uploadDir, dispute.supportingDocument.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server storage.',
      });
    }

    res.setHeader('Content-Type', dispute.supportingDocument.mimeType || 'application/octet-stream');
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
