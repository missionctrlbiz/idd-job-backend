# Frontend Developer Guide

## Backend Base URL
The backend is deployed and accessible at:
**`https://idd-job-backend.onrender.com`**

## Authentication
Most endpoints require authentication. You must include the JWT token in the `Authorization` header of your requests.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (Job Seeker or Employer)
- `POST /api/auth/login` - Login to get a JWT token
- `GET /api/auth/me` - Get current user profile (Requires Auth)

### Jobs
- `GET /api/jobs` - Fetch all jobs (Public)
- `GET /api/jobs/:id` - Fetch a single job details (Public)
- `POST /api/jobs` - Post a new job (Employer only, Requires Auth)
- `PUT /api/jobs/:id` - Update a job (Employer only, Requires Auth)
- `DELETE /api/jobs/:id` - Delete a job (Employer only, Requires Auth)

### Applications
- `POST /api/applications` - Apply for a job (Job Seeker only, Requires Auth)
  - Accepts `multipart/form-data` for resume/cover letter uploads.
- `GET /api/applications/my-applications` - Get applications for the logged-in job seeker (Requires Auth)
- `GET /api/applications/job/:jobId` - Get applications for a specific job (Employer only, Requires Auth)
- `PATCH /api/applications/:id/status` - Update application status (Employer only, Requires Auth)

### Employer
- `GET /api/employer/dashboard-stats` - Get employer dashboard statistics (Employer only, Requires Auth)

## Health Check
- `GET /api/health` (if implemented) or root `/` to verify server status.

## Socket.io
- The server supports Socket.io connections at the base URL for real-time updates (notifications).
