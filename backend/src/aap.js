// ─────────────────────────────────────────────────────────
// Servicio genérico para disparar workflows en AAP
// ─────────────────────────────────────────────────────────
const fetch = require('node-fetch');

const AAP_URL = process.env.AAP_URL || 'https://aap-controller.example';

/**
 * Lanza un workflow_job_template en AAP.
 *
 * @param {string|number} workflowId  – ID numérico o path del workflow template
 * @param {object}        extraVars   – Variables extra que recibe el workflow
 * @param {string}        token       – Bearer token de servicio (AAP)
 * @returns {{ job_id: number }}
 */
async function launchAapWorkflow(workflowId, extraVars = {}, token) {
  const url = `${AAP_URL}/api/v2/workflow_job_templates/${workflowId}/launch/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ extra_vars: extraVars }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AAP respondió ${response.status}: ${text}`);
  }

  const data = await response.json();
  return { job_id: data.id };
}

/**
 * Elige el token AAP apropiado según el rol del usuario.
 *   commercial  → AAP_TOKEN_AUDIT
 *   ops         → AAP_TOKEN_OPS
 */
function tokenForRole(role) {
  if (role === 'ops') return process.env.AAP_TOKEN_OPS;
  return process.env.AAP_TOKEN_AUDIT;
}

module.exports = { launchAapWorkflow, tokenForRole };
