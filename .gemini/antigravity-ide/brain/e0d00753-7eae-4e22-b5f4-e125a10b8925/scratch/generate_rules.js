const fs = require('fs');

const ruleDefinitions = [
  { id: 'low-contrast', name: 'Low Contrast', desc: 'Text contrast does not meet WCAG accessibility minimums.', sev: 'error', cat: 'color', msg: 'Increase text contrast ratio.', rx: /(color\\s*:\\s*(#777|#888|#999|gray|grey)|color\\s*:\\s*rgba\\(\\d+,\\s*\\d+,\\s*\\d+,\\s*0\\.[1-4]\\))/i },
  { id: 'gray-on-color', name: 'Gray on Color', desc: 'Gray text on colored backgrounds creates muddy contrast.', sev: 'warning', cat: 'color', msg: 'Use white, very light, or very dark text instead.', rx: /color\\s*:\\s*(gray|grey|#888888|#999999)/i },
  { id: 'gradient-text', name: 'Gradient Text', desc: 'Text using a background clip gradient can be visually overwhelming.', sev: 'warning', cat: 'color', msg: 'Remove the gradient clip from text.', rx: /(background-clip\\s*:\\s*text|-webkit-background-clip\\s*:\\s*text)/i },
  { id: 'ai-color-palette', name: 'AI Color Palette', desc: 'Uses generic AI-generated color palettes.', sev: 'warning', cat: 'color', msg: 'Refine the color palette to align with brand guidelines.', rx: /(#8a2be2|#9370db|#8b008b|#4b0082|blueviolet)/i },
  { id: 'dark-glow', name: 'Dark Glow', desc: 'Bright colored box-shadow glows on dark backgrounds.', sev: 'warning', cat: 'color', msg: 'Remove or heavily soften colored glows on dark backgrounds.', rx: /box-shadow\\s*:[^;]*?(rgba\\([^,]+,[^,]+,[^,]+,\\s*0\\.[6-9]+\\)|#[a-fA-F0-9]{3,8})/i },
  { id: 'repeating-stripes-gradient', name: 'Repeating Stripes Gradient', desc: 'Repeating CSS gradient stripes are a common AI design tell.', sev: 'warning', cat: 'color', msg: 'Replace repeating gradient stripes with a solid color or subtle texture.', rx: /repeating-linear-gradient/i },
  { id: 'cream-palette', name: 'Cream Palette', desc: 'Overuse of cream/beige palettes resulting in a low-contrast aesthetic.', sev: 'warning', cat: 'color', msg: 'Introduce crisp white or darker contrasting sections.', rx: /(#f5f5dc|#fffdd0|#f5f5f5|beige|cornsilk)/i },
  { id: 'bounce-easing', name: 'Bounce Easing', desc: 'Uses generic, exaggerated bounce or elastic animation easings.', sev: 'warning', cat: 'motion', msg: 'Replace bounce easings with refined spring mechanics.', rx: /cubic-bezier\\(\\s*0\\.175\\s*,\\s*0\\.885\\s*,\\s*0\\.32\\s*,\\s*1\\.275\\s*\\)/ },
  { id: 'layout-transition', name: 'Layout Transition', desc: 'Animating layout properties causes performance and reflow issues.', sev: 'error', cat: 'motion', msg: 'Transition transform (scale, translate) or opacity instead of layout properties.', rx: /transition\\s*:.*?(\\bwidth\\b|\\bheight\\b|\\bmargin\\b|\\bpadding\\b|\\ball\\b)/i },
  { id: 'image-hover-transform', name: 'Image Hover Transform', desc: 'Applying dramatic scale or rotate transforms to images on hover is generic.', sev: 'warning', cat: 'motion', msg: 'Use subtle transitions or rely on opacity/overlay changes.', rx: /transform\\s*:\\s*scale\\([1-9]/i },
  { id: 'line-length', name: 'Line Length', desc: 'Line length is either too short or too long.', sev: 'warning', cat: 'quality', msg: 'Constrain body text width to approximately 60-80 characters per line.', rx: /width\\s*:\\s*100vw/i },
  { id: 'cramped-padding', name: 'Cramped Padding', desc: 'Containers lack sufficient internal padding.', sev: 'warning', cat: 'quality', msg: 'Increase padding inside containers to give content breathing room.', rx: /padding\\s*:\\s*(0|2px|4px|1rem)(;|$)/i },
  { id: 'tight-leading', name: 'Tight Leading', desc: 'Line height (leading) is too tight, squishing text.', sev: 'warning', cat: 'quality', msg: 'Increase line-height (e.g., 1.5) for body text.', rx: /line-height\\s*:\\s*(1|1\\.0|1\\.1|1\\.2|100%|110%|120%)(;|$|!)/i },
  { id: 'justified-text', name: 'Justified Text', desc: 'Text is fully justified, causing uneven gaps.', sev: 'warning', cat: 'quality', msg: 'Align text to the left or right instead of using text-align: justify.', rx: /text-align\\s*:\\s*justify/i },
  { id: 'tiny-text', name: 'Tiny Text', desc: 'Font size is too small, failing accessibility standards.', sev: 'error', cat: 'quality', msg: 'Ensure all text is at least 12px, preferably 16px.', rx: /font-size\\s*:\\s*([1-9]|1[01])(px|pt)\\b/i },
  { id: 'all-caps-body', name: 'All Caps Body', desc: 'Long blocks of text are set in all caps, reducing readability.', sev: 'warning', cat: 'quality', msg: 'Use sentence case for multi-line text.', rx: /text-transform\\s*:\\s*uppercase/i },
  { id: 'wide-tracking', name: 'Wide Tracking', desc: 'Excessive letter-spacing (tracking) on lowercase body text.', sev: 'warning', cat: 'quality', msg: 'Remove letter-spacing on lowercase text.', rx: /letter-spacing\\s*:\\s*[2-9]px/i },
  { id: 'extreme-negative-tracking', name: 'Extreme Negative Tracking', desc: 'Letter-spacing is heavily negative.', sev: 'warning', cat: 'quality', msg: 'Reduce negative letter-spacing.', rx: /letter-spacing\\s*:\\s*-[1-9]px/i },
  { id: 'body-text-viewport-edge', name: 'Body Text at Viewport Edge', desc: 'Text touches the edge of the viewport.', sev: 'error', cat: 'quality', msg: 'Add horizontal padding to the main container.', rx: /padding\\s*:\\s*0\\b/i },
  { id: 'theater-slop-phrase', name: 'Theater Slop Phrase', desc: 'Uses generic "theater" framing copy commonly output by AI.', sev: 'warning', cat: 'quality', msg: 'Rewrite copy to be direct and authentic.', rx: /(embark on a journey|delve into|in a world where|a tapestry of)/i },
  { id: 'side-tab', name: 'Side Tab', desc: 'Thick borders on just one side of a container resemble outdated side tabs.', sev: 'warning', cat: 'layout', msg: 'Remove the heavy side border.', rx: /border-left\\s*:\\s*[4-9]px\\s+solid/i },
  { id: 'border-accent-on-rounded', name: 'Border Accent on Rounded Container', desc: 'Mixing a heavy single-side border accent with rounded corners.', sev: 'warning', cat: 'layout', msg: 'Use full borders on rounded containers.', rx: /border-left.*?solid.*?border-radius/i },
  { id: 'monotonous-spacing', name: 'Monotonous Spacing', desc: 'Uses the exact same spacing value everywhere.', sev: 'warning', cat: 'layout', msg: 'Vary padding and margin to create hierarchy.', rx: /(padding|margin)\\s*:\\s*16px\\s+16px\\s+16px\\s+16px/i },
  { id: 'nested-cards', name: 'Nested Cards', desc: 'Placing cards within cards creates unnecessary visual clutter.', sev: 'warning', cat: 'layout', msg: 'Flatten the UI by removing nested borders.', rx: /class="[^"]*card[^"]*".*?class="[^"]*card[^"]*"/i },
  { id: 'gpt-thin-border-wide-shadow', name: 'Thin Border Wide Shadow', desc: 'Combines a thin gray border with a massive shadow.', sev: 'warning', cat: 'layout', msg: 'Pick one: a crisp border with no shadow, or a refined shadow with no border.', rx: /border\\s*:\\s*1px\\s+solid.*?box-shadow\\s*:\\s*.*?[2-9]0px/i },
  { id: 'icon-tile-stack', name: 'Icon Tile Stack', desc: 'Floating icon tiles stacked directly above headings without integration.', sev: 'warning', cat: 'layout', msg: 'Integrate icons inline with the text.', rx: /class="[^"]*icon[^"]*".*?class="[^"]*tile[^"]*"/i },
  { id: 'repeated-section-kickers', name: 'Repeated Section Kickers', desc: 'Every section uses the exact same uppercase kicker style.', sev: 'warning', cat: 'layout', msg: 'Vary section headers or remove unnecessary kickers.', rx: /class="[^"]*(section-kicker|eyebrow|kicker)[^"]*"/i },
  { id: 'clipped-overflow-container', name: 'Clipped Overflow Container', desc: 'Container strictly clips its contents in a way that hides shadows.', sev: 'warning', cat: 'layout', msg: 'Adjust overflow settings or padding.', rx: /overflow\\s*:\\s*hidden/i },
  { id: 'overused-font', name: 'Overused Font', desc: 'Relies on an overused default web font.', sev: 'warning', cat: 'typography', msg: 'Switch to a more distinctive typeface.', rx: /font-family\\s*:.*?(Roboto|Open Sans|Lato)/i },
  { id: 'single-font', name: 'Single Font', desc: 'Uses only one font family without varying weight or size.', sev: 'warning', cat: 'typography', msg: 'Introduce a secondary typeface for headings.', rx: /font-family\\s*:\\s*inherit/i },
  { id: 'flat-type-hierarchy', name: 'Flat Type Hierarchy', desc: 'Headings and body text are too similar.', sev: 'error', cat: 'typography', msg: 'Increase contrast between headings and body text.', rx: /font-size\\s*:\\s*16px.*?font-weight\\s*:\\s*normal/i },
  { id: 'oversized-h1', name: 'Oversized H1', desc: 'The main heading is comically large.', sev: 'warning', cat: 'typography', msg: 'Reduce the font size of the H1.', rx: /font-size\\s*:\\s*([7-9][0-9]|1[0-9]{2})px/i },
  { id: 'italic-serif-display', name: 'Italic Serif Display', desc: 'Uses italic serif fonts for large display text.', sev: 'warning', cat: 'typography', msg: 'Use a regular (upright) serif or a sans-serif for hero typography.', rx: /font-style\\s*:\\s*italic.*?font-family\\s*:.*?serif/i },
  { id: 'hero-eyebrow-chip', name: 'Hero Eyebrow Chip', desc: 'Uses a small, brightly colored pill/chip above the main H1.', sev: 'warning', cat: 'typography', msg: 'Remove the eyebrow chip or integrate the text.', rx: /class="[^"]*eyebrow[^"]*"/i },
  { id: 'anti-pure-black', name: 'Anti Pure Black', desc: 'Avoid pure black. It creates eye strain.', sev: 'warning', cat: 'color', msg: 'Use a dark gray like #1a1a1a instead.', rx: /#000000|#000\\b|rgb\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\)/i },
  { id: 'anti-inter-default', name: 'Anti Inter Default', desc: 'Avoid default generic usage of "Inter".', sev: 'warning', cat: 'typography', msg: 'Refine typographic scales or use another font.', rx: /font-family\\s*:\\s*[^;]*['"]?Inter['"]?/i },
  { id: 'anti-bounce-ease', name: 'Anti Bounce Ease', desc: 'Avoid generic bounce easings.', sev: 'warning', cat: 'motion', msg: 'Use refined spring mechanics.', rx: /cubic-bezier\\(\\s*0\\.175\\s*,\\s*0\\.885\\s*,\\s*0\\.32\\s*,\\s*1\\.275\\s*\\)/ },
  { id: 'anti-generic-blue', name: 'Anti Generic Blue', desc: 'Avoid generic unrefined blues.', sev: 'warning', cat: 'color', msg: 'Use a brand-specific blue instead.', rx: /#0000ff\\b|\\bcolor\\s*:\\s*blue\\b/i },
  { id: 'anti-pure-white', name: 'Anti Pure White', desc: 'Avoid pure white. It lacks depth.', sev: 'warning', cat: 'color', msg: 'Use an off-white instead.', rx: /#ffffff|#fff\\b|rgb\\(\\s*255\\s*,\\s*255\\s*,\\s*255\\s*\\)/i },
  { id: 'anti-comic-sans', name: 'Anti Comic Sans', desc: 'Avoid Comic Sans MS.', sev: 'error', cat: 'typography', msg: 'Use a professional typeface.', rx: /font-family\\s*:.*Comic Sans MS/i },
  { id: 'anti-papyrus', name: 'Anti Papyrus', desc: 'Avoid Papyrus.', sev: 'error', cat: 'typography', msg: 'Use a modern display font.', rx: /font-family\\s*:.*Papyrus/i },
  { id: 'anti-centered-text', name: 'Anti Centered Text', desc: 'Avoid centered text for long paragraphs.', sev: 'warning', cat: 'typography', msg: 'Left-align long blocks of text.', rx: /text-align\\s*:\\s*center/i },
  { id: 'anti-transparent-text', name: 'Anti Transparent Text', desc: 'Avoid transparent text without clear reason.', sev: 'warning', cat: 'color', msg: 'Ensure text is visible.', rx: /color\\s*:\\s*transparent/i },
  { id: 'anti-absolute-positioning', name: 'Anti Absolute Positioning', desc: 'Minimize absolute positioning for layouts.', sev: 'warning', cat: 'layout', msg: 'Prefer Flexbox or Grid.', rx: /position\\s*:\\s*absolute/i }
];

let jsContent = `(function () {
  const getCleanedLines = (content) => {
    let cleaned = content.replace(/\\/\\*[\\s\\S]*?\\*\\//g, (match) => {
      const newlines = match.match(/\\n/g);
      return newlines ? newlines.join('') : '';
    });
    cleaned = cleaned.replace(/\\/\\/.*$/gm, '');
    return cleaned.split(/\\r?\\n/);
  };

  const rules = [
`;

for (let i = 0; i < ruleDefinitions.length; i++) {
  const r = ruleDefinitions[i];
  jsContent += `    {
      id: '${r.id}',
      name: '${r.name}',
      description: '${r.desc.replace(/'/g, "\\'")}',
      severity: '${r.sev}',
      category: '${r.cat}',
      message: '${r.msg.replace(/'/g, "\\'")}',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = ${r.rx.toString()};
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: '${r.msg.replace(/'/g, "\\'")}' });
          }
        });
        return matches;
      }
    }${i < ruleDefinitions.length - 1 ? ',' : ''}\n`;
}

jsContent += `  ];

  globalThis.DesignRules = rules;
})();
`;

fs.writeFileSync('src/engine/rules.js', jsContent);
console.log('Successfully generated src/engine/rules.js');
