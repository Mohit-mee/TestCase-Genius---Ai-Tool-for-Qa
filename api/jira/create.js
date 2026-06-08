/**
 * POST /api/jira/create  →  Jira /rest/api/3/issue
 *
 * The actual "Push to Jira" call. Accepts the full Jira `fields` payload
 * pre-built by the browser (the proxy is intentionally dumb so all field
 * mapping / ADF generation stays in `index.html` where it can be iterated
 * on quickly).
 *
 * Body: { jiraUrl, email, apiToken, payload }
 *       where payload = { fields: { ... } }
 */

const { jiraFetch, makeHandler } = require("../_lib/jira.js");

module.exports = makeHandler({
  method: "POST",
  run: async (body) => {
    if (!body.payload || !body.payload.fields) {
      return { status: 400, body: { error: "Missing payload.fields" } };
    }
    return jiraFetch({
      ...body,
      method: "POST",
      path: "/rest/api/3/issue",
      body: body.payload
    });
  }
});
