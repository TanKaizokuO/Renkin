import fs from 'fs';
import path from 'path';
import { runAudit } from './audit.js';

export function runIterationCommand(command, targetDir) {
  let target = targetDir;
  
  if (!target) {
    if (fs.existsSync('./src')) {
      target = './src';
    } else {
      console.error('Error: No target directory specified and ./src does not exist.');
      console.error(`Usage: design_skill ${command} <target>`);
      process.exit(2);
    }
  }

  const absoluteTarget = path.resolve(target);
  
  if (!fs.existsSync(absoluteTarget)) {
    console.error(`Error: Target directory does not exist: ${absoluteTarget}`);
    process.exit(2);
  }

  const cwd = process.cwd();
  const designPath = path.join(cwd, 'DESIGN.md');
  let designContext = '';
  
  if (fs.existsSync(designPath)) {
    designContext = fs.readFileSync(designPath, 'utf-8');
  } else {
    console.error('Error: DESIGN.md not found. Please run init first.');
    process.exit(1);
  }

  const prompts = {
    shape: `Refine structural layout and spacing:
- Target the parent container. Convert arbitrary 'margin' on flex/grid children to 'gap' on the parent.
- Align all spacing properties (padding, gap, margin) to the 4px/8px baseline grid.
- Ensure containers have clear hierarchy and padding.`,
    bolder: `Make the design bolder and more prominent:
- Bump primary font weights by +100 (clamp: if current weight is already >= 800, set to 900 and flag for human review).
- Increase contrast ratio for primary elements to at least 7:1.
- Use stronger, thicker borders or heavier shadows for emphasis.`,
    quieter: `Make the design softer and quieter:
- Lower contrast on secondary borders (e.g., use lighter grays).
- Reduce font weights by 100 for secondary text.
- Increase white space/padding around elements to let them breathe.`,
    polish: `Apply final polish and refine aesthetics:
- Ensure optical alignment of icons and text.
- Apply subtle gradients instead of flat colors.
- For shadows, enforce blur radius <= 12px, opacity <= 0.15.
- Refine border radii to be consistent and proportional.`,
    animate: `Add appropriate animations and transitions:
- Add hover states to all interactive elements.
- Implement view transitions or enter/exit animations.
- Use smooth easing functions (e.g., ease-out) without bounce effects.`,
    colorize: `Apply colors according to brand guidelines:
- Read the Colors section from DESIGN.md and generate a full semantic palette.
- The AI must ONLY apply colors by referencing or creating '--ds-*' prefixed CSS custom properties.
- Never use inline hex values or bare framework color classes.`
  };

  const instruction = prompts[command];
  
  if (!instruction) {
    console.error(`Error: Unknown iteration command '${command}'`);
    process.exit(1);
  }

  console.log(`--- AI AGENT DESIGN ITERATION INSTRUCTIONS ---`);
  console.log(`Command: ${command}`);
  console.log(`Target: ${absoluteTarget}`);
  console.log(`\n1. CONTEXT (from DESIGN.md):`);
  console.log(`--- DESIGN CONTEXT START ---`);
  console.log(designContext);
  console.log(`--- DESIGN CONTEXT END ---\n`);
  console.log(`2. TASK:`);
  console.log(`Apply the '${command}' transformation on the target source files.`);
  console.log(`${instruction}\n`);
  console.log(`3. VERIFICATION (MANDATORY POST-STEP):`);
  console.log(`After you have applied these changes, you MUST run the following command to verify that no anti-patterns were introduced:`);
  console.log(`npx design_skill audit ${target}`);
  console.log(`----------------------------------------------\n`);
  console.log(`Running pre-iteration audit on target...`);

  runAudit(target);
}
