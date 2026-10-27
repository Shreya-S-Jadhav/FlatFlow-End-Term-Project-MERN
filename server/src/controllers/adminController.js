import Flat from '../models/Flat.js';
import User from '../models/User.js';

// @desc    Create a new flat record
// @route   POST /api/admin/flats
// @access  Private (Admin only)
export const createFlat = async (req, res, next) => {
  try {
    const { flatNumber, wing, floor, ownerName, contactNumber, maintenanceBaseAmount } = req.body;

    if (!flatNumber || !wing || floor === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Flat number, wing, and floor are required.',
      });
    }

    // Check if flat already exists in this wing
    const existing = await Flat.findOne({
      wing: wing.toUpperCase().trim(),
      flatNumber: flatNumber.toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Flat ${wing.toUpperCase()}-${flatNumber.toUpperCase()} already exists in the society.`,
      });
    }

    const flat = await Flat.create({
      flatNumber: flatNumber.toUpperCase().trim(),
      wing: wing.toUpperCase().trim(),
      floor,
      ownerName: ownerName || '',
      contactNumber: contactNumber || '',
      maintenanceBaseAmount: maintenanceBaseAmount || 2500,
    });

    return res.status(201).json({
      success: true,
      message: 'Flat record created successfully.',
      flat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flats in society
// @route   GET /api/admin/flats
// @access  Private (Admin only)
export const getFlats = async (req, res, next) => {
  try {
    const flats = await Flat.find().sort({ wing: 1, flatNumber: 1 });
    return res.status(200).json({
      success: true,
      count: flats.length,
      flats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new resident account and associate with a flat
// @route   POST /api/admin/residents
// @access  Private (Admin only)
export const createResident = async (req, res, next) => {
  try {
    const { name, email, password, flatId, phone } = req.body;

    if (!name || !email || !password || !flatId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and associated flat are required.',
      });
    }

    // Validate flat exists
    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: 'The selected flat record does not exist.',
      });
    }

    // Check email uniqueness
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered.',
      });
    }

    const resident = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'resident',
      flat: flatId,
      phone: phone || '',
      status: 'active',
    });

    // Populate flat details for response
    await resident.populate('flat');

    return res.status(201).json({
      success: true,
      message: 'Resident account created and associated with flat successfully.',
      resident: {
        _id: resident._id,
        name: resident.name,
        email: resident.email,
        role: resident.role,
        flat: resident.flat,
        phone: resident.phone,
        status: resident.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered residents
// @route   GET /api/admin/residents
// @access  Private (Admin only)
export const getResidents = async (req, res, next) => {
  try {
    const residents = await User.find({ role: 'resident' })
      .select('-password')
      .populate('flat')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: residents.length,
      residents,
    });
  } catch (error) {
    next(error);
  }
};
