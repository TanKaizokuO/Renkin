export const commands = [
  { name: 'init', description: 'Initialize the project with required design contexts.' },
  { name: 'audit', description: 'Evaluate technical frontend quality and accessibility.' },
  { name: 'critique', description: 'Provide a design critique against standard principles.' },
  { name: 'bolder', description: 'Make the design bolder and more prominent.' },
  { name: 'shape', description: 'Refine the structural layout and spacing.' },
  { name: 'craft', description: 'Apply fine-tuned micro-design improvements.' },
  { name: 'polish', description: 'Apply final polish and polish up the aesthetics.' },
  { name: 'animate', description: 'Add appropriate animations and transitions.' },
  { name: 'colorize', description: 'Apply colors according to brand guidelines.' },
  { name: 'extract', description: 'Extract UI tokens and components to the design system.' },
  { name: 'document', description: 'Generate DESIGN.md from an undocumented codebase.' },
  // Undecided slots
  { name: 'quieter', description: 'Make the design more restrained and subtle (opposite of bolder)' },
  { name: 'tokens', description: 'Output all design tokens to a centralized tokens.css file' },
  { name: 'simplify', description: 'Reduce visual complexity by removing decorative noise' },
  { name: 'modernize', description: 'Replace dated patterns with current design conventions' },
  { name: 'contrast', description: 'Improve contrast ratios across all text and UI elements' },
  { name: 'scale', description: 'Adjust typographic scale and size relationships' },
  { name: 'space', description: 'Refine whitespace, padding, and vertical rhythm' },
  { name: 'dark', description: 'Adapt or generate a dark mode variant of the design' },
  { name: 'focus', description: 'Improve focus states and keyboard navigation affordances' },
  { name: 'responsive', description: 'Improve mobile layout and breakpoint behavior' },
  { name: 'brand', description: 'Apply or reinforce brand identity elements from PRODUCT.md' },
  { name: 'reset', description: 'Clear PRODUCT.md, DESIGN.md and prompt re-initialization' }
];

export function getValidCommands() {
  return commands.filter(c => c.name !== null).map(c => c.name);
}

export function generateHelpTable() {
  const validCommands = commands.filter(c => c.name !== null);
  const maxLen = Math.max(...validCommands.map(c => c.name.length));
  
  let output = 'Available commands:\\n\\n';
  for (const cmd of validCommands) {
    const paddedName = cmd.name.padEnd(maxLen + 4, ' ');
    output += `  ${paddedName}${cmd.description}\\n`;
  }
  return output;
}
