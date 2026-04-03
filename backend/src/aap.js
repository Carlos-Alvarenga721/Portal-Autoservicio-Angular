// ─────────────────────────────────────────────────────────
// Servicio para disparar workflows y job templates en AAP
// ─────────────────────────────────────────────────────────
const https = require('https');
const fetch = require('node-fetch');

function normalizeAapUrl(rawUrl) {
  if (!rawUrl) return 'https://10.10.0.10';
  return rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;
}

const AAP_URL = normalizeAapUrl(process.env.AAP_URL);
const AAP_TOKEN = process.env.AAP_TOKEN;

// Agente HTTPS que ignora certificados autofirmados (POC)
const agent = new https.Agent({ rejectUnauthorized: false });

async function fetchAapJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AAP_TOKEN}`,
      ...(options.headers || {}),
    },
    agent,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AAP respondió ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Lanza un Workflow Job Template en AAP.
 */
async function launchWorkflow(workflowId, extraVars = {}) {
  const url = `${AAP_URL}/api/v2/workflow_job_templates/${workflowId}/launch/`;
  const data = await fetchAapJson(url, {
    method: 'POST',
    body: JSON.stringify({ extra_vars: extraVars }),
  });
  return { job_id: data.id };
}

/**
 * Lanza un Job Template directo en AAP.
 */
async function launchJobTemplate(jtId, extraVars = {}) {
  const url = `${AAP_URL}/api/v2/job_templates/${jtId}/launch/`;
  const data = await fetchAapJson(url, {
    method: 'POST',
    body: JSON.stringify({ extra_vars: extraVars }),
  });
  return { job_id: data.id };
}

async function getUnifiedJobStatus(jobId) {
  const url = `${AAP_URL}/api/v2/unified_jobs/${jobId}/`;
  const data = await fetchAapJson(url);

  return {
    job_id: data.id,
    status: data.status,
    failed: Boolean(data.failed),
    job_type: data.type,
    name: data.name,
    started: data.started,
    finished: data.finished,
    elapsed: data.elapsed,
  };
}

module.exports = { launchWorkflow, launchJobTemplate, getUnifiedJobStatus };
