import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

// pdf-parse is CommonJS-only; use createRequire to load it in an ESM context
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// ============================================================================
// Helper: Call Gemini with a prompt and return parsed JSON
// ============================================================================
async function callGemini(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
}

// ============================================================================
// @desc    Parse a resume PDF and extract structured data
// @route   POST /api/v1/ai/parse-resume
// @access  Private (jobseeker)
// ============================================================================
export const parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
        }

        // Read the uploaded file buffer
        const filePath = path.resolve(req.file.path);
        const dataBuffer = fs.readFileSync(filePath);

        // Extract raw text from PDF
        let pdfText = '';
        try {
            const pdfData = await pdfParse(dataBuffer);
            pdfText = pdfData.text;
        } catch (pdfError) {
            logger.warn(`PDF parse warning: ${pdfError.message}`);
            // If pdf-parse fails, still try to send the file reference
            pdfText = '';
        }

        if (!pdfText || pdfText.trim().length < 20) {
            return res.status(422).json({
                success: false,
                message: 'Could not extract text from the PDF. Please ensure it is a text-based PDF (not a scanned image).'
            });
        }

        // Build Gemini prompt
        const prompt = `
You are a professional resume parser. Extract structured information from the following resume text.

Return ONLY a valid JSON object with this exact structure (use null for missing fields, empty arrays for missing lists):
{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "currentJobTitle": "string or null",
  "linkedin": "string or null",
  "portfolio": "string or null",
  "summary": "string or null",
  "skills": ["string"],
  "certifications": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "location": "string or null",
      "startDate": "string or null",
      "endDate": "string or null",
      "current": boolean,
      "description": "string or null"
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "startYear": "string or null",
      "endYear": "string or null"
    }
  ],
  "languages": ["string"],
  "address": "string or null"
}

Resume Text:
---
${pdfText.slice(0, 8000)}
---

Return ONLY the JSON object. No markdown, no explanation.
`;

        const parsed = await callGemini(prompt);

        // Attach file info
        const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const resumeFilename = req.file.originalname;

        res.status(200).json({
            success: true,
            data: {
                parsed,
                resume: {
                    url: resumeUrl,
                    filename: resumeFilename,
                    path: req.file.filename
                },
                rawTextLength: pdfText.length
            }
        });
    } catch (error) {
        logger.error(`parseResume Error: ${error.message}`, { stack: error.stack });

        if (error instanceof SyntaxError) {
            return res.status(500).json({
                success: false,
                message: 'AI returned an unexpected response. Please try again.',
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to parse resume.'
        });
    }
};

// ============================================================================
// @desc    Check candidate qualification against a job
// @route   POST /api/v1/ai/check-qualification
// @access  Private (jobseeker)
// ============================================================================
export const checkQualification = async (req, res) => {
    try {
        const { jobId, resumeText, parsedData } = req.body;

        if (!jobId) {
            return res.status(400).json({ success: false, message: 'jobId is required.' });
        }

        if (!resumeText && !parsedData) {
            return res.status(400).json({ success: false, message: 'Resume text or parsed data is required.' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        // Build candidate context from parsedData or raw text
        const candidateContext = parsedData
            ? `
Candidate Name: ${parsedData.fullName || 'Unknown'}
Current Title: ${parsedData.currentJobTitle || 'Unknown'}
Skills: ${(parsedData.skills || []).join(', ') || 'None listed'}
Certifications: ${(parsedData.certifications || []).join(', ') || 'None listed'}
Experience: ${(parsedData.experience || []).map(e => `${e.role} at ${e.company}`).join('; ') || 'None listed'}
Education: ${(parsedData.education || []).map(e => `${e.degree} from ${e.school}`).join('; ') || 'None listed'}
Languages: ${(parsedData.languages || []).join(', ') || 'English'}
Summary: ${parsedData.summary || 'Not provided'}
`
            : resumeText.slice(0, 4000);

        // Build job context
        const jobContext = `
Job Title: ${job.title}
Company: ${job.company}
Role Category: ${job.roleCategory}
Job Type: ${job.type}
Required Certifications: ${(job.certifications || []).join(', ') || 'None specified'}
Requirements: ${(job.requirements || []).join('; ') || 'None specified'}
Qualifications: ${(job.qualifications || []).join('; ') || 'None specified'}
Responsibilities: ${(job.responsibilities || []).join('; ') || 'None specified'}
Description: ${job.description?.slice(0, 800) || ''}
`;

        const qualificationPrompt = `
You are an expert HR recruiter and talent assessment specialist.

Evaluate this candidate for the job below and return ONLY a valid JSON object with this exact structure:
{
  "qualificationScore": <integer 0-100>,
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "strengths": ["string"],
  "summary": "2-3 sentence honest assessment of fit"
}

JOB DETAILS:
${jobContext}

CANDIDATE:
${candidateContext}

Scoring guide:
- 80-100: Highly qualified, meets or exceeds all requirements
- 60-79: Good fit, meets most requirements
- 40-59: Partial fit, meets some requirements
- 0-39: Not a strong fit for this specific role

Return ONLY the JSON. No markdown, no explanation.
`;

        const coverLetterPrompt = `
You are a professional career coach. Write a compelling, sincere cover letter for this job application.

JOB: ${job.title} at ${job.company}
JOB DESCRIPTION: ${job.description?.slice(0, 600) || ''}
REQUIREMENTS: ${(job.requirements || []).join('; ') || 'N/A'}

CANDIDATE:
${candidateContext}

Write a 3-paragraph professional cover letter:
- Paragraph 1: Strong opening with enthusiasm for the role
- Paragraph 2: Match candidate's relevant experience/skills to the job requirements
- Paragraph 3: Confident closing with call to action

Keep it under 350 words. Use first person. Do NOT include date, address headers or placeholders.
Return ONLY the cover letter text, no JSON.
`;

        // Run both calls in parallel
        const [qualificationResult, coverLetterResult] = await Promise.all([
            callGemini(qualificationPrompt),
            (async () => {
                const genAIClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAIClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
                const result = await model.generateContent(coverLetterPrompt);
                return result.response.text().trim();
            })()
        ]);

        res.status(200).json({
            success: true,
            data: {
                qualificationScore: qualificationResult.qualificationScore,
                matchedSkills: qualificationResult.matchedSkills || [],
                missingSkills: qualificationResult.missingSkills || [],
                strengths: qualificationResult.strengths || [],
                summary: qualificationResult.summary || '',
                coverLetter: coverLetterResult,
                job: {
                    title: job.title,
                    company: job.company,
                    roleCategory: job.roleCategory
                }
            }
        });
    } catch (error) {
        logger.error(`checkQualification Error: ${error.message}`, { stack: error.stack });

        if (error instanceof SyntaxError) {
            return res.status(500).json({
                success: false,
                message: 'AI returned an unexpected response. Please try again.'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check qualification.'
        });
    }
};
