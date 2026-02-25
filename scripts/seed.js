import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import connectDB from '../config/db.js';

dotenv.config();

// connectDB(); // Moved to run() function

// Realistic Users
const users = [
    {
        name: 'Michael Johnson',
        email: 'michael.johnson@email.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '303-555-1234',
        bio: 'Dedicated caregiver with 3 years of experience supporting individuals with developmental disabilities.',
        profile: {
            headline: 'Experienced DSP Professional',
            location: 'Denver, CO',
            skills: ['Personal Care', 'Medication Administration', 'Behavioral Support', 'Transportation'],
            certifications: ['CPR', 'First Aid', 'QMAP'],
            experienceYears: 3,
            desiredSalary: { min: 18, max: 22 },
            availability: 'Immediately',
            preferredShifts: ['Day', 'Evening']
        }
    },
    {
        name: 'Sarah Williams',
        email: 'sarah.williams@email.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '720-555-5678',
        bio: 'CNA with passion for helping individuals with IDD achieve their goals.',
        profile: {
            headline: 'Certified Nursing Assistant',
            location: 'Aurora, CO',
            skills: ['Vital Signs', 'ADL Assistance', 'Documentation', 'Communication'],
            certifications: ['CNA', 'CPR', 'First Aid', 'BLS'],
            experienceYears: 5,
            desiredSalary: { min: 20, max: 25 },
            availability: '2 Weeks',
            preferredShifts: ['Day', 'Weekend']
        }
    },
    {
        name: 'David Chen',
        email: 'david.chen@email.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '303-555-9012',
        bio: 'Recent graduate looking to start a career in disability services.',
        profile: {
            headline: 'Entry-Level DSP Seeking Opportunities',
            location: 'Boulder, CO',
            skills: ['Communication', 'Patience', 'Problem Solving', 'Team Player'],
            certifications: ['CPR', 'First Aid'],
            experienceYears: 0,
            desiredSalary: { min: 16, max: 19 },
            availability: 'Immediately',
            preferredShifts: ['Flexible']
        }
    },
    {
        name: 'Jennifer Martinez',
        email: 'jennifer@sunrisecommunity.org',
        password: 'password123',
        role: 'employer',
        phone: '303-555-3456',
        bio: 'HR Director at Sunrise Community Services',
        company: {
            name: 'Sunrise Community Services',
            website: 'https://sunrisecommunity.org',
            description: 'Sunrise Community Services has been providing quality care for individuals with intellectual and developmental disabilities since 1985. We operate 15 group homes across the Denver metro area.',
            size: '100-250 employees',
            industry: 'Healthcare / Social Services',
            address: {
                street: '1234 Main Street',
                city: 'Denver',
                state: 'CO',
                zip: '80202'
            }
        }
    },
    {
        name: 'Robert Thompson',
        email: 'robert@pathwaysindependence.com',
        password: 'password123',
        role: 'employer',
        phone: '720-555-7890',
        bio: 'Recruiting Manager at Pathways to Independence',
        company: {
            name: 'Pathways to Independence',
            website: 'https://pathwaysindependence.com',
            description: 'Pathways to Independence helps adults with disabilities live fulfilling lives through residential services, day programs, and employment support.',
            size: '50-100 employees',
            industry: 'Healthcare / Social Services',
            address: {
                street: '5678 Oak Avenue',
                city: 'Aurora',
                state: 'CO',
                zip: '80012'
            }
        }
    },
    {
        name: 'Admin User',
        email: 'admin@iddjobs.com',
        password: 'admin123',
        role: 'admin',
        phone: '303-555-0000'
    }
];

