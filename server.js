import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// CORS - allow origins from env or sensible defaults
const defaultOrigins = [
    'http://localhost:3000',
    'https://iddjobplatform.vercel.app',
    'https://idd-job-platform.vercel.app'
];
const originsEnv = process.env.CORS_ORIGINS || defaultOrigins.join(',');
const allowedOrigins = originsEnv.split(',').map(o => o.trim()).filter(Boolean);

// During development it's convenient to allow requests from any origin
// Set ALLOW_ALL_ORIGINS=true in env to temporarily allow all origins (useful for local testing)
const allowAll = process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true';

const corsOptions = allowAll ? {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
} : {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Ensure preflight requests are handled for all routes
app.options('*', cors(corsOptions));

app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers (v1)
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', applicationRoutes);

// Backwards-compatible mounts (some clients may call /auth or /applications without the /api/v1 prefix)
app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
