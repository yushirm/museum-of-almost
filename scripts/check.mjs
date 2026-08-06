import { readFile } from 'node:fs/promises';

const required = ['index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'service-worker.js', 'icon.svg', 'PRIVACY.md'];
const runtimeFiles = ['index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'service-worker.js', 'icon.svg'];
const forbidden = [
  { label: 'external URL', pattern: /https?:\/\//i },
  { label: 'XMLHttpRequest', pattern: /XMLHttpRequest/ },
  { label: 'WebSocket', pattern: /\bWebSocket\b/ },
  { label: 'EventSource', pattern: /\bEventSource\b/ },
  { label: 'Google Analytics', pattern: /google-analytics|googletagmanager|gtag\s*\(/i },
  { label: 'common private key marker', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: 'GitHub token', pattern: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { label: 'generic API key assignment', pattern: /(?:api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]{12,}['"]/i }
];

let failed = false;

for (const file of required) {
  try {
    await readFile(file);
  } catch {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

for (const file of runtimeFiles) {
  const content = (await readFile(file, 'utf8')).replace('http://www.w3.org/2000/svg', '');
  for (const rule of forbidden) {
    if (rule.pattern.test(content)) {
      console.error(`${file}: forbidden ${rule.label}`);
      failed = true;
    }
  }
}

const html = await readFile('index.html', 'utf8');
for (const asset of ['styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg']) {
  if (!html.includes(asset)) {
    console.error(`index.html does not reference ${asset}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Curiosity Lab checks passed. No external runtime dependencies or obvious secrets found.');
