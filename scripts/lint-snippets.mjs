#!/usr/bin/env node
/**
 * lint-snippets.mjs — Validate snippet code for syntactic validity before publishing.
 *
 * Checks:
 *   - Schema: required fields present and correctly typed
 *   - TypeScript snippets: parse as valid JS (via Node's vm.compileFunction)
 *   - Bash snippets: validate via bash -n (syntax check only, no execution)
 *   - JSON snippets: parse via JSON.parse
 *   - Slug uniqueness: no duplicate ids/slugs
 *
 * Usage:
 *   node scripts/lint-snippets.mjs
 *   node scripts/lint-snippets.mjs --fix-ids   (regenerate missing ids)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Allocate a unique tmpdir for this lint run. Using fs.mkdtempSync under
// the OS temp root gives a path no other process can predict, so the
// per-snippet write/read/unlink cycle below is free of symlink-redirect
// or race conditions. Cleaned up on process exit.
// Closes CodeQL js/insecure-temporary-file (lint-snippets.mjs:100, :117).
const LINT_TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'dcyfr-codes-snip-lint-'));
process.on('exit', () => {
  try { fs.rmSync(LINT_TMP_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data/snippets.json');

const REQUIRED_FIELDS = ['id', 'slug', 'title', 'description', 'category', 'difficulty', 'language', 'tags', 'code', 'explanation', 'relatedSnippets'];
const VALID_CATEGORIES = ['Agent Patterns', 'Delegation', 'RAG', 'Code Generation', 'CLI', 'Infrastructure', 'Context Engineering', 'Testing'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const VALID_LANGUAGES = ['typescript', 'bash', 'python', 'json', 'yaml', 'markdown'];

let errors = 0;
let warnings = 0;

function err(id, msg) { console.error(`  ✗ [${id}] ${msg}`); errors++; }
function warn(id, msg) { console.warn(`  ⚠ [${id}] ${msg}`); warnings++; }
function ok(msg) { console.log(`  ✓ ${msg}`); }

if (!fs.existsSync(dataPath)) {
  console.error(`✗ data/snippets.json not found at ${dataPath}`);
  process.exit(1);
}

let snippets;
try {
  snippets = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.error(`✗ snippets.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(snippets)) {
  console.error('✗ snippets.json must be an array');
  process.exit(1);
}

console.log(`\nLinting ${snippets.length} snippets...\n`);

// --- Uniqueness ---
const seenIds = new Set();
const seenSlugs = new Set();
for (const s of snippets) {
  const id = s.id ?? '(missing-id)';
  if (seenIds.has(id)) err(id, `Duplicate id`);
  seenIds.add(id);
  if (s.slug && seenSlugs.has(s.slug)) err(id, `Duplicate slug: ${s.slug}`);
  if (s.slug) seenSlugs.add(s.slug);
}

// --- Per-snippet checks ---
for (const s of snippets) {
  const id = s.id ?? '(missing-id)';

  // Required fields
  for (const f of REQUIRED_FIELDS) {
    if (s[f] === undefined || s[f] === null) err(id, `Missing required field: ${f}`);
  }

  // Enum checks
  if (s.category && !VALID_CATEGORIES.includes(s.category)) err(id, `Invalid category: "${s.category}"`);
  if (s.difficulty && !VALID_DIFFICULTIES.includes(s.difficulty)) err(id, `Invalid difficulty: "${s.difficulty}"`);
  if (s.language && !VALID_LANGUAGES.includes(s.language)) err(id, `Invalid language: "${s.language}"`);

  // Array checks
  if (s.tags && !Array.isArray(s.tags)) err(id, 'tags must be an array');
  if (s.relatedSnippets && !Array.isArray(s.relatedSnippets)) err(id, 'relatedSnippets must be an array');

  // Slug format
  if (s.slug && !/^[a-z0-9-]+$/.test(s.slug)) err(id, `Slug must be lowercase alphanumeric with hyphens: "${s.slug}"`);

  // Code non-empty
  if (typeof s.code === 'string' && s.code.trim().length === 0) err(id, 'code field is empty');

  // Syntactic validity
  if (typeof s.code === 'string' && s.code.trim().length > 0) {
    try {
      if (s.language === 'typescript' || s.language === 'javascript') {
        // Write to temp file; run tsc with --noResolve --skipLibCheck to check syntax only.
        // We only surface TS1xxx errors (syntax errors), ignoring TS2xxx (type/module resolution).
        const tmpFile = path.join(LINT_TMP_DIR, `snip-${id}.ts`);
        fs.writeFileSync(tmpFile, s.code);
        try {
          const output = execSync(
            `./node_modules/.bin/tsc "${tmpFile}" --noEmit --noResolve --skipLibCheck --target esnext --module esnext 2>&1 || true`,
            { encoding: 'utf8', shell: true, cwd: path.join(__dirname, '..') }
          );
          const syntaxErrors = output.split('\n').filter((l) => /TS1\d{3}:/.test(l));
          if (syntaxErrors.length > 0) {
            throw new Error(syntaxErrors[0].replace(/^.*error /, '').trim());
          }
        } finally {
          fs.existsSync(tmpFile) && fs.unlinkSync(tmpFile);
        }
      } else if (s.language === 'json') {
        JSON.parse(s.code);
      } else if (s.language === 'bash') {
        const tmpFile = path.join(LINT_TMP_DIR, `snip-${id}.sh`);
        fs.writeFileSync(tmpFile, s.code);
        try {
          execSync(`bash -n "${tmpFile}"`, { stdio: 'pipe' });
        } finally {
          fs.existsSync(tmpFile) && fs.unlinkSync(tmpFile);
        }
      }
      // yaml/markdown/python: not validated syntactically (no available parser)
    } catch (e) {
      err(id, `Syntax error in ${s.language} code: ${e.message.slice(0, 120)}`);
    }
  }

  // Warn on long titles/descriptions
  if (s.title && s.title.length > 80) warn(id, `Title is long (${s.title.length} chars) — consider shortening`);
  if (s.description && s.description.length > 200) warn(id, `Description is long (${s.description.length} chars)`);
}

// --- relatedSnippets referential integrity ---
for (const s of snippets) {
  for (const ref of (s.relatedSnippets ?? [])) {
    if (!seenIds.has(ref)) warn(s.id ?? '?', `relatedSnippets references unknown id: "${ref}"`);
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`${snippets.length} snippets checked — ${errors} error(s), ${warnings} warning(s)\n`);
if (errors > 0) process.exit(1);
