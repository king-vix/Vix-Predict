# VixPredict

Mobile-friendly football analysis prototype with a working Poisson goal-probability calculator and an optional API-Football backend for fixtures and provider predictions.

## What's working
- Responsive mobile UI for Android/Chrome.
- Home/draw/away probabilities, expected goals, scoreline estimate, Over 1.5/Over 2.5/Under 2.5, and both-teams-to-score calculations.
- Manual SportyBet 1X2 odds comparison.
- Backend routes for fixture listing and API-Football fixture predictions.
- API key read only from the server environment, not browser code.

## Run locally
Requires Node.js 20 or newer.

1. Create an API-Football account and obtain an API key if you want live fixtures.
2. Set the environment variable `API_FOOTBALL_KEY` in your terminal or hosting provider.
3. Run `npm install` then `npm start`.
4. Open `http://localhost:3000`.

The calculator works without an API key. Live fixture requests will show a setup error until a key is configured.

## Deploy
GitHub Pages can host only the static frontend; it cannot run `server.js`. To use live API data, deploy this whole project to a Node-capable host (for example Render or another Node host), add `API_FOOTBALL_KEY` as a secret environment variable, and open the deployed URL. Do not publish the API key in HTML, JavaScript, screenshots, or a public repository.

## Current limitations
- Fixtures route is connected to API-Football's `/fixtures` endpoint.
- A backend endpoint exists for provider predictions at `/api/prediction/:fixtureId`; this first UI version does not yet automatically render that endpoint's response.
- Player injury/lineup analysis and bookmaker odds are not yet wired into the UI.
- API data availability depends on the provider's plan and coverage for each competition. SportyBet is not directly connected; odds are entered manually.
- The sample statistics are illustrative. Do not use them as live team data or treat predictions as guaranteed.

## API references
- https://www.api-football.com/documentation-v3
