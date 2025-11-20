# Portfolio Site (Static)

This is the static portfolio for Herald Mbre Inyang, deployed via GitHub Pages from the `site/` folder.

## Structure

- `index.html` — semantic, accessible layout with sections for Hero, About, Skills, Featured, Projects, Quote, Stats, Contact.
- `styles.css` — responsive styling with dark theme.
- `script.js` — small enhancements: typing effect, mobile nav, GitHub projects fetch, quote of the day.

## Local Preview

Open `site/index.html` directly in a browser, or serve it locally:

```bash
# Python
python -m http.server -d site 5500

# Node (if installed globally)
npx serve site -l 5500
```

Visit http://localhost:5500.

## Deploy

Deployment uses GitHub Pages with the workflow `.github/workflows/pages.yml` which publishes the `site/` directory on pushes to `main`.

After the first run, ensure Pages is enabled:

- Repo Settings → Pages → Source: GitHub Actions (should auto-populate after workflow run).

## Notes

- Projects are fetched client-side from the GitHub API and filtered to non-forks, non-archived.
- Quotes reuse the set from `scripts/update-quote.js` for consistency.
- To customize, edit text in `index.html`, styles in `styles.css`, or logic in `script.js`.
