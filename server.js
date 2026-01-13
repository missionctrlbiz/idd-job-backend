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

// ============================================================================
// CORS Configuration (Production-Ready)
// ============================================================================

// Default origins - production frontends
const defaultOrigins = [
    'https://iddjobplatform.vercel.app',
    'https://idd-job-platform.vercel.app'
];

// Parse CORS_ORIGINS from environment (comma-separated)
const originsEnv = process.env.CORS_ORIGINS;
let allowedOrigins = originsEnv
    ? originsEnv.split(',').map(o => o.trim()).filter(Boolean)
    : [...defaultOrigins];

// ALLOW_LOCALHOST_ORIGIN: Explicitly allow http://localhost:3000 for local dev
// Safe to enable on Render when testing with local frontend against hosted backend
if (process.env.ALLOW_LOCALHOST_ORIGIN === 'true') {
    if (!allowedOrigins.includes('http://localhost:3000')) {
        allowedOrigins.push('http://localhost:3000');
    }
    console.log('🔓 ALLOW_LOCALHOST_ORIGIN is enabled - localhost:3000 allowed');
}

// ALLOW_ALL_ORIGINS: Emergency override - allows ANY origin (⚠️ USE ONLY FOR DEBUGGING)
// Should NEVER be enabled in production
const allowAll = process.env.ALLOW_ALL_ORIGINS === 'true';
if (allowAll) {
    console.warn('⚠️  WARNING: ALLOW_ALL_ORIGINS is enabled - ALL origins are allowed!');
    console.warn('⚠️  This should ONLY be used for debugging. Disable in production!');
}

// Configure CORS options
const corsOptions = allowAll ? {
    origin: true,  // Accept any origin
    credentials: true,
    optionsSuccessStatus: 200
} : {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Reject with descriptive error
        const error = new Error(`CORS policy: Origin '${origin}' is not allowed`);
        console.error(`🚫 CORS blocked: ${origin}`);
        return callback(error);
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Log CORS configuration on startup
console.log('🌐 CORS Configuration:');
if (allowAll) {
    console.log('   Mode: ALLOW ALL (⚠️ Debug mode)');
} else {
    console.log('   Mode: Restricted');
    console.log('   Allowed Origins:', allowedOrigins.join(', '));
}
console.log('   Credentials: enabled');

// ============================================================================

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

// Health check endpoint - useful for monitoring and testing CORS
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cors: {
            allowAll: process.env.ALLOW_ALL_ORIGINS === 'true',
            allowLocalhost: process.env.ALLOW_LOCALHOST_ORIGIN === 'true'
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'IDD Job Platform API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            jobs: '/api/v1/jobs',
            auth: '/api/v1/auth',
            applications: '/api/v1/applications'
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
