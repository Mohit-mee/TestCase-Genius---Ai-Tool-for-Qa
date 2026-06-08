/**
 * GET /api/health  →  { ok: true, service: "..." }
 *
 * Exposed at /health via the rewrite in vercel.json so the existing
 * `jiraProxyHealth(cfg)` call in index.html works unchanged on the
 * deployed site (cfg.proxy + "/health").
 */

const { makeHandler } = require("./_lib/jira.js");

module.exports = makeHandler({
  method: "GET",
  run: async () => ({
    status: 200,
    body: { ok: true, service: "testcase-genius-jira-proxy", runtime: "vercel" }
  })
});
