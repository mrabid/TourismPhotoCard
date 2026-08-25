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

**One-time setup:**

1. Open [Settings → Pages](https://github.com/mrabid/PRB-POST-News-Photo-Card/settings/pages).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to `gh-pages` and folder to `/ (root)`.
4. Save, then push to `main` (or re-run the deploy workflow).

The workflow builds with the correct `/PRB-POST-News-Photo-Card/` base path and publishes `dist/` to the `gh-pages` branch.

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
