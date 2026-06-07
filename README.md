# TestCase Genius

An AI-powered test case generator for QA teams. Describe a feature in plain English and get a **diverse set of test cases**, each with a **rationale explaining why it matters** — plus one-click export to **Excel, CSV, Markdown, and JSON**.

Built as a single-file web app — no install, no build step. Just open `index.html` in any modern browser.

---

## Why testers will love it

- **Diverse coverage** — Positive, Negative, Boundary, Edge, Security, Accessibility, Performance, UI/UX, Compatibility, and Integration test cases in one shot
- **Rationale column** — every case explains *why* it matters, so junior testers learn while they execute and leads can justify coverage to managers
- **Audience-tuned output** — choose Junior (longer education), Standard, or Lead/Manager (concise)
- **Adjustable depth** — Quick (8–12), Standard (15–25), or Deep (30+) cases
- **Export to anywhere** — Excel (formatted), CSV, Markdown (Confluence/Notion-ready), JSON (tooling)
- **Push directly to Jira** — one click creates a Jira issue per test case with full description, steps, expected result, and rationale (via a tiny local proxy — no SaaS, no signup)
- **Jira CSV import** — zero-setup alternative; generates a CSV that Jira's built-in importer accepts
- **Works offline** — a smart rule-based "Demo engine" generates real test cases for common features (login, signup, search, payment, upload, API) with no API key
- **Optional OpenAI mode** — paste your API key in Settings for unrestricted, AI-generated cases on any feature; the key stays in your browser

---

## Quick start

### Option A — Just open the file

Double-click `index.html`. That's it. Works offline.

### Option B — Serve it locally (recommended for sharing on the same machine)

```powershell
cd $env:USERPROFILE\Projects\testcase-genius
python -m http.server 8080
```

Then open <http://localhost:8080>.

If you don't have Python:

```powershell
npx --yes http-server -p 8080
```

### Option C — Deploy free to the internet (so your team can use it)

The simplest path is **Vercel**, **Netlify**, or **GitHub Pages**:

**Vercel:**

```powershell
npm install -g vercel
cd $env:USERPROFILE\Projects\testcase-genius
vercel
```

Press Enter through the prompts. You'll get a public URL like `https://testcase-genius-xyz.vercel.app` you can share with your team.

**Netlify drop:** Drag the `testcase-genius` folder onto <https://app.netlify.com/drop>.

**GitHub Pages:** Push the folder to a GitHub repo, then in repo Settings → Pages, pick "Deploy from branch" → `main` → `/ (root)`.

---

## How to use it

1. **Describe the feature.** Paste a user story, requirement, or a plain-English description. Mention fields, validation rules, roles, and platform if known.
2. **(Optional) Set Module, Platform, Depth, Audience.**
3. **Click Generate.** Cases appear in a table on the right.
4. **Click any row** to see full details: pre-conditions, steps, expected result, and the rationale ("Why this test matters").
5. **Filter** by type or priority.
6. **Export** to Excel / CSV / Markdown / JSON with one click.

### Try a sample

Click any sample chip (Login form, Signup form, Search bar, Payment, File upload, REST API) to load a realistic example, then Generate. Great for demoing to your team.

---

## Engine modes

### Demo engine (default, offline, free)

A rule-based engine detects the type of feature from your description (login, signup, search, payment, upload, API, or generic form) and generates real, useful test cases tuned to that domain. Output includes detailed rationale and follows industry coverage patterns (positive, negative, boundary, edge, security, accessibility, etc.).

Great for:

- Demoing the tool internally before getting AI budget
- Working offline / on restricted networks
- Common feature types where rule-based output is already excellent

### Google Gemini engine (FREE — recommended)

For any feature description, switch to **Gemini** in the **Engine** dropdown. It's the best free AI engine available:

