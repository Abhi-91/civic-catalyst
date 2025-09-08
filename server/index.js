const express = require('express');
const fetch = require('node-fetch');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'dev', resave: false, saveUninitialized: true }));

// -----------------
// NOTE ABOUT DESCOPE
// -----------------
// This skeleton assumes you handle the Descope Flow separately and that
// after successful GitHub outbound flow, your backend session contains a
// GitHub access token at `req.session.github_token`.
// How you populate that depends on how you wire Descope (Descope will
// issue tokens for outbound apps). Placeholders are marked TODO.

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Example endpoint to *start* a Descope flow (placeholder)
app.get('/api/connect-github', (req, res) => {
  // TODO: Redirect user to your hosted Descope Flow URL that connects GitHub.
  // After Descope flow completes, it should redirect back to your frontend
  // and the backend should be able to read the GitHub token (e.g., via
  // a secure callback or by storing it in the session).
  res.json({ message: 'Implement your Descope Flow redirect here.' });
});

// Main endpoint: find issues based on skills (languages)
app.post('/api/find-issues', async (req, res) => {
  try {
    const { skills = '' } = req.body;
    // Example: parse languages from skills input: "Python, React" -> pick Python & JavaScript
    const parsed = parseSkills(skills);

    // Retrieve GitHub token from session (populated by Descope Flow)
    const ghToken = req.session.github_token;
    if (!ghToken) {
      return res.status(401).json({ error: 'No GitHub token in session. Connect GitHub via Descope first.' });
    }

    // Fetch issues (search by label "good first issue" + language)
    const issues = [];
    for (const lang of parsed.languages) {
      const pageIssues = await fetchGitHubIssues(lang, ghToken);
      issues.push(...pageIssues);
    }

    // Take top 5 unique issues
    const unique = dedupeIssues(issues).slice(0, 5);

    // Summarize each issue with AI
    const summarized = [];
    for (const it of unique) {
      const summary = await summarizeIssue(it);
      summarized.push({ issue: it, summary });
    }

    res.json({ results: summarized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------
// Helper functions
// -----------------------

function parseSkills(skillsText) {
  // Very small heuristic parser — update as needed.
  const s = skillsText.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  const languages = [];
  if (s.includes('python')) languages.push('Python');
  if (s.includes('react') || s.includes('javascript') || s.includes('js')) languages.push('JavaScript');
  if (s.includes('java')) languages.push('Java');
  if (s.includes('c++') || s.includes('cpp')) languages.push('C++');
  if (languages.length === 0) languages.push('JavaScript'); // default
  return { languages };
}

async function fetchGitHubIssues(language, token) {
  const q = encodeURIComponent(`label:"good first issue" language:${language} state:open`);
  const url = `https://api.github.com/search/issues?q=${q}&per_page=10`;
  const r = await fetch(url, { headers: { Authorization: `token ${token}`, 'User-Agent': 'CivicCatalyst' } });
  if (!r.ok) {
    const text = await r.text();
    console.error('GitHub fetch failed', r.status, text);
    return [];
  }
  const data = await r.json();
  return data.items || [];
}

function dedupeIssues(issues) {
  const seen = new Set();
  const out = [];
  for (const it of issues) {
    if (!seen.has(it.url)) {
      seen.add(it.url);
      out.push(it);
    }
  }
  return out;
}

async function summarizeIssue(issue) {
  // Compose a prompt for the AI summarizer
  const prompt = `Summarize this GitHub issue for a beginner contributor in 2 sentences. Include: repo name, one-sentence explanation of what to do, and why this is beginner-friendly.\n\nTitle: ${issue.title}\nBody: ${issue.body || ''}`;

  // Option A: Vercel AI SDK (pseudo)
  // Option B: OpenAI REST call
  // Below is a generic fetch to OpenAI-compatible endpoint. Replace with Vercel SDK if preferred.

  const aiKey = process.env.AI_API_KEY;
  if (!aiKey) return 'AI key not configured — cannot summarize.';

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.2
    })
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('AI summarize failed', resp.status, txt);
    return 'AI summarization failed';
  }
  const j = await resp.json();
  const out = j.choices?.[0]?.message?.content || j.choices?.[0]?.text || '';
  return out.trim();
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
