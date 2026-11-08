# Scrapbook

A frontend-only React + TypeScript app, built with Vite. The otherwise blank homepage displays a large, flat magazine with paper texture and page-turn animation. Its 12 printed pages comprise the front cover, five interior spreads, and back cover. The first inside spread reproduces the two Figma collage pages; the remaining inside pages are blank. Click the right page to advance or the left page to go back. Click the front cover to open the first spread, or the back cover to reopen the last spread. Clicks during a page turn are ignored so each transition finishes before another begins. When focused, use Left/Right to turn pages or Home/End to jump to the covers. Reduced-motion preferences are respected. No backend, API keys, or database are required.

## Development

Use Node.js 22.12+ (the repository pins Node 22 with `.nvmrc`).

```sh
nvm use
npm ci
npm run dev
```

Open the local URL printed by Vite. Edit `src/App.tsx` for the homepage and `src/components/Storybook.tsx` for the book content and component. Shared styles live in `src/styles.css`.

## Commands

- `npm run dev`: start the app with hot reload.
- `npm run typecheck`: check TypeScript.
- `npm run build`: check TypeScript and build the static app into `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run storybook`: develop component stories on port 6006.
- `npm run build-storybook`: build the component explorer into `storybook-static/`.

Storybook is a separate development tool; the homepage renders the React component directly. Front-cover, open-spread, and back-cover examples are in `src/components/Storybook.stories.tsx`.

## GitHub Pages

1. Push this repository to GitHub on `main`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. The **Build and deploy to GitHub Pages** workflow builds and deploys the homepage on pushes to `main`. You can also run it manually from the Actions tab.

Expected URL: https://arminm1383.github.io/scrapbook/

Pull requests build the homepage and Storybook without deploying. Only `dist/` is published; the component explorer stays a development tool.

The workflow sets `VITE_BASE_PATH` to the repository name so asset URLs work under `/scrapbook/`. For an account-level `username.github.io` repository or a custom domain, change that workflow value to `/`. Local builds default to relative asset paths (`./`). This follows [Vite’s GitHub Pages deployment guide](https://vite.dev/guide/static-deploy#github-pages).

There is one route and no client-side router, so no SPA fallback or server configuration is needed.
