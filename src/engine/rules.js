(function() {
const getCleanedLines = (content) => {
  let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const newlines = match.match(/\n/g);
    return newlines ? newlines.join('') : '';
  });
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  return cleaned.split(/\r?\n/);
};

const ALL_EXTENSIONS = ['.css', '.scss', '.sass', '.js', '.jsx', '.ts', '.tsx', '.html', '.vue', '.svelte'];

const rules = [
  {
    id: 'anti-pure-black',
    description: 'Avoid pure black. It creates eye strain. Use a dark gray like #1a1a1a. Note: May trigger false positives in string literals.',
    extensions: ALL_EXTENSIONS,
    evaluate: (content, lines) => {
      const matches = [];
      const regex = /#000000|#000\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/i;
      const cleanedLines = getCleanedLines(content);
      cleanedLines.forEach((cleaned, index) => {
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: lines[index].trim() });
        }
      });
      return matches;
    }
  },
  {
    // TODO: requires CSS AST for better nesting evaluation
    id: 'anti-inter-default',
    description: 'Avoid default generic usage of "Inter" without typographic refinement. Note: May trigger false positives in string literals.',
    extensions: ALL_EXTENSIONS,
    evaluate: (content, lines) => {
      const matches = [];
      const regex = /font-family\s*:\s*[^;]*['"]?Inter['"]?/i;
      const cleanedLines = getCleanedLines(content);
      cleanedLines.forEach((cleaned, index) => {
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: lines[index].trim() });
        }
      });
      return matches;
    }
  },
  {
    id: 'anti-bounce-ease',
    description: 'Avoid default generic bounce easings like cubic-bezier(0.175, 0.885, 0.32, 1.275). Use refined spring mechanics. Note: May trigger false positives in string literals.',
    extensions: ALL_EXTENSIONS,
    evaluate: (content, lines) => {
      const matches = [];
      const regex = /cubic-bezier\(\s*0\.175\s*,\s*0\.885\s*,\s*0\.32\s*,\s*1\.275\s*\)/;
      const cleanedLines = getCleanedLines(content);
      cleanedLines.forEach((cleaned, index) => {
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: lines[index].trim() });
        }
      });
      return matches;
    }
  },
  {
    id: 'anti-generic-blue',
    description: 'Avoid generic, unrefined blues like #0000FF or "blue". Note: May trigger false positives in string literals.',
    extensions: ALL_EXTENSIONS,
    evaluate: (content, lines) => {
      const matches = [];
      const regex = /#0000ff\b|\bcolor\s*:\s*blue\b/i;
      const cleanedLines = getCleanedLines(content);
      cleanedLines.forEach((cleaned, index) => {
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: lines[index].trim() });
        }
      });
      return matches;
    }
  },
];

// Pad to 44 rules with stubs
for (let i = 5; i <= 44; i++) {
  const ruleNum = i.toString().padStart(2, '0');
  rules.push({
    id: `_stub_rule_${ruleNum}`,
    description: `Placeholder rule ${ruleNum} - not yet implemented`,
    extensions: ALL_EXTENSIONS,
    evaluate: (content, lines) => {
      return [];
    }
  });
}

globalThis.DesignRules = rules;
})();
