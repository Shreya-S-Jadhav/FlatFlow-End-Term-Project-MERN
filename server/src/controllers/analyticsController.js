import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import Dispute from '../models/Dispute.js';
import Flat from '../models/Flat.js';
import User from '../models/User.js';

// @desc    Get comprehensive society financial analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin only)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // --- Parallel data fetch for performance ---
    const [
      allBills,
      capturedPayments,
      allDisputes,
      totalFlats,
      totalResidents,
    ] = await Promise.all([
      Bill.find().populate('flat'),
      Payment.find({ status: 'captured' }).populate('flat').populate('payer', 'name email'),
      Dispute.find(),
      Flat.countDocuments(),
      User.countDocuments({ role: 'resident' }),
    ]);

    // --- Auto-sync overdue status ---
    const now = new Date();
    for (const bill of allBills) {
      if (bill.status === 'unpaid' && now > bill.dueDate) {
        bill.status = 'overdue';
        await bill.save();
      }
    }

    // --- Bill Status Breakdown ---
    const billsByStatus = {
      total: allBills.length,
      paid: allBills.filter((b) => b.status === 'paid').length,
      unpaid: allBills.filter((b) => b.status === 'unpaid').length,
      overdue: allBills.filter((b) => b.status === 'overdue').length,
    };

    // --- Financial Summary ---
    const totalBilled = allBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCollected = capturedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = totalBilled - totalCollected;
    const collectionRate = totalBilled > 0
      ? Math.round((totalCollected / totalBilled) * 100)
      : 0;

    // --- Monthly Collection Trend (last 6 months) ---
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const periodKey = `${year}-${month}`;
      const periodLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      const periodBills = allBills.filter((b) => b.billingPeriod === periodKey);
      const periodBilled = periodBills.reduce((sum, b) => sum + b.totalAmount, 0);
      const periodPaid = periodBills.filter((b) => b.status === 'paid').length;
      const periodTotal = periodBills.length;

      // Payments made in this month (by paidAt timestamp)
      const periodCollected = capturedPayments
        .filter((p) => {
          if (!p.paidAt) return false;
          const pd = new Date(p.paidAt);
          return pd.getFullYear() === year && pd.getMonth() === d.getMonth();
        })
        .reduce((sum, p) => sum + p.amount, 0);

      monthlyTrend.push({
        period: periodKey,
        label: periodLabel,
        billed: periodBilled,
        collected: periodCollected,
        totalBills: periodTotal,
        paidBills: periodPaid,
      });
    }

    // --- Dispute Summary ---
    const disputesByStatus = {
      total: allDisputes.length,
      open: allDisputes.filter((d) => d.status === 'open').length,
      underReview: allDisputes.filter((d) => d.status === 'under_review').length,
      resolved: allDisputes.filter((d) => d.status === 'resolved').length,
      rejected: allDisputes.filter((d) => d.status === 'rejected').length,
    };

    // --- Top Defaulters (flats with most overdue bills) ---
    const overdueByFlat = {};
    allBills
      .filter((b) => b.status === 'overdue')
      .forEach((b) => {
        const flatKey = b.flat ? `${b.flat.wing}-${b.flat.flatNumber}` : 'Unknown';
        if (!overdueByFlat[flatKey]) {
          overdueByFlat[flatKey] = { flat: flatKey, count: 0, totalOverdue: 0 };
        }
        overdueByFlat[flatKey].count++;
        overdueByFlat[flatKey].totalOverdue += b.totalAmount;
      });

    const topDefaulters = Object.values(overdueByFlat)
      .sort((a, b) => b.totalOverdue - a.totalOverdue)
      .slice(0, 5);

    // --- Recent Payments (last 10) ---
    const recentPayments = capturedPayments
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
      .slice(0, 10)
      .map((p) => ({
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        flat: p.flat ? `${p.flat.wing}-${p.flat.flatNumber}` : 'N/A',
        payer: p.payer?.name || 'N/A',
        paidAt: p.paidAt,
        method: p.paymentMethod,
      }));

    return res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalFlats,
          totalResidents,
          totalBills: billsByStatus.total,
        },
        billsByStatus,
        financial: {
          totalBilled,
          totalCollected,
          totalOutstanding,
          collectionRate,
        },
        monthlyTrend,
        disputesByStatus,
        topDefaulters,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resident's own summary analytics
// @route   GET /api/analytics/my-summary
// @access  Private (Resident)
export const getResidentSummary = async (req, res, next) => {
  try {
    if (!req.user.flat) {
      return res.status(400).json({
        success: false,
        message: 'No flat associated with your profile.',
      });
    }

    const flatId = req.user.flat._id;

    const [myBills, myPayments, myDisputes] = await Promise.all([
      Bill.find({ flat: flatId }),
      Payment.find({ flat: flatId, status: 'captured' }),
      Dispute.find({ flat: flatId }),
    ]);

    // Auto-sync overdue
    const now = new Date();
    for (const bill of myBills) {
      if (bill.status === 'unpaid' && now > bill.dueDate) {
        bill.status = 'overdue';
        await bill.save();
      }
    }

    const totalBilled = myBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPaid = myPayments.reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      summary: {
        totalBills: myBills.length,
        paidBills: myBills.filter((b) => b.status === 'paid').length,
        unpaidBills: myBills.filter((b) => b.status === 'unpaid').length,
        overdueBills: myBills.filter((b) => b.status === 'overdue').length,
        totalBilled,
        totalPaid,
        totalOutstanding: totalBilled - totalPaid,
        activeDisputes: myDisputes.filter((d) => d.status === 'open' || d.status === 'under_review').length,
        totalDisputes: myDisputes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
