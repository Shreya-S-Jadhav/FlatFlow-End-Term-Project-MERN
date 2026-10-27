import mongoose from 'mongoose';

const flatSchema = new mongoose.Schema(
  {
    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true,
      uppercase: true,
    },
    wing: {
      type: String,
      required: [true, 'Wing / Block is required'],
      trim: true,
      uppercase: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
    },
    ownerName: {
      type: String,
      trim: true,
      default: '',
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['occupied', 'vacant'],
      default: 'occupied',
    },
    maintenanceBaseAmount: {
      type: Number,
      default: 2500, // Monthly base maintenance in INR
      min: [0, 'Maintenance amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate flat identifiers within the same wing/society
flatSchema.index({ wing: 1, flatNumber: 1 }, { unique: true });

const Flat = mongoose.model('Flat', flatSchema);

export default Flat;
