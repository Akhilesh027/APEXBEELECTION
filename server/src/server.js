import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import voterRoutes from './routes/voterRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();

// Trust reverse proxy for accurate IP address extraction
app.set('trust proxy', 1);

// Enable CORS for production and development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);
      const clientUrl = process.env.CLIENT_URL;
      if (!clientUrl || clientUrl === '*') return callback(null, true);
      if (
        origin === clientUrl ||
        origin.includes('apexbee.in') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Console Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  res.on('finish', () => {
    const duration = Date.now() - start;
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusColor} [${time}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms) | IP: ${clientIp}`);
  });
  next();
});

// Rate limiting (1000 requests per 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  validate: { trustProxy: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/audit', auditRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Election Management Portal API',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server and connect to DB
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Election Portal Server running on http://localhost:${PORT}`);
  });
};

startServer();
