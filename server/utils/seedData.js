import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'admin1234';

        // Check if admin exists
        const adminExists = await User.findOne({ email: adminEmail });

        // Ensure at least one department exists for the admin (Universal/Central)
        let adminDept = await Department.findOne({ name: 'Administration' });
        if (!adminDept) {
            adminDept = await Department.create({ name: 'Administration' });
        }

        if (!adminExists) {
            // Role 'admin' is lowercase because of convention, but prompt said 'ADMIN' in caps for type
            // I'll use lowercase 'admin' as stored value to match common patterns, but I'll ensure the model enum has it
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                department: adminDept._id,
            });
            console.log('Default Admin seeded successfully');
        } else {
            console.log('Admin already exists');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

const migrateDepartments = async () => {
    try {
        const users = await User.find({ department: { $type: 'string' } });
        
        if (users.length === 0) {
            console.log('No users found with string-based departments for migration.');
            return;
        }

        console.log(`Starting migration for ${users.length} users with string-based departments...`);

        for (const user of users) {
            let deptName = user.department; // String value
            
            console.log(`Migrating user ${user.email} (ID: ${user._id}) from department string: "${deptName}"`);
            
            // Handle if deptName is empty or invalid
            if (!deptName || (typeof deptName === 'string' && deptName.trim() === '')) {
                deptName = 'General';
            } else if (typeof deptName === 'string') {
                deptName = deptName.trim();
            } else {
                // Should not happen with $type: 'string', but for safety:
                deptName = String(deptName);
            }
            
            let dept = await Department.findOne({ name: deptName });
            if (!dept) {
                console.log(`Creating new department: "${deptName}"`);
                dept = await Department.create({ name: deptName });
            }
            
            user.department = dept._id;
            // Disable validation temporarily to avoid role-specific field errors during migration
            await user.save({ validateBeforeSave: false });
        }

        console.log('Department migration completed successfully');
    } catch (error) {
        console.error('Error migrating departments:', error);
    }
};

const runSeeds = async () => {
    await migrateDepartments();
    await seedAdmin();
};

export default runSeeds;
