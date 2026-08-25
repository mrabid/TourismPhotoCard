# PRB POST — News Photo Card Generator

A simple web app to create PRB POST-style news photo cards. Upload a photo, edit Bengali headlines, and download a high-resolution PNG.

## Features

- Upload any photo into the template image area
- Edit badge text, date, headline (white + yellow), and subtext
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

1. Push this project to a GitHub repository.
2. Go to **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions** (or deploy the `dist` folder from the `gh-pages` branch).
4. The included workflow (`.github/workflows/deploy.yml`) builds and deploys automatically on push to `main`.

Your site will be live at: `https://<username>.github.io/<repo-name>/`

## Usage

1. Open the site
2. Upload a news photo
3. Fill in Bengali text fields
4. Click **PNG ডাউনলোড** to save the card

## Tech Stack

- [Vite](https://vitejs.dev/)
- [html-to-image](https://github.com/bubkoo/html-to-image)
- Google Fonts — Noto Sans Bengali