- **Cost: $0** (Google's free tier)
- **1,500 generations per day** included for free
- **15 generations per minute** rate limit
- **No credit card required**
- Default model: `gemini-1.5-flash` (fast, free)
- Higher-quality option: `gemini-1.5-pro` (smaller free quota)
- Newest: `gemini-2.0-flash-exp`

#### Get your free key in 30 seconds

1. Go to <https://aistudio.google.com/app/apikey> (sign in with any Google account)
2. Click **Create API key** → copy it (starts with `AIza...`)
3. In TestCase Genius: **Settings → Gemini API Key** → paste → Save
4. Switch the **Engine** dropdown to **"Google Gemini (FREE)"** → click Generate

### OpenAI engine (paid alternative)

For OpenAI, switch to OpenAI in the **Engine** dropdown. Add your API key in **Settings** (it's stored only in your browser, never sent anywhere except `api.openai.com`).

- Default model: `gpt-4o-mini` (fast and cheap)
- Optional: `gpt-4o` or `gpt-4-turbo` for higher quality
- Cost: typically well under $0.01 per generation with `gpt-4o-mini`

### Using a corporate / internal LLM endpoint

If your company has an internal OpenAI-compatible endpoint, edit the URL in the `generateOpenAI` function inside `index.html` (search for `https://api.openai.com/v1/chat/completions`).

---

## Push to Jira

Two ways to get your test cases into Jira — pick whichever fits your environment.

### Option 1 — Jira CSV (zero setup)

1. Click **Jira CSV** in the export bar. You'll get a file like `login-testcases-jira-import.csv`.
2. In Jira: **Settings → System → External System Import → CSV**.
3. Upload the file, accept the default field mapping (Jira recognizes Summary / Issue Type / Priority / Labels / Description).
4. Done — issues are created with the full test case in the Description (using Jira wiki markup).

This works on Jira Cloud, Server, and Data Center. No credentials, no IT approval needed.

### Option 2 — Cursor + Atlassian MCP (zero infra, zero proxy)

If you use **Cursor** with the **Atlassian plugin** installed, you can push test cases to Jira straight from a Cursor chat — no local proxy, no API token to manage in this app.

There is a Cursor Skill installed at:

```text
~/.cursor/skills/push-test-cases-to-jira/SKILL.md
```

#### How to use it

1. In TestCase Genius, click **JSON** to export your generated cases (e.g. `login-testcases-2026-06-05.json`).
2. Open any Cursor chat and say:

   > *"Push the test cases in `~/Downloads/login-testcases-2026-06-05.json` to Jira project QA under epic QA-100."*

3. Cursor will:
   - Read the JSON file
   - Resolve your Atlassian site (via the Atlassian MCP)
   - Confirm the project, issue type, and Epic
   - Create one Jira issue per test case with full ADF description (steps, expected, rationale)
   - Auto-skip cases whose `[TC_...]` summary already exists in the project
   - Print a results table with clickable Jira links

You can also chain generation + push in one shot:

   > *"Generate test cases for the signup form and push them to Jira project QA as Tests."*

Cursor will invoke the `manual-test-case-generator` skill, then the `push-test-cases-to-jira` skill, all in one turn.

This is the cleanest option for teams already using Cursor — no `node server.js`, no API token configuration in the app itself, and the agent handles dedup, retries, and reporting automatically.

### Option 3 — Direct push from the web app (one-click via local proxy)

The browser can't call Jira directly (CORS), so the app talks to a tiny local Node.js proxy included in this project. **No `npm install` needed** — only Node.js 18+.

#### 1. Get a Jira API token

Go to <https://id.atlassian.com/manage-profile/security/api-tokens> → **Create API token** → copy it.

#### 2. Start the proxy (once per session)

Open a terminal in this folder and run:

```powershell
cd $env:USERPROFILE\Projects\testcase-genius
node server.js
```

You'll see:

```text
TestCase Genius -> Jira proxy
Listening on http://localhost:7777
```

Leave that terminal window open while you use the app.

#### 3. Configure in the app

Open the app → **Settings** → fill the **Jira Integration** section:

| Field | Value |
|---|---|
| Jira Site URL | `https://yourcompany.atlassian.net` |
| Email | your Atlassian login email |
| API Token | the token from step 1 |
| Project Key | e.g. `QA` (the prefix on your issue keys) |
| Issue Type | `Task` (default) or `Test` if you use Xray/Zephyr |
| Proxy URL | `http://localhost:7777` (default) |
| Parent Epic Key | optional — links every issue under that epic |
| Extra Labels | optional — added to every issue |

Click **Test connection** to verify. You should see *"Connected as <your name> ✓"*.

#### 4. Push

After generating test cases, click **Push to Jira**. A modal shows each case being created with a live link to the new Jira issue. Every issue gets:

- **Summary** — `[TC_LOGIN_001] Successful login with valid credentials`
- **Description** — formatted Jira ADF with Pre-conditions, numbered Steps, Test Data, Expected Result, and the "Why this test matters" rationale as a blockquote
- **Labels** — `testcase-genius`, `type-positive`, `priority-high`, plus your extras
- **Epic link** — if you set a Parent Epic Key

### Security notes

- Credentials are kept in your browser's `localStorage` and passed per-request to the proxy. They never touch any third-party server.
- The proxy runs only on `localhost` and accepts only `/health`, `/jira/myself`, and `/jira/create`.
- The proxy has zero npm dependencies — easy to audit (~100 lines).

### Troubleshooting

| Symptom | Fix |
|---|---|
| "Proxy not reachable" | Run `node server.js` in the project folder; check the terminal for errors. |
| "Auth failed" | Wrong email or API token. Regenerate the token. |
| Issue creation returns 400 with `issuetype` error | Your project doesn't have that issue type. Try `Task`. |
| Issue creation returns 400 with `customfield_10014` error | Epic Link field id differs. Either clear the Parent Epic field, or edit `customfield_10014` in `index.html` (search for it) to match your instance. |
| Want to push to Jira Server (not Cloud) | Replace `/rest/api/3/` with `/rest/api/2/` in `server.js` and edit `toADF` in `index.html` to return Jira wiki markup string instead of ADF. |

---

## Pitching this to your company

This project hits every QA-leadership talking point in one demo:

| What it shows | Business value |
|---|---|
| Auto-generated coverage | Cuts test-design time by 70–90% |
| Rationale column | Trains junior testers without senior time; justifies coverage in reviews |
| Excel export | Drops straight into existing TestRail / Jira / Zephyr workflows |
| Offline demo mode | Pilot it with zero IT approval needed |
| Single HTML file | Easy security review — auditable in 5 minutes |

Suggested pitch:

> "I built a tool that turns user stories into a complete test case suite — with a rationale column explaining each case so the team learns the *why*, not just the *what*. It exports to Excel for our existing workflows and runs entirely in the browser, so there's no infra to procure. I'd like to pilot it on the next sprint."

---

## File layout

```text
testcase-genius/
├── index.html      # the whole app (UI + engine + exports + Jira push)
├── server.js       # tiny Node proxy for Push to Jira (zero deps)
└── README.md       # this file
```

---

## Extending it

Common requests and where to make changes (all inside `index.html`):

- **Add a new sample prompt** — add to the `SAMPLES` object near the top of the `<script>` block.
- **Add a new feature-type pattern** — extend `detectFeatureType` and add a matching `if (featureType.includes(...))` block in `buildCases`.
- **Change rationale wording** — edit the `RATIONALES` object.
- **Add a new export format (e.g. TestRail XML)** — model after `exportCSV`; wire a new button in the export bar.
- **Switch LLM provider** — edit `generateOpenAI` (URL, headers, request shape).

---

## Roadmap ideas

- Direct push to Jira / TestRail / Zephyr via their REST APIs
- Save & load generation sessions (project library)
- Diff mode — regenerate after a requirement change and highlight what changed
- Team library of approved test cases with tagging and search
- Browser extension that watches Jira and generates cases inline

---

## License

Use freely inside your company. If you publish or sell a derivative, give attribution.
