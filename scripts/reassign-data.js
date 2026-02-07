
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const manageData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log('MongoDB Connected...');

        const email = process.argv[2];

        if (!email) {
            console.log('No email provided. Listing all employers:');
            const employers = await User.find({ role: 'employer' });
            employers.forEach(emp => {
                console.log(`- ${emp.name} (${emp.email})`);
            });
            console.log('\nTo reassign data to a user, run: node scripts/reassign-data.js <email>');
            process.exit(0);
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User not found with email: ${email}`);
            process.exit(1);
        }

        if (user.role !== 'employer') {
            console.error(`User ${email} is not an employer`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user._id})`);

        // Update all jobs to be owned by this user
        const jobUpdateResult = await Job.updateMany({}, { employerId: user._id });
        console.log(`Updated ${jobUpdateResult.modifiedCount} jobs to be owned by ${user.name}`);

        console.log('Data reassignment complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

manageData();
