const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const courierRouter = require('./routes/courier');
const analyticsRouter = require('./routes/analytics');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate-limit public order submissions: 5 per minute per IP
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order submissions. Please wait a minute and try again.' },
  skip: (req) => req.method !== 'POST', // only limit POST
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/orders', orderLimiter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/courier', courierRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
module.exports = app;
