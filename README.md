# GameVault (Frontend)

Demo React + Tailwind for GameVault.

## Quickstart (dev)
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

## Build & Deploy (GitHub Pages)
1. Set `vite.config.js` `base` to `/REPO_NAME/` (see below).
2. `npm run build`
3. `npm install --save-dev gh-pages`
4. Add scripts:
   - `"predeploy": "npm run build"`
   - `"deploy": "gh-pages -d dist"`
5. `npm run deploy` (deploys `dist` to `gh-pages` branch)

## Features
- CRUD games (with backend)
- Filters, search, pagination
- Add / Edit inline + modal add
- Tailwind styling

## Notes
- Backend: see `gamevault-server` repo (Express + SQLite).

## Demo

<video controls loop muted width="720">
  <source src="./docs/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>