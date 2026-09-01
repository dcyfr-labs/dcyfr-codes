import { test, expect } from '@playwright/test';

/**
 * Text-contrast gate, both colour schemes.
 *
 * Ported from dcyfr-tech/e2e/contrast.spec.ts, which is where this gate was
 * first written after a screenshot baseline certified four white-on-white
 * headings for four months. Pixels cannot see invisible text: the missing
 * glyphs measured 0.01 of the image against a 0.05 maxDiffPixelRatio, so the
 * visual gate passed every run. Contrast is measured rather than diffed and
 * needs no baseline, so it cannot go stale the way that PNG did.
 *
 * The fleet-wide defect this port exists for: in the slate palette, dark
 * `--primary` and dark `--foreground` are the SAME value, hsl(210 40% 98%).
 * Any element pairing a `bg-primary` fill with `text-foreground` therefore
 * renders white-on-white in dark mode. Both tokens are semantically correct
 * in isolation, so `dcyfr-local/no-hardcoded-colors` and the theme-audit
 * grep both pass; only a computed-style walk sees it.
 *
 * dcyfr-codes paired a full-opacity `bg-primary` fill with `text-foreground`
 * on the active difficulty and language chips at `/snippets`. In dark that
 * is 1.00:1 — the two tokens are the same value — so the selected filter
 * label vanished entirely. Repaired in this commit and measured below.
 *
 * Dark is driven through localStorage rather than `emulateMedia`, because
 * next-themes only consults `prefers-color-scheme` when the resolved theme is
 * "system". Setting the key the provider itself reads is the app's own path
 * and works regardless of this site's `defaultTheme`.
 */

const ROUTES = [
  '/',
  '/snippets',
  '/categories',
  '/privacy',
] as const;

const THEMES = ['light', 'dark'] as const;

/**
 * Floor for "the page actually rendered". Well under this means a shell with
 * no content, which would pass the contrast assertion vacuously.
 */
const MIN_TEXT_ELEMENTS = 20;

