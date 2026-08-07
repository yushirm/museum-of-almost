# Deep Space / Almost

`deep-space.html` is the Museum's second gallery. It is intentionally separate from Commons / Now and does not reuse, mutate or depend on the live world snapshot.

## Product contract

- Static and GitHub Pages compatible.
- No account, visitor identity, geolocation, analytics, telemetry or visitor free-text.
- No third-party runtime scripts, fonts, media or APIs.
- No runtime network request beyond same-origin service-worker registration and normal local asset loading.
- Works from relative paths under the GitHub Pages project URL.
- Included in the offline application shell.

## Scientific instruments

### Light as a clock

The page uses the exact SI speed of light, `299,792.458 km/s`, and the exact IAU astronomical unit, `149,597,870.7 km`, to convert fixed reference distances into one-way light travel times.

The Moon distance (`384,400 km`), Proxima Centauri distance (`4.2465 ly`), Milky Way diameter (`100,000 ly`) and Andromeda distance (`2.5 million ly`) are deliberately rounded reference values. They are not live ephemerides or precision astrometry.

### Gravity as geometry

The event-horizon instrument uses the Schwarzschild radius:

`r = 2GM / c²`

It is explicitly presented as a non-rotating, uncharged approximation. Real astrophysical black holes are expected to rotate.

Reference masses are rounded: `10` solar masses, `4.3 million` solar masses for Sagittarius A*, and `6.5 billion` solar masses for M87*.

### Cosmic inventory

The `4.9% / 26.8% / 68.3%` ordinary-matter / dark-matter / dark-energy split is a rounded reference representation of the standard cosmological model, not a live measurement and not a claim that the underlying physics is fully understood.

### Unsolved room

The mystery cards deliberately separate observationally grounded statements from unresolved theory. They avoid ranking hypotheses or presenting speculative answers as settled science.

## Accessibility

The gallery uses semantic sections, visible keyboard focus, 44px minimum interactive targets, polite live regions for changing instrument readouts, a skip link, responsive layouts, `prefers-reduced-motion`, `prefers-contrast`, and print handling.
