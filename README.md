# Nice Shot — Coffee & Tennis

A coffee-and-tennis browser game built with Vite, JavaScript, SVG, and Canvas. Production: https://energytennis.netlify.app/

## Run

Node.js 20.19+ or 22.12+ is required; Netlify uses Node.js 24.

```sh
npm ci --cache /tmp/energy-npm-cache
npm run dev
npm test
npm run build
npm run test:e2e
```

Browser tests use system Chromium at `/usr/bin/chromium`. On other machines, install Playwright Chromium and remove that executable override in playwright.config.js. Outcome browser tests seed reachable stage preconditions, then use actual controls and collisions to trigger each ending; unit tests cover the full coffee progression and terminal state rules.

## Rules

- Click the Start racket, then choose Coffee or NO. The first choice screen shows only the question and choices. Gameplay and the coffee rail appear afterwards.
- Select UP / DOWN / LEFT / RIGHT on the racket handle, or use keyboard arrows, then click HIT or press Space.
- A collision with the right edge gives +15, left −15, top +5, bottom −5. Corner collisions combine both edges. Only real collisions score.
- 0–2 cups: grey ball, low power and imprecise aim; only sleepy feedback (zzz…, Yawn…) and rising z symbols. Tennis praise unlocks at 3 cups. 3 cups: green ball, faster. 4–6 cups: green ball, strong bounce and accurate aim. 7–9 cups: pink ball, jitter, unpredictable directions and a bias toward penalties. The interface becomes pinker as caffeine increases.
- Coffee Break comes after 12 HITs at 0–5 cups, 6 HITs at 6–7 cups, and 3 HITs at 8–9 cups. It pauses gameplay, blurs the background and locks other controls. Coffee adds a cup; NO preserves the cup count.
- Five hits within 1.1 seconds trigger Stir × Spin. Tennis feedback uses uploaded Chalkduster, random colors and positions, and pop/fade effects. Coffee choices never trigger shot praise. Break Point appears only inside Coffee Break.

## Three endings

1. **LOVE:** initial zero is safe. After a real shot, a penalty reducing the score to zero ends play. Scores clamp at zero. LOVE appears above all gameplay graphics and pulses twice, followed by **Bad tennis player. Coffee lover.** and the final/peak score.
2. **Too much caffeine:** choosing the tenth cup immediately ends play, shows a brief dizziness effect, then a black screen. There are no additional ten hits. Reduced-motion users get a static transition.
3. **Perfect warm-up:** reaching 1,000 points immediately completes training. Score clamps at 1,000 and further actions cannot change it.

Restart cancels ending timers and resets score, coffee, effects and aim.

## Assets and layout

Original court image, coffee cup, racket, ball variants and heart are extracted from the user-provided coffee.ai. Chalkduster WOFF is converted from the complete user-uploaded Chalkduster.ttf, including all letters and digits. No third-party font requests or backend credentials are needed.

The artboard retains 1366:768 landscape proportions and fits both viewport width and remaining height. Racket controls and the ten-slot coffee rail remain within the viewport. Canvas density caps at 2, particles at 100, and trails at nine points.

## Deploy and offline package

Netlify builds `npm run build` and publishes `dist/`, configured in netlify.toml. Pushing main triggers the connected production deployment.

```sh
npm run build
node scripts/standalone.js
```

The standalone script creates `/workspace/Nice-Shot.html`, embedding all assets and the font for offline play. Website packages contain this file renamed to `index.html`.
