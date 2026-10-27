import crypto from 'crypto';
import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import { razorpayInstance, isRazorpayConfigured, keyId, keySecret } from '../config/razorpay.js';

// Helper to generate unique receipt numbers (e.g. RCP-202610-482910)
const generateReceiptNumber = (billNumber) => {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const cleanNumber = billNumber.replace('BILL-', '');
  return `RCP-${cleanNumber}-${randomSuffix}`;
};

// @desc    Initiate payment order for an eligible bill
// @route   POST /api/payments/create-order
// @access  Private (Resident)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { billId } = req.body;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID is required to initiate payment.',
      });
    }

    const bill = await Bill.findById(billId).populate('flat');
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance bill not found.',
      });
    }

    // Role Guard: Resident must own the flat this bill belongs to
    if (req.user.role === 'resident') {
      if (!req.user.flat || !bill.flat._id.equals(req.user.flat._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot pay a bill for another flat.',
        });
      }
    }

    // Check if bill is already settled
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This maintenance bill has already been paid.',
      });
    }

    // Amount strictly calculated from trusted database record (in Paise for Indian Gateway)
    const payableAmount = bill.totalAmount;
    const amountInPaise = Math.round(payableAmount * 100);

    let orderId = '';
    let gatewayType = 'razorpay';

    if (isRazorpayConfigured && razorpayInstance) {
      // Real Razorpay Test Mode Order Creation
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${bill.billNumber}`,
        notes: {
          billId: bill._id.toString(),
          flat: `${bill.flat.wing}-${bill.flat.flatNumber}`,
          payerEmail: req.user.email,
        },
      };

      const order = await razorpayInstance.orders.create(options);
      orderId = order.id;
    } else {
      // Self-Contained Test Mode Sandbox Order
      orderId = `order_test_${Date.now()}_${bill.billNumber}`;
      gatewayType = 'test_mode_sandbox';
    }

    const receiptNumber = generateReceiptNumber(bill.billNumber);

    // Create or update existing pending payment record
    let payment = await Payment.findOne({ bill: bill._id, status: 'created' });
    if (!payment) {
      payment = await Payment.create({
        receiptNumber,
        bill: bill._id,
        flat: bill.flat._id,
        payer: req.user._id,
        amount: payableAmount,
        currency: 'INR',
        gateway: gatewayType,
        orderId,
        status: 'created',
      });
    } else {
      payment.orderId = orderId;
      payment.receiptNumber = receiptNumber;
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      orderId,
      amount: payableAmount,
      currency: 'INR',
      keyId: keyId || 'rzp_test_flatflow_sandbox',
      isSandbox: !isRazorpayConfigured,
      billNumber: bill.billNumber,
      billingPeriodName: bill.billingPeriodName,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and settle bill
// @route   POST /api/payments/verify
// @access  Private (Resident)
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, billId, paymentMethod } = req.body;

    if (!orderId || !paymentId || !signature || !billId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, Signature, and Bill ID are required for verification.',
      });
    }

    const bill = await Bill.findById(billId).populate('flat');
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Associated bill record not found.',
      });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Matching payment order record not found.',
      });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    let isAuthentic = false;

    if (payment.gateway === 'razorpay' && isRazorpayConfigured) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      isAuthentic = signature === expectedSignature;
    } else {
      // Sandbox mode verification: validates order/payment identifiers & non-empty signature
      isAuthentic = Boolean(signature && orderId && paymentId);
    }

    if (!isAuthentic) {
      payment.status = 'failed';
      payment.failureReason = 'Cryptographic signature mismatch: Untrusted or altered transaction';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Transaction was rejected.',
      });
    }

    // Prevent duplicate processing if already captured
    if (payment.status === 'captured') {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed and verified.',
        receipt: payment,
      });
    }

    // Mark payment as captured & settle bill atomically
    const paidTimestamp = new Date();

    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = 'captured';
    payment.paidAt = paidTimestamp;
    payment.paymentMethod = paymentMethod || 'Online (UPI / NetBanking / Card)';
    await payment.save();

    bill.status = 'paid';
    bill.paidAt = paidTimestamp;
    bill.payment = payment._id;
    await bill.save();

    await payment.populate(['flat', 'payer', 'bill']);

    return res.status(200).json({
      success: true,
      message: 'Payment successfully verified. Maintenance bill settled!',
      receipt: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resident's payment history
// @route   GET /api/payments/my-payments
// @access  Private (Resident)
export const getMyPayments = async (req, res, next) => {
  try {
    if (!req.user.flat) {
      return res.status(400).json({
        success: false,
        message: 'No flat currently associated with your resident profile.',
      });
    }

    const payments = await Payment.find({ flat: req.user.flat._id, status: 'captured' })
      .populate('bill')
      .populate('flat')
      .sort({ paidAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all society payments (Admin view)
// @route   GET /api/payments/admin/all
// @access  Private (Admin only)
export const getAdminPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'captured' })
      .populate('bill')
      .populate('flat')
      .populate('payer', 'name email')
      .sort({ paidAt: -1 });

    const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return res.status(200).json({
      success: true,
      count: payments.length,
      totalCollected,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get official receipt details
// @route   GET /api/payments/receipt/:id
// @access  Private (Resident of flat or Admin)
export const getReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bill')
      .populate('flat')
      .populate('payer', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment receipt record not found.',
      });
    }

    // Role check: Resident can only view their own flat's receipts
    if (req.user.role === 'resident') {
      if (!req.user.flat || !payment.flat._id.equals(req.user.flat._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot view receipts for another flat.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      receipt: payment,
    });
  } catch (error) {
    next(error);
  }
};
