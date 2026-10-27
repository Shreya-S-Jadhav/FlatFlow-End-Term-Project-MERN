import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Flat from '../models/Flat.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Cleaning existing test users and flats...');
    await User.deleteMany();
    await Flat.deleteMany();

    console.log('[Seeder] Creating society flats...');
    const flats = await Flat.insertMany([
      {
        flatNumber: '101',
        wing: 'A',
        floor: 1,
        ownerName: 'Rahul Sharma',
        contactNumber: '9876543210',
        status: 'occupied',
        maintenanceBaseAmount: 2500,
      },
      {
        flatNumber: '102',
        wing: 'A',
        floor: 1,
        ownerName: 'Priya Patel',
        contactNumber: '9876543211',
        status: 'occupied',
        maintenanceBaseAmount: 2500,
      },
      {
        flatNumber: '201',
        wing: 'B',
        floor: 2,
        ownerName: 'Amit Verma',
        contactNumber: '9876543212',
        status: 'occupied',
        maintenanceBaseAmount: 3000,
      },
      {
        flatNumber: '202',
        wing: 'B',
        floor: 2,
        ownerName: 'Sneha Deshmukh',
        contactNumber: '9876543213',
        status: 'occupied',
        maintenanceBaseAmount: 3000,
      },
    ]);

    console.log(`[Seeder] Created ${flats.length} flats.`);

    console.log('[Seeder] Creating admin and resident accounts...');

    // 1. Society Administrator
    const admin = await User.create({
      name: 'Society Administrator',
      email: 'admin@flatflow.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999988888',
      status: 'active',
    });

    // 2. Resident for Flat A-101
    const resident1 = await User.create({
      name: 'Rahul Sharma',
      email: 'resident.a101@flatflow.com',
      password: 'resident123',
      role: 'resident',
      flat: flats[0]._id,
      phone: '9876543210',
      status: 'active',
    });

    // 3. Resident for Flat B-201
    const resident2 = await User.create({
      name: 'Amit Verma',
      email: 'resident.b201@flatflow.com',
      password: 'resident123',
      role: 'resident',
      flat: flats[2]._id,
      phone: '9876543212',
      status: 'active',
    });

    console.log('[Seeder] Database successfully seeded with:');
    console.log('--------------------------------------------------');
    console.log(`ADMIN:    email: admin@flatflow.com         | pass: admin123`);
    console.log(`RESIDENT: email: resident.a101@flatflow.com | pass: resident123 (Flat A-101)`);
    console.log(`RESIDENT: email: resident.b201@flatflow.com | pass: resident123 (Flat B-201)`);
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
