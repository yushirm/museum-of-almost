import assert from 'node:assert/strict';
import {
  assertCssContract,
  assertNoRemoteUrls,
  read,
  requirePatterns
} from './test-support.mjs';

const html = read('commons-now.html');
const app = read('app.js');
const css = read('field-sheet.css');

requirePatterns(html, [
  /id="field-sheet" class="field-sheet"/,
  /id="field-sheet-button" type="button">Make field sheet<\/button>/,
  /The page forgets\. This sheet can remember one snapshot\./,
  /native print dialog/i
], 'Commons field sheet surface');

requirePatterns(app, [
  /fieldSheetButton:\s*document\.querySelector\('#field-sheet-button'\)/,
  /fieldSheetButton\?\.addEventListener\('click', \(\) => window\.print\(\)\)/
], 'Commons local field sheet action');

requirePatterns(css, [
  /\.planetary-section:has\(#field-sheet-button:focus\) \.field-sheet/,
  /outline:\s*2px dashed var\(--blue\)/,
  /LOCAL FIELD COPY · ONE LATCH/,
  /@media \(forced-colors: active\)/,
  /@media print/
], 'Commons field sheet tear-off ritual');

assertCssContract(css, 'Commons field sheet styles', {
  responsive: true,
  reducedMotion: true,
  contrast: true,
  print: true,
  touchTarget: true
});
assertNoRemoteUrls(css, 'Commons field sheet styles');
assert.doesNotMatch(css, /animation-name|@keyframes/i, 'tear-off ritual must not add ambient animation');

console.log('Commons field sheet local-copy ritual, native print boundary, accessibility environments, and local-only styles verified.');
