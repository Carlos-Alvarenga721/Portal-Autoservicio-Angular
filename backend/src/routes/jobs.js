// ─────────────────────────────────────────────────────────
// Rutas para disparar jobs en AAP
// ─────────────────────────────────────────────────────────
const { Router } = require('express');
const { authRequired }                    = require('../auth');
const { launchWorkflow, launchJobTemplate } = require('../aap');

const router = Router();
router.use(authRequired);

// ── CIS Level 1 ──────────────────────────────────────────
router.post('/cis', async (req, res) => {
  try {
    const result = await launchWorkflow(process.env.AAP_WF_CIS);
    return res.json(result);
  } catch (err) {
    console.error('[CIS]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Alta de empleado ─────────────────────────────────────
router.post('/employees/alta', async (req, res) => {
  try {
    const {
      employee_username,
      employee_oracle_username,
      employee_full_name,
      employee_password,
      employee_role,
    } = req.body || {};

    if (!employee_username || !employee_oracle_username || !employee_full_name || !employee_password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const extraVars = {
      employee_action: 'alta',
      employee_username,
      employee_oracle_username,
      employee_full_name,
      employee_password,
      employee_role: employee_role || 'APP_READONLY',
    };

    const result = await launchWorkflow(process.env.AAP_WF_EMP_ALTA, extraVars);
    return res.json(result);
  } catch (err) {
    console.error('[Alta]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Baja de empleado ─────────────────────────────────────
router.post('/employees/baja', async (req, res) => {
  try {
    const { employee_username, employee_oracle_username } = req.body || {};

    if (!employee_username || !employee_oracle_username) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const extraVars = {
      employee_action: 'baja',
      employee_username,
      employee_oracle_username,
    };

    const result = await launchWorkflow(process.env.AAP_WF_EMP_BAJA, extraVars);
    return res.json(result);
  } catch (err) {
    console.error('[Baja]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Cambio de rol ────────────────────────────────────────
router.post('/employees/cambio-rol', async (req, res) => {
  try {
    const { employee_oracle_username, employee_role_anterior, employee_role } = req.body || {};

    if (!employee_oracle_username || !employee_role_anterior || !employee_role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const extraVars = {
      employee_action: 'cambio_rol',
      employee_oracle_username,
      employee_role_anterior,
      employee_role,
    };

    const result = await launchWorkflow(process.env.AAP_WF_EMP_CAMBIO_ROL, extraVars);
    return res.json(result);
  } catch (err) {
    console.error('[Cambio Rol]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── Reset de contraseña ──────────────────────────────────
router.post('/employees/reset', async (req, res) => {
  try {
    const { employee_username, employee_password } = req.body || {};

    if (!employee_username || !employee_password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const extraVars = {
      employee_action: 'reset',
      employee_username,
      employee_password,
    };

    const result = await launchJobTemplate(process.env.AAP_JT_EMP_AD_RESET, extraVars);
    return res.json(result);
  } catch (err) {
    console.error('[Reset]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── VM efímera - crear ───────────────────────────────────
router.post('/ephemeral/create', async (req, res) => {
  try {
    const {
      instance_name,
      machine_family,
      image_version,
      disk_size_gb,
      ttl_hours,
    } = req.body || {};

    if (!instance_name || !machine_family || !image_version || !disk_size_gb || !ttl_hours) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const extraVars = {
      instance_name,
      machine_family,
      image_version,
      disk_size_gb: Number(disk_size_gb),
      ttl_hours: Number(ttl_hours),
      requested_by: req.user?.email || 'portal-user',
    };

    const result = await launchJobTemplate(process.env.AAP_JT_EPHEMERAL_VM_CREATE, extraVars);
    return res.json(result);
  } catch (err) {
    console.error('[Ephemeral Create]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

// ── VM efímera - eliminar ────────────────────────────────
router.post('/ephemeral/delete', async (req, res) => {
  try {
    const { instance_name } = req.body || {};

    if (!instance_name) {
      return res.status(400).json({ error: 'Falta el nombre de la instancia' });
    }

    const extraVars = {
      instance_name,
      requested_by: req.user?.email || 'portal-user',
    };

    const result = await launchJobTemplate(process.env.AAP_JT_EPHEMERAL_VM_DELETE, extraVars);
    return res.json(result);
  } catch (err) {
    console.error('[Ephemeral Delete]', err.message);
    return res.status(502).json({ error: err.message });
  }
});

module.exports = router;
