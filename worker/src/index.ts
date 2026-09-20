export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  ADMIN_TOKEN: string;
}

const MAX_MESSAGE_LEN = 4000;
const MAX_EMAIL_LEN = 320;

function corsHeaders(req: Request, env: Env): HeadersInit {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

function json(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

async function handleSubmit(req: Request, env: Env, cors: HeadersInit): Promise<Response> {
  let body: { message?: unknown; email?: unknown; hp?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  // Honeypot: a hidden field real visitors never fill in. Bots that
  // auto-fill every form field trip this and get silently "accepted"
  // (so they don't learn to avoid it) without ever touching the DB.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') {
    return json({ ok: true }, 200, cors);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!message) return json({ error: 'Message is required' }, 400, cors);
  if (message.length > MAX_MESSAGE_LEN) return json({ error: 'Message is too long' }, 400, cors);
  if (email.length > MAX_EMAIL_LEN) return json({ error: 'Email is too long' }, 400, cors);

  await env.DB.prepare(
    'INSERT INTO feedback (message, email, created_at) VALUES (?, ?, ?)'
  ).bind(message, email || null, new Date().toISOString()).run();

  return json({ ok: true }, 201, cors);
}

async function handleList(req: Request, env: Env, cors: HeadersInit): Promise<Response> {
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  const { results } = await env.DB.prepare(
    'SELECT id, message, email, created_at FROM feedback ORDER BY created_at DESC LIMIT 500'
  ).all();

  return json({ feedback: results }, 200, cors);
}

const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>PhysicsLab Feedback — Admin</title>
<style>
  :root { color-scheme: light; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #171b26; }
  h1 { font-size: 1.4rem; }
  #gate { display: flex; gap: 8px; margin-bottom: 24px; }
  input[type=password] { flex: 1; padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.9rem; }
  button { padding: 10px 18px; border: none; border-radius: 8px; background: #4f46e5; color: #fff; font-weight: 600; cursor: pointer; }
  button:hover { background: #4338ca; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  th { color: #667085; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.04em; }
  .msg { white-space: pre-wrap; max-width: 480px; }
  .err { color: #dc2626; margin-top: 8px; font-size: 0.85rem; }
  .muted { color: #667085; font-size: 0.8rem; }
</style>
</head>
<body>
  <h1>📬 PhysicsLab Feedback</h1>
  <div id="gate">
    <input id="token" type="password" placeholder="Admin token" />
    <button id="load">Load</button>
  </div>
  <div id="err" class="err"></div>
  <div id="out"></div>
<script>
  const gate = document.getElementById('token');
  const out = document.getElementById('out');
  const err = document.getElementById('err');

  document.getElementById('load').addEventListener('click', async () => {
    err.textContent = '';
    out.innerHTML = 'Loading…';
    try {
      const res = await fetch('/api/feedback', {
        headers: { Authorization: 'Bearer ' + gate.value },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || ('HTTP ' + res.status));
      }
      const data = await res.json();
      if (!data.feedback.length) {
        out.innerHTML = '<p class="muted">No feedback yet.</p>';
        return;
      }
      const rows = data.feedback.map((f) =>
        '<tr><td class="muted">' + new Date(f.created_at).toLocaleString() + '</td>' +
        '<td class="msg">' + escapeHtml(f.message) + '</td>' +
        '<td>' + (f.email ? escapeHtml(f.email) : '<span class="muted">—</span>') + '</td></tr>'
      ).join('');
      out.innerHTML = '<table><thead><tr><th>When</th><th>Message</th><th>Email</th></tr></thead><tbody>' + rows + '</tbody></table>';
    } catch (e) {
      err.textContent = e.message;
      out.innerHTML = '';
    }
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
</script>
</body>
</html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const cors = corsHeaders(req, env);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/api/feedback' && req.method === 'POST') {
      return handleSubmit(req, env, cors);
    }

    if (url.pathname === '/api/feedback' && req.method === 'GET') {
      return handleList(req, env, cors);
    }

    if (url.pathname === '/admin' && req.method === 'GET') {
      return new Response(ADMIN_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
