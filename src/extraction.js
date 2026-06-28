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

function extractComponents(targetDir) {
  const files = walkDir(targetDir);
  const componentCounts = {
    Buttons: {},
    Cards: {},
    Modals: {},
    Navigation: {},
    Badges: {},
    FormFields: {}
  };
  
  const componentFiles = {
    Buttons: {},
    Cards: {},
    Modals: {},
    Navigation: {},
    Badges: {},
    FormFields: {}
  };

  const addComponent = (category, signature, file) => {
    if (!componentCounts[category][signature]) {
      componentCounts[category][signature] = 0;
      componentFiles[category][signature] = new Set();
    }
    componentCounts[category][signature]++;
    componentFiles[category][signature].add(file);
  };

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.html', '.jsx', '.tsx', '.vue', '.js', '.mjs'].includes(ext)) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    const tagRegex = /<([a-zA-Z0-9\-]+)([^>]*)>/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      const attrs = match[2];
      
      let classNames = '';
      const classMatch = /class(?:Name)?=["']([^"']+)["']/i.exec(attrs);
      if (classMatch) {
        classNames = classMatch[1].trim();
      }
      
      const classList = classNames.split(/\s+/).filter(Boolean);
      const signature = classNames ? `${tag}.${classList.join('.')}` : tag;
      
      if (tag === 'button' || classList.some(c => c.includes('btn') || c.includes('button'))) {
        addComponent('Buttons', signature, file);
      }
      
      if (tag === 'div' && classList.some(c => c.includes('card'))) {
        addComponent('Cards', signature, file);
      }
      
      if (classList.some(c => c.includes('modal') || c.includes('dialog') || c.includes('overlay'))) {
        addComponent('Modals', signature, file);
      }
      
      if (tag === 'nav' || classList.some(c => c.includes('nav') || c.includes('navbar'))) {
        addComponent('Navigation', signature, file);
      }
      
      if (classList.some(c => c.includes('badge') || c.includes('pill') || c.includes('tag') || c.includes('chip'))) {
        addComponent('Badges', signature, file);
      }
      
      if (['input', 'select', 'textarea'].includes(tag)) {
        addComponent('FormFields', signature, file);
      }
    }
  }

  const filteredCards = {};
  for (const [sig, count] of Object.entries(componentCounts.Cards)) {
    if (count >= 3) {
      filteredCards[sig] = count;
    }
  }
  componentCounts.Cards = filteredCards;

  const results = {};
  for (const category of Object.keys(componentCounts)) {
    let totalCount = 0;
    let maxCount = 0;
    let bestSignature = null;
    const allFiles = new Set();
    
    for (const [sig, count] of Object.entries(componentCounts[category])) {
      totalCount += count;
      if (count > maxCount) {
        maxCount = count;
        bestSignature = sig;
      }
      for (const f of componentFiles[category][sig]) {
        allFiles.add(f);
      }
    }
    
    if (bestSignature) {
      results[category] = {
        name: category,
        count: totalCount,
        signature: bestSignature,
        files: Array.from(allFiles)
      };
    }
  }

  return results;
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

  const components = extractComponents(targetDir);
  if (Object.keys(components).length > 0) {
    cssContent += '\n/* Components */\n';
    for (const comp of Object.values(components)) {
      cssContent += `/* ${comp.name} - Found ${comp.count} instances */\n`;
      cssContent += `/* Signature: ${comp.signature} */\n`;
      cssContent += `/* Files: ${comp.files.map(f => path.basename(f)).join(', ')} */\n\n`;
    }
  }

  const outPath = path.join(process.cwd(), 'tokens.css');
  fs.writeFileSync(outPath, cssContent, 'utf-8');

  const findings = evaluateContent(cssContent, '.css');
  if (findings.length > 0) {
    console.error('Extraction failed: Generated tokens contain design anti-patterns.');
    findings.forEach(finding => {
      console.error(`- Rule: ${finding.ruleId} | Violation: ${finding.snippet}`);
    });
    process.exit(1);
  }

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
    if (content.includes('RENKIN_initialized: true')) {
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
  mdContent += 'RENKIN_initialized: true\n';
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
