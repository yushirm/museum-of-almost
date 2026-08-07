import crypto from 'node:crypto';
import fs from 'node:fs';

const dimensions = JSON.parse(
  fs.readFileSync(new URL('./entropy-dimensions.json', import.meta.url), 'utf8')
);

export function selectIndex(seed, label, length, offset = 0) {
  const digest = crypto.createHash('sha256').update(`${seed}:${label}:${offset}`).digest();
  const value = digest.readBigUInt64BE(0);
  return Number(value % BigInt(length));
}

export function selectEntropy(seed) {
  const result = {};
  for (const label of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'J', 'K']) {
    result[label] = dimensions[label][selectIndex(seed, label, dimensions[label].length)];
  }
  const firstMaterialIndex = selectIndex(seed, 'H', dimensions.H.length, 0);
  let secondMaterialIndex = selectIndex(seed, 'H', dimensions.H.length, 1);
  if (secondMaterialIndex === firstMaterialIndex) {
    secondMaterialIndex = selectIndex(seed, 'H', dimensions.H.length, 2);
  }
  result.H = [dimensions.H[firstMaterialIndex], dimensions.H[secondMaterialIndex]];
  result.preservationBudget =
    dimensions.Preservation[selectIndex(seed, 'Preservation', dimensions.Preservation.length)];
  return result;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const seed = process.argv[2];
  if (!seed) {
    process.stderr.write('Usage: node scripts/entropy-select.mjs <seed>\n');
    process.exitCode = 1;
  } else {
    process.stdout.write(`${JSON.stringify(selectEntropy(seed), null, 2)}\n`);
  }
}
