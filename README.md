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

The demo does not call the real GapHunter backend. CDN libraries are still loaded from the browser for Tailwind, Alpine.js, ApexCharts, Font Awesome, AOS, particles.js, SweetAlert, and Typed.js.

Career OS modules added:

- Career Path Navigator in the Individual results view.
- Fair Pay Engine inside Market Salary Intelligence.
- Future-State Curriculum Engine in the University tab.
