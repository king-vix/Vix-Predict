import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE = 'https://v3.football.api-sports.io';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

async function api(pathname, params = {}) {
  if (!API_KEY) throw new Error('Server API key is not configured. Set API_FOOTBALL_KEY in your hosting environment.');
  const url = new URL(BASE + pathname);
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Football provider returned HTTP ${response.status}`);
  if (body.errors && Object.keys(body.errors).length) throw new Error(JSON.stringify(body.errors));
  return body;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, apiKeyConfigured: Boolean(API_KEY) }));
app.get('/api/fixtures', async (req, res) => {
  try {
    const date = String(req.query.date || new Date().toISOString().slice(0, 10));
    const league = String(req.query.league || '39');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d+$/.test(league)) return res.status(400).json({ error: 'Invalid date or league.' });
    const data = await api('/fixtures', { date, league, timezone: 'Africa/Lagos' });
    const matches = (data.response || []).map(item => ({
      id: item.fixture?.id,
      date: item.fixture?.date,
      time: item.fixture?.date ? new Date(item.fixture.date).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' }) : '',
      status: item.fixture?.status?.long,
      league: item.league?.name || 'League',
      home: item.teams?.home?.name || 'Home',
      away: item.teams?.away?.name || 'Away'
    }));
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ matches, provider: 'API-Football', count: matches.length });
  } catch (error) { res.status(502).json({ error: error.message || 'Unable to load fixtures.' }); }
});
app.get('/api/prediction/:fixtureId', async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.fixtureId)) return res.status(400).json({ error: 'Invalid fixture ID.' });
    const data = await api('/predictions', { fixture: req.params.fixtureId });
    const result = data.response?.[0];
    if (!result) return res.status(404).json({ error: 'No provider prediction available for this fixture.' });
    res.json({ provider: 'API-Football', fixtureId: Number(req.params.fixtureId), prediction: result.predictions, comparison: result.comparison, teams: result.teams, league: result.league });
  } catch (error) { res.status(502).json({ error: error.message || 'Unable to load prediction.' }); }
});
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`VixPredict running on port ${PORT}`));
