// ─────────────────────────────────────────────────────────
// Rutas para disparar jobs en AAP
// ─────────────────────────────────────────────────────────
const { Router } = require('express');
const { authRequired }           = require('../auth');
const { launchAapWorkflow, tokenForRole } = require('../aap');

const router = Router();

// Todas las rutas de /api/jobs requieren autenticación
router.use(authRequired);

// ── CIS Audit ────────────────────────────────────────────
router.post('/cis/audit', async (req, res) => {
  try {
    const wfId  = process.env.AAP_WF_CIS_AUDIT;
    const token = tokenForRole(req.user.role);
    const result = await launchAapWorkflow(wfId, {}, token);
    return res.json(result);
  } catch (err) {
    console.error('[CIS Audit]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Employee Onboard ─────────────────────────────────────
router.post('/employees/create', async (req, res) => {
  try {
    const { firstName, lastName, username, email, department, role, adGroups } = req.body || {};

    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({ error: 'Campos obligatorios: firstName, lastName, username, email' });
    }

    const extraVars = { firstName, lastName, username, email, department, role, adGroups };
    const wfId  = process.env.AAP_WF_EMPLOYEE_ONBOARD;
    const token = tokenForRole(req.user.role);
    const result = await launchAapWorkflow(wfId, extraVars, token);
    return res.json(result);
  } catch (err) {
    console.error('[Employee Create]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Ephemeral – Crear ────────────────────────────────────
router.post('/ephemeral/create', async (req, res) => {
  try {
    const { envId } = req.body || {};
    if (!envId) {
      return res.status(400).json({ error: 'Campo requerido: envId' });
    }

    const extraVars = { envId, ttl_hours: 3 };
    const wfId  = process.env.AAP_WF_EPHEMERAL_PROVISION;
    const token = tokenForRole(req.user.role);
    const result = await launchAapWorkflow(wfId, extraVars, token);
    return res.json(result);
  } catch (err) {
    console.error('[Ephemeral Create]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Ephemeral – Eliminar ─────────────────────────────────
router.post('/ephemeral/delete', async (req, res) => {
  try {
    const { envId } = req.body || {};
    if (!envId) {
      return res.status(400).json({ error: 'Campo requerido: envId' });
    }

    const extraVars = { envId };
    const wfId  = process.env.AAP_WF_EPHEMERAL_DELETE;
    const token = tokenForRole(req.user.role);
    const result = await launchAapWorkflow(wfId, extraVars, token);
    return res.json(result);
  } catch (err) {
    console.error('[Ephemeral Delete]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

module.exports = router;
