import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(scriptsDir, '..');
const requireFromScripts = createRequire(import.meta.url);

export function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

export function requireFiles(names, label = 'required file') {
  for (const name of names) {
    assert.ok(fs.existsSync(path.join(root, name)), `${label}: missing ${name}`);
  }
}

export function requireCjs(name) {
  return requireFromScripts(path.join(root, name));
}

export function bundle(...sources) {
  return sources.flat().join('\n');
}

export function requirePatterns(source, patterns, label = 'source') {
  for (const pattern of patterns) {
    assert.match(source, pattern, `${label}: missing ${pattern}`);
  }
}

export function forbidPatterns(source, patterns, label = 'source') {
  for (const pattern of patterns) {
    assert.doesNotMatch(source, pattern, `${label}: forbidden ${pattern}`);
  }
}

export function assertNoNetwork(source, label = 'runtime') {
  forbidPatterns(source, [
    /\bfetch\s*\(/,
    /\b(?:XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i
  ], `${label} network boundary`);
}

export function assertNoVisitorState(source, label = 'runtime', { history = true } = {}) {
  const patterns = [
    /localStorage|sessionStorage|indexedDB|document\.cookie/i,
    /navigator\.geolocation|\bgeolocation\b/i
  ];
  if (history) patterns.push(/history\.(?:pushState|replaceState)/i);
  forbidPatterns(source, patterns, `${label} visitor-state boundary`);
}

export function assertNoTimers(source, label = 'runtime') {
  forbidPatterns(source, [/setInterval|setTimeout|requestAnimationFrame/i], `${label} timer boundary`);
}

export function assertNoTracking(source, label = 'runtime') {
  forbidPatterns(source, [
    /\b(?:gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b/i,
    /google-analytics|googletagmanager|analytics\.js|facebook\.com\/tr|doubleclick/i,
    /\banalytics\b|\btelemetry\b/i
  ], `${label} tracking boundary`);
}

export function assertNoRemoteUrls(source, label = 'runtime') {
  forbidPatterns(source, [/https?:\/\//i], `${label} remote-URL boundary`);
}

export function assertNoDomStringInjection(source, label = 'runtime') {
  forbidPatterns(source, [/innerHTML|insertAdjacentHTML|outerHTML|document\.write/i], `${label} DOM-injection boundary`);
}

export function assertNoVisitorInput(source, label = 'runtime') {
  forbidPatterns(source, [
    /createElement\(['"](?:input|textarea|select)['"]\)/i,
    /<(?:input|textarea|select)\b/i,
    /contenteditable/i
  ], `${label} visitor-input boundary`);
}

export function assertLocalRuntime(source, label = 'runtime', {
  network = true,
  visitorState = true,
  timers = true,
  tracking = true,
  remoteUrls = true,
  domStringInjection = false,
  visitorInput = false,
  history = true
} = {}) {
  if (network) assertNoNetwork(source, label);
  if (visitorState) assertNoVisitorState(source, label, { history });
  if (timers) assertNoTimers(source, label);
  if (tracking) assertNoTracking(source, label);
  if (remoteUrls) assertNoRemoteUrls(source, label);
  if (domStringInjection) assertNoDomStringInjection(source, label);
  if (visitorInput) assertNoVisitorInput(source, label);
}

export function assertCssContract(css, label = 'styles', {
  responsive = true,
  reducedMotion = true,
  contrast = true,
  print = true,
  touchTarget = false,
  focusVisible = false
} = {}) {
  const required = [];
  if (responsive) required.push(/@media/);
  if (reducedMotion) required.push(/prefers-reduced-motion/);
  if (contrast) required.push(/prefers-contrast/);
  if (print) required.push(/@media\s+print|@media\s*print/);
  if (touchTarget) required.push(/min-height:\s*44px/);
  if (focusVisible) required.push(/:focus-visible/);
  requirePatterns(css, required, label);
  forbidPatterns(css, [/@import\s+url|@font-face|font-face|https?:\/\//i], `${label} local-resource boundary`);
}

export function assertOfflineAssets(workerSource, assets, label = 'offline shell') {
  for (const asset of assets) {
    assert.ok(workerSource.includes(`'${asset}'`) || workerSource.includes(`"${asset}"`), `${label}: missing ${asset}`);
  }
}
