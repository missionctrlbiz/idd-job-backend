import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import connectDB from '../config/db.js';

dotenv.config();

// Sample data generators
const firstNames = {
    male: ['Jerome', 'Jake', 'Guy', 'Darrell', 'Floyd', 'Leif', 'Rodolfo', 'Jerome', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas', 'Charles'],
    female: ['Eleanor', 'Jenny', 'Cyndy', 'Maria', 'Sarah', 'Jessica', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Sandra', 'Ashley', 'Emily', 'Emma', 'Olivia']
};

const lastNames = ['Bell', 'Gyll', 'Hawkins', 'Steward', 'Miles', 'Floyd', 'Goode', 'Wilson', 'Pena', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];

const companies = [
    { name: 'Nomad', logo: 'N', color: 'blue' },
    { name: 'Care Horizons', logo: 'CH', color: 'green' },
    { name: 'LifeBridge Services', logo: 'LS', color: 'purple' },
    { name: 'Community First Care', logo: 'CF', color: 'orange' }
];

const jobTitles = [
    'Direct Support Professional (DSP)',
    'Caregiver - IDD',
    'Behavioral Specialist',
    'Program Coordinator',
    'Residential Counselor',
    'Personal Care Assistant',
    'Community Living Specialist',
    'Job Coach'
];

const cities = ['Manchester, Kentucky', 'Boston, Massachusetts', 'Portland, Oregon', 'Austin, Texas', 'Denver, Colorado', 'Seattle, Washington', '4517 Washington Ave, Manchester, Kentucky 39495', 'Remote'];

const skills = [
    'Project Management', 'Copywriting', 'English', 'Spanish', 'French', 'Design Research',
    'User Interface', 'User Experience', 'Interaction Design', 'Wireframing', 'Prototyping',
    'Communication', 'Leadership', 'Problem Solving', 'Time Management', 'Patient Care',
    'Crisis Intervention', 'Behavior Management', 'First Aid', 'CPR Certified'
];

const hiringStages = ['In-Review', 'Shortlisted', 'Interview', 'Hired', 'Declined'];

const generateAvatar = (name, gender) => {
    // Using UI Avatars API for placeholder avatars
    const initials = name.split(' ').map(n => n[0]).join('');
    const bgColors = ['3B82F6', '10B981', '8B5CF6', 'F59E0B', 'EF4444', '06B6D4'];
    const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=200&bold=true`;
};

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomElements = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        // Only clear employer-related data to preserve job seeker accounts
        await Job.deleteMany({});
        await Application.deleteMany({});

        // Delete only employer users, preserve job seekers
        await User.deleteMany({ role: 'employer' });
        await User.deleteMany({ name: { $regex: /^(Jerome|Jake|Guy|Darrell|Floyd|Eleanor|Jenny|Cyndy)/i } });

        console.log('👔 Creating employer accounts...');
        const employers = [];

        for (let i = 0; i < 3; i++) {
            const company = companies[i];
            const employer = await User.create({
                name: `${company.name} HR Manager`,
                email: `hr@${company.name.toLowerCase().replace(/\s/g, '')}.com`,
                password: 'password123',
                role: 'employer',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(company.logo)}&background=6366F1&color=fff&size=200`,
                company: {
                    name: company.name,
                    description: `Leading provider of IDD/developmental disability services`,
                    logo: company.logo,
                    size: '100-500 employees',
                    industry: 'Healthcare & Social Services'
                }
            });
            employers.push(employer);
        }

        console.log(`✅ Created ${employers.length} employer accounts`);

        console.log('💼 Creating job postings...');
        const jobs = [];

        for (const employer of employers) {
            const numJobs = 4 + Math.floor(Math.random() * 3); // 4-6 jobs per employer

            for (let i = 0; i < numJobs; i++) {
                const viewsByDay = [];
                // Generate views for last 7 days
                for (let d = 6; d >= 0; d--) {
                    const date = new Date();
                    date.setDate(date.getDate() - d);
                    viewsByDay.push({
                        date,
                        count: Math.floor(Math.random() * 50) + 10
                    });
                }

                const job = await Job.create({
                    title: getRandomElement(jobTitles),
                    company: employer.company.name,
                    employerId: employer._id,
                    location: getRandomElement(cities),
                    workMode: getRandomElement(['On-site', 'Hybrid', 'Remote']),
                    type: getRandomElement(['Full-Time', 'Part-Time', 'Contract', 'PRN']),
                    roleCategory: getRandomElement(['DSP', 'Caregiver', 'Behavioral', 'Admin']),
                    shifts: getRandomElements(['Day', 'Evening', 'Overnight', 'Weekend', 'Rotating'], 2),
                    certifications: ['CPR', 'First Aid'],
                    salary: {
                        min: 15 + Math.floor(Math.random() * 5),
                        max: 20 + Math.floor(Math.random() * 10),
                        period: 'Hourly'
                    },
                    description: `Join our team as a ${getRandomElement(jobTitles)} and make a difference in the lives of individuals with developmental disabilities.`,
                    responsibilities: [
                        'Provide direct support to individuals with developmental disabilities',
                        'Assist with daily living activities',
                        'Implement behavioral support plans',
                        'Maintain detailed documentation'
                    ],
                    qualifications: [
                        'High school diploma or equivalent',
                        'Valid driver\'s license',
                        'CPR and First Aid certification preferred'
                    ],
                    benefits: ['Health Insurance', '401(k)', 'Paid Time Off', 'Professional Development'],
                    viewsCount: viewsByDay.reduce((sum, day) => sum + day.count, 0),
                    viewsByDay,
                    postedAt: getRandomDate(new Date(2024, 5, 1), new Date())
                });
                jobs.push(job);
            }
        }

        console.log(`✅ Created ${jobs.length} job postings`);

        console.log('👥 Creating applicant profiles...');
        const applicants = [];

        for (let i = 0; i < 50; i++) {
            const gender = Math.random() > 0.5 ? 'Male' : 'Female';
            const firstName = getRandomElement(firstNames[gender.toLowerCase()]);
            const lastName = getRandomElement(lastNames);
            const fullName = `${firstName} ${lastName}`;

            const birthYear = 1975 + Math.floor(Math.random() * 30);
            const dateOfBirth = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

            const applicant = await User.create({
                name: fullName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
                password: 'password123',
                role: 'jobseeker',
                avatar: generateAvatar(fullName, gender),
                phone: `+1 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
                gender,
                dateOfBirth,
                languages: getRandomElements(['English', 'Spanish', 'French', 'Bahasa'], 1 + Math.floor(Math.random() * 2)),
                profile: {
                    headline: getRandomElement(jobTitles),
                    location: getRandomElement(cities).split(',')[0],
                    isOpenToWork: true,
                    address: {
                        street: `${Math.floor(Math.random() * 9000) + 1000} ${getRandomElement(['Main', 'Oak', 'Maple', 'Washington', 'Park'])} St`,
                        city: getRandomElement(['Manchester', 'Boston', 'Portland', 'Austin']),
                        state: getRandomElement(['KY', 'MA', 'OR', 'TX']),
                        zip: `${Math.floor(Math.random() * 90000) + 10000}`,
                        country: 'USA'
                    },
                    socialLinks: {
                        linkedin: `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                        twitter: Math.random() > 0.5 ? `twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : '',
                        instagram: Math.random() > 0.5 ? `instagram.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : '',
                        website: Math.random() > 0.7 ? `www.${firstName.toLowerCase()}${lastName.toLowerCase()}.com` : ''
                    },
                    aboutMe: `I'm a ${getRandomElement(jobTitles).toLowerCase()} with ${2 + Math.floor(Math.random() * 15)} years of experience working with individuals with developmental disabilities. I'm passionate about providing compassionate care and support to help individuals achieve their goals and live fulfilling lives.`,
                    currentJob: Math.random() > 0.3 ? getRandomElement(jobTitles) : '',
                    qualificationLevel: getRandomElement(['High School Diploma', 'Associate Degree', 'Bachelor\'s Degree in Social Work', 'Bachelor\'s Degree in Psychology']),
                    experienceYears: 2 + Math.floor(Math.random() * 15),
                    skills: getRandomElements(skills, 3 + Math.floor(Math.random() * 5)),
                    certifications: getRandomElements(['CPR', 'First Aid', 'CNA', 'Behavioral Support'], 2),
                    workExperience: [{
                        company: getRandomElement(companies).name,
                        role: getRandomElement(jobTitles),
                        type: 'Full-Time',
                        startDate: new Date(2020, 0, 1),
                        endDate: null,
                        current: true,
                        description: 'Providing direct support to individuals with developmental disabilities'
                    }],
                    education: [{
                        school: getRandomElement(['State University', 'Community College', 'Technical Institute']),
                        degree: getRandomElement(['High School Diploma', 'Associate Degree', 'Bachelor Degree']),
                        field: getRandomElement(['General Studies', 'Social Work', 'Psychology']),
                        startYear: birthYear + 18,
                        endYear: birthYear + 22
                    }]
                }
            });
            applicants.push(applicant);
        }

        console.log(`✅ Created ${applicants.length} applicant profiles`);

        console.log('📝 Creating job applications...');
        const applications = [];

        // Create 3-8 applications per job
        for (const job of jobs) {
            const numApplications = 3 + Math.floor(Math.random() * 6);
            const selectedApplicants = getRandomElements(applicants, numApplications);

            for (const applicant of selectedApplicants) {
                const hiringStage = getRandomElement(hiringStages);
                const score = Math.floor(Math.random() * 5) + (hiringStage === 'Declined' ? 0 : 1);

                const notes = [];
                if (Math.random() > 0.5) {
                    const employer = employers.find(e => e._id.equals(job.employerId));
                    notes.push({
                        text: getRandomElement([
                            'Great candidate, strong communication skills.',
                            'Excellent experience with IDD population.',
                            'Please do an interview stage immediately. The design division needs more new employee now',
                            'Good fit for our team culture.',
                            'Lacks required certifications but shows potential.',
                            'Please do an interview stage immediately.'
                        ]),
                        addedBy: employer._id,
                        authorName: employer.name,
                        authorAvatar: employer.avatar,
                        addedAt: getRandomDate(new Date(2024, 6, 1), new Date())
                    });
                }

                const assignedTo = [];
                if (hiringStage === 'Interview' && Math.random() > 0.5) {
                    const teamMembers = getRandomElements(employers, 1 + Math.floor(Math.random() * 2));
                    teamMembers.forEach(member => {
                        assignedTo.push({
                            user: member._id,
                            name: member.name,
                            avatar: member.avatar
                        });
                    });
                }

                const interview = hiringStage === 'Interview' ? {
                    scheduledAt: getRandomDate(new Date(), new Date(2024, 11, 31)),
                    type: getRandomElement(['Phone', 'Video', 'In-Person']),
                    location: 'Silver Crysta Room, Nomad Office\n3517 W. Gray St. Utica, Pennsylvania 57867',
                    notes: 'Please arrive 10 minutes early',
                    status: getRandomElement(['Scheduled', 'On Progress', 'Completed'])
                } : undefined;

                const application = await Application.create({
                    job: job._id,
                    applicant: applicant._id,
                    coverLetter: `I am excited to apply for the ${job.title} position at ${job.company}. With my background in providing support to individuals with developmental disabilities, I believe I would be a great fit for your team.`,
                    resume: {
                        url: `https://example.com/resumes/${applicant._id}.pdf`,
                        filename: `${applicant.name.replace(/\s/g, '_')}_Resume.pdf`
                    },
                    applicantInfo: {
                        name: applicant.name,
                        email: applicant.email,
                        phone: applicant.phone,
                        linkedIn: applicant.profile.socialLinks.linkedin
                    },
                    status: hiringStage === 'Interview' ? 'Interview' : hiringStage === 'Shortlisted' ? 'Shortlisted' : 'Reviewed',
                    score,
                    hiringStage,
                    notes,
                    assignedTo,
                    interview,
                    appliedAt: getRandomDate(new Date(2024, 5, 1), new Date())
                });
                applications.push(application);
            }
        }

        console.log(`✅ Created ${applications.length} applications`);

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${employers.length} employer accounts`);
        console.log(`   - ${jobs.length} job postings`);
        console.log(`   - ${applicants.length} applicant profiles`);
        console.log(`   - ${applications.length} applications\n`);

        console.log('🔐 Login Credentials:');
        employers.forEach(emp => {
            console.log(`   Employer: ${emp.email} / password123`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
