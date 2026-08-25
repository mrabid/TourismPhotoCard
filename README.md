# PRB POST — News Photo Card Generator

A simple web app to create PRB POST-style news photo cards. Upload a photo, edit Bengali headlines, and download a high-resolution PNG.

## Features

- Upload any photo into the template image area
- Edit badge text, date, and headlines (white + yellow)
- Live preview using the official `PRB-NEWS-Tempated.png` template
- Download as 1254×1254 PNG

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output is in the `dist/` folder.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

Edit `index.source.html` for development. The workflow builds with the correct `/PRB-POST-News-Photo-Card/` base path and publishes the built `index.html`, `assets/`, and template PNG to the repository root for GitHub Pages.

Live URL: `https://mrabid.github.io/PRB-POST-News-Photo-Card/`

## Usage

1. Open the site
2. Upload a news photo
3. Fill in Bengali text fields
4. Click **PNG ডাউনলোড** to save the card

## Tech Stack

- [Vite](https://vitejs.dev/)
- HTML Canvas rendering
- Google Fonts — Hind Siliguri, Noto Sans Bengali
