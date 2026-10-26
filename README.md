# FIRST-REPO
CONTRIBUTION IN COMMUNITY

## CommonGround — local service directory

A responsive service directory prototype with keyword search, category filters, clickable directions and phone links, and a suggestion form.

The Springfield listings and phone numbers are fictional demo data, not verified referrals. Replace them with current, verified information before people rely on the directory. Suggestions submitted through the form are saved to the database for review.

The site files are in the repository root: `index.html`, `styles.css`, and `app.js`.

### Hosting on Netlify

On Netlify the API runs as Netlify Functions (`netlify/functions/`) backed by Netlify Database (managed Postgres). The schema lives in `db/schema.ts`, and migrations in `netlify/database/migrations/` (which also seed the demo listings) are applied automatically on deploy. The build runs `build_static.py`, which publishes only the public site files.

- `GET /api/services` returns the directory listings.
- `POST /api/suggestions` saves a suggestion (`kind`, `note`, optional `service` and `email`).

### Running locally with Python

`python3 backend.py` serves the same site and API at http://127.0.0.1:8000 using a local SQLite file. Run the tests with `python3 -m unittest test_backend`.