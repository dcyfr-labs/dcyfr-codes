#!/usr/bin/env node
/**
 * Theme-engine wiring gate.
 *
 * The identity-clobber check in design-tokens.yml guards the PRE-adoption
 * failure: a `.theme-<name>` block overriding surface tokens without a
 * dark-scoped counterpart. After a site adopts the theme engine that block is
 * empty, so the check passes trivially and stops carrying weight — while the
 * failure mode it used to approximate simply moves.
 *
 * Post-adoption, a theme applies only if THREE things line up, and each can
 * break independently without any build, lint or type error:
 *
 *   1. the theme package files are installed under app/
 *   2. globals.css imports them
 *   3. <html> carries data-identity="<name>" matching the scope the theme
 *      file actually declares
 *
 * Miss (2) or (3) and every token falls back to whatever Tailwind's defaults
 * happen to be. The page still renders. It renders WRONG, in a way a
 * whole-page screenshot ratio absorbs quietly — the engine adoption at this
 * site moved 0.1% of pixels against a 5% tolerance, so the visual gate cannot
 * be relied on to notice a theme that silently stopped applying either.
 *
 * Skips cleanly at sites that have not adopted yet, so the same file can ship
 * to all seven and start enforcing the moment each one migrates.
 *
 * Usage: node scripts/check-theme-wiring.mjs [repoRoot]
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? process.cwd();
const appDir = ['app', 'src/app'].map((d) => join(root, d)).find((d) => existsSync(d));

if (!appDir) {
  console.error('::error::No app/ or src/app/ directory found.');
  process.exit(1);
}

const ENGINE = 'dcyfr-theme-engine.css';
const enginePath = join(appDir, ENGINE);

if (!existsSync(enginePath)) {
  console.log('✓ theme engine not installed — site has not adopted yet, nothing to check');
  process.exit(0);
}

const failures = [];

// --- 1. a theme package accompanies the engine -------------------------------
const themeFiles = readdirSync(appDir).filter(
  (f) => /^dcyfr-theme-.+\.css$/.test(f) && f !== ENGINE,
);

if (themeFiles.length === 0) {
  failures.push(
    `${ENGINE} is installed but no dcyfr-theme-<name>.css package is. The engine ` +
      'only binds roles; it supplies no values, so every token is unset.',
  );
}

// --- 2. globals.css imports both ---------------------------------------------
const globalsPath = join(appDir, 'globals.css');
if (!existsSync(globalsPath)) {
  failures.push('No globals.css found next to the installed theme files.');
}
const globals = existsSync(globalsPath) ? readFileSync(globalsPath, 'utf8') : '';

for (const f of [ENGINE, ...themeFiles]) {
  const imported = new RegExp(`@import\\s+["'][^"']*${f.replace('.', '\\.')}["']`).test(globals);
  if (!imported) {
    failures.push(`${f} is installed but globals.css never imports it — it ships zero bytes.`);
  }
}

// --- 3. the stamped identity matches a scope a theme file declares ------------
const layoutPath = ['layout.tsx', 'layout.jsx']
  .map((f) => join(appDir, f))
  .find((f) => existsSync(f));

if (!layoutPath) {
  failures.push('No app/layout.tsx found, so the data-identity stamp cannot be verified.');
}

/**
 * Comments have to come out before scanning. The first version of this check
 * passed a layout with the attribute deleted, because a comment in that same
 * file mentions `[data-identity="slate"]` while explaining the scoping — so
 * the gate read prose as configuration and reported the wiring intact.
 *
 * The `(?<!:)` guard keeps `https://…` in metadata URLs from eating the rest
 * of its line. Crude, and fine: nothing here is reconstructed afterwards, this
 * text is only ever scanned for one attribute.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/[^\n]*/g, '');
}

const layout = layoutPath ? stripComments(readFileSync(layoutPath, 'utf8')) : '';
const stamps = [...layout.matchAll(/data-identity\s*=\s*["']([\w-]+)["']/g)].map((m) => m[1]);
const stamp = stamps[0] ?? null;

if (new Set(stamps).size > 1) {
  failures.push(
    `The layout stamps more than one identity (${[...new Set(stamps)].join(', ')}). ` +
      'Which one applies depends on render order, so this is never intentional.',
  );
}

// Declared scopes, across every installed theme package.
const declared = new Set();
for (const f of themeFiles) {
  const css = readFileSync(join(appDir, f), 'utf8');
  for (const m of css.matchAll(/\[data-identity\s*=\s*["']?([\w-]+)["']?\]/g)) {
    declared.add(m[1]);
  }
}

if (!stamp) {
  failures.push(
    'No data-identity="…" on <html> in the layout. The theme is scoped to that ' +
      `attribute (declared: ${[...declared].join(', ') || 'none'}), so none of its ` +
      'values apply and the site silently renders on Tailwind defaults.',
  );
} else if (declared.size > 0 && !declared.has(stamp)) {
  failures.push(
    `<html data-identity="${stamp}"> does not match any installed theme scope ` +
      `(${[...declared].join(', ')}). The attribute is present, so this fails silently.`,
  );
}

// --- report ------------------------------------------------------------------
if (failures.length > 0) {
  for (const f of failures) console.error(`::error::Theme wiring: ${f}`);
  process.exit(1);
}

console.log(
  `✓ theme wiring intact — data-identity="${stamp}", ` +
    `packages [${themeFiles.join(', ')}] installed and imported`,
);
