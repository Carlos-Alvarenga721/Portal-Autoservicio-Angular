// ─────────────────────────────────────────────────────────
// Rutas de autenticación
// ─────────────────────────────────────────────────────────
const { Router }        = require('express');
const { findUserByEmail } = require('../db');
const { signToken, authRequired } = require('../auth');

const router = Router();

/**
 * POST /api/auth/login
 * Body: { email: string }
 * Respuesta: { token, email, role }
 */
router.post('/login', (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'El campo email es requerido' });
  }

  const user = findUserByEmail(email.toLowerCase().trim());
  if (!user) {
    return res.status(403).json({ error: 'Acceso denegado: email no autorizado' });
  }

  const token = signToken({ email: user.email, role: user.role });
  return res.json({ token, email: user.email, role: user.role });
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Respuesta: { email, role }
 */
router.get('/me', authRequired, (req, res) => {
  return res.json({ email: req.user.email, role: req.user.role });
});

module.exports = router;
