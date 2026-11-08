# Chrome sphere

A reusable, dependency-free WebGL component with a modeled sphere and 71 modeled chrome prongs. The front of the sphere retains the supplied photograph's reflection. This is a 3D interpretation of the sculpture rather than a scanned replica.

## Run locally

Requires Node.js. No install or build step.

```sh
npm run dev
```

Open http://127.0.0.1:4173.

## Use in another page

The demo contains only the sculpture: no text, controls, page background, or ground shadow. The WebGL canvas has a transparent alpha channel.

Copy `chrome-sculpture.js` and `assets/reflection.jpg`, then include:

```html
<script type="module" src="./chrome-sculpture.js"></script>
<chrome-sculpture reflection="./assets/reflection.jpg" max-tilt="5"
  tabindex="0" role="img" aria-label="Interactive chrome sculpture">
</chrome-sculpture>
<style>
chrome-sculpture { width:100%; height:600px; }
</style>
```

`max-tilt` is the maximum combined angular displacement, in degrees, bounded to 1–8. The demo uses 5. Drag in any direction; release to return gently to rest. Arrow keys adjust the view. Escape/Home return to rest. Reduced motion bypasses spring animation. Rendering stops when the object settles and resumes only on interaction or resize.

The reflective surface uses the original photo. The chrome prongs have procedural environment reflections, perspective, geometric lighting, and depth occlusion. No external services, CDNs, or dependencies are needed.

The component includes its own interaction styles in its shadow root and defaults to a square container. Set width/height in your site layout. It centers and frames itself to fit its container, including portrait layouts. The surrounding site controls the visible background.
