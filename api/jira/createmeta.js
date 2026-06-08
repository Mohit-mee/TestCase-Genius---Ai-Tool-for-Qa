/**
 * POST /api/jira/createmeta  →  Jira /rest/api/3/issue/createmeta
 *
 * Read-only pre-flight: returns the project and the issue types the caller
 * can create in it. Used by the pre-push modal to (a) verify the project
 * key exists and (b) show a helpful inline retry if the chosen issue type
 * is invalid for that project.
 *
 * Body: { jiraUrl, email, apiToken, project }
 */

const { jiraFetch, makeHandler } = require("../_lib/jira.js");

module.exports = makeHandler({
  method: "POST",
  run: async (body) => {
    const project = encodeURIComponent(body.project || "");
    return jiraFetch({
      ...body,
      method: "GET",
      path: `/rest/api/3/issue/createmeta?projectKeys=${project}&expand=projects.issuetypes`
    });
  }
});
