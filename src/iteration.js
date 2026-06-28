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
      console.error(`Usage: RENKIN ${command} <target>`);
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
    critique: `Provide a design critique against standard principles:
- Evaluate the current design against established UI/UX principles.
- Identify areas for improvement in hierarchy, contrast, and alignment.
- Suggest actionable changes without implementing them directly.`,
    craft: `Apply fine-tuned micro-design improvements:
- Adjust micro-interactions and transitions for a premium feel.
- Fine-tune border radiuses and subtle shadows to create depth.
- Enhance typography with optimal line height and letter spacing.`,
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
- Never use inline hex values or bare framework color classes.`,
    tokens: `Output all design tokens to a centralized tokens.css file:
- Scan the target directory for colors, fonts, and spacing.
- Generate a tokens.css file with CSS variables mapping to semantic token names.`,
    simplify: `Reduce visual complexity by removing decorative noise:
- Remove unnecessary borders, box-shadows, and background patterns.
- Flatten nested containers and rely on whitespace for separation.`,
    modernize: `Replace dated patterns with current design conventions:
- Update heavy gradients to subtle ones or flat colors.
- Use rounded corners, larger text, and modern structural properties (e.g., flex gap).`,
    contrast: `Improve contrast ratios across all text and UI elements:
- Ensure body text meets at least 4.5:1 against its background.
- Ensure large text and UI components meet at least 3.0:1.
- Avoid light gray text on white backgrounds.`,
    scale: `Adjust typographic scale and size relationships:
- Establish a clear modular typographic scale (e.g., base 16px, 1.25 ratio).
- Differentiate heading levels (H1 vs H2 vs H3) clearly by weight and size.`,
    space: `Refine whitespace, padding, and vertical rhythm:
- Use consistent padding and margins based on an 8px grid system.
- Increase padding on cards and buttons to give elements breathing room.`,
    dark: `Adapt or generate a dark mode variant of the design:
- Invert background colors to dark grays (e.g., #111 or #18181b) and text to off-white.
- Reduce saturation of accent colors to avoid eye strain.`,
    focus: `Improve focus states and keyboard navigation affordances:
- Add high-contrast :focus-visible outlines to all interactive elements.
- Ensure focus rings are not clipped by overflow:hidden containers.`,
    responsive: `Improve mobile layout and breakpoint behavior:
- Convert fixed widths to percentages or use max-width.
- Stack horizontal flex/grid layouts vertically on smaller screens.
- Ensure tap targets are at least 48x48px on mobile.`,
    brand: `Apply or reinforce brand identity elements from PRODUCT.md:
- Integrate core brand colors as primary accents throughout the UI.
- Apply brand-specific typography and border radiuses.`,
    reset: `Clear PRODUCT.md, DESIGN.md and prompt re-initialization:
- Inform the user to delete PRODUCT.md and DESIGN.md manually and then run 'RENKIN init'.`
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
  console.log(`npx RENKIN audit ${target}`);
  console.log(`----------------------------------------------\n`);
  console.log(`Running pre-iteration audit on target...`);

  runAudit(target);
}
