# SoloNook Library (offline-first PWA)

A personal, offline-first library + reader + writing nook for **PDF** and **EPUB** on Android (works great on Chrome).

## What this starter includes
- Library of folders (“books”) with custom cover images
- Import PDF / EPUB into any folder
- Offline storage using OPFS (Origin Private File System)
- PDF reader (page-based) via pdfjs
- EPUB reader (paginated) with font size + theme controls via epub.js
- Writing Nook (rich text) using React Quill
- Backup export/import for **metadata + notes**
  - (Documents stay in OPFS; export of binaries is a next step)

## Run locally
1. Install Node.js (on a computer)
2. In this folder:

```bash
npm install
npm run dev
```

Open the shown URL.

## Install as an app (PWA) on Android
To install, you need HTTPS.
Free options:
- GitHub Pages (free)
- Netlify / Vercel free tier

### GitHub Pages (recommended free path)
1. Create a GitHub repo and push this project
2. In `vite.config.ts`, set:
   - `base: '/<your-repo-name>/'`
3. Build:

```bash
npm run build
```

4. Deploy `dist/` to GitHub Pages (via Actions or gh-pages)

Once hosted, open it on your Redmi Note in Chrome and:
- Menu → **Add to Home screen**

## Notes on PDF vs EPUB
- EPUB: you can change font size + theme easily (this starter does).
- PDF: fixed layout; you can still do a good book-like page viewer (this starter does),
  but changing the underlying PDF font is generally not possible.

## Next upgrades you can add
- PDF night mode / invert colors
- PDF merge: “combine papers into one book”
- Real cover generation from first page or embedded thumbnail
- Full backup including documents (zip)
- Search, tags, favorites
