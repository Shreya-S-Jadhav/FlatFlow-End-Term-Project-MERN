import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      required: [true, 'Bill reference is required'],
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required'],
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer user reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'test_mode_sandbox'],
      default: 'razorpay',
    },
    orderId: {
      type: String,
      required: [true, 'Gateway order ID is required'],
      unique: true,
      trim: true,
    },
    paymentId: {
      type: String,
      unique: true,
      sparse: true, // Only set once payment is captured
      trim: true,
    },
    signature: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    paymentMethod: {
      type: String,
      default: 'UPI / NetBanking / Card',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: '',
    },
    isReconciled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and duplicate prevention
paymentSchema.index({ bill: 1 });
paymentSchema.index({ flat: 1 });
paymentSchema.index({ payer: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
