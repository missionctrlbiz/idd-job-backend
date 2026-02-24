# IDD Job Platform — Frontend Integration Guide

> **For: Mr. Kazim**
> **Date: February 2026**

---

## 1. Backend URL (Render)

The backend API is deployed on Render and accessible at:

```
https://idd-job-backend.onrender.com
```

All API endpoints are prefixed with `/api/v1`. So the **full base URL** for API calls is:

```
https://idd-job-backend.onrender.com/api/v1
```

### Quick Health Check
You can verify the backend is online by visiting:
- Root: [https://idd-job-backend.onrender.com/](https://idd-job-backend.onrender.com/)
- Health: [https://idd-job-backend.onrender.com/health](https://idd-job-backend.onrender.com/health)

> ⚠️ **Note:** Render free-tier services spin down after inactivity. The **first request** after a cold start may take **30–60 seconds** to respond. Subsequent requests will be fast.

---

## 2. Environment File Setup

In your frontend project root, create a `.env.local` file (for Next.js) or `.env` file (for Vite/CRA):

### Next.js (`.env.local`)
```env
# Backend API URL — points to the Render deployment
NEXT_PUBLIC_API_URL=https://idd-job-backend.onrender.com/api/v1
```

### Vite (`.env`)
```env
VITE_API_URL=https://idd-job-backend.onrender.com/api/v1
```

### Create React App (`.env`)
```env
REACT_APP_API_URL=https://idd-job-backend.onrender.com/api/v1
```

> **Important:** For Next.js, the variable **must** start with `NEXT_PUBLIC_` to be available in the browser. For Vite, it must start with `VITE_`.

---

## 3. Axios Setup (Recommended Pattern)

Create a reusable API client with automatic token injection:

### `services/api.js`

```javascript
import axios from 'axios';

// Read the API URL from environment variables
// Adjust the env variable name based on your framework:
//   Next.js:  process.env.NEXT_PUBLIC_API_URL
//   Vite:     import.meta.env.VITE_API_URL
//   CRA:      process.env.REACT_APP_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://idd-job-backend.onrender.com/api/v1';

// Create a reusable Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds (generous for Render cold starts)
});

// Automatically attach the JWT token to every request
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
```

---

## 4. Code Examples

### 4.1 — Fetch All Jobs (Public, No Auth Required)

```javascript
import api from './api';

async function fetchJobs(filters = {}) {
    try {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const queryString = params.toString();
        const url = queryString ? `/jobs?${queryString}` : '/jobs';

        const response = await api.get(url);

        // ⚠️ IMPORTANT: The backend wraps data in { success, count, data }
        // You must unwrap it to get the actual array:
        const jobs = response.data?.data || [];

        console.log(`Fetched ${jobs.length} jobs`);
        return jobs;

    } catch (error) {
        console.error('Failed to fetch jobs:', error.message);
        return [];
    }
}

// Usage:
// const allJobs = await fetchJobs();
// const filteredJobs = await fetchJobs({ search: 'nurse', location: 'Texas' });
```

### 4.2 — Fetch a Single Job by ID (Public)

```javascript
async function fetchJobById(jobId) {
    try {
        const response = await api.get(`/jobs/${jobId}`);
        // Backend returns { success, data } — unwrap:
        return response.data?.data || null;
    } catch (error) {
        console.error('Failed to fetch job:', error.message);
        return null;
    }
}
```

### 4.3 — Register a New User

```javascript
async function register(name, email, password, role = 'jobseeker') {
    try {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
            role,  // 'jobseeker' or 'employer'
        });

        // Response: { success: true, token: "jwt...", user: { _id, name, email, role } }
        const { token, user } = response.data;

        // Store in localStorage for subsequent authenticated requests
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
    } catch (error) {
        console.error('Registration failed:', error.response?.data?.message || error.message);
        throw error;
    }
}
```

### 4.4 — Login

```javascript
async function login(email, password) {
    try {
        const response = await api.post('/auth/login', { email, password });

        // Response: { success: true, token: "jwt...", user: { _id, name, email, role } }
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
    } catch (error) {
        console.error('Login failed:', error.response?.data?.message || error.message);
        throw error;
    }
}
```

### 4.5 — Fetch My Applications (Authenticated Job Seeker)

```javascript
async function getMyApplications() {
    const response = await api.get('/applications/me');
    // Backend returns { success, count, data } — unwrap:
    return response.data?.data || [];
}
```

### 4.6 — Apply for a Job (Authenticated Job Seeker, with Resume Upload)

```javascript
async function applyForJob(jobId, formData) {
    // formData is a FormData object containing:
    //   - jobId (string)
    //   - coverLetter (string)
    //   - resume (File)
    //   - applicantInfo fields (name, email, phone, etc.)

    if (!formData.has('jobId')) {
        formData.append('jobId', jobId);
    }

    const response = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
    // Response: { success: true, message: "...", data: { _id, status, ... } }
}
```

---

## 5. API Response Format

All endpoints follow this consistent response format:

### Success (single item):
```json
{
    "success": true,
    "data": { /* object */ }
}
```

### Success (list):
```json
{
    "success": true,
    "count": 10,
    "data": [ /* array of objects */ ]
}
```

### Error:
```json
{
    "success": false,
    "message": "Error description here"
}
```

> **Key pattern:** Always access `response.data.data` (not just `response.data`) to get the actual payload. The outer `.data` is Axios's response wrapper; the inner `.data` is the backend's response field.

---

## 6. Available API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **Authentication** |
| `POST` | `/auth/register` | ✗ | Any | Register new user |
| `POST` | `/auth/login` | ✗ | Any | Login, returns JWT |
| `GET` | `/auth/me` | ✓ | Any | Get current user |
| **Jobs** |
| `GET` | `/jobs` | ✗ | Any | List all jobs |
| `GET` | `/jobs/:id` | ✗ | Any | Get job details |
| `POST` | `/jobs` | ✓ | Employer | Create a job |
| `PUT` | `/jobs/:id` | ✓ | Employer | Update a job |
| `DELETE` | `/jobs/:id` | ✓ | Employer | Delete a job |
| **Applications** |
| `POST` | `/applications` | ✓ | Job Seeker | Apply for a job |
| `GET` | `/applications/me` | ✓ | Job Seeker | My applications |
| `GET` | `/applications/:id` | ✓ | Any | Application detail |
| `GET` | `/applications/job/:jobId` | ✓ | Employer | Applications for a job |
| **Employer Dashboard** |
| `GET` | `/employer/dashboard/overview` | ✓ | Employer | Dashboard stats |
| `GET` | `/employer/applicants` | ✓ | Employer | All applicants |
| `GET` | `/employer/applicants/:id` | ✓ | Employer | Applicant detail |
| `PUT` | `/employer/applicants/:id/stage` | ✓ | Employer | Update hiring stage |
| `POST` | `/employer/applicants/:id/notes` | ✓ | Employer | Add note |
| **AI** |
| `POST` | `/ai/parse-resume` | ✓ | Job Seeker | Parse resume PDF |
| `POST` | `/ai/check-qualification` | ✓ | Job Seeker | AI qualification check |

---

## 7. CORS — Adding Your Frontend Origin

The backend currently allows requests from:
- `https://iddjobplatform.vercel.app` (production)
- `http://localhost:3000` (when `ALLOW_LOCALHOST_ORIGIN=true` on Render)

If Mr. Kazim's frontend is deployed to a different domain (e.g., a different Vercel project), his origin URL needs to be added to the backend's `CORS_ORIGINS` environment variable on Render:

```
CORS_ORIGINS=https://kazim-frontend.vercel.app
```

**For local development**, if Mr. Kazim runs his frontend on `http://localhost:3000`, the backend already supports this — the `ALLOW_LOCALHOST_ORIGIN=true` flag is set on Render.

If he uses a different port (e.g., 5173 for Vite), we need to add that to `CORS_ORIGINS` on Render:
```
CORS_ORIGINS=http://localhost:5173
```

---

## 8. Test Accounts

Use these to test without registering:

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | *(register a new one via /auth/register)* | — |
| Employer | *(register with role: "employer")* | — |

---

## Quick Start Checklist

1. ✅ Create `.env.local` with `NEXT_PUBLIC_API_URL=https://idd-job-backend.onrender.com/api/v1`
2. ✅ Set up Axios with the token interceptor (see Section 3)
3. ✅ Test with `GET /jobs` — no auth needed
4. ✅ Register a user with `POST /auth/register`
5. ✅ Store the token in `localStorage`
6. ✅ All subsequent requests auto-attach the token via the interceptor
7. ✅ Always unwrap responses: use `response.data.data` not `response.data`

---

## 9. Full Environment Files Reference

### 9.1 — Backend `.env` (Render Environment Variables)

These are the environment variables configured on the **backend** (Render dashboard → Environment).
Mr. Kazim does **not** need these unless he is running his own backend instance.

```env
# ==============================================================================
# DATABASE
# ==============================================================================
# MongoDB Atlas connection string (shared database)


# ==============================================================================
# SERVER
# ==============================================================================
PORT=5000
NODE_ENV=production

# ==============================================================================
# JWT AUTHENTICATION
# ==============================================================================
# Secret key used to sign JWT tokens — must match across all backends sharing the same users
JWT_SECRET=idd_job_platform_2026_super_secure_jwt_secret_key_xK9mP2vL
# Token expiry (30 days)
JWT_EXPIRE=30d

# ==============================================================================
# AI / GEMINI (Optional — required only for AI resume parsing features)
# ==============================================================================
GEMINI_API_KEY=

# ==============================================================================
# CORS — CRITICAL FOR FRONTEND ACCESS
# ==============================================================================
# Option A: Allow specific origins (recommended for production)
# Comma-separated list of frontend URLs allowed to call this backend.
# The Vercel deployment is always allowed by default (hardcoded in server.js).
# Add Mr. Kazim's deployed frontend URL here:
CORS_ORIGINS=https://iddjobplatform.vercel.app,https://kazim-frontend.vercel.app

# Option B: Allow localhost for local frontend development
# Set to "true" to allow http://localhost:3000
ALLOW_LOCALHOST_ORIGIN=true

# Option C: Allow ALL origins (⚠️ DEBUG ONLY — never use in production)
# ALLOW_ALL_ORIGINS=true
```

> **⚠️ IMPORTANT:** The `JWT_SECRET` must be **identical** on any backend instance that shares the same user database. If Mr. Kazim runs his own backend, he must use the same secret, or tokens from one backend won't work on another.

---

### 9.2 — Frontend `.env.local` (What Mr. Kazim Needs)

This is the **only file** Mr. Kazim needs to create in his frontend project root:

#### If connecting to the shared Render backend:

```env
# ==============================================================================
# IDD Job Platform — Frontend Environment
# ==============================================================================

# Backend API URL (Render deployment)
NEXT_PUBLIC_API_URL=https://idd-job-backend.onrender.com/api/v1
```

That's it — **one line**. The Axios interceptor (Section 3) handles auth tokens automatically.

#### If running the backend locally for development:

```env
# ==============================================================================
# IDD Job Platform — Frontend Environment (Local Development)
# ==============================================================================

# Backend API URL (local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

#### For Vite projects, use this instead:

```env
# Backend API URL (Render deployment)
VITE_API_URL=https://idd-job-backend.onrender.com/api/v1
```

And in the Axios setup, read it as:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://idd-job-backend.onrender.com/api/v1';
```

---

### 9.3 — Render Dashboard CORS Setup

If Mr. Kazim deploys his frontend to Vercel (or anywhere else), his domain needs to be whitelisted:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select the **idd-job-backend** service
3. Go to **Environment** tab
4. Find `CORS_ORIGINS` and add his frontend URL (comma-separated):
   ```
   CORS_ORIGINS=https://iddjobplatform.vercel.app,https://kazim-frontend.vercel.app
   ```
5. Click **Save Changes** — the service will redeploy automatically

> If he's developing locally on `localhost:3000`, the flag `ALLOW_LOCALHOST_ORIGIN=true` is already set, so no changes needed.
