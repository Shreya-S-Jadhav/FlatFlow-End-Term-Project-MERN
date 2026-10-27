import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required'],
    },
    billingPeriod: {
      type: String, // e.g. "2026-10" (YYYY-MM)
      required: [true, 'Billing period is required'],
      trim: true,
    },
    billingPeriodName: {
      type: String, // e.g. "October 2026"
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    baseAmount: {
      type: Number,
      required: [true, 'Base maintenance amount is required'],
      min: [0, 'Base amount cannot be negative'],
    },
    adjustments: {
      type: Number,
      default: 0, // Authorized credits (-), late charges or repairs (+)
    },
    adjustmentReason: {
      type: String,
      trim: true,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total payable amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['unpaid', 'overdue', 'pending', 'paid'],
      default: 'unpaid',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: 'Monthly Society Maintenance',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bills for the same flat in the same billing period
billSchema.index({ flat: 1, billingPeriod: 1 }, { unique: true });

// Auto-sync overdue state on query retrieval if unpaid and past due date
billSchema.methods.checkAndSyncOverdue = function () {
  if (this.status === 'unpaid' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  return this;
};

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
