# Story performance check

Build and serve the production app:

```sh
npm run build
npm run preview
```

Open `http://localhost:4173/?perf=1`, wait for the Home page to settle, then start the demo. The app writes one `[story-perf]` record to the console for each scene after sampling its first 1.6 seconds.

A passing cold run has:

- `frameGapsOver50Ms` equal to `0` for every scene.
- `longTasks` equal to `0` during scene entrance.
- `worstFrameMs` below `50`.

Run the story once from a fresh production build, then replay it. The cold run is the regression check. The replay is useful only as a comparison.
