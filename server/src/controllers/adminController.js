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

// @desc    Get all flats in society (supports search & status filtering)
// @route   GET /api/admin/flats
// @access  Private (Admin only)
export const getFlats = async (req, res, next) => {
  try {
    const { search, status, wing } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (wing && wing !== 'all') {
      query.wing = wing.toUpperCase().trim();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const parts = search.trim().split(/[-\s]+/);
      const orClauses = [
        { flatNumber: regex },
        { wing: regex },
        { ownerName: regex },
        { contactNumber: regex },
      ];

      if (parts.length >= 2) {
        orClauses.push({
          wing: new RegExp(parts[0], 'i'),
          flatNumber: new RegExp(parts[1], 'i'),
        });
      }

      query.$or = orClauses;
    }

    const flats = await Flat.find(query).sort({ wing: 1, flatNumber: 1 });
    return res.status(200).json({
      success: true,
      count: flats.length,
      flats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing flat record
// @route   PUT /api/admin/flats/:id
// @access  Private (Admin only)
export const updateFlat = async (req, res, next) => {
  try {
    const { flatNumber, wing, floor, ownerName, contactNumber, maintenanceBaseAmount, status } = req.body;

    const flat = await Flat.findById(req.params.id);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: 'Flat record not found.',
      });
    }

    // If changing wing or flatNumber, ensure uniqueness
    const newWing = wing ? wing.toUpperCase().trim() : flat.wing;
    const newFlatNumber = flatNumber ? flatNumber.toUpperCase().trim() : flat.flatNumber;

    if (newWing !== flat.wing || newFlatNumber !== flat.flatNumber) {
      const conflict = await Flat.findOne({
        wing: newWing,
        flatNumber: newFlatNumber,
        _id: { $ne: flat._id },
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Flat ${newWing}-${newFlatNumber} already exists in the society.`,
        });
      }
    }

    flat.wing = newWing;
    flat.flatNumber = newFlatNumber;
    if (floor !== undefined && floor !== '') flat.floor = Number(floor);
    if (ownerName !== undefined) flat.ownerName = ownerName.trim();
    if (contactNumber !== undefined) flat.contactNumber = contactNumber.trim();
    if (maintenanceBaseAmount !== undefined && maintenanceBaseAmount !== '') {
      flat.maintenanceBaseAmount = Number(maintenanceBaseAmount);
    }
    if (status && ['occupied', 'vacant'].includes(status)) flat.status = status;

    await flat.save();

    return res.status(200).json({
      success: true,
      message: `Flat ${flat.wing}-${flat.flatNumber} updated successfully.`,
      flat,
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

// @desc    Get all registered residents (supports search & status filtering)
// @route   GET /api/admin/residents
// @access  Private (Admin only)
export const getResidents = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = { role: 'resident' };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');

      // Check if search matches any flats (wing, flatNumber, or wing-flatNumber combination)
      const parts = search.trim().split(/[-\s]+/);
      const flatOrClauses = [
        { flatNumber: regex },
        { wing: regex },
      ];

      if (parts.length >= 2) {
        flatOrClauses.push({
          wing: new RegExp(parts[0], 'i'),
          flatNumber: new RegExp(parts[1], 'i'),
        });
      }

      const matchingFlats = await Flat.find({ $or: flatOrClauses }).select('_id');
      const flatIds = matchingFlats.map((f) => f._id);

      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { flat: { $in: flatIds } },
      ];
    }

    const residents = await User.find(query)
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

// @desc    Update an existing resident account
// @route   PUT /api/admin/residents/:id
// @access  Private (Admin only)
export const updateResident = async (req, res, next) => {
  try {
    const { name, email, phone, flatId, status, password } = req.body;

    const resident = await User.findById(req.params.id);
    if (!resident || resident.role !== 'resident') {
      return res.status(404).json({
        success: false,
        message: 'Resident account not found.',
      });
    }

    // If email is changing, check uniqueness
    if (email && email.toLowerCase().trim() !== resident.email) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: resident._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another user is already registered with this email.',
        });
      }
      resident.email = email.toLowerCase().trim();
    }

    // If changing flat association, validate flat exists
    if (flatId) {
      const flat = await Flat.findById(flatId);
      if (!flat) {
        return res.status(404).json({
          success: false,
          message: 'Selected flat record does not exist.',
        });
      }
      resident.flat = flatId;
    }

    if (name) resident.name = name.trim();
    if (phone !== undefined) resident.phone = phone.trim();
    if (status && ['active', 'inactive'].includes(status)) resident.status = status;
    if (password && password.trim().length >= 6) {
      resident.password = password.trim();
    }

    await resident.save();
    await resident.populate('flat');

    return res.status(200).json({
      success: true,
      message: `Resident account for ${resident.name} updated successfully.`,
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

