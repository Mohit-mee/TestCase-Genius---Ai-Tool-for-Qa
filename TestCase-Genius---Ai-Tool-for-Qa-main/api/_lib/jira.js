/**
 * Shared Jira fetcher used by every /api/jira/* serverless function.
 *
 * Files under api/_lib are NOT routed by Vercel (the underscore is the
 * convention for private helpers) but ARE importable from sibling functions.
 *
 * Auth model: credentials are passed per-request from the browser, the same
 * model used by the local `server.js` proxy. Nothing is stored on this
 * server — the function is stateless and forgets the caller's token the
 * moment the response is returned.
 */

async function jiraFetch({ jiraUrl, email, apiToken, method, path, body }) {
  if (!jiraUrl || !email || !apiToken) {
    const e = new Error("Missing jiraUrl, email, or apiToken");
    e.status = 400;
    throw e;
  }
  let target;
  try { target = new URL(path, jiraUrl); }
  catch (err) {
    const e = new Error("Invalid jiraUrl: " + jiraUrl);
    e.status = 400;
    throw e;
  }

  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
  const res = await fetch(target.toString(), {
    method,
    headers: {
      "Authorization": "Basic " + auth,
      "Accept": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; }
  catch { json = { raw: text }; }
  return { status: res.status, body: json };
}

/**
 * Tiny boilerplate wrapper every endpoint shares: sets CORS so the static
 * page (which lives on the same Vercel origin in production, but could be
 * opened from `file://` or a custom domain in unusual setups) can hit the
 * function; handles preflight; and converts thrown errors into JSON.
 */
function makeHandler({ method, run }) {
  return async function handler(req, res) {
    // Permissive CORS — credentials never traverse this layer (Jira basic
    // auth is in the body, not the Authorization header), so `*` is safe.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    if (req.method !== method) {
      res.status(405).json({ error: "Method not allowed", expected: method });
      return;
    }
    try {
      // Vercel auto-parses JSON when Content-Type is application/json, but
      // guard against the string form some clients send.
      let body = req.body || {};
      if (typeof body === "string") {
        try { body = JSON.parse(body || "{}"); } catch { body = {}; }
      }
      const { status, body: respBody } = await run(body);
      res.status(status).json(respBody);
    } catch (e) {
      const status = e && e.status ? e.status : 500;
      res.status(status).json({ error: (e && e.message) || String(e) });
    }
  };
}

module.exports = { jiraFetch, makeHandler };