/** Serialized into the page; keep it dependency-free. */
function collectFailures() {
  type C = { r: number; g: number; b: number; a: number };

  // Colour parsing goes through the browser's own painter rather than a
  // regex. Tailwind v4 compiles every `/<alpha>` modifier to
  // `color-mix(in oklab, …)`, which getComputedStyle serialises as
  // `oklab(0.71 -0.008 -0.034 / 0.6)`. The regex this gate originally used
  // matched `rgba?()` only, returned null for those, and the caller skipped
  // the element — so the tokens most likely to be mispaired, the translucent
  // ones, were the exact tokens never measured. Painting one pixel and
  // reading it back handles rgb/hsl/oklab/lab/color-mix uniformly and gets
  // the same sRGB values the user actually sees.
  const cv = document.createElement('canvas');
  cv.width = 1;
  cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });

  const parse = (c: string): C | null => {
    if (!c) return null;
    const m = c.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
      if (p.length >= 3 && p.every((n) => !Number.isNaN(n))) {
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      }
    }
    if (!ctx) return null;
    ctx.clearRect(0, 0, 1, 1);
    // An unsupported value leaves fillStyle at its previous setting, which
    // would silently report the LAST colour again. Set a known sentinel and
    // require that the assignment actually moved it.
    ctx.fillStyle = '#000000';
    const before = ctx.fillStyle;
    ctx.fillStyle = c;
    if (ctx.fillStyle === before && !/^(#000000|black|rgb\(0, ?0, ?0\))$/i.test(c.trim())) {
      return null;
    }
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  };

  const over = (f: C, b: C): C => ({
    r: f.r * f.a + b.r * (1 - f.a),
    g: f.g * f.a + b.g * (1 - f.a),
    b: f.b * f.a + b.b * (1 - f.a),
    a: 1,
  });

  // Walk ancestors for the first opaque background and composite the
  // translucent layers back down onto it. Reading document.body's own
  // background is not enough: it is frequently rgba(0,0,0,0), which composites
  // every element over black and reports passing text as failing.
  const groundOf = (el: Element): C => {
    const stack: C[] = [];
    let n: Element | null = el;
    while (n && n.nodeType === 1) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) {
        stack.push(bg);
        if (bg.a >= 1) break;
      }
      n = n.parentElement;
    }
    let g: C =
      stack.length && stack[stack.length - 1].a >= 1
        ? stack.pop()!
        : { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) g = over(stack[i], g);
    return g;
  };

  const lum = (c: C) => {
    const f = (v: number) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a: C, b: C) => {
    const l1 = lum(a);
    const l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const out: { text: string; cls: string; ratio: number; need: number }[] = [];
  const unparsed: string[] = [];
  let measured = 0;
  document.querySelectorAll('*').forEach((el) => {
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => (n.textContent ?? '').trim())
      .join(' ')
      .trim();
    if (!text) return;

    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) return;

    // Screen-reader-only text is not a contrast defect. The `sr-only` idiom
    // collapses the box to 1x1 and clips it away rather than hiding it, so it
    // survives a `width === 0` guard and then reports 1:1 — the skip link's
    // colour equals its ground because neither is ever painted. Measuring it
    // is how this gate ends up failing on text no sighted user can see, which
    // trains people to ignore it. A box this small cannot hold a glyph, so the
    // dimension test is the honest one: it catches `sr-only` in both Tailwind
    // v3 (`clip: rect(0,0,0,0)`) and v4 (`clip-path: inset(50%)`) without
    // hard-coding either. Focus-revealed variants (`focus:not-sr-only`) resize
    // on focus and this gate walks resting style, so they are out of scope
    // here by the same reasoning that keeps `:hover` out of scope.
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return;

    const fg = parse(s.color);
    if (!fg) {
      // Never skip silently. An unreadable colour is a hole in the gate, and
      // a hole in the gate is how the defect this file exists for survived.
      unparsed.push(`${s.color} on <${el.tagName.toLowerCase()}> "${text.slice(0, 30)}"`);
      return;
    }

    const ground = groundOf(el);
    const contrast = ratio(over(fg, ground), ground);
    measured++;

    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;

    if (contrast < need) {
      out.push({
        text: text.slice(0, 60),
        cls: el.className.toString().slice(0, 90),
        ratio: Math.round(contrast * 100) / 100,
        need,
      });
    }
  });
  return { measured, failures: out, unparsed };
}
for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`contrast: ${route} @ ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          window.localStorage.setItem('theme', t);
        } catch {
          /* storage unavailable — the assertion below catches the wrong theme */
        }
      }, theme);

      await page.goto(route, { waitUntil: 'load' });
      await page.waitForFunction(
        (t) => document.documentElement.classList.contains(t),
        theme,
        { timeout: 5000 },
      );

      // Wait for content rather than for a specific element: these routes do
      // not all render an <h1>, and a walk over a shell reports nothing wrong
      // because there is nothing there to be wrong. Swallow the timeout so the
      // floor assertion below produces the diagnostic instead of a bare
      // "waitForFunction exceeded" with no element count in it.
      await page
        .waitForFunction(
          (min) =>
            Array.from(document.querySelectorAll('*')).filter((el) =>
              Array.from(el.childNodes).some(
                (n) => n.nodeType === 3 && (n.textContent ?? '').trim(),
              ),
            ).length > min,
          MIN_TEXT_ELEMENTS,
          { timeout: 10000 },
        )
        .catch(() => {});

      const { measured, failures, unparsed } = await page.evaluate(collectFailures);

      // A colour this gate cannot read is a colour it cannot judge. The
      // original regex parser returned null for every Tailwind v4 alpha
      // modifier — `color-mix(in oklab, …)` serialises as `oklab(… / 0.6)` —
      // and the walk skipped those elements, so the gate reported a clean
      // sweep over the very tokens most likely to be mispaired. Fail on the
      // hole itself rather than trusting a result produced by not looking.
      expect(
        unparsed,
        `Unparseable colours on ${route} — these elements were NOT measured:\n` +
          unparsed.join('\n'),
      ).toEqual([]);

      // A gate that measures nothing passes everything. That is precisely how
      // the screenshot baseline came to certify invisible headings, so this
      // one states its own floor rather than trusting an empty result.
      expect(
        measured,
        `Only ${measured} text elements measured on ${route} — the page did not render, so a clean result here means nothing.`,
      ).toBeGreaterThan(MIN_TEXT_ELEMENTS);

      expect(
        failures,
        `Text below WCAG AA in ${theme} mode on ${route} (${measured} elements measured):\n` +
          failures.map((f) => `  ${f.ratio}:1 (needs ${f.need}) "${f.text}" [${f.cls}]`).join('\n'),
      ).toEqual([]);
    });
  }
}
