// ─────────────────────────────────────────────────────────
// Middleware de autenticación (JWT simple)
// ─────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

/** Genera un JWT con { email, role }. */
function signToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

/** Verifica y decodifica el token. */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Middleware Express: requiere header  Authorization: Bearer <token>
 * Adjunta req.user = { email, role }.
 */
function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
}

module.exports = { signToken, verifyToken, authRequired, requireRole };
