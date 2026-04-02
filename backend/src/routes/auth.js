// ─────────────────────────────────────────────────────────
// Rutas de autenticación — Google OAuth + JWT
// ─────────────────────────────────────────────────────────
const { Router }          = require('express');
const passport            = require('passport');
const GoogleStrategy      = require('passport-google-oauth20').Strategy;
const { findUserByEmail } = require('../db');
const { signToken, authRequired } = require('../auth');

const router = Router();

// ── Configurar estrategia Google ─────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!email) return done(null, false);

  const user = findUserByEmail(email);
  if (!user) return done(null, false, { message: 'Email no autorizado' });

  return done(null, user);
}));

// ── Iniciar flujo OAuth ───────────────────────────────────
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// ── Callback de Google ────────────────────────────────────
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/?error=acceso_denegado',
  }),
  (req, res) => {
    const token = signToken({ email: req.user.email, role: req.user.role });
    // Redirige al frontend con el token en la URL
    res.redirect(`/?token=${token}&email=${req.user.email}&role=${req.user.role}`);
  }
);

// ── Verificar sesión activa ───────────────────────────────
router.get('/me', authRequired, (req, res) => {
  return res.json({ email: req.user.email, role: req.user.role });
});

module.exports = router;