import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initProject() {
  const cwd = process.cwd();
  
  // Create .RENKIN directory and copy skill.md
  const destSkillDir = path.join(cwd, '.RENKIN');
  const destSkillPath = path.join(destSkillDir, 'skill.md');
  const templatesDir = path.join(__dirname, '..', 'templates');
  const skillTplPath = path.join(templatesDir, 'skill.md');

  if (!fs.existsSync(destSkillDir)) {
    fs.mkdirSync(destSkillDir, { recursive: true });
  }
  
  if (!fs.existsSync(destSkillPath)) {
    fs.copyFileSync(skillTplPath, destSkillPath);
    console.log('Created .RENKIN/skill.md');
  } else {
    console.log('.RENKIN/skill.md already exists, skipping.');
  }

  const rl = readline.createInterface({ input, output });

  try {
    console.log('\n--- RENKIN Init ---');
    const goal = await rl.question('What is the main objective of this project? ');
    const audience = await rl.question('Who are the target users? ');
    const brand = await rl.question('What is the brand\'s personality? (e.g., playful, corporate, minimalist): ');
    const typography = await rl.question('Describe the typographic feeling you\'re after (e.g., editorial serif, technical monospace): ');
    
    let color = '';
    while (true) {
      color = await rl.question('What is the Base Color? (Provide a valid HEX code, e.g. #2D4A3E): ');
      if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color)) {
        break;
      } else {
        console.log('Invalid hex code. Please try again.');
      }
    }

    // Write PRODUCT.tmp
    const productContent = `---
RENKIN_initialized: true
---

# PRODUCT.md

## Goal
${goal}

## Audience
${audience}

## Features
<!-- Add key features here -->
`;

    // Write DESIGN.tmp
    const designContent = `# DESIGN.md

## Brand Lane
${brand}

## Typography
${typography}

## Colors
${color}

## Aesthetics
<!-- Add specific aesthetic requirements here -->
`;

    const productTmpPath = path.join(cwd, 'PRODUCT.tmp');
    const designTmpPath = path.join(cwd, 'DESIGN.tmp');
    
    fs.writeFileSync(productTmpPath, productContent);
    fs.writeFileSync(designTmpPath, designContent);
    
    // Atomic rename
    fs.renameSync(productTmpPath, path.join(cwd, 'PRODUCT.md'));
    fs.renameSync(designTmpPath, path.join(cwd, 'DESIGN.md'));
    
    console.log('\nSuccessfully created PRODUCT.md and DESIGN.md.');
  } catch (err) {
    console.error('Error during init:', err);
  } finally {
    rl.close();
  }
}
