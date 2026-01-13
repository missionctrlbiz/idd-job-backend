# IDD Job Platform - Backend API

Backend API for the IDD (Intellectual and Developmental Disabilities) Job Platform built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)

## Local Development

### Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB)

### Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd idd-job-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/idd-job-platform
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
```

4. Run the development server:

```bash
npm run dev
```

5. Seed the database (optional):

```bash
npm run seed
```

## API Endpoints

### Jobs

- `GET /api/v1/jobs` - Get all jobs (with filtering, pagination)
- `GET /api/v1/jobs/:id` - Get single job
- `GET /api/v1/jobs/filters` - Get filter options with counts
- `POST /api/v1/jobs` - Create job (requires auth)
- `PUT /api/v1/jobs/:id` - Update job (requires auth)
- `DELETE /api/v1/jobs/:id` - Delete job (requires auth)

### Auth

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Applications

- `POST /api/v1/applications` - Apply for job (requires auth)
- `GET /api/v1/applications/me` - Get my applications (requires auth)
- `GET /api/v1/applications/job/:jobId` - Get job applications (employer only)

### Query Parameters for Jobs

| Parameter      | Description                           | Example               |
| -------------- | ------------------------------------- | --------------------- |
| `search`       | Search in title, company, description | `?search=DSP`         |
| `type`         | Employment type                       | `?type=Full-Time`     |
| `roleCategory` | Role category                         | `?roleCategory=Nurse` |
| `location`     | Location (partial match)              | `?location=Denver`    |
| `minSalary`    | Minimum hourly rate                   | `?minSalary=18`       |
| `maxSalary`    | Maximum hourly rate                   | `?maxSalary=25`       |
| `shifts`       | Shift preferences (comma-separated)   | `?shifts=Day,Evening` |
| `page`         | Page number                           | `?page=1`             |
| `limit`        | Results per page                      | `?limit=20`           |

---

## 🚀 Deployment to Render.com

### Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/idd-job-backend.git
git push -u origin main
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com) and sign up (free)
2. Connect your GitHub account

### Step 3: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

| Setting           | Value                        |
| ----------------- | ---------------------------- |
| **Name**          | `idd-job-backend`            |
| **Region**        | Choose closest to your users |
| **Branch**        | `main`                       |
| **Runtime**       | `Node`                       |
| **Build Command** | `npm install`                |
| **Start Command** | `npm start`                  |
| **Instance Type** | `Free`                       |

### Step 4: Add Environment Variables

In the Render dashboard, go to **Environment** and add:

| Key                      | Value                                        | Notes                                               |
| ------------------------ | -------------------------------------------- | --------------------------------------------------- |
| `NODE_ENV`               | `production`                                 | Required                                            |
| `MONGO_DB`               | `mongodb+srv://...` (your MongoDB Atlas URI) | Required (note: use `MONGO_DB`, not `MONGO_URI`)    |
| `JWT_SECRET`             | `your_secret_key`                            | Required - generate a secure random string          |
| `JWT_EXPIRE`             | `30d`                                        | Optional (default: 30d)                             |
| `CORS_ORIGINS`           | `https://iddjobplatform.vercel.app`          | Optional - defaults to Vercel URLs                  |
| `ALLOW_LOCALHOST_ORIGIN` | `true`                                       | Optional - set to `true` for local frontend testing |
| `ALLOW_ALL_ORIGINS`      | `false`                                      | ⚠️ Emergency debugging only - keep `false`          |

**CORS Configuration Notes:**

- **Production (frontend deployed):** Set `CORS_ORIGINS` to your Vercel URL(s). Example: `https://iddjobplatform.vercel.app`
- **Testing with local frontend:** Set `ALLOW_LOCALHOST_ORIGIN=true` to allow requests from `http://localhost:3000` while backend is on Render
- **Never enable `ALLOW_ALL_ORIGINS` in production** - this disables CORS security entirely

### Step 5: Deploy

Click **"Create Web Service"** and wait for deployment (2-3 minutes).

Your API will be available at: `https://idd-job-backend.onrender.com`

### Step 6: Update Frontend

Update your frontend's API base URL to point to your Render deployment:

```javascript
const API_URL = "https://idd-job-backend.onrender.com/api/v1";
```

---

## MongoDB Atlas IP Whitelist

For Render deployment, you need to whitelist all IPs in MongoDB Atlas:

1. Go to MongoDB Atlas → Network Access
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
4. Click **"Confirm"**

⚠️ This is required because Render uses dynamic IPs.

---

## Alternative Hosting Platforms

| Platform    | Free Tier     | URL                                |
| ----------- | ------------- | ---------------------------------- |
| **Render**  | ✅ 750 hrs/mo | [render.com](https://render.com)   |
| **Railway** | $5 credit/mo  | [railway.app](https://railway.app) |
| **Fly.io**  | ✅ 3 VMs free | [fly.io](https://fly.io)           |
| **Cyclic**  | ✅ Free       | [cyclic.sh](https://cyclic.sh)     |

---

## License

ISC
