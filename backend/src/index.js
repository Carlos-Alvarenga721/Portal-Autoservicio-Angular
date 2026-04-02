// ─────────────────────────────────────────────────────────
// AAP Portal – Backend entrypoint
// ─────────────────────────────────────────────────────────
require('dotenv').config();

const passport = require('passport');
require('./routes/auth'); // inicializa la estrategia Google

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// ── Rutas ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);

// ── Health-check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Servir Angular en producción ─────────────────────────
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist', 'frontend', 'browser');
app.use(express.static(frontendDist));
app.get('*', (_req, res, next) => {
  const index = path.join(frontendDist, 'index.html');
  res.sendFile(index, (err) => { if (err) next(); });
});

// ── Iniciar ──────────────────────────────────────────────
initDb();
app.listen(PORT, () => {
  console.log(`✔  Backend corriendo en http://localhost:${PORT}`);
});
