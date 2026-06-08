/**
 * POST /api/jira/users  →  Jira /rest/api/3/user/assignable/search
 *
 * Search-as-you-type for the Assignee picker shown in the pre-push modal
 * (any issue type can have an assignee, not just Bug).
 *
 * Body: { jiraUrl, email, apiToken, project, query? }
 */

const { jiraFetch, makeHandler } = require("../_lib/jira.js");

module.exports = makeHandler({
  method: "POST",
  run: async (body) => {
    if (!body.project) {
      return { status: 400, body: { error: "Missing project" } };
    }
    const project = encodeURIComponent(body.project);
    const q = encodeURIComponent(body.query || "");
    return jiraFetch({
      ...body,
      method: "GET",
      path: `/rest/api/3/user/assignable/search?project=${project}&query=${q}&maxResults=20`
    });
  }
});