// Realistic job data with proper salaries based on Colorado market rates
const generateJobs = (employers) => {
    const sunriseId = employers[0]._id;
    const pathwaysId = employers[1]._id;

    const jobs = [
        // DSP Jobs - Entry Level ($16-20/hr)
        {
            title: 'Direct Support Professional (DSP)',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Denver, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'DSP',
            salary: { min: 17, max: 20, period: 'Hourly' },
            shifts: ['Day', 'Evening'],
            hoursPerWeek: { min: 36, max: 40 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'High School Diploma or GED',
                'Valid Colorado Driver\'s License',
                'Must pass background check',
                'Reliable transportation',
                'Ability to lift 50 lbs'
            ],
            qualifications: [
                'High School Diploma or GED',
                'Valid Colorado Driver\'s License',
                'Must pass background check',
                'Reliable transportation',
                'Ability to lift 50 lbs'
            ],
            experienceLevel: 'Entry Level',
            description: 'Sunrise Community Services is seeking compassionate Direct Support Professionals to assist individuals with intellectual and developmental disabilities in our residential programs. You will help with daily living activities, community outings, and skill development while promoting independence and dignity.',
            responsibilities: [
                'Assist individuals with personal care needs including bathing, dressing, and grooming',
                'Support medication administration following QMAP protocols',
                'Facilitate community integration activities and outings',
                'Document daily progress notes and incidents',
                'Implement individualized support plans',
                'Maintain a safe and clean living environment'
            ],
            benefits: [
                'Health, dental, and vision insurance',
                'Paid training and certification',
                '401(k) with company match',
                'Paid time off and sick leave',
                'Flexible scheduling',
                'Career advancement opportunities'
            ],
            perks: [
                { title: 'Healthcare', description: 'Comprehensive health coverage', icon: 'stethoscope' },
                { title: 'Insurance', description: 'Life and disability insurance', icon: 'umbrella' },
                { title: 'Remote Work', description: 'Hybrid options available', icon: 'video' }
            ],
            officeImages: [
                '/images/office-1.svg',
                '/images/office-2.svg',
                '/images/office-3.svg'
            ],
            status: 'Open',
            featured: true,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2026-01-03'),
            expiresAt: new Date('2026-02-03')
        },
        {
            title: 'Weekend DSP - Part Time',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Aurora, CO',
            workMode: 'On-site',
            type: 'Part-Time',
            roleCategory: 'DSP',
            salary: { min: 18, max: 21, period: 'Hourly' },
            shifts: ['Weekend'],
            hoursPerWeek: { min: 16, max: 24 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'High School Diploma or GED',
                'Available Saturdays and Sundays',
                'Valid Driver\'s License',
                'Background check required'
            ],
            experienceLevel: 'Entry Level',
            description: 'Looking for reliable weekend staff to provide support in our Aurora group home. Perfect for students or those seeking supplemental income. Weekend differential pay included!',
            responsibilities: [
                'Provide personal care assistance',
                'Plan and facilitate weekend activities',
                'Prepare meals and assist with nutrition',
                'Document care provided',
                'Communicate with weekday staff during transitions'
            ],
            benefits: [
                'Weekend differential pay (+$1/hr)',
                'Flexible scheduling',
                'Paid training',
                'Holiday pay (time and a half)'
            ],
            status: 'Open',
            featured: false,
            urgent: true,
            employerId: sunriseId,
            postedAt: new Date('2026-01-05'),
            expiresAt: new Date('2026-01-26')
        },
        {
            title: 'Overnight Direct Support Professional',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Lakewood, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'DSP',
            salary: { min: 18, max: 22, period: 'Hourly' },
            shifts: ['Overnight'],
            hoursPerWeek: { min: 36, max: 40 },
            certifications: ['CPR', 'First Aid', 'QMAP'],
            requirements: [
                'Previous experience in residential care preferred',
                'Ability to stay awake and alert during overnight shifts',
                'Valid Driver\'s License',
                'High School Diploma or GED'
            ],
            experienceLevel: 'Entry Level',
            description: 'Join our overnight team providing essential support to adults with IDD in our Lakewood residence. Overnight shift includes differential pay. Responsibilities include safety monitoring, medication support, and emergency response.',
            responsibilities: [
                'Monitor residents during sleeping hours',
                'Respond to overnight needs and emergencies',
                'Complete overnight documentation',
                'Assist with morning routines before shift change',
                'Light housekeeping duties',
                'Administer scheduled medications'
            ],
            benefits: [
                'Overnight differential (+$2/hr)',
                'Full health benefits',
                'Paid time off',
                '401(k) retirement plan',
                'Life insurance'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-02'),
            expiresAt: new Date('2026-02-02')
        },

        // Caregiver Jobs ($15-19/hr)
        {
            title: 'Personal Care Assistant (PCA)',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Boulder, CO',
            workMode: 'On-site',
            type: 'Part-Time',
            roleCategory: 'Caregiver',
            salary: { min: 16, max: 19, period: 'Hourly' },
            shifts: ['Day', 'Flexible'],
            hoursPerWeek: { min: 20, max: 30 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'Compassionate and patient demeanor',
                'Reliable transportation',
                'Background check required',
                'Ability to work flexible hours'
            ],
            experienceLevel: 'No Experience Required',
            description: 'We are looking for caring individuals to provide personal care assistance to clients in their homes. This is a great entry-level position with training provided. Help our clients maintain their independence while living in the community.',
            responsibilities: [
                'Assist with bathing, dressing, and personal hygiene',
                'Help with meal preparation and feeding',
                'Provide companionship and emotional support',
                'Light housekeeping and laundry',
                'Transportation to appointments',
                'Report changes in client condition'
            ],
            benefits: [
                'Flexible scheduling',
                'Paid training',
                'Mileage reimbursement',
                'Weekly pay',
                'Supportive supervision'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-04'),
            expiresAt: new Date('2026-02-04')
        },
        {
            title: 'Respite Care Provider',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Colorado Springs, CO',
            workMode: 'On-site',
            type: 'PRN',
            roleCategory: 'Caregiver',
            salary: { min: 17, max: 20, period: 'Hourly' },
            shifts: ['Flexible', 'Weekend'],
            hoursPerWeek: { min: 0, max: 20 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'Experience with individuals with disabilities preferred',
                'Flexible availability',
                'Own transportation',
                'Background check required'
            ],
            experienceLevel: 'Entry Level',
            description: 'Provide temporary relief care to families of individuals with IDD. Work on an as-needed basis in family homes throughout Colorado Springs. This position offers great flexibility and the opportunity to make a real difference for families.',
            responsibilities: [
                'Provide supervision and care during respite periods',
                'Engage clients in meaningful activities',
                'Follow family care plans and routines',
                'Ensure safety at all times',
                'Communicate with families about care provided'
            ],
            benefits: [
                'Set your own schedule',
                'Competitive hourly rate',
                'No minimum hours required',
                'Training provided'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2025-12-28'),
            expiresAt: new Date('2026-01-28')
        },
        {
            title: 'Live-In Caregiver',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Fort Collins, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'Caregiver',
            salary: { min: 950, max: 1200, period: 'Weekly' },
            shifts: ['Live-In'],
            hoursPerWeek: { min: 40, max: 50 },
            certifications: ['CPR', 'First Aid', 'QMAP'],
            requirements: [
                '2+ years caregiving experience',
                'Comfortable living on-site',
                'Valid Driver\'s License',
                'Must pass extensive background check',
                'References required'
            ],
            experienceLevel: 'Mid Level',
            description: 'Seeking an experienced live-in caregiver to support a young adult with autism in their Fort Collins home. Room and board provided in addition to competitive weekly salary. This position requires patience, consistency, and excellent communication skills.',
            responsibilities: [
                'Provide 24/7 support with breaks scheduled',
                'Assist with all daily living activities',
                'Implement behavioral support strategies',
                'Coordinate medical appointments',
                'Meal planning and preparation',
                'Community integration and socialization'
            ],
            benefits: [
                'Private room and board included',
                'Competitive weekly salary',
                'Health insurance',
                'Paid time off',
                '2 days off per week'
            ],
            status: 'Open',
            featured: true,
            urgent: true,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-06'),
            expiresAt: new Date('2026-02-06')
        },

        // Nursing Jobs ($28-45/hr)
        {
            title: 'Registered Nurse (RN) - IDD Services',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Denver, CO',
            workMode: 'Hybrid',
            type: 'Full-Time',
            roleCategory: 'Nurse',
            salary: { min: 35, max: 45, period: 'Hourly' },
            shifts: ['Day'],
            hoursPerWeek: { min: 36, max: 40 },
            certifications: ['RN', 'BLS', 'CPR'],
            requirements: [
                'Active Colorado RN License',
                'BSN preferred',
                '2+ years nursing experience',
                'Experience with IDD population preferred',
                'Strong assessment and documentation skills'
            ],
            experienceLevel: 'Mid Level',
            description: 'Sunrise Community Services is seeking a Registered Nurse to oversee health services across our residential programs. You will provide nursing assessments, train staff on medical protocols, and coordinate with healthcare providers to ensure quality care for individuals with IDD.',
            responsibilities: [
                'Conduct nursing assessments and develop care plans',
                'Oversee medication administration programs',
                'Train and supervise DSP staff on health protocols',
                'Coordinate with physicians and specialists',
                'Respond to medical emergencies',
                'Ensure compliance with state health regulations',
                'Maintain medical records and documentation'
            ],
            benefits: [
                'Competitive salary',
                'Comprehensive health benefits',
                'Student loan repayment assistance',
                '401(k) with 4% match',
                'Generous PTO',
                'Professional development stipend',
                'Monday-Friday schedule (no weekends!)'
            ],
            status: 'Open',
            featured: true,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2026-01-01'),
            expiresAt: new Date('2026-02-15')
        },
        {
            title: 'Licensed Practical Nurse (LPN)',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Aurora, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'Nurse',
            salary: { min: 28, max: 34, period: 'Hourly' },
            shifts: ['Day', 'Evening', 'Rotating'],
            hoursPerWeek: { min: 36, max: 40 },
            certifications: ['LPN', 'CPR', 'First Aid'],
            requirements: [
                'Active Colorado LPN License',
                '1+ year LPN experience',
                'Experience with developmental disabilities a plus',
                'Ability to work rotating schedule'
            ],
            experienceLevel: 'Entry Level',
            description: 'Join our nursing team providing skilled nursing care in our Aurora residential facility. Work alongside a supportive team to provide medication management, health monitoring, and nursing interventions for adults with IDD.',
            responsibilities: [
                'Administer medications and treatments',
                'Monitor and document vital signs',
                'Assist RN with assessments',
                'Provide wound care and other nursing procedures',
                'Communicate with families and healthcare providers',
                'Train DSP staff on health-related tasks'
            ],
            benefits: [
                'Health, dental, vision insurance',
                '401(k) retirement plan',
                'Paid time off',
                'Continuing education support',
                'Shift differentials available'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-03'),
            expiresAt: new Date('2026-02-03')
        },
        {
            title: 'PRN Nurse - Weekends',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Thornton, CO',
            workMode: 'On-site',
            type: 'PRN',
            roleCategory: 'Nurse',
            salary: { min: 38, max: 48, period: 'Hourly' },
            shifts: ['Weekend'],
            hoursPerWeek: { min: 8, max: 24 },
            certifications: ['RN', 'CPR', 'BLS'],
            requirements: [
                'Active Colorado RN License',
                'Weekend availability required',
                'Minimum 1 shift per month commitment'
            ],
            experienceLevel: 'Mid Level',
            description: 'Looking for experienced RNs to provide PRN weekend coverage at our Thornton location. Premium pay rates for this flexible position. Perfect for nurses looking to supplement their income or maintain clinical skills.',
            responsibilities: [
                'Provide nursing coverage during weekend shifts',
                'Handle medication management and nursing assessments',
                'Respond to health concerns and emergencies',
                'Document all nursing interventions',
                'Communicate with on-call physician as needed'
            ],
            benefits: [
                'Premium PRN pay rate',
                'Flexible scheduling',
                'Pick up shifts as available',
                'No minimum hours required after first month'
            ],
            status: 'Open',
            featured: false,
            urgent: true,
            employerId: sunriseId,
            postedAt: new Date('2026-01-05'),
            expiresAt: new Date('2026-02-05')
        },

        // Admin/Management Jobs ($22-35/hr or salary)
        {
            title: 'Group Home Manager',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Westminster, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'Admin',
            salary: { min: 52000, max: 62000, period: 'Yearly' },
            shifts: ['Day'],
            hoursPerWeek: { min: 40, max: 45 },
            certifications: ['CPR', 'First Aid', 'QMAP'],
            requirements: [
                'Bachelor\'s degree in Human Services or related field',
                '3+ years experience in IDD services',
                '1+ year supervisory experience',
                'Valid Driver\'s License',
                'Strong leadership and organizational skills'
            ],
            experienceLevel: 'Senior Level',
            description: 'Lead our Westminster group home team in providing exceptional care and support. The Group Home Manager oversees daily operations, supervises staff, ensures regulatory compliance, and advocates for the individuals we serve.',
            responsibilities: [
                'Supervise and schedule DSP staff team of 8-10',
                'Ensure quality care and program implementation',
                'Manage home budget and inventory',
                'Conduct staff training and performance evaluations',
                'Maintain regulatory compliance',
                'Coordinate with families, case managers, and healthcare providers',
                'On-call rotation for emergencies'
            ],
            benefits: [
                'Competitive salary',
                'Comprehensive benefits package',
                '401(k) with employer match',
                'Generous PTO',
                'Professional development opportunities',
                'Company cell phone',
                'Mileage reimbursement'
            ],
            status: 'Open',
            featured: true,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2025-12-20'),
            expiresAt: new Date('2026-01-31')
        },
        {
            title: 'Program Coordinator - Day Services',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Centennial, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'Admin',
            salary: { min: 45000, max: 55000, period: 'Yearly' },
            shifts: ['Day'],
            hoursPerWeek: { min: 40, max: 40 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'Bachelor\'s degree preferred',
                '2+ years experience in day program services',
                'Strong programming and activity planning skills',
                'Experience with person-centered planning'
            ],
            experienceLevel: 'Mid Level',
            description: 'Coordinate our day program services for adults with IDD. Develop engaging activities, manage program staff, and ensure meaningful experiences for program participants. This role combines direct service with administrative responsibilities.',
            responsibilities: [
                'Develop and implement daily programming',
                'Supervise day program staff',
                'Coordinate community outings and activities',
                'Maintain program documentation',
                'Communicate with families and residential teams',
                'Ensure program meets state requirements',
                'Manage program budget'
            ],
            benefits: [
                'Medical, dental, vision insurance',
                '401(k) plan',
                'Paid holidays and PTO',
                'Professional development',
                'Monday-Friday schedule'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-02'),
            expiresAt: new Date('2026-02-02')
        },
        {
            title: 'Case Manager',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Denver, CO',
            workMode: 'Hybrid',
            type: 'Full-Time',
            roleCategory: 'Admin',
            salary: { min: 48000, max: 58000, period: 'Yearly' },
            shifts: ['Day'],
            hoursPerWeek: { min: 40, max: 40 },
            certifications: [],
            requirements: [
                'Bachelor\'s degree in Social Work, Psychology, or related field',
                '2+ years case management experience',
                'Knowledge of Colorado IDD waiver programs',
                'Strong documentation and communication skills',
                'Valid Driver\'s License'
            ],
            experienceLevel: 'Mid Level',
            description: 'Manage a caseload of individuals receiving residential and day services. Coordinate services, develop person-centered plans, and advocate for individuals to achieve their goals. This position requires travel between program sites.',
            responsibilities: [
                'Develop and monitor Individual Support Plans',
                'Coordinate services across providers',
                'Conduct assessments and eligibility determination',
                'Attend ISP meetings and advocate for client needs',
                'Maintain accurate case documentation',
                'Connect individuals with community resources',
                'Ensure compliance with waiver requirements'
            ],
            benefits: [
                'Hybrid work schedule (3 days in office)',
                'Comprehensive benefits',
                'Professional development budget',
                '401(k) with match',
                'Generous PTO',
                'Mileage reimbursement'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2026-01-04'),
            expiresAt: new Date('2026-02-04')
        },

        // Behavioral Jobs ($20-32/hr)
        {
            title: 'Behavioral Technician (RBT)',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Denver, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'Behavioral',
            salary: { min: 20, max: 26, period: 'Hourly' },
            shifts: ['Day', 'Evening'],
            hoursPerWeek: { min: 35, max: 40 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'High School Diploma required, Bachelor\'s preferred',
                'RBT certification or willingness to obtain within 90 days',
                'Experience working with individuals with autism or IDD',
                'Reliable transportation'
            ],
            experienceLevel: 'Entry Level',
            description: 'Implement behavior support plans under the supervision of a BCBA. Work one-on-one with individuals with autism and developmental disabilities to teach skills and reduce challenging behaviors. Training and RBT certification support provided.',
            responsibilities: [
                'Implement behavior intervention plans',
                'Collect and record behavioral data',
                'Teach functional skills using ABA techniques',
                'Communicate progress with BCBA and families',
                'Participate in team meetings',
                'Maintain professional documentation'
            ],
            benefits: [
                'RBT certification training provided',
                'Health benefits',
                'Paid time off',
                'Supervision hours for BCBA track',
                'Professional development opportunities'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-01'),
            expiresAt: new Date('2026-02-01')
        },
        {
            title: 'Behavior Support Specialist',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Arvada, CO',
            workMode: 'Hybrid',
            type: 'Full-Time',
            roleCategory: 'Behavioral',
            salary: { min: 26, max: 32, period: 'Hourly' },
            shifts: ['Day', 'Flexible'],
            hoursPerWeek: { min: 40, max: 40 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'Bachelor\'s degree in Psychology, Special Education, or related field',
                '2+ years experience in behavior support',
                'Training in positive behavior supports',
                'BCaBA or BCBA certification preferred'
            ],
            experienceLevel: 'Mid Level',
            description: 'Develop and implement positive behavior support plans for individuals across our residential programs. Train staff on behavioral strategies, conduct functional assessments, and collaborate with families and treatment teams.',
            responsibilities: [
                'Conduct functional behavior assessments',
                'Develop positive behavior support plans',
                'Train direct care staff on plan implementation',
                'Monitor effectiveness and adjust plans',
                'Respond to behavioral crises',
                'Participate in ISP meetings',
                'Maintain required documentation'
            ],
            benefits: [
                'Competitive hourly rate',
                'Full benefits package',
                'Flexible schedule',
                'Professional development stipend',
                'Supervision for BCBA certification'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2026-01-03'),
            expiresAt: new Date('2026-02-03')
        },

        // More DSP positions with variety
        {
            title: 'Community Support Specialist',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Lakewood, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'DSP',
            salary: { min: 18, max: 21, period: 'Hourly' },
            shifts: ['Day'],
            hoursPerWeek: { min: 40, max: 40 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'High School Diploma or GED',
                'Valid Driver\'s License with clean record',
                'Ability to drive company vehicles',
                'Strong community connections preferred'
            ],
            experienceLevel: 'Entry Level',
            description: 'Support individuals with IDD in accessing their community! This unique position focuses on community integration, vocational support, and helping individuals build meaningful connections outside of residential settings.',
            responsibilities: [
                'Transport individuals to jobs and activities',
                'Support individuals in community settings',
                'Assist with job coaching and employment support',
                'Facilitate social connections and friendships',
                'Document community participation',
                'Coordinate with residential teams'
            ],
            benefits: [
                'Monday-Friday schedule',
                'Company vehicle provided',
                'Health insurance',
                'Paid time off',
                '401(k) plan'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2025-12-30'),
            expiresAt: new Date('2026-01-30')
        },
        {
            title: 'DSP - Day Program',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Centennial, CO',
            workMode: 'On-site',
            type: 'Full-Time',
            roleCategory: 'DSP',
            salary: { min: 17, max: 19, period: 'Hourly' },
            shifts: ['Day'],
            hoursPerWeek: { min: 36, max: 40 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'High School Diploma or GED',
                'Interest in activity programming',
                'Creative and energetic personality',
                'Background check required'
            ],
            experienceLevel: 'No Experience Required',
            description: 'Join our day program team! No weekends or evenings required. Support adults with IDD in meaningful daytime activities including arts, recreation, life skills, and community outings. Perfect for those new to the field!',
            responsibilities: [
                'Facilitate group activities and programming',
                'Assist with personal care as needed',
                'Lead recreational activities',
                'Support individuals during outings',
                'Maintain activity documentation',
                'Communicate with families and residential staff'
            ],
            benefits: [
                'Monday-Friday, 8am-4pm schedule',
                'No weekends!',
                'Health benefits available',
                'Paid training',
                'Great entry-level opportunity'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2026-01-05'),
            expiresAt: new Date('2026-02-05')
        },
        {
            title: 'Job Coach',
            company: 'Pathways to Independence',
            companyLogo: '/images/companies/pathways.svg',
            location: 'Denver, CO',
            workMode: 'On-site',
            type: 'Part-Time',
            roleCategory: 'DSP',
            salary: { min: 19, max: 23, period: 'Hourly' },
            shifts: ['Day', 'Flexible'],
            hoursPerWeek: { min: 20, max: 30 },
            certifications: ['CPR', 'First Aid'],
            requirements: [
                'Experience in job coaching or vocational services preferred',
                'Valid Driver\'s License',
                'Flexible schedule to accommodate client work hours',
                'Strong communication and advocacy skills'
            ],
            experienceLevel: 'Entry Level',
            description: 'Help individuals with IDD succeed in competitive employment! Provide on-site job coaching, employer relationship building, and support individuals in maintaining meaningful employment in the community.',
            responsibilities: [
                'Provide on-site job coaching at employer locations',
                'Train individuals on job tasks and workplace expectations',
                'Build relationships with employers',
                'Document employment progress',
                'Fade support as individuals gain independence',
                'Coordinate with case managers and families'
            ],
            benefits: [
                'Flexible hours',
                'Mileage reimbursement',
                'Professional development',
                'Rewarding work helping people achieve employment goals'
            ],
            status: 'Open',
            featured: false,
            urgent: false,
            employerId: pathwaysId,
            postedAt: new Date('2026-01-04'),
            expiresAt: new Date('2026-02-04')
        },
        {
            title: 'Host Home Provider',
            company: 'Sunrise Community Services',
            companyLogo: '/images/companies/sunrise.svg',
            location: 'Colorado Springs, CO',
            workMode: 'On-site',
            type: 'Contract',
            roleCategory: 'Caregiver',
            salary: { min: 2800, max: 4500, period: 'Monthly' },
            shifts: ['Live-In'],
            hoursPerWeek: { min: 40, max: 50 },
            certifications: ['CPR', 'First Aid', 'QMAP'],
            requirements: [
                'Spare bedroom in your home',
                'Pass home study and background check',
                'Ability to provide 24/7 support with scheduled respite',
                'Experience with disabilities preferred',
                'Must be at least 21 years old'
            ],
            experienceLevel: 'Entry Level',
            description: 'Become a Host Home Provider and share your home with an adult with IDD! You will provide a family-like environment while supporting daily living skills and community participation. Comprehensive training, ongoing support, and competitive monthly stipend provided.',
            responsibilities: [
                'Provide a safe and welcoming home environment',
                'Support daily living activities',
                'Facilitate community involvement',
                'Attend required training and meetings',
                'Maintain documentation',
                'Coordinate with support team'
            ],
            benefits: [
                'Monthly stipend of $2,800-$4,500 based on support needs',
                'Respite care provided (minimum 14 days/year)',
                'All training provided',
                'Ongoing support from dedicated coordinator',
                '24/7 on-call support available'
            ],
            status: 'Open',
            featured: true,
            urgent: false,
            employerId: sunriseId,
            postedAt: new Date('2025-12-15'),
            expiresAt: new Date('2026-02-15')
        }
    ];

    return jobs;
};

// Generate sample applications
const generateApplications = (jobs, jobseekers) => {
    const applications = [
        {
            job: jobs[0]._id, // DSP position
            applicant: jobseekers[0]._id, // Michael Johnson
            coverLetter: 'I am excited to apply for the DSP position at Sunrise Community Services. With 3 years of experience supporting individuals with developmental disabilities, I believe I would be a valuable addition to your team. I am passionate about promoting independence and dignity for all individuals.',
            resume: {
                url: '/resumes/michael_johnson_resume.pdf',
                filename: 'michael_johnson_resume.pdf'
            },
            applicantInfo: {
                name: 'Michael Johnson',
                email: 'michael.johnson@email.com',
                phone: '303-555-1234'
            },
            status: 'Reviewed',
            appliedAt: new Date('2026-01-04')
        },
        {
            job: jobs[0]._id, // Same DSP position
            applicant: jobseekers[2]._id, // David Chen
            coverLetter: 'As a recent graduate, I am eager to begin my career in disability services. While I may not have direct experience, I bring enthusiasm, reliability, and a genuine desire to make a positive impact in the lives of others.',
            resume: {
                url: '/resumes/david_chen_resume.pdf',
                filename: 'david_chen_resume.pdf'
            },
            applicantInfo: {
                name: 'David Chen',
                email: 'david.chen@email.com',
                phone: '303-555-9012'
            },
            status: 'Pending',
            appliedAt: new Date('2026-01-05')
        },
        {
            job: jobs[6]._id, // RN position
            applicant: jobseekers[1]._id, // Sarah Williams (CNA applying for RN - just for demo)
            coverLetter: 'I am writing to express my strong interest in the RN position. I have been working as a CNA while completing my nursing degree and am passionate about serving the IDD population.',
            resume: {
                url: '/resumes/sarah_williams_resume.pdf',
                filename: 'sarah_williams_resume.pdf'
            },
            applicantInfo: {
                name: 'Sarah Williams',
                email: 'sarah.williams@email.com',
                phone: '720-555-5678'
            },
            status: 'Pending',
            appliedAt: new Date('2026-01-06')
        },
        {
            job: jobs[3]._id, // PCA position
            applicant: jobseekers[2]._id, // David Chen
            coverLetter: 'I am interested in the Personal Care Assistant position as I begin my career in healthcare. I am a quick learner and dedicated to providing compassionate care.',
            resume: {
                url: '/resumes/david_chen_resume.pdf',
                filename: 'david_chen_resume.pdf'
            },
            applicantInfo: {
                name: 'David Chen',
                email: 'david.chen@email.com',
                phone: '303-555-9012'
            },
            status: 'Shortlisted',
            notes: [{
                text: 'Good candidate for entry-level position. Schedule phone interview.',
                addedAt: new Date('2026-01-05')
            }],
            appliedAt: new Date('2026-01-04')
        },
        {
            job: jobs[1]._id, // Weekend DSP
            applicant: jobseekers[0]._id, // Michael Johnson
            coverLetter: 'I am looking for additional weekend shifts to supplement my current work. I have excellent availability on Saturdays and Sundays and would love to contribute to your Aurora team.',
            resume: {
                url: '/resumes/michael_johnson_resume.pdf',
                filename: 'michael_johnson_resume.pdf'
            },
            applicantInfo: {
                name: 'Michael Johnson',
                email: 'michael.johnson@email.com',
                phone: '303-555-1234'
            },
            status: 'Interview',
            interview: {
                scheduledAt: new Date('2026-01-10T10:00:00'),
                type: 'Video',
                notes: 'Zoom interview scheduled'
            },
            notes: [{
                text: 'Experienced candidate, good availability. Scheduled video interview.',
                addedAt: new Date('2026-01-06')
            }],
            appliedAt: new Date('2026-01-05')
        }
    ];

    return applications;
};

const importData = async () => {
    try {
        // Clear existing data
        await Application.deleteMany();
        await Job.deleteMany();
        await User.deleteMany();

        console.log('Cleared existing data...');

        // Create users
        const createdUsers = await User.create(users);
        console.log(`Created ${createdUsers.length} users`);

        // Get employer IDs
        const employers = createdUsers.filter(u => u.role === 'employer');
        const jobseekers = createdUsers.filter(u => u.role === 'jobseeker');

        // Create jobs
        const jobsData = generateJobs(employers);
        const createdJobs = await Job.insertMany(jobsData);
        console.log(`Created ${createdJobs.length} jobs`);

        // Create applications
        const applicationsData = generateApplications(createdJobs, jobseekers);
        const createdApplications = await Application.insertMany(applicationsData);
        console.log(`Created ${createdApplications.length} applications`);

        // Update application counts on jobs
        for (const job of createdJobs) {
            const count = await Application.countDocuments({ job: job._id });
            await Job.findByIdAndUpdate(job._id, { applicationsCount: count });
        }

        console.log('\n✅ Data Import Complete!');
        console.log('------------------------');
        console.log(`Users: ${createdUsers.length}`);
        console.log(`  - Job Seekers: ${jobseekers.length}`);
        console.log(`  - Employers: ${employers.length}`);
        console.log(`  - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
        console.log(`Jobs: ${createdJobs.length}`);
        console.log(`Applications: ${createdApplications.length}`);
        console.log('------------------------');

        process.exit();
    } catch (error) {
        console.error('Import Error:', error);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Application.deleteMany();
        await Job.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();

