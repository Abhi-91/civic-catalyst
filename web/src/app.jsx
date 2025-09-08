import React, { useState } from 'react';

export default function App() {
  const [skills, setSkills] = useState('Python, React');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  async function handleFind() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/find-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills })
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setResults(j.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Civic Catalyst — Quick Demo</h1>
      <p>Connect GitHub (via Descope) first, then type skills and click <strong>Find issues</strong>.</p>

      <div style={{ marginBottom: 12 }}>
        <label>Skills (comma separated)</label>
        <input value={skills} onChange={e => setSkills(e.target.value)} style={{ width: '60%', padding: 8, marginLeft: 8 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        {/* Placeholder connect button: implement Descope Flow -> redirect -> backend session will be populated */}
        <button onClick={() => window.location.href = '/api/connect-github'} style={{ marginRight: 8 }}>Connect GitHub (Descope)</button>
        <button onClick={handleFind} disabled={loading}>{loading ? 'Finding…' : 'Find issues'}</button>
      </div>

      {error && (<div style={{ color: 'red' }}>Error: {error}</div>)}

      <div>
        {results.length === 0 && <div>No results yet.</div>}
        {results.map((r, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', padding: 12, margin: '8px 0' }}>
            <div><strong>{r.issue.repository_url?.split('/').slice(-1)[0] || r.issue.html_url}</strong></div>
            <div><a href={r.issue.html_url} target='_blank' rel='noreferrer'>{r.issue.title}</a></div>
            <div style={{ marginTop: 8 }}>{r.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
