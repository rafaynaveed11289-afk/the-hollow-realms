# Changelog — mobile responsiveness repair

Repair only: no redesign. At 1364px and wider every page renders pixel-identically to the original.

## Root causes fixed

1. **Header overflow widened the whole page on phones.** Logo (2rem) + hamburger + login could not fit, so the
   layout grew to ~645px on a 390px phone; the fixed `.background`, `.fog` and header stretched with it. The header
   is now hamburger — title — login with a 12px gap, and fits from 320px up.
2. **Hamburger button missing on 7 pages** (world, characters, gallery, highlights, trailers, buy, login) — no
   navigation existed on mobile there. Added, using the same markup as index/about.
3. **Desktop nav needs ~1280px.** Below that the logo wrapped to 3 lines and Login was pushed off-screen on tablets.
   Hamburger navigation now applies at 1279px and below.
4. **Homepage hero order.** Buttons and covers sit in different columns, so the left column now dissolves
   (`display: contents`) on ≤900px and flex order places: title → book title → tagline → covers → Highlights/Trailers
   → four cards. Both covers are shown (the old mobile CSS hid the back cover). Cards are one column at ≤900px,
   2×2 above.
5. **Hero scales fluidly (901–1363px)** from `--bw` / `--title` on `.hero`; desktop values are the caps.
6. **Decorative glows wider than the viewport** — scaled from `--bw`, made `pointer-events: none`, and trimmed at the
   viewport edge with `overflow-x: clip` on `<main>` (not a global `overflow-x: hidden`).

## Other fixes

- Background art on portrait screens is positioned on the ship (60%) instead of the middle; fixed layers use `lvh`
  so artwork doesn't rescale when mobile toolbars move.
- Divider centred; footer stacks and centres on phones (it overflowed at 320px).
- Enlarged district maps open ~2× wide on portrait phones and can be panned; close button and caption stay fixed.
  The lightbox now resets its scroll on open and compensates for scroll in its close animation.
- Character panel close (×) button was covered by the portrait in the single-column layout; given a `z-index` and a
  44px tap area on phones.
- Logged-in username is truncated with an ellipsis so it cannot break the header.
- Heading hover effect (letter-spacing change) limited to hover-capable devices so taps no longer re-wrap text.
- `characters.html`: added missing `</main>`.
- Menu panel opacity .92 → .96 for readability.

## Cleanup

- Removed: unused `.particles` layer; the `!important` duplicate character-grid block and its dead selectors;
  dead duplicate `.about-content` overrides; superseded scattered media queries (consolidated into one RESPONSIVE
  section); CSS `@import` of fonts (every page already loads them via `<link>`; weight 700 added there so
  rendering is unchanged).
- Kept (unverified purpose or author-owned): all assets incl. unreferenced `dih.png`, the empty `.fog-2` div,
  unused utility classes such as `.pull-quote`.

## Known, not changed

- `.highlight-grid/.highlight-card/.highlight-number` have no CSS (Highlights page is unstyled on all sizes).
- Animation names `floatBook`, `fogFloat`, `pulseCircle`, `rotateCircle`, `rotateCircleReverse` have no
  `@keyframes`, so those effects never ran.
- `world.html` contains placeholder text "Add your intro sentence here."
- Footer social icons are not links. The maps/districts are on the Gallery page.
