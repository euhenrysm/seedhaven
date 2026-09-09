# Seedhaven

**Build, grow and trade.**

This repository contains the public Seedhaven documentation and the browser prototype.

## Structure

```text
seedhaven/
├── index.html      # Whitepaper / public docs
├── README.md
└── game/
    ├── index.html  # Playable prototype
    ├── game.js
    ├── style.css
    └── README.md
```

## Local preview

From the repository folder:

```bash
python -m http.server 8000
```

Open:

- Whitepaper: http://localhost:8000/
- Game: http://localhost:8000/game/

## GitHub Pages

When GitHub Pages is configured to deploy from `main` / root:

- Docs: `https://YOUR-USERNAME.github.io/seedhaven/`
- Game: `https://YOUR-USERNAME.github.io/seedhaven/game/`
