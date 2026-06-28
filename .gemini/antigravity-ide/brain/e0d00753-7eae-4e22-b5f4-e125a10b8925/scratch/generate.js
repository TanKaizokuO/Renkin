const fs = require('fs');

const ruleDefinitions = [
  { id: 'low-contrast', name: 'Low Contrast', desc: 'Text contrast does not meet WCAG accessibility minimums against its background.', sev: 'error', cat: 'color', msg: 'Increase text contrast ratio to at least 4.5:1 (or 3.0:1 for large text).', rx: "color\\\\s*:\\\\s*(#777|#888|#999|gray|grey)|color\\\\s*:\\\\s*rgba\\\\(\\\\d+,\\\\s*\\\\d+,\\\\s*\\\\d+,\\\\s*0\\\\.[1-4]\\\\)" },
  { id: 'gray-on-color', name: 'Gray on Color', desc: 'Gray text on colored backgrounds creates muddy contrast and is hard to read.', sev: 'warning', cat: 'color', msg: 'Use white, very light, or very dark text against colored backgrounds instead of gray.', rx: "color\\\\s*:\\\\s*(gray|grey|#888888|#999999)" },
  { id: 'gradient-text', name: 'Gradient Text', desc: 'Text using a background clip gradient can be visually overwhelming and hard to read.', sev: 'warning', cat: 'color', msg: 'Remove the gradient clip from text and use a solid, high-contrast color.', rx: "background-clip\\\\s*:\\\\s*text|-webkit-background-clip\\\\s*:\\\\s*text" },
  { id: 'ai-color-palette', name: 'AI Color Palette', desc: 'Uses generic AI-generated color palettes (e.g., highly saturated purples and violets).', sev: 'warning', cat: 'color', msg: 'Refine the color palette to align with brand guidelines instead of default generic presets.', rx: "#8a2be2|#9370db|#8b008b|#4b0082|blueviolet" },
  { id: 'dark-glow', name: 'Dark Glow', desc: 'Bright colored box-shadow glows on dark backgrounds can look dated or noisy.', sev: 'warning', cat: 'color', msg: 'Remove or heavily soften colored glows on dark backgrounds. Rely on borders or subtle elevations.', rx: "box-shadow\\\\s*:[^;]*?(rgba\\\\([^,]+,[^,]+,[^,]+,\\\\s*0\\\\.[6-9]+\\\\)|#[a-fA-F0-9]{3,8})" },
  { id: 'repeating-stripes-gradient', name: 'Repeating Stripes Gradient', desc: 'Repeating CSS gradient stripes are a common AI design tell that looks unrefined.', sev: 'warning', cat: 'color', msg: 'Replace repeating gradient stripes with a solid color, subtle texture, or cleaner background pattern.', rx: "repeating-linear-gradient" },
  { id: 'cream-palette', name: 'Cream Palette', desc: 'Overuse of cream/beige palettes resulting in a low-contrast or muddy aesthetic.', sev: 'warning', cat: 'color', msg: 'Introduce crisp white or darker contrasting sections to break up uniform cream backgrounds.', rx: "#f5f5dc|#fffdd0|#f5f5f5|beige|cornsilk" },
  { id: 'bounce-easing', name: 'Bounce Easing', desc: 'Uses generic, exaggerated bounce or elastic animation easings.', sev: 'warning', cat: 'motion', msg: 'Replace bounce easings with refined spring mechanics or smooth ease-out curves.', rx: "cubic-bezier\\\\(\\\\s*0\\\\.175\\\\s*,\\\\s*0\\\\.885\\\\s*,\\\\s*0\\\\.32\\\\s*,\\\\s*1\\\\.275\\\\s*\\\\)" },
  { id: 'layout-transition', name: 'Layout Transition', desc: 'Animating layout properties (width, height, padding, margin) causes performance and reflow issues.', sev: 'error', cat: 'motion', msg: 'Transition transform (scale, translate) or opacity instead of layout properties.', rx: "transition\\\\s*:.*?(\\\\bwidth\\\\b|\\\\bheight\\\\b|\\\\bmargin\\\\b|\\\\bpadding\\\\b|\\\\ball\\\\b)" },
  { id: 'image-hover-transform', name: 'Image Hover Transform', desc: 'Applying dramatic scale or rotate transforms to images on hover is a generic pattern.', sev: 'warning', cat: 'motion', msg: 'Use subtle transitions or rely on opacity/overlay changes rather than raw image scaling.', rx: "transform\\\\s*:\\\\s*scale\\\\([1-9]\\\\)" },
  { id: 'line-length', name: 'Line Length', desc: 'Line length is either too short or too long for comfortable reading.', sev: 'warning', cat: 'quality', msg: 'Constrain body text width to approximately 60-80 characters per line (e.g., max-w-prose).', rx: "width\\\\s*:\\\\s*100vw" },
  { id: 'cramped-padding', name: 'Cramped Padding', desc: 'Containers lack sufficient internal padding, making content feel crowded.', sev: 'warning', cat: 'quality', msg: 'Increase padding inside containers, cards, and buttons to give content breathing room.', rx: "padding\\\\s*:\\\\s*(0|2px|4px|1rem)(;|$)" },
  { id: 'tight-leading', name: 'Tight Leading', desc: 'Line height (leading) is too tight, squishing text vertically.', sev: 'warning', cat: 'quality', msg: 'Increase line-height (e.g., 1.5 or 150%) for body text to improve readability.', rx: "line-height\\\\s*:\\\\s*(1|1\\\\.0|1\\\\.1|1\\\\.2|100%|110%|120%)(;|$|!)" },
  { id: 'justified-text', name: 'Justified Text', desc: 'Text is fully justified, causing uneven gaps (rivers) between words.', sev: 'warning', cat: 'quality', msg: 'Align text to the left (or right for RTL languages) instead of using text-align: justify.', rx: "text-align\\\\s*:\\\\s*justify" },
  { id: 'tiny-text', name: 'Tiny Text', desc: 'Font size is too small, failing accessibility and legibility standards.', sev: 'error', cat: 'quality', msg: 'Ensure all text is at least 12px, preferably 16px for body content.', rx: "font-size\\\\s*:\\\\s*([1-9]|1[01])(px|pt)\\\\b" },
  { id: 'all-caps-body', name: 'All Caps Body', desc: 'Long blocks of text are set in all caps, severely reducing readability.', sev: 'warning', cat: 'quality', msg: 'Use sentence case for multi-line text and reserve all-caps for short headings or labels.', rx: "text-transform\\\\s*:\\\\s*uppercase" },
  { id: 'wide-tracking', name: 'Wide Tracking', desc: 'Excessive letter-spacing (tracking) on lowercase body text.', sev: 'warning', cat: 'quality', msg: 'Remove letter-spacing on lowercase text. Wide tracking should only be used on all-caps.', rx: "letter-spacing\\\\s*:\\\\s*[2-9]px" },
  { id: 'extreme-negative-tracking', name: 'Extreme Negative Tracking', desc: 'Letter-spacing is heavily negative, causing characters to crash into each other.', sev: 'warning', cat: 'quality', msg: 'Reduce negative letter-spacing to ensure distinct letterforms remain legible.', rx: "letter-spacing\\\\s*:\\\\s*-[1-9]px" },
  { id: 'body-text-viewport-edge', name: 'Body Text at Viewport Edge', desc: 'Text touches the edge of the viewport on small screens without padding.', sev: 'error', cat: 'quality', msg: 'Add horizontal padding (e.g., px-4 or 16px) to the main container to keep text off screen edges.', rx: "padding\\\\s*:\\\\s*0\\\\b" },
  { id: 'theater-slop-phrase', name: 'Theater Slop Phrase', desc: 'Uses generic "theater" framing copy commonly output by AI models.', sev: 'warning', cat: 'quality', msg: 'Rewrite copy to be direct and authentic rather than using generic framing phrasing.', rx: "embark on a journey|delve into|in a world where|a tapestry of" },
  { id: 'side-tab', name: 'Side Tab', desc: 'Thick borders on just one side of a container resemble outdated side tabs.', sev: 'warning', cat: 'layout', msg: 'Remove the heavy side border. Use subtle background colors or full borders for emphasis.', rx: "border-left\\\\s*:\\\\s*[4-9]px\\\\s+solid" },
  { id: 'border-accent-on-rounded', name: 'Border Accent on Rounded Container', desc: 'Mixing a heavy single-side border accent with rounded corners creates geometric awkwardness.', sev: 'warning', cat: 'layout', msg: 'Use full borders on rounded containers, or remove the border-radius if using a side accent.', rx: "border-left.*?solid.*?border-radius" },
  { id: 'monotonous-spacing', name: 'Monotonous Spacing', desc: 'Uses the exact same spacing value everywhere without hierarchy.', sev: 'warning', cat: 'layout', msg: 'Vary padding and margin to create clear logical groupings and visual hierarchy.', rx: "(padding|margin)\\\\s*:\\\\s*16px\\\\s+16px\\\\s+16px\\\\s+16px" },
  { id: 'nested-cards', name: 'Nested Cards', desc: 'Placing cards within cards creates unnecessary visual clutter and boxiness.', sev: 'warning', cat: 'layout', msg: 'Flatten the UI by removing nested borders/backgrounds and relying on spacing for grouping.', rx: "class=\\\"[^\"]*card[^\"]*\\\".*?class=\\\"[^\"]*card[^\"]*\\\"" },
  { id: 'gpt-thin-border-wide-shadow', name: 'Thin Border Wide Shadow', desc: 'Combines a thin gray border with a massive, diffuse shadow (classic AI pattern).', sev: 'warning', cat: 'layout', msg: 'Pick one: a crisp border with no shadow, or a refined shadow with no border.', rx: "border\\\\s*:\\\\s*1px\\\\s+solid.*?box-shadow\\\\s*:\\\\s*.*?[2-9]0px" },
  { id: 'icon-tile-stack', name: 'Icon Tile Stack', desc: 'Floating icon tiles stacked directly above headings without integration.', sev: 'warning', cat: 'layout', msg: 'Integrate icons inline with the text or refine the layout to avoid floating icon boxes.', rx: "class=\\\"[^\"]*icon[^\"]*\\\".*?class=\\\"[^\"]*tile[^\"]*\\\"" },
  { id: 'repeated-section-kickers', name: 'Repeated Section Kickers', desc: 'Every section uses the exact same uppercase kicker style, creating monotony.', sev: 'warning', cat: 'layout', msg: 'Vary section headers or remove unnecessary kickers/eyebrows to reduce repetitiveness.', rx: "class=\\\"[^\"]*(section-kicker|eyebrow|kicker)[^\"]*\\\"" },
  { id: 'clipped-overflow-container', name: 'Clipped Overflow Container', desc: 'Container strictly clips its contents in a way that hides interactive elements or shadows.', sev: 'warning', cat: 'layout', msg: 'Adjust overflow settings or padding so child elements (like focus rings or dropdowns) are not clipped.', rx: "overflow\\\\s*:\\\\s*hidden" },
  { id: 'overused-font', name: 'Overused Font', desc: 'Relies on an overused default web font without typographic refinement.', sev: 'warning', cat: 'typography', msg: 'Switch to a more distinctive typeface or carefully refine weight and spacing if using defaults.', rx: "font-family\\\\s*:.*?(Roboto|Open Sans|Lato)" },
  { id: 'single-font', name: 'Single Font', desc: 'Uses only one font family across the entire page without varying weight or size enough.', sev: 'warning', cat: 'typography', msg: 'Introduce a secondary typeface for headings, or create starker contrast in font weights/sizes.', rx: "font-family\\\\s*:\\\\s*inherit" },
  { id: 'flat-type-hierarchy', name: 'Flat Type Hierarchy', desc: 'Headings and body text are too similar in size and weight.', sev: 'error', cat: 'typography', msg: 'Increase contrast between headings and body text using larger sizes, heavier weights, or different fonts.', rx: "font-size\\\\s*:\\\\s*16px.*?font-weight\\\\s*:\\\\s*normal" },
  { id: 'oversized-h1', name: 'Oversized H1', desc: 'The main heading is comically large and breaks layout or readability.', sev: 'warning', cat: 'typography', msg: 'Reduce the font size of the H1 to fit harmoniously within the viewport.', rx: "font-size\\\\s*:\\\\s*([7-9][0-9]|1[0-9]{2})px" },
  { id: 'italic-serif-display', name: 'Italic Serif Display', desc: 'Uses italic serif fonts for large display text, a cliché AI design trope.', sev: 'warning', cat: 'typography', msg: 'Use a regular (upright) serif or a sans-serif for hero typography instead of forced italics.', rx: "font-style\\\\s*:\\\\s*italic.*?font-family\\\\s*:.*?serif" },
  { id: 'hero-eyebrow-chip', name: 'Hero Eyebrow Chip', desc: 'Uses a small, brightly colored pill/chip above the main H1 (common generic pattern).', sev: 'warning', cat: 'typography', msg: 'Remove the eyebrow chip or integrate the text more naturally into the heading hierarchy.', rx: "class=\\\"[^\"]*eyebrow[^\"]*\\\"" },
  { id: 'anti-pure-black', name: 'Anti Pure Black', desc: 'Avoid pure black. It creates eye strain. Use a dark gray like #1a1a1a.', sev: 'warning', cat: 'color', msg: 'Use a dark gray like #1a1a1a instead.', rx: "#000000|#000\\\\b|rgb\\\\(\\\\s*0\\\\s*,\\\\s*0\\\\s*,\\\\s*0\\\\s*\\\\)" },
  { id: 'anti-inter-default', name: 'Anti Inter Default', desc: 'Avoid default generic usage of "Inter".', sev: 'warning', cat: 'typography', msg: 'Refine typographic scales or use another font.', rx: "font-family\\\\s*:\\\\s*[^;]*['\\\"]?Inter['\\\"]?" },
  { id: 'anti-bounce-ease', name: 'Anti Bounce Ease', desc: 'Avoid generic bounce easings.', sev: 'warning', cat: 'motion', msg: 'Use refined spring mechanics.', rx: "cubic-bezier\\\\(\\\\s*0\\\\.175\\\\s*,\\\\s*0\\\\.885\\\\s*,\\\\s*0\\\\.32\\\\s*,\\\\s*1\\\\.275\\\\s*\\\\)" },
  { id: 'anti-generic-blue', name: 'Anti Generic Blue', desc: 'Avoid generic unrefined blues.', sev: 'warning', cat: 'color', msg: 'Use a brand-specific blue instead.', rx: "#0000ff\\\\b|\\\\bcolor\\\\s*:\\\\s*blue\\\\b" },
  { id: 'anti-pure-white', name: 'Anti Pure White', desc: 'Avoid pure white. It lacks depth.', sev: 'warning', cat: 'color', msg: 'Use an off-white instead.', rx: "#ffffff|#fff\\\\b|rgb\\\\(\\\\s*255\\\\s*,\\\\s*255\\\\s*,\\\\s*255\\\\s*\\\\)" },
  { id: 'anti-comic-sans', name: 'Anti Comic Sans', desc: 'Avoid Comic Sans MS.', sev: 'error', cat: 'typography', msg: 'Use a professional typeface.', rx: "font-family\\\\s*:.*Comic Sans MS" },
  { id: 'anti-papyrus', name: 'Anti Papyrus', desc: 'Avoid Papyrus.', sev: 'error', cat: 'typography', msg: 'Use a modern display font.', rx: "font-family\\\\s*:.*Papyrus" },
  { id: 'anti-centered-text', name: 'Anti Centered Text', desc: 'Avoid centered text for long paragraphs.', sev: 'warning', cat: 'typography', msg: 'Left-align long blocks of text.', rx: "text-align\\\\s*:\\\\s*center" },
  { id: 'anti-transparent-text', name: 'Anti Transparent Text', desc: 'Avoid transparent text without clear reason.', sev: 'warning', cat: 'color', msg: 'Ensure text is visible.', rx: "color\\\\s*:\\\\s*transparent" },
  { id: 'anti-absolute-positioning', name: 'Anti Absolute Positioning', desc: 'Minimize absolute positioning for layouts.', sev: 'warning', cat: 'layout', msg: 'Prefer Flexbox or Grid.', rx: "position\\\\s*:\\\\s*absolute" }
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
        const regex = new RegExp('${r.rx}', 'i');
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
