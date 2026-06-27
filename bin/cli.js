#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { initProject } from '../src/init.js';
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
    console.error(`Error: Unrecognized command '${command}'\\n`);
    console.log(generateHelpTable());
    process.exit(1);
  }

  if (command !== 'init') {
    const cwd = process.cwd();
    const productPath = path.join(cwd, 'PRODUCT.md');
    // const designPath = path.join(cwd, 'DESIGN.md');
    
    if (!fs.existsSync(productPath)) {
      console.error(`Error: Missing Context. Please run 'design_skill init' to establish the foundational design context first.`);
      process.exit(1);
    }
  }

  if (command === 'init') {
    initProject();
  } else {
    // Dispatch stubs for all other valid commands
    console.log(`Command '${command}' is not yet implemented.`);
  }
}

main();
