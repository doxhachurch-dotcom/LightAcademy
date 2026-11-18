// Assemble les fichiers de src/ en un seul index.html (équivalent de src/build.py)
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'src', f), 'utf8');

const css = src('style.css') + src('theme.css');
const js = ['core.js', 'data.js', 'logic.js', 'views1.js', 'views2.js', 'views3.js', 'school.js', 'edu.js', 'access.js', 'io.js','links.js','edt.js','importschool.js','cloud.js']
  .map(src).join('\n') + '\nboot();\n';

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Light Academy — Gestion scolaire et financière</title>
<meta name="theme-color" content="#1f52e5">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div id="app"></div><div id="modal-root"></div><div id="toast-root" class="toast-root"></div>
<script>
${js}
</script>
</body>
</html>`;

writeFileSync(join(root, 'index.html'), html);
// fichiers du mode hors ligne, aussi copiés à la racine pour un hébergement statique
for (const f of ['sw.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']) copyFileSync(join(root, 'public', f), join(root, f));
console.log(`index.html généré (${html.length} caractères)`);
