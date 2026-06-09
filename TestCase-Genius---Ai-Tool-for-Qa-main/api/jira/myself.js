/**
 * POST /api/jira/myself  →  Jira /rest/api/3/myself
 *
 * Read-only auth-test endpoint. The Settings panel's "Test connection"
 * button hits this to verify the user's email + API token before any
 * issue-create attempt.
 *
 * Body: { jiraUrl, email, apiToken }
 */

const { jiraFetch, makeHandler } = require("../_lib/jira.js");

module.exports = makeHandler({
  method: "POST",
  run: async (body) => jiraFetch({ ...body, method: "GET", path: "/rest/api/3/myself" })
});
