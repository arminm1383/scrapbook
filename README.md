# Scrapbook

A frontend-only React + TypeScript app, built with Vite. The otherwise blank homepage displays a large, flat magazine with paper texture and page-turn animation. Its 10 printed pages comprise the front cover, four interior spreads, and back cover. The implemented collages follow the updated Figma order: original page 1, sphere/gallery, wine, nature/dinner, bison, photo-grid/gallery, fish, portrait/dog/hearts. The last spread closes directly onto the back cover. Overlapping artwork uses subtle autonomous parallax, independent of cursor position; motion stops during page turns and for reduced-motion preferences. Click the right page to advance or the left page to go back. Click the front cover to open the first spread, or the back cover to flip the closed magazine back to the front. Clicks during a page turn are ignored so each transition finishes before another begins. When focused, use Left/Right to turn pages or Home/End to jump to the covers. Reduced-motion preferences are respected. No backend, API keys, or database are required.

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

Storybook is a separate development tool; the homepage renders the React component directly. Front-cover, first-spread, second-spread, third-spread, and back-cover examples are in `src/components/Storybook.stories.tsx`.

## GitHub Pages

1. Push this repository to GitHub on `main`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. The **Build and deploy to GitHub Pages** workflow builds and deploys the homepage on pushes to `main`. You can also run it manually from the Actions tab.

Expected URL: https://arminm1383.github.io/scrapbook/

Pull requests build the homepage and Storybook without deploying. Only `dist/` is published; the component explorer stays a development tool.

The workflow sets `VITE_BASE_PATH` to the repository name so asset URLs work under `/scrapbook/`. For an account-level `username.github.io` repository or a custom domain, change that workflow value to `/`. Local builds default to relative asset paths (`./`). This follows [Vite’s GitHub Pages deployment guide](https://vite.dev/guide/static-deploy#github-pages).

There is one route and no client-side router, so no SPA fallback or server configuration is needed.

## Chrome sphere

Inside page 2 replaces Figma layer `9:353` with the dependency-free WebGL component supplied in `chrome-sphere-component.zip`. The React adapter is `src/components/ChromeSphere.tsx`; the supplied component and reflection texture live in `src/components/chrome-sphere/`.

The sculpture inherits the original layer’s position, rotation, clipping, stacking order, and autonomous parallax. Drag it to tilt; releasing returns it to rest. A drag does not turn the page, while an ordinary click retains page navigation. The original sphere photo remains as a fallback while loading or if WebGL is unavailable. The component releases its observers, animation frame, and GPU resources when its page unmounts.

## Pouring wine GIF

Inside page 3 uses `src/assets/scrapbook/page2-wine-pouring.gif`: a seamless 32-frame loop in which only the red pouring and overflowing wine changes. The figure, bottle, glass, and graphic placement stay still. `WinePour.tsx` selects the original PNG for reduced-motion viewers. The **Page Three Wine Pour** Storybook story previews the page independently; **Second Spread** also includes the GIF.

## Rendered swimming fish

Page 7 uses `fish-swimming.webm`, a four-second, 24 fps VP9 video with transparency. Its three fish retain the original stippled illustration, colors, and outlines. Individually articulated meshes add a rearward-traveling body wave, tail strokes, and restrained fin motion; the head remains anchored and the rest frame matches the original artwork. The original collage slot, flip, stacking, clipping, parallax, and entrance remain in place.

`SwimmingFish.tsx` plays the loop only when visible, pauses during page turns and while the document is hidden, and shows its rendered still for reduced motion. Storybook includes **Page Seven Swimming Video** and the updated **Fourth Spread**.

The authoring scene is in `scripts/fish-scene.js`. To regenerate the video, install `playwright` and `three` into a temporary directory, set `FISH_RENDER_DEPS` to that directory, and run `node scripts/render-fish.mjs` from the repository root. It uses the project's esbuild, local Chrome, and ffmpeg; these authoring dependencies are not shipped to the site. `CHROME_PATH` can override the Chrome executable path.

## Front cover

The front cover matches Figma frame `2:10`, using its source images, crops, rotated hearts, and PP Kyoto Extrabold typography. `FrontCover.tsx` is shared by the closed cover and the front face of the turning leaf, so opening and closing preserve the artwork. The existing **Front Cover** Storybook preview includes this design.

## Back cover and restart

`BackCover.tsx` reproduces Figma frame `2:45`. Advancing from inside pages 7–8 folds the magazine shut to reveal the back, with no trailing blank spread. Clicking the back flips the entire closed magazine over to the front; arrow-left can still reopen the last spread. The **Back Cover** Storybook preview starts at the back.

## Music player

The persistent bar uses `src/data/playlist.ts` and includes all six supplied MP3s with local Spotify album art. Verified titles, full artist credits, album names, and source links are recorded in `src/data/music-sources.json`. Original audio files are copied byte-for-byte into `src/assets/music/tracks`; album covers are stored in `src/assets/music/covers`.

Entries without `src` (such as the Long Titles story) are silent previews: play/pause, seeking, previous/next, cover changes, and automatic playlist looping are simulated. Add an imported MP3 URL as `src` and an optional album image URL as `cover` to use native audio playback. Real audio metadata supplies the duration; playback starts only after the visitor presses play. For files in `public/music`, use `${import.meta.env.BASE_URL}music/filename.mp3` so GitHub Pages repository paths work.

The **Music player / Preview** and **Long Titles** stories cover the bar independently. **Application / Full Experience** includes the book, navigation, and player together. The album artwork stays static and overflow text scrolls unless reduced motion is enabled. The controller follows the Figma sleeve-left / details-middle / play-right layout, with a translucent system-font widget at the desktop top-right. On mobile it docks at the bottom-right: swipe right or use the close button to tuck it into a music tab without interrupting playback. Short landscape screens start with the widget tucked away.
