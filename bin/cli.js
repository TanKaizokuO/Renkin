#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { initProject } from '../src/init.js';
import { runAudit } from '../src/audit.js';
import { runIterationCommand } from '../src/iteration.js';
import { runExtract, runDocument } from '../src/extraction.js';
import { getValidCommands, generateHelpTable } from '../src/commands.js';

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(generateHelpTable());
    process.exit(0);
  }

  const validCommands = getValidCommands();

  if (!validCommands.includes(command)) {
    console.error(`Error: Unrecognized command '${command}'\n`);
    console.log(generateHelpTable());
    process.exit(1);
  }

  if (command !== 'init') {
    const cwd = process.cwd();
    const productPath = path.join(cwd, 'PRODUCT.md');

    let isInitialized = false;
    if (fs.existsSync(productPath)) {
      const productContent = fs.readFileSync(productPath, 'utf-8');
      if (productContent.includes('renkintialized: true')) {
        isInitialized = true;
      }
    }

    if (!isInitialized) {
      console.error(`Error: Missing Context. Please run 'renkint' to establish the foundational design context first.`);
      process.exit(1);
    }
  }

  if (command === 'init') {
    initProject();
  } else if (command === 'audit') {
    const target = args[1];
    runAudit(target);
  } else if (['critique', 'craft', 'shape', 'bolder', 'quieter', 'polish', 'animate', 'colorize', 'tokens', 'simplify', 'modernize', 'contrast', 'scale', 'space', 'dark', 'focus', 'responsive', 'brand', 'reset'].includes(command)) {
    const target = args[1];
    runIterationCommand(command, target);
  } else if (command === 'extract') {
    const target = args[1] || process.cwd();
    runExtract(target);
  } else if (command === 'document') {
    const target = args[1] || process.cwd();
    runDocument(target);
  } else {
    // Dispatch stubs for all other valid commands
    console.log(`Command '${command}' is not yet implemented.`);
  }
}

main();
