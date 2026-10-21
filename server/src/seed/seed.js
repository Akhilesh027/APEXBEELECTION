import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Voter } from '../models/Voter.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

const seedOnlySuperAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas...');

    // 1. Wipe all collections clean
    await Voter.deleteMany({});
    console.log('🧹 Removed all voter records.');

    await AuditLog.deleteMany({});
    console.log('🧹 Removed all audit log entries.');

    await User.deleteMany({});
    console.log('🧹 Removed all staff accounts (Admins & Viewers).');

    // 2. Create ONLY the Super Admin
    const superAdmin = await User.create({
      fullName: 'Super Admin',
      email: 'superadmin@election.com',
      password: 'Password@123',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      assignedConstituency: 'ALL',
      lastLoginAt: new Date(),
    });

    console.log('\n✅ Clean state initialized! Only Super Admin exists in the database.');
    console.log('----------------------------------------------------');
    console.log(`Role     : ${superAdmin.role}`);
    console.log(`Email    : ${superAdmin.email}`);
    console.log(`Password : Password@123`);
    console.log('----------------------------------------------------');
    console.log('You can now log in as Super Admin and create Admins and Viewers from the portal.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Reset Error:', err);
    process.exit(1);
  }
};

seedOnlySuperAdmin();
