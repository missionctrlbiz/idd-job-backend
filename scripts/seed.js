import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const jobs = [
    {
        title: 'Direct Support Professional (DSP)',
        company: 'Sunrise Community Services',
        location: 'Denver, CO',
        type: 'Full-Time',
        roleCategory: 'DSP',
        shifts: ['Overnight', 'Weekend'],
        certifications: ['CPR', 'First Aid'],
        salary: {
            min: 18,
            max: 22,
            period: 'Hourly'
        },
        description: 'Supporting individuals with intellectual and developmental disabilities in their daily lives. Responsibilities include assisting with personal care, medication administration, and community integration.',
    },
    {
        title: 'Weekend Caregiver',
        company: 'Loving Hands Home Care',
        location: 'Aurora, CO',
        type: 'Part-Time',
        roleCategory: 'Caregiver',
        shifts: ['Weekend', 'Day'],
        certifications: ['QMAP'],
        salary: {
            min: 20,
            max: 24,
            period: 'Hourly'
        },
        description: 'Provide companionship and assistance to elderly clients during weekends. Must have reliable transportation.',
    },
    {
        title: 'Registered Nurse (IDD Focus)',
        company: 'HealthFirst Solutions',
        location: 'Boulder, CO',
        type: 'Contract',
        roleCategory: 'Nurse',
        shifts: ['Day', 'Rotating'],
        certifications: ['RN License', 'CPR'],
        salary: {
            min: 35,
            max: 45,
            period: 'Hourly'
        },
        description: 'Oversee medical care plans for individuals with IDD. Coordinate with DSPs and families to ensure optimal health outcomes.',
    }
];

const importData = async () => {
    try {
        await Job.deleteMany(); // Clear existing data

        await Job.insertMany(jobs);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Job.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
