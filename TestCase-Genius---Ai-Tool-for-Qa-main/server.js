#!/usr/bin/env node
/**
 * TestCase Genius — Jira proxy
 * Bridges the browser to Jira Cloud's REST API (which doesn't allow CORS).
 *
 * Usage:   node server.js
 * Requires: Node.js 18+ (no npm install needed)
 *
 * Endpoints:
 *   GET  /health         → { ok: true }
 *   POST /jira/myself    → proxy to Jira /rest/api/3/myself  (auth test)
 *   POST /jira/createmeta→ proxy to Jira /rest/api/3/issue/createmeta (project + types)
 *   POST /jira/users     → proxy to Jira /rest/api/3/user/assignable/search (assignee picker)
 *   POST /jira/create    → proxy to Jira /rest/api/3/issue   (create issue)
 *
 * All POSTs accept JSON body:
 *   { jiraUrl, email, apiToken, payload }   (payload is the Jira fields object for create)
 *
 * Credentials are passed per-request from the browser; nothing is stored on disk.
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = parseInt(process.env.PORT || "7777", 10);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "600");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch (e) { reject(new Error("Invalid JSON body: " + e.message)); }
    });
    req.on("error", reject);
  });
}

function jiraRequest({ jiraUrl, email, apiToken, method, path, body }) {
  return new Promise((resolve, reject) => {
    if (!jiraUrl || !email || !apiToken) {
      return reject(new Error("Missing jiraUrl, email, or apiToken"));
    }
    let target;
    try { target = new URL(path, jiraUrl); }
    catch (e) { return reject(new Error("Invalid jiraUrl: " + jiraUrl)); }

    const isHttps = target.protocol === "https:";
    const lib = isHttps ? https : http;
    const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
    const payload = body ? JSON.stringify(body) : null;

    const req = lib.request({
      method,
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: target.pathname + target.search,
      headers: {
        "Authorization": "Basic " + auth,
        "Accept": "application/json",
        ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {})
      }
    }, jr => {
      const buf = [];
      jr.on("data", c => buf.push(c));
      jr.on("end", () => {
        const text = Buffer.concat(buf).toString("utf8");
        let json; try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
        resolve({ status: jr.statusCode, body: json });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const routes = {
  "GET /health": async () => ({ status: 200, body: { ok: true, service: "testcase-genius-jira-proxy" } }),

  "POST /jira/myself": async (body) => {
    const r = await jiraRequest({ ...body, method: "GET", path: "/rest/api/3/myself" });
    return r;
  },

  // Read-only: returns the project + the issue types the caller can create.
  // Used to validate Project Key + Issue Type before doing any creates.
  "POST /jira/createmeta": async (body) => {
    const project = encodeURIComponent(body.project || "");
    const r = await jiraRequest({
      ...body, method: "GET",
      path: `/rest/api/3/issue/createmeta?projectKeys=${project}&expand=projects.issuetypes.fields`
    });
    return r;
  },

  // Read-only: returns users who can be assigned issues in a given project.
  // Used to populate the "Assignee" picker shown when issue type = Bug.
  // body: { jiraUrl, email, apiToken, project, query? }
  "POST /jira/users": async (body) => {
    if (!body.project) return { status: 400, body: { error: "Missing project" } };
    const project = encodeURIComponent(body.project);
    const q = encodeURIComponent(body.query || "");
    const r = await jiraRequest({
      ...body, method: "GET",
      path: `/rest/api/3/user/assignable/search?project=${project}&query=${q}&maxResults=20`
    });
    return r;
  },

  "POST /jira/create": async (body) => {
    if (!body.payload || !body.payload.fields) {
      return { status: 400, body: { error: "Missing payload.fields" } };
    }
    const r = await jiraRequest({
      ...body, method: "POST", path: "/rest/api/3/issue", body: body.payload
    });
    return r;
  }
};

const server = http.createServer(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const key = req.method + " " + (req.url || "/").split("?")[0];
  const handler = routes[key];
  if (!handler) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found", route: key }));
    return;
  }

  try {
    const body = req.method === "GET" ? {} : await readBody(req);
    const { status, body: respBody } = await handler(body);
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(respBody));
    const tag = status >= 200 && status < 300 ? "OK " : "ERR";
    console.log(`[${new Date().toISOString()}] ${tag} ${key} → ${status}`);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
    console.error(`[${new Date().toISOString()}] EXC ${key} → ${e.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`
  TestCase Genius -> Jira proxy
  Listening on http://localhost:${PORT}
  Health:  http://localhost:${PORT}/health

  Leave this window running while you use the app.
  Press Ctrl+C to stop.
`);
});
