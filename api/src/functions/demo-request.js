const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');

// Where leads are stored. The connection string is injected as an Azure SWA
// application setting (Configuration → Application settings) — never hard-coded.
const TABLE_NAME = process.env.DEMO_TABLE_NAME || 'demosubmissions';
const CONN = process.env.STORAGE_CONNECTION_STRING;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.http('demo-request', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { ok: false, error: 'Invalid request.' } };
    }

    // Honeypot: real users never see/fill `company_url`. Bots do — quietly
    // accept and store nothing so they don't learn they were caught.
    if (body && body.company_url) {
      return { status: 200, jsonBody: { ok: true } };
    }

    const name = (body.name || '').toString().trim();
    const company = (body.company || '').toString().trim();
    const email = (body.email || '').toString().trim();

    if (!name || !company || !email) {
      return { status: 400, jsonBody: { ok: false, error: 'Name, company and email are required.' } };
    }
    if (!EMAIL_RE.test(email)) {
      return { status: 400, jsonBody: { ok: false, error: 'Please enter a valid email address.' } };
    }

    if (!CONN) {
      context.error('STORAGE_CONNECTION_STRING app setting is not configured.');
      return { status: 500, jsonBody: { ok: false, error: 'Server not configured. Please try again later.' } };
    }

    try {
      const client = TableClient.fromConnectionString(CONN, TABLE_NAME);
      await client.createTable(); // idempotent — no-op if it already exists
      const now = new Date();
      const rowKey = `${now.toISOString()}-${Math.random().toString(36).slice(2, 8)}`;
      await client.createEntity({
        partitionKey: 'demo',
        rowKey,
        name: name.slice(0, 200),
        company: company.slice(0, 200),
        email: email.slice(0, 320),
        phone: (body.phone || '').toString().trim().slice(0, 40),
        message: (body.message || '').toString().trim().slice(0, 2000),
        submittedAt: now.toISOString(),
        userAgent: (request.headers.get('user-agent') || '').slice(0, 400),
      });
      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      context.error('Failed to store demo submission', err);
      return { status: 500, jsonBody: { ok: false, error: 'Could not save your request. Please try again.' } };
    }
  },
});
