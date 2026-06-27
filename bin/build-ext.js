#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src/extension');
const engineDir = path.resolve('src/engine');
const distDir = path.resolve('dist/extension');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Copy manifest, background, styles
fs.copyFileSync(path.join(srcDir, 'manifest.json'), path.join(distDir, 'manifest.json'));
fs.copyFileSync(path.join(srcDir, 'background.js'), path.join(distDir, 'background.js'));
fs.copyFileSync(path.join(srcDir, 'styles.css'), path.join(distDir, 'styles.css'));

// 2. Concatenate rules.js, dom-rules.js, and content-core.js into content.js
const rulesJS = fs.readFileSync(path.join(engineDir, 'rules.js'), 'utf-8');
const domRulesJS = fs.readFileSync(path.join(srcDir, 'dom-rules.js'), 'utf-8');
const contentCoreJS = fs.readFileSync(path.join(srcDir, 'content-core.js'), 'utf-8');

const combinedContentJS = `
// --- Auto-generated content script ---
// From: src/engine/rules.js
${rulesJS}

// From: src/extension/dom-rules.js
${domRulesJS}

// From: src/extension/content-core.js
${contentCoreJS}
`;

fs.writeFileSync(path.join(distDir, 'content.js'), combinedContentJS);

console.log('✅ Extension built successfully in dist/extension/');
