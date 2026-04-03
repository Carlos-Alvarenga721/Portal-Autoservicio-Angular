// ─────────────────────────────────────────────────────────
// Servicio para disparar workflows y job templates en AAP
// ─────────────────────────────────────────────────────────
const https = require('https');
const fetch = require('node-fetch');

const AAP_URL = process.env.AAP_URL || 'https://10.10.0.10';
const AAP_TOKEN = process.env.AAP_TOKEN;

// Agente HTTPS que ignora certificados autofirmados (POC)
const agent = new https.Agent({ rejectUnauthorized: false });

/**
 * Lanza un Workflow Job Template en AAP.
 */
async function launchWorkflow(workflowId, extraVars = {}) {
  const url = `${AAP_URL}/api/v2/workflow_job_templates/${workflowId}/launch/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${AAP_TOKEN}`,
    },
    body: JSON.stringify({ extra_vars: extraVars }),
    agent,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AAP respondió ${response.status}: ${text}`);
  }

  const data = await response.json();
  return { job_id: data.id };
}

/**
 * Lanza un Job Template directo en AAP.
 */
async function launchJobTemplate(jtId, extraVars = {}) {
  const url = `${AAP_URL}/api/v2/job_templates/${jtId}/launch/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${AAP_TOKEN}`,
    },
    body: JSON.stringify({ extra_vars: extraVars }),
    agent,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AAP respondió ${response.status}: ${text}`);
  }

  const data = await response.json();
  return { job_id: data.id };
}

module.exports = { launchWorkflow, launchJobTemplate };