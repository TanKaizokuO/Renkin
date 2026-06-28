(function () {
  const getCleanedLines = (content) => {
    let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      const newlines = match.match(/\n/g);
      return newlines ? newlines.join('') : '';
    });
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    return cleaned.split(/\r?\n/);
  };

  const rules = [
    {
      id: 'low-contrast',
      name: 'Low Contrast',
      description: 'Text contrast does not meet WCAG accessibility minimums against its background.',
      severity: 'error',
      category: 'color',
      message: 'Increase text contrast ratio to at least 4.5:1 (or 3.0:1 for large text).',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /color\s*:\s*(#777|#888|#999|gray|grey)|color\s*:\s*rgba\(\d+,\s*\d+,\s*\d+,\s*0\.[1-4]\)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Increase text contrast ratio to at least 4.5:1 (or 3.0:1 for large text).', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'gray-on-color',
      name: 'Gray on Color',
      description: 'Gray text on colored backgrounds creates muddy contrast and is hard to read.',
      severity: 'warning',
      category: 'color',
      message: 'Use white, very light, or very dark text against colored backgrounds instead of gray.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /color\s*:\s*(gray|grey|#888888|#999999)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use white, very light, or very dark text against colored backgrounds instead of gray.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'gradient-text',
      name: 'Gradient Text',
      description: 'Text using a background clip gradient can be visually overwhelming and hard to read.',
      severity: 'warning',
      category: 'color',
      message: 'Remove the gradient clip from text and use a solid, high-contrast color.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /(background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Remove the gradient clip from text and use a solid, high-contrast color.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'ai-color-palette',
      name: 'AI Color Palette',
      description: 'Uses generic AI-generated color palettes (e.g., highly saturated purples and violets).',
      severity: 'warning',
      category: 'color',
      message: 'Refine the color palette to align with brand guidelines instead of default generic presets.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /(#8a2be2|#9370db|#8b008b|#4b0082|blueviolet)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Refine the color palette to align with brand guidelines instead of default generic presets.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'dark-glow',
      name: 'Dark Glow',
      description: 'Bright colored box-shadow glows on dark backgrounds can look dated or noisy.',
      severity: 'warning',
      category: 'color',
      message: 'Remove or heavily soften colored glows on dark backgrounds. Rely on borders or subtle elevations.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /box-shadow\s*:[^;]*?(rgba\([^,]+,[^,]+,[^,]+,\s*0\.[6-9]+\)|#[a-fA-F0-9]{3,8})/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Remove or heavily soften colored glows on dark backgrounds. Rely on borders or subtle elevations.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'repeating-stripes-gradient',
      name: 'Repeating Stripes Gradient',
      description: 'Repeating CSS gradient stripes are a common AI design tell that looks unrefined.',
      severity: 'warning',
      category: 'color',
      message: 'Replace repeating gradient stripes with a solid color, subtle texture, or cleaner background pattern.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /repeating-linear-gradient/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Replace repeating gradient stripes with a solid color, subtle texture, or cleaner background pattern.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'cream-palette',
      name: 'Cream Palette',
      description: 'Overuse of cream/beige palettes resulting in a low-contrast or muddy aesthetic.',
      severity: 'warning',
      category: 'color',
      message: 'Introduce crisp white or darker contrasting sections to break up uniform cream backgrounds.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /(#f5f5dc|#fffdd0|#f5f5f5|beige|cornsilk)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Introduce crisp white or darker contrasting sections to break up uniform cream backgrounds.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'bounce-easing',
      name: 'Bounce Easing',
      description: 'Uses generic, exaggerated bounce or elastic animation easings.',
      severity: 'warning',
      category: 'motion',
      message: 'Replace bounce easings with refined spring mechanics or smooth ease-out curves.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /cubic-bezier\(\s*0\.175\s*,\s*0\.885\s*,\s*0\.32\s*,\s*1\.275\s*\)/;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Replace bounce easings with refined spring mechanics or smooth ease-out curves.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'layout-transition',
      name: 'Layout Transition',
      description: 'Animating layout properties (width, height, padding, margin) causes performance and reflow issues.',
      severity: 'error',
      category: 'motion',
      message: 'Transition transform (scale, translate) or opacity instead of layout properties.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /transition\s*:.*?(\bwidth\b|\bheight\b|\bmargin\b|\bpadding\b|\ball\b)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Transition transform (scale, translate) or opacity instead of layout properties.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'image-hover-transform',
      name: 'Image Hover Transform',
      description: 'Applying dramatic scale or rotate transforms to images on hover is a generic pattern.',
      severity: 'warning',
      category: 'motion',
      message: 'Use subtle transitions or rely on opacity/overlay changes rather than raw image scaling.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /transform\s*:\s*scale\([1-9]/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use subtle transitions or rely on opacity/overlay changes rather than raw image scaling.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'line-length',
      name: 'Line Length',
      description: 'Line length is either too short or too long for comfortable reading.',
      severity: 'warning',
      category: 'quality',
      message: 'Constrain body text width to approximately 60-80 characters per line (e.g., max-w-prose).',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /width\s*:\s*100vw/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Constrain body text width to approximately 60-80 characters per line (e.g., max-w-prose).', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'cramped-padding',
      name: 'Cramped Padding',
      description: 'Containers lack sufficient internal padding, making content feel crowded.',
      severity: 'warning',
      category: 'quality',
      message: 'Increase padding inside containers, cards, and buttons to give content breathing room.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /padding\s*:\s*(0|2px|4px|1rem)(;|$)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Increase padding inside containers, cards, and buttons to give content breathing room.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'tight-leading',
      name: 'Tight Leading',
      description: 'Line height (leading) is too tight, squishing text vertically.',
      severity: 'warning',
      category: 'quality',
      message: 'Increase line-height (e.g., 1.5 or 150%) for body text to improve readability.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /line-height\s*:\s*(1|1\.0|1\.1|1\.2|100%|110%|120%)(;|$|!)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Increase line-height (e.g., 1.5 or 150%) for body text to improve readability.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'justified-text',
      name: 'Justified Text',
      description: 'Text is fully justified, causing uneven gaps (rivers) between words.',
      severity: 'warning',
      category: 'quality',
      message: 'Align text to the left (or right for RTL languages) instead of using text-align: justify.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /text-align\s*:\s*justify/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Align text to the left (or right for RTL languages) instead of using text-align: justify.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'tiny-text',
      name: 'Tiny Text',
      description: 'Font size is too small, failing accessibility and legibility standards.',
      severity: 'error',
      category: 'quality',
      message: 'Ensure all text is at least 12px, preferably 16px for body content.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-size\s*:\s*([1-9]|1[01])(px|pt)\b/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Ensure all text is at least 12px, preferably 16px for body content.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'all-caps-body',
      name: 'All Caps Body',
      description: 'Long blocks of text are set in all caps, severely reducing readability.',
      severity: 'warning',
      category: 'quality',
      message: 'Use sentence case for multi-line text and reserve all-caps for short headings or labels.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /text-transform\s*:\s*uppercase/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use sentence case for multi-line text and reserve all-caps for short headings or labels.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'wide-tracking',
      name: 'Wide Tracking',
      description: 'Excessive letter-spacing (tracking) on lowercase body text.',
      severity: 'warning',
      category: 'quality',
      message: 'Remove letter-spacing on lowercase text. Wide tracking should only be used on all-caps.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /letter-spacing\s*:\s*[2-9]px/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Remove letter-spacing on lowercase text. Wide tracking should only be used on all-caps.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'extreme-negative-tracking',
      name: 'Extreme Negative Tracking',
      description: 'Letter-spacing is heavily negative, causing characters to crash into each other.',
      severity: 'warning',
      category: 'quality',
      message: 'Reduce negative letter-spacing to ensure distinct letterforms remain legible.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /letter-spacing\s*:\s*-[1-9]px/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Reduce negative letter-spacing to ensure distinct letterforms remain legible.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'body-text-viewport-edge',
      name: 'Body Text at Viewport Edge',
      description: 'Text touches the edge of the viewport on small screens without padding.',
      severity: 'error',
      category: 'quality',
      message: 'Add horizontal padding (e.g., px-4 or 16px) to the main container to keep text off screen edges.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /padding\s*:\s*0\b/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Add horizontal padding (e.g., px-4 or 16px) to the main container to keep text off screen edges.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'theater-slop-phrase',
      name: 'Theater Slop Phrase',
      description: 'Uses generic "theater" framing copy commonly output by AI models.',
      severity: 'warning',
      category: 'quality',
      message: 'Rewrite copy to be direct and authentic rather than using generic framing phrasing.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /(embark on a journey|delve into|in a world where|a tapestry of)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Rewrite copy to be direct and authentic rather than using generic framing phrasing.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'side-tab',
      name: 'Side Tab',
      description: 'Thick borders on just one side of a container resemble outdated side tabs.',
      severity: 'warning',
      category: 'layout',
      message: 'Remove the heavy side border. Use subtle background colors or full borders for emphasis.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /border-left\s*:\s*[4-9]px\s+solid/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Remove the heavy side border. Use subtle background colors or full borders for emphasis.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'border-accent-on-rounded',
      name: 'Border Accent on Rounded Container',
      description: 'Mixing a heavy single-side border accent with rounded corners creates geometric awkwardness.',
      severity: 'warning',
      category: 'layout',
      message: 'Use full borders on rounded containers, or remove the border-radius if using a side accent.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /border-left.*?solid.*?border-radius/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use full borders on rounded containers, or remove the border-radius if using a side accent.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'monotonous-spacing',
      name: 'Monotonous Spacing',
      description: 'Uses the exact same spacing value everywhere without hierarchy.',
      severity: 'warning',
      category: 'layout',
      message: 'Vary padding and margin to create clear logical groupings and visual hierarchy.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /(padding|margin)\s*:\s*16px\s+16px\s+16px\s+16px/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Vary padding and margin to create clear logical groupings and visual hierarchy.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'nested-cards',
      name: 'Nested Cards',
      description: 'Placing cards within cards creates unnecessary visual clutter and boxiness.',
      severity: 'warning',
      category: 'layout',
      message: 'Flatten the UI by removing nested borders/backgrounds and relying on spacing for grouping.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /class="[^"]*card[^"]*".*?class="[^"]*card[^"]*"/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Flatten the UI by removing nested borders/backgrounds and relying on spacing for grouping.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'gpt-thin-border-wide-shadow',
      name: 'Thin Border Wide Shadow',
      description: 'Combines a thin gray border with a massive, diffuse shadow (classic AI pattern).',
      severity: 'warning',
      category: 'layout',
      message: 'Pick one: a crisp border with no shadow, or a refined shadow with no border.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /border\s*:\s*1px\s+solid.*?box-shadow\s*:\s*.*?[2-9]0px/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Pick one: a crisp border with no shadow, or a refined shadow with no border.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'icon-tile-stack',
      name: 'Icon Tile Stack',
      description: 'Floating icon tiles stacked directly above headings without integration.',
      severity: 'warning',
      category: 'layout',
      message: 'Integrate icons inline with the text or refine the layout to avoid floating icon boxes.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /class="[^"]*icon[^"]*".*?class="[^"]*tile[^"]*"/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Integrate icons inline with the text or refine the layout to avoid floating icon boxes.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'repeated-section-kickers',
      name: 'Repeated Section Kickers',
      description: 'Every section uses the exact same uppercase kicker style, creating monotony.',
      severity: 'warning',
      category: 'layout',
      message: 'Vary section headers or remove unnecessary kickers/eyebrows to reduce repetitiveness.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /class="[^"]*(section-kicker|eyebrow|kicker)[^"]*"/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Vary section headers or remove unnecessary kickers/eyebrows to reduce repetitiveness.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'clipped-overflow-container',
      name: 'Clipped Overflow Container',
      description: 'Container strictly clips its contents in a way that hides interactive elements or shadows.',
      severity: 'warning',
      category: 'layout',
      message: 'Adjust overflow settings or padding so child elements (like focus rings or dropdowns) are not clipped.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /overflow\s*:\s*hidden/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Adjust overflow settings or padding so child elements (like focus rings or dropdowns) are not clipped.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'overused-font',
      name: 'Overused Font',
      description: 'Relies on an overused default web font without typographic refinement.',
      severity: 'warning',
      category: 'typography',
      message: 'Switch to a more distinctive typeface or carefully refine weight and spacing if using defaults.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-family\s*:.*?(Roboto|Open Sans|Lato)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Switch to a more distinctive typeface or carefully refine weight and spacing if using defaults.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'single-font',
      name: 'Single Font',
      description: 'Uses only one font family across the entire page without varying weight or size enough.',
      severity: 'warning',
      category: 'typography',
      message: 'Introduce a secondary typeface for headings, or create starker contrast in font weights/sizes.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-family\s*:\s*inherit/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Introduce a secondary typeface for headings, or create starker contrast in font weights/sizes.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'flat-type-hierarchy',
      name: 'Flat Type Hierarchy',
      description: 'Headings and body text are too similar in size and weight.',
      severity: 'error',
      category: 'typography',
      message: 'Increase contrast between headings and body text using larger sizes, heavier weights, or different fonts.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-size\s*:\s*16px.*?font-weight\s*:\s*normal/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Increase contrast between headings and body text using larger sizes, heavier weights, or different fonts.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'oversized-h1',
      name: 'Oversized H1',
      description: 'The main heading is comically large and breaks layout or readability.',
      severity: 'warning',
      category: 'typography',
      message: 'Reduce the font size of the H1 to fit harmoniously within the viewport.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-size\s*:\s*([7-9][0-9]|1[0-9]{2})px/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Reduce the font size of the H1 to fit harmoniously within the viewport.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'italic-serif-display',
      name: 'Italic Serif Display',
      description: 'Uses italic serif fonts for large display text, a cliché AI design trope.',
      severity: 'warning',
      category: 'typography',
      message: 'Use a regular (upright) serif or a sans-serif for hero typography instead of forced italics.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-style\s*:\s*italic.*?font-family\s*:.*?serif/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use a regular (upright) serif or a sans-serif for hero typography instead of forced italics.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'hero-eyebrow-chip',
      name: 'Hero Eyebrow Chip',
      description: 'Uses a small, brightly colored pill/chip above the main H1 (common generic pattern).',
      severity: 'warning',
      category: 'typography',
      message: 'Remove the eyebrow chip or integrate the text more naturally into the heading hierarchy.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /class="[^"]*eyebrow[^"]*"/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Remove the eyebrow chip or integrate the text more naturally into the heading hierarchy.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-pure-black',
      name: 'Anti Pure Black',
      description: 'Avoid pure black. It creates eye strain. Use a dark gray like #1a1a1a.',
      severity: 'warning',
      category: 'color',
      message: 'Use a dark gray like #1a1a1a instead.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /#000000|#000\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use a dark gray like #1a1a1a instead.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-inter-default',
      name: 'Anti Inter Default',
      description: 'Avoid default generic usage of "Inter".',
      severity: 'warning',
      category: 'typography',
      message: 'Refine typographic scales or use another font.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-family\s*:\s*[^;]*['"]?Inter['"]?/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Refine typographic scales or use another font.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-bounce-ease',
      name: 'Anti Bounce Ease',
      description: 'Avoid generic bounce easings.',
      severity: 'warning',
      category: 'motion',
      message: 'Use refined spring mechanics.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /cubic-bezier\(\s*0\.175\s*,\s*0\.885\s*,\s*0\.32\s*,\s*1\.275\s*\)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use refined spring mechanics.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-generic-blue',
      name: 'Anti Generic Blue',
      description: 'Avoid generic unrefined blues.',
      severity: 'warning',
      category: 'color',
      message: 'Use a brand-specific blue instead.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /#0000ff\b|\bcolor\s*:\s*blue\b/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use a brand-specific blue instead.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-pure-white',
      name: 'Anti Pure White',
      description: 'Avoid pure white. It lacks depth.',
      severity: 'warning',
      category: 'color',
      message: 'Use an off-white instead.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /#ffffff|#fff\b|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use an off-white instead.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-comic-sans',
      name: 'Anti Comic Sans',
      description: 'Avoid Comic Sans MS.',
      severity: 'error',
      category: 'typography',
      message: 'Use a professional typeface.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-family\s*:.*Comic Sans MS/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use a professional typeface.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-papyrus',
      name: 'Anti Papyrus',
      description: 'Avoid Papyrus.',
      severity: 'error',
      category: 'typography',
      message: 'Use a modern display font.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /font-family\s*:.*Papyrus/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Use a modern display font.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-centered-text',
      name: 'Anti Centered Text',
      description: 'Avoid centered text for long paragraphs.',
      severity: 'warning',
      category: 'typography',
      message: 'Left-align long blocks of text.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /text-align\s*:\s*center/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Left-align long blocks of text.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-transparent-text',
      name: 'Anti Transparent Text',
      description: 'Avoid transparent text without clear reason.',
      severity: 'warning',
      category: 'color',
      message: 'Ensure text is visible.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /color\s*:\s*transparent/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Ensure text is visible.', snippet: line.trim() });
          }
        });
        return matches;
      }
    },
    {
      id: 'anti-absolute-positioning',
      name: 'Anti Absolute Positioning',
      description: 'Minimize absolute positioning for layouts.',
      severity: 'warning',
      category: 'layout',
      message: 'Prefer Flexbox or Grid.',
      evaluate: (content, filePath) => {
        const matches = [];
        const lines = getCleanedLines(content);
        const regex = /position\s*:\s*absolute/i;
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, message: 'Prefer Flexbox or Grid.', snippet: line.trim() });
          }
        });
        return matches;
      }
    }
  ];

  globalThis.DesignRules = rules;
})();
