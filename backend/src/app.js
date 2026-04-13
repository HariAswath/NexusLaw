// src/app.js — Express application
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const authRouter       = require('./routes/auth');
const casesRouter      = require('./routes/cases');
const partiesRouter    = require('./routes/parties');
const witnessesRouter  = require('./routes/witnesses');
const judgementsRouter = require('./routes/judgements');
const aiRouter         = require('./routes/ai');
const ticketsRouter    = require('./routes/tickets');
const { protect }      = require('./middleware/auth');

const app = express();

// ── CORS ──────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── HTTP logging ──────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API Routes ────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/cases',       casesRouter);
app.use('/api/cases',       partiesRouter);    // /api/cases/:caseId/parties
app.use('/api/cases',       witnessesRouter);  // /api/cases/:caseId/witnesses
app.use('/api/cases',       judgementsRouter); // /api/cases/:caseId/judgement
app.use('/api/ai',          aiRouter);
app.use('/api/tickets',     protect, ticketsRouter);

// ── 404 catch-all ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// ── Global error handler ──────────────────────────────
app.use(errorHandler);

module.exports = app;
