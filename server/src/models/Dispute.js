import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      required: [true, 'Associated bill reference is required'],
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required'],
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident reference is required'],
    },
    subject: {
      type: String,
      required: [true, 'Dispute subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'rejected'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    supportingDocument: {
      filename: { type: String, default: null },
      originalName: { type: String, default: null },
      mimeType: { type: String, default: null },
      size: { type: Number, default: 0 },
    },
    adminResponse: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.index({ flat: 1 });
disputeSchema.index({ bill: 1 });
disputeSchema.index({ status: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;
