# IDD Job Connect API

The backend API for the IDD (Intellectual and Developmental Disabilities) Job Platform. This RESTful API powers the job board, applicant tracking system (ATS), and user management features. Built with Node.js, Express, and MongoDB.

## 🚀 Features

-   **User Authentication**: JWT-based auth for Job Seekers, Employers, and Admins.
-   **Job Management**: Create, read, update, and delete job postings.
-   **Application System**: Candidates can apply with resumes; Employers can track hiring stages.
-   **Employer Dashboard**: Analytics, applicant filtering, and team collaboration notes.
-   **User Profiles**: specialized profiles for caregivers and healthcare professionals.

## 🛠️ Tech Stack

-   **Runtime**: Node.js 18+
-   **Framework**: Express.js
-   **Database**: MongoDB Atlas
-   **ODM**: Mongoose
-   **Authentication**: JSON Web Tokens (JWT) & bcrypt
-   **Security**: Helmet, CORS, Rate Limiting (planned)

## 📦 Installation & Setup

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

### 2. Clone the Repository

```bash
git clone https://github.com/corehealthp/idd-job-connect-api.git
cd idd-job-connect-api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Configuration

Create a `.env` file in the root directory. You can copy the example file:

```bash
cp .env.example .env
```

**Required Variables:**

| Variable       | Description                                                 | Example                                                      |
| :------------- | :---------------------------------------------------------- | :----------------------------------------------------------- |
| `NODE_ENV`     | Environment mode (`development` or `production`)            | `development`                                                |
| `PORT`         | Server port                                                 | `5000`                                                       |
| `MONGO_DB`     | MongoDB Connection String                                   | `mongodb+srv://user:pass@cluster.mongodb.net/dbname`         |
| `JWT_SECRET`   | Secret key for signing tokens                               | `super_secret_key_change_me`                                 |
| `JWT_EXPIRE`   | Token expiration time                                       | `30d`                                                        |
| `CORS_ORIGINS` | Comma-separated list of allowed origins                     | `http://localhost:3000,https://iddjobplatform.vercel.app`    |

### 5. Running the API

**Development Mode** (with hot-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

## 🌱 Database Seeding

To populate the database with initial sample data (Users, Jobs, Applications):

```bash
npm run seed
```
> **Note**: This will clear existing data in the connected database.

## 📚 API Documentation

### Base URL
`http://localhost:5000/api/v1`

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register a new user (Job Seeker or Employer)
- `POST /auth/login` - Login and receive JWT
- `GET /auth/me` - Get current user profile

#### Jobs
- `GET /jobs` - List all jobs (supports pagination & filtering)
- `GET /jobs/:id` - Get job details
- `POST /jobs` - Post a new job (Employer only)

#### Employer Dashboard
- `GET /employer/dashboard/overview` - Get high-level stats
- `GET /employer/applicants` - List applicants across all jobs
- `GET /employer/applicants/:id` - View specific applicant details
- `PUT /employer/applicants/:id/stage` - Update hiring stage (e.g., Interview, Hired)

## 🚢 Deployment

This application follows the **12-Factor App** methodology and can be deployed to any cloud provider (AWS, Render, Heroku, etc.) that supports Node.js.

### Production Environment
Ensure the following environment variables are set in your production environment (e.g., AWS Elastic Beanstalk, EC2, or Render):

- `NODE_ENV`: Set to `production`
- `MONGO_DB`: Production MongoDB connection string
- `JWT_SECRET`: Secure, random string
- `CORS_ORIGINS`: Comma-separated list of allowed frontend domains (e.g., specific AWS CloudFront URLs or Vercel domains)

### CI/CD
The repository is configured for continuous deployment. Pushes to the `main` branch trigger the deployment pipeline defined in your CI/CD configuration (e.g., GitHub Actions).

### Frontend Integration
The backend is CORS-enabled and can be consumed by any frontend that is whitelisted in `CORS_ORIGINS`.
- **Local Development**: `http://localhost:3000`
- **Production**: Your deployed frontend URL

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
