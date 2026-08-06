# Curiosity Lab

A dependency-free browser playground for small generative systems.

## Experiments

- **Orbit Forge** — a deliberately soft gravity sandbox.
- **Cellular Bloom** — a cyclic cellular automaton that grows moving colour fronts.
- **Wave Loom** — layered sine waves that form an interactive moving textile.

## Run it

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

No build step is required. Opening `index.html` directly also works, although offline installation requires a local web server.

## Privacy and safety

The application has no external dependencies, API integrations, analytics, accounts or identifying sample data. See [PRIVACY.md](PRIVACY.md).

A small repository check rejects runtime network calls, externally hosted assets and common secret patterns:

```bash
node scripts/check.mjs
```

## Intent

This repository is a place for experiments that are complete enough to touch but small enough to throw away. New toys should remain self-contained, understandable and privacy-preserving.
