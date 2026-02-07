import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import bcrypt from 'bcryptjs';

dotenv.config();

// Realistic first names and last names for generating applicants
const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
    'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
    'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
    'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah',
    'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
    'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna',
    'Stephen', 'Brenda', 'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra', 'Frank', 'Rachel',
    'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine', 'Dennis', 'Maria', 'Jerry', 'Heather'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
    'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
    'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
];

const hiringStages = ['In-Review', 'Shortlisted', 'Interview', 'Hired', 'Declined'];
const skills = [
    'Personal Care', 'Medication Administration', 'Behavioral Support', 'Transportation',
    'Communication', 'Patience', 'Problem Solving', 'CPR', 'First Aid', 'Documentation',
    'Team Collaboration', 'Crisis Intervention', 'Meal Preparation', 'Vital Signs',
    'ADL Assistance', 'Community Integration', 'Safety Awareness', 'Emotional Support'
];

const certifications = ['CPR', 'First Aid', 'QMAP', 'CNA', 'BLS', 'RBT', 'DSP Certification'];

const generateRandomDate = (daysBack) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date;
};

const generateApplicants = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log('MongoDB Connected...');

        // Find employer
        const employer = await User.findOne({ email: 'hr@nomad.com' });
        if (!employer) {
            console.error('Employer hr@nomad.com not found. Please seed base data first.');
            process.exit(1);
        }
        console.log(`Found employer: ${employer.name} (${employer._id})`);

        // Get employer's jobs
        const jobs = await Job.find({ employerId: employer._id });
        if (jobs.length === 0) {
            console.error('No jobs found for this employer. Please seed jobs first.');
            process.exit(1);
        }
        console.log(`Found ${jobs.length} jobs for this employer`);

        // Clear existing applications
        await Application.deleteMany({ job: { $in: jobs.map(j => j._id) } });
        console.log('Cleared existing applications');

        // Clear existing jobseeker users created by this script
        await User.deleteMany({ email: { $regex: /^applicant\d+@iddjobs\.test$/ } });
        console.log('Cleared existing test applicants');

        // Pre-hash password ONCE for all users (insertMany skips pre-save hooks)
        const hashedPassword = await bcrypt.hash('password123', 10);

        const applicantsToCreate = [];
        const targetCount = 550;
        console.log(`Generating ${targetCount} applicants...`);

        for (let i = 1; i <= targetCount; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `applicant${i}@iddjobs.test`;

            applicantsToCreate.push({
                name,
                email,
                password: hashedPassword, // Already hashed - insertMany skips pre-save hook
                role: 'jobseeker',
                phone: `555-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                bio: `Dedicated caregiver with experience supporting individuals with developmental disabilities.`,
                profile: {
                    headline: 'DSP Professional',
                    location: ['Denver, CO', 'Aurora, CO', 'Boulder, CO', 'Lakewood, CO', 'Fort Collins, CO'][Math.floor(Math.random() * 5)],
                    skills: [...skills].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3),
                    certifications: [...certifications].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
                    experienceYears: Math.floor(Math.random() * 10)
                }
            });
        }

        // Bulk insert users (skipping pre-save hooks - password already hashed)
        const createdUsers = await User.insertMany(applicantsToCreate, { ordered: false });
        console.log(`Created ${createdUsers.length} applicant users`);

        // Create applications for each user
        const applicationsToCreate = [];
        for (let i = 0; i < createdUsers.length; i++) {
            const user = createdUsers[i];
            const job = jobs[Math.floor(Math.random() * jobs.length)];
            const hiringStage = hiringStages[Math.floor(Math.random() * hiringStages.length)];
            const score = hiringStage === 'In-Review' ? 0 : Math.round((Math.random() * 4 + 1) * 10) / 10;

            applicationsToCreate.push({
                job: job._id,
                applicant: user._id,
                coverLetter: `I am excited to apply for the ${job.title} position. With my background in caregiving and passion for supporting individuals with disabilities, I believe I would be a great fit for your team.`,
                applicantInfo: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                status: hiringStage === 'Hired' ? 'Hired' : hiringStage === 'Declined' ? 'Rejected' : 'Pending',
                score,
                hiringStage,
                appliedAt: generateRandomDate(90)
            });
        }

        // Bulk insert applications
        const createdApps = await Application.insertMany(applicationsToCreate, { ordered: false });
        console.log(`Created ${createdApps.length} applications`);

        // Update job application counts
        for (const job of jobs) {
            const count = await Application.countDocuments({ job: job._id });
            await Job.findByIdAndUpdate(job._id, { applicationsCount: count });
        }
        console.log('Updated job application counts');

        console.log('\n✅ Seeding complete!');
        console.log(`   - ${createdUsers.length} applicant users created`);
        console.log(`   - ${createdApps.length} applications created`);
        console.log(`   - Pagination will show ~55 pages (10 per page)`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.writeErrors) {
            console.error('Write errors:', error.writeErrors.length);
        }
        process.exit(1);
    }
};

generateApplicants();
