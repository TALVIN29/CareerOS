# GapHunter Demo

This is a self-contained static demo of the GapHunter site.

Files:

- `index.html` - the UI cloned from the public GapHunter frontend.
- `demo-api.js` - a local mock API that returns dummy job, gap, salary, company, CV, interview, roadmap, and enterprise intelligence data.

Run locally:

```bash
python3 -m http.server 5189
```

Then open:

```text
http://localhost:5189
```

By default the browser uses `demo-api.js` for local mock data. Set `USE_LOCAL_MOCKS = false` in `index.html` to call the Express API server instead. CDN libraries are still loaded from the browser for Tailwind, Alpine.js, ApexCharts, Font Awesome, AOS, particles.js, SweetAlert, and Typed.js.

Run the API server:

```bash
npm install
cp .env.example .env
npm run dev
```

The Express API listens on `PORT` from `.env`, defaults to `3000`, enables CORS, and preserves the response keys expected by the Alpine.js frontend. Set `APP_API_SECRET` to require either `Authorization: Bearer <secret>` or `X-Demo-Secret: <secret>`. Search skill gaps are persisted to a local SQLite ledger at `DATABASE_PATH`, defaulting to `./data/careeros.sqlite`.

Live integrations are optional. `POST /api/search` uses `SERPAPI_API_KEY` for Google Jobs first, then `BRIGHTDATA_SEARCH_URL` plus `BRIGHTDATA_API_KEY`, and falls back to local demo jobs. `POST /api/resume` extracts text from PDF, DOCX, or text uploads and uses `OPENAI_API_KEY` plus `OPENAI_MODEL` for skill and role inference, defaulting to GPT-4o and falling back to demo skills when no key is configured.

`GET /api/uni/metrics` aggregates the `gaps_ledger` table into the top 5 recurring market gaps and returns a dynamic curriculum readiness benchmark for the University flow.

Career OS modules added:

- Career Path Navigator in the Individual results view.
- Lifelong Career Trajectory Map in the Individual results view.
- Fair Pay Engine inside Market Salary Intelligence.
- Future-State Curriculum Engine in the University tab.
