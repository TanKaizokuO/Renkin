import fs from 'fs';
import path from 'path';
import { walkDir, evaluateContent } from './engine/runner.js';

function getFrequencies(arr) {
  const counts = {};
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
}

function scanDirectoryForTokens(targetDir) {
  const files = walkDir(targetDir);
  const rawFonts = [];
  const rawColors = [];
  const rawSpacing = [];

  const fontRegex = /font-family\s*:\s*([^;!}]+)/gi;
  const colorRegex = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\))/gi;
  const spacingRegex = /(?:margin|padding|gap)(?:-[a-z]+)?\s*:\s*([^;!}]+)/gi;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    // Only scan CSS-like and JS-like files for now
    if (!['.css', '.scss', '.js', '.jsx', '.ts', '.tsx', '.html', '.vue'].includes(ext)) {
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    
    let match;
    while ((match = fontRegex.exec(content)) !== null) {
      const val = match[1].trim().replace(/['"]/g, '');
      if (val) rawFonts.push(val);
    }
    
    while ((match = colorRegex.exec(content)) !== null) {
      rawColors.push(match[1].toLowerCase());
    }

    while ((match = spacingRegex.exec(content)) !== null) {
      const parts = match[1].split(/\s+/);
      for (const part of parts) {
        if (/^[0-9.]+(px|rem|em|vh|vw|%)$/.test(part)) {
          rawSpacing.push(part);
        }
      }
    }
  }

  return {
    fonts: getFrequencies(rawFonts),
    colors: getFrequencies(rawColors),
    spacing: getFrequencies(rawSpacing)
  };
}

export function runExtract(targetDir) {
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${targetDir} does not exist.`);
    process.exit(1);
  }

  const { fonts, colors, spacing } = scanDirectoryForTokens(targetDir);
  
  let cssContent = ':root {\n';
  
  fonts.forEach((font, i) => {
    const name = i === 0 ? 'primary' : i === 1 ? 'secondary' : `font-${i}`;
    cssContent += `  --ds-font-${name}: ${font};\n`;
  });

  colors.forEach((color, i) => {
    const name = i === 0 ? 'primary' : i === 1 ? 'secondary' : `color-${i}`;
    cssContent += `  --ds-color-${name}: ${color};\n`;
  });

  spacing.forEach((space, i) => {
    cssContent += `  --ds-space-${i}: ${space};\n`;
  });

  cssContent += '}\n';

  const findings = evaluateContent(cssContent, '.css');
  if (findings.length > 0) {
    console.error('Extraction failed: Generated tokens contain design anti-patterns.');
    findings.forEach(finding => {
      console.error(`- Rule: ${finding.ruleId} | Violation: ${finding.snippet}`);
    });
    process.exit(1);
  }

  const outPath = path.join(process.cwd(), 'tokens.css');
  fs.writeFileSync(outPath, cssContent, 'utf-8');
  console.log(`Successfully extracted tokens to ${outPath}`);
}

export function runDocument(targetDir) {
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${targetDir} does not exist.`);
    process.exit(1);
  }

  const designMdPath = path.join(process.cwd(), 'DESIGN.md');
  if (fs.existsSync(designMdPath)) {
    const content = fs.readFileSync(designMdPath, 'utf-8');
    if (content.includes('design_skill_initialized: true')) {
      console.error('Error: DESIGN.md already exists and is initialized. Use a force flag (not yet implemented) to overwrite.');
      process.exit(1);
    }
  }

  const { fonts, colors, spacing } = scanDirectoryForTokens(targetDir);

  const prompt = `
The following fonts were found: [${fonts.join(', ')}].
The following colors were found: [${colors.join(', ')}].
The following spacing values were found: [${spacing.join(', ')}].

Generate a DESIGN.md...
  `.trim();

  console.log('--- Grounded AI Prompt ---');
  console.log(prompt);
  console.log('--------------------------\n');

  let mdContent = '---\n';
  mdContent += 'design_skill_initialized: true\n';
  mdContent += '---\n\n';
  mdContent += '# Design System\n\n';
  
  mdContent += '## Typography\n';
  fonts.forEach((font, i) => {
    mdContent += `- ${i === 0 ? 'Primary' : 'Secondary'}: ${font}\n`;
  });
  
  mdContent += '\n## Colors\n';
  colors.forEach((color, i) => {
    mdContent += `- ${i === 0 ? 'Primary' : 'Secondary'}: ${color}\n`;
  });

  mdContent += '\n## Spacing\n';
  spacing.forEach((space) => {
    mdContent += `- ${space}\n`;
  });

  fs.writeFileSync(designMdPath, mdContent, 'utf-8');
  console.log(`Successfully generated ${designMdPath}`);
}
