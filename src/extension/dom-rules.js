(function() {
  const parseColor = (colorStr) => {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit') return null;
    const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1], 10),
        g: parseInt(rgbaMatch[2], 10),
        b: parseInt(rgbaMatch[3], 10),
        a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
      };
    }
    return null;
  };

  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrast = (color1, color2) => {
    const l1 = getLuminance(color1.r, color1.g, color1.b);
    const l2 = getLuminance(color2.r, color2.g, color2.b);
    const lightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (lightest + 0.05) / (darkest + 0.05);
  };

  const isPureBlack = (colorStr) => {
    const c = parseColor(colorStr);
    return c && c.r === 0 && c.g === 0 && c.b === 0 && c.a > 0;
  };
  
  const isPureWhite = (colorStr) => {
    const c = parseColor(colorStr);
    return c && c.r === 255 && c.g === 255 && c.b === 255 && c.a > 0;
  };

  const isGenericBlue = (colorStr) => {
    const c = parseColor(colorStr);
    return c && c.r === 0 && c.g === 0 && c.b === 255 && c.a > 0;
  };
  
  const isGray = (colorStr) => {
    const c = parseColor(colorStr);
    if (!c || c.a === 0) return false;
    const max = Math.max(c.r, c.g, c.b);
    const min = Math.min(c.r, c.g, c.b);
    return (max - min) < 20 && c.r > 50 && c.r < 200;
  };

  const hasText = (node) => {
    return Array.from(node.childNodes).some(child => child.nodeType === 3 && child.textContent.trim().length > 0);
  };

  const domRules = {
    'low-contrast': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      const textColor = parseColor(style.color);
      let bgNode = node;
      let bgColor = null;
      while (bgNode && bgNode !== document) {
        const bgStyle = window.getComputedStyle(bgNode);
        const c = parseColor(bgStyle.backgroundColor);
        if (c && c.a > 0) {
          bgColor = c;
          break;
        }
        bgNode = bgNode.parentElement;
      }
      if (textColor && bgColor) {
        const contrast = getContrast(textColor, bgColor);
        const size = parseFloat(style.fontSize) || 16;
        const isLarge = size >= 24 || (size >= 19 && style.fontWeight >= 700);
        const minContrast = isLarge ? 3.0 : 4.5;
        if (contrast < minContrast) {
          return { element: node, message: 'Increase text contrast ratio to at least 4.5:1 (or 3.0:1 for large text).' };
        }
      }
      return null;
    },
    'gray-on-color': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (isGray(style.color)) {
        let bgNode = node;
        let bgColor = null;
        while (bgNode && bgNode !== document) {
          const bgStyle = window.getComputedStyle(bgNode);
          const c = parseColor(bgStyle.backgroundColor);
          if (c && c.a > 0) {
            bgColor = c;
            break;
          }
          bgNode = bgNode.parentElement;
        }
        if (bgColor) {
          const bgMax = Math.max(bgColor.r, bgColor.g, bgColor.b);
          const bgMin = Math.min(bgColor.r, bgColor.g, bgColor.b);
          if (bgMax - bgMin > 30) {
             return { element: node, message: 'Use white, very light, or very dark text against colored backgrounds instead of gray.' };
          }
        }
      }
      return null;
    },
    'gradient-text': (node) => {
      const style = window.getComputedStyle(node);
      if (style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text') {
        if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
          return { element: node, message: 'Remove the gradient clip from text and use a solid, high-contrast color.' };
        }
      }
      return null;
    },
    'ai-color-palette': (node) => {
      const style = window.getComputedStyle(node);
      const checkColor = (cStr) => {
        const c = parseColor(cStr);
        if (!c) return false;
        return (c.r > 70 && c.b > 120 && c.g < 100); 
      };
      if (checkColor(style.color) || checkColor(style.backgroundColor) || checkColor(style.borderColor)) {
        return { element: node, message: 'Refine the color palette to align with brand guidelines instead of default generic presets.' };
      }
      return null;
    },
    'dark-glow': (node) => {
      const style = window.getComputedStyle(node);
      if (style.boxShadow && style.boxShadow !== 'none') {
        let bgNode = node.parentElement;
        if (bgNode) {
           const bgStyle = window.getComputedStyle(bgNode);
           const bgColor = parseColor(bgStyle.backgroundColor);
           if (bgColor && getLuminance(bgColor.r, bgColor.g, bgColor.b) < 0.2) {
              if (style.boxShadow.includes('rgba') && !style.boxShadow.includes('0, 0, 0')) {
                return { element: node, message: 'Remove or heavily soften colored glows on dark backgrounds. Rely on borders or subtle elevations.' };
              }
           }
        }
      }
      return null;
    },
    'repeating-stripes-gradient': (node) => {
      const style = window.getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage.includes('repeating-linear-gradient')) {
        return { element: node, message: 'Replace repeating gradient stripes with a solid color, subtle texture, or cleaner background pattern.' };
      }
      return null;
    },
    'cream-palette': (node) => {
      const style = window.getComputedStyle(node);
      const bg = parseColor(style.backgroundColor);
      if (bg && bg.r > 230 && bg.g > 230 && bg.b > 200 && bg.b < 240) {
        return { element: node, message: 'Introduce crisp white or darker contrasting sections to break up uniform cream backgrounds.' };
      }
      return null;
    },
    'bounce-easing': (node) => {
      const style = window.getComputedStyle(node);
      if (style.transitionTimingFunction && style.transitionTimingFunction.includes('cubic-bezier(0.175, 0.885, 0.32, 1.275)')) {
        return { element: node, message: 'Replace bounce easings with refined spring mechanics or smooth ease-out curves.' };
      }
      return null;
    },
    'layout-transition': (node) => {
      const style = window.getComputedStyle(node);
      const trans = style.transitionProperty || '';
      if (trans.includes('width') || trans.includes('height') || trans.includes('margin') || trans.includes('padding') || trans.includes('all')) {
        if (style.transitionDuration && style.transitionDuration !== '0s') {
          return { element: node, message: 'Transition transform (scale, translate) or opacity instead of layout properties.' };
        }
      }
      return null;
    },
    'image-hover-transform': (node) => {
      if (node.tagName === 'IMG') {
        const style = window.getComputedStyle(node);
        if (style.transitionProperty && style.transitionProperty.includes('transform')) {
          return { element: node, message: 'Use subtle transitions or rely on opacity/overlay changes rather than raw image scaling.' };
        }
      }
      return null;
    },
    'line-length': (node) => {
      if (!hasText(node)) return null;
      const textLen = node.textContent.trim().length;
      if (textLen > 100) {
        const style = window.getComputedStyle(node);
        const width = parseFloat(style.width);
        const fontSize = parseFloat(style.fontSize);
        if (width / fontSize > 45) {
          return { element: node, message: 'Constrain body text width to approximately 60-80 characters per line (e.g., max-w-prose).' };
        }
      }
      return null;
    },
    'cramped-padding': (node) => {
      if (!hasText(node) && node.children.length === 0) return null;
      const style = window.getComputedStyle(node);
      if (style.display === 'inline') return null;
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.borderWidth && parseFloat(style.borderWidth) > 0) {
        const pTop = parseFloat(style.paddingTop);
        const pBottom = parseFloat(style.paddingBottom);
        const pLeft = parseFloat(style.paddingLeft);
        const pRight = parseFloat(style.paddingRight);
        if (pTop < 4 || pBottom < 4 || pLeft < 4 || pRight < 4) {
          if (node.tagName === 'BUTTON' || style.borderWidth !== '0px') {
            return { element: node, message: 'Increase padding inside containers, cards, and buttons to give content breathing room.' };
          }
        }
      }
      return null;
    },
    'tight-leading': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (style.display === 'inline') return null;
      const lh = parseFloat(style.lineHeight);
      const fz = parseFloat(style.fontSize);
      if (!isNaN(lh) && !isNaN(fz) && (lh / fz) <= 1.2 && node.textContent.trim().length > 50) {
        return { element: node, message: 'Increase line-height (e.g., 1.5 or 150%) for body text to improve readability.' };
      }
      return null;
    },
    'justified-text': (node) => {
      const style = window.getComputedStyle(node);
      if (style.textAlign === 'justify') {
        return { element: node, message: 'Align text to the left (or right for RTL languages) instead of using text-align: justify.' };
      }
      return null;
    },
    'tiny-text': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (parseFloat(style.fontSize) < 12) {
        return { element: node, message: 'Ensure all text is at least 12px, preferably 16px for body content.' };
      }
      return null;
    },
    'all-caps-body': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (style.textTransform === 'uppercase' && node.textContent.trim().length > 60) {
        return { element: node, message: 'Use sentence case for multi-line text and reserve all-caps for short headings or labels.' };
      }
      return null;
    },
    'wide-tracking': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (style.textTransform !== 'uppercase' && parseFloat(style.letterSpacing) >= 2) {
        return { element: node, message: 'Remove letter-spacing on lowercase text. Wide tracking should only be used on all-caps.' };
      }
      return null;
    },
    'extreme-negative-tracking': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (parseFloat(style.letterSpacing) <= -1) {
        return { element: node, message: 'Reduce negative letter-spacing to ensure distinct letterforms remain legible.' };
      }
      return null;
    },
    'body-text-viewport-edge': (node) => {
      if (!hasText(node)) return null;
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      if (rect.left <= 0 && rect.right >= window.innerWidth && parseFloat(style.paddingLeft) === 0) {
        return { element: node, message: 'Add horizontal padding (e.g., px-4 or 16px) to the main container to keep text off screen edges.' };
      }
      return null;
    },
    'theater-slop-phrase': (node) => {
      if (!hasText(node)) return null;
      const text = node.textContent.toLowerCase();
      if (text.includes('embark on a journey') || text.includes('delve into') || text.includes('in a world where') || text.includes('a tapestry of')) {
        return { element: node, message: 'Rewrite copy to be direct and authentic rather than using generic framing phrasing.' };
      }
      return null;
    },
    'side-tab': (node) => {
      const style = window.getComputedStyle(node);
      const l = parseFloat(style.borderLeftWidth);
      const r = parseFloat(style.borderRightWidth);
      const t = parseFloat(style.borderTopWidth);
      const b = parseFloat(style.borderBottomWidth);
      if (l >= 4 && r === 0 && t === 0 && b === 0) {
        return { element: node, message: 'Remove the heavy side border. Use subtle background colors or full borders for emphasis.' };
      }
      return null;
    },
    'border-accent-on-rounded': (node) => {
      const style = window.getComputedStyle(node);
      const l = parseFloat(style.borderLeftWidth);
      const r = parseFloat(style.borderRightWidth);
      const br = parseFloat(style.borderTopLeftRadius);
      if (l > 0 && r === 0 && br > 0) {
        return { element: node, message: 'Use full borders on rounded containers, or remove the border-radius if using a side accent.' };
      }
      return null;
    },
    'monotonous-spacing': (node) => {
      const style = window.getComputedStyle(node);
      if (style.padding === '16px' && style.margin === '16px') {
        return { element: node, message: 'Vary padding and margin to create clear logical groupings and visual hierarchy.' };
      }
      return null;
    },
    'nested-cards': (node) => {
      if (node.className && typeof node.className === 'string' && node.className.includes('card')) {
        let parent = node.parentElement;
        while (parent && parent !== document.body) {
          if (parent.className && typeof parent.className === 'string' && parent.className.includes('card')) {
            return { element: node, message: 'Flatten the UI by removing nested borders/backgrounds and relying on spacing for grouping.' };
          }
          parent = parent.parentElement;
        }
      }
      return null;
    },
    'gpt-thin-border-wide-shadow': (node) => {
      const style = window.getComputedStyle(node);
      if (style.borderWidth === '1px' && style.boxShadow && style.boxShadow !== 'none') {
        if (style.boxShadow.includes('20px') || style.boxShadow.includes('30px') || style.boxShadow.includes('40px')) {
          return { element: node, message: 'Pick one: a crisp border with no shadow, or a refined shadow with no border.' };
        }
      }
      return null;
    },
    'icon-tile-stack': (node) => {
      if (node.className && typeof node.className === 'string' && (node.className.includes('icon') || node.className.includes('tile'))) {
        if (node.nextElementSibling && ['H1','H2','H3','H4'].includes(node.nextElementSibling.tagName)) {
           return { element: node, message: 'Integrate icons inline with the text or refine the layout to avoid floating icon boxes.' };
        }
      }
      return null;
    },
    'repeated-section-kickers': (node) => {
      if (node.className && typeof node.className === 'string' && (node.className.includes('kicker') || node.className.includes('eyebrow'))) {
        const style = window.getComputedStyle(node);
        if (style.textTransform === 'uppercase') {
          return { element: node, message: 'Vary section headers or remove unnecessary kickers/eyebrows to reduce repetitiveness.' };
        }
      }
      return null;
    },
    'clipped-overflow-container': (node) => {
      const style = window.getComputedStyle(node);
      if (style.overflow === 'hidden' && style.padding === '0px') {
        return { element: node, message: 'Adjust overflow settings or padding so child elements (like focus rings or dropdowns) are not clipped.' };
      }
      return null;
    },
    'overused-font': (node) => {
      const style = window.getComputedStyle(node);
      const font = style.fontFamily || '';
      if (font.includes('Roboto') || font.includes('Open Sans') || font.includes('Lato')) {
        return { element: node, message: 'Switch to a more distinctive typeface or carefully refine weight and spacing if using defaults.' };
      }
      return null;
    },
    'single-font': (node) => {
      return null; // Skip live check
    },
    'flat-type-hierarchy': (node) => {
      if (['H1','H2','H3'].includes(node.tagName)) {
        const style = window.getComputedStyle(node);
        if (parseFloat(style.fontSize) <= 18 && (style.fontWeight === '400' || style.fontWeight === 'normal')) {
          return { element: node, message: 'Increase contrast between headings and body text using larger sizes, heavier weights, or different fonts.' };
        }
      }
      return null;
    },
    'oversized-h1': (node) => {
      if (node.tagName === 'H1') {
        const style = window.getComputedStyle(node);
        if (parseFloat(style.fontSize) > 70) {
          return { element: node, message: 'Reduce the font size of the H1 to fit harmoniously within the viewport.' };
        }
      }
      return null;
    },
    'italic-serif-display': (node) => {
      if (['H1','H2','H3'].includes(node.tagName)) {
        const style = window.getComputedStyle(node);
        if (style.fontStyle === 'italic' && (style.fontFamily.includes('serif') || style.fontFamily.includes('Times'))) {
          return { element: node, message: 'Use a regular (upright) serif or a sans-serif for hero typography instead of forced italics.' };
        }
      }
      return null;
    },
    'hero-eyebrow-chip': (node) => {
      if (node.className && typeof node.className === 'string' && node.className.includes('eyebrow')) {
        if (node.nextElementSibling && node.nextElementSibling.tagName === 'H1') {
          return { element: node, message: 'Remove the eyebrow chip or integrate the text more naturally into the heading hierarchy.' };
        }
      }
      return null;
    },
    'anti-pure-black': (node) => {
      const style = window.getComputedStyle(node);
      if (isPureBlack(style.color) || isPureBlack(style.backgroundColor) || isPureBlack(style.borderColor)) {
        return { element: node, message: 'Use a dark gray like #1a1a1a instead.' };
      }
      return null;
    },
    'anti-inter-default': (node) => {
      const style = window.getComputedStyle(node);
      const font = style.fontFamily || '';
      if (font.toLowerCase().includes('inter')) {
        if (style.letterSpacing === 'normal' && style.fontFeatureSettings === 'normal') {
          return { element: node, message: 'Refine typographic scales or use another font.' };
        }
      }
      return null;
    },
    'anti-bounce-ease': (node) => {
      const style = window.getComputedStyle(node);
      const transition = style.transitionTimingFunction || '';
      if (transition.includes('cubic-bezier(0.175, 0.885, 0.32, 1.275)')) {
        return { element: node, message: 'Use refined spring mechanics.' };
      }
      return null;
    },
    'anti-generic-blue': (node) => {
      const style = window.getComputedStyle(node);
      if (isGenericBlue(style.color) || isGenericBlue(style.backgroundColor) || isGenericBlue(style.borderColor)) {
        return { element: node, message: 'Use a brand-specific blue instead.' };
      }
      return null;
    },
    'anti-pure-white': (node) => {
      const style = window.getComputedStyle(node);
      if (isPureWhite(style.backgroundColor)) {
        return { element: node, message: 'Use an off-white instead.' };
      }
      return null;
    },
    'anti-comic-sans': (node) => {
      const style = window.getComputedStyle(node);
      if (style.fontFamily && style.fontFamily.toLowerCase().includes('comic sans ms')) {
        return { element: node, message: 'Use a professional typeface.' };
      }
      return null;
    },
    'anti-papyrus': (node) => {
      const style = window.getComputedStyle(node);
      if (style.fontFamily && style.fontFamily.toLowerCase().includes('papyrus')) {
        return { element: node, message: 'Use a modern display font.' };
      }
      return null;
    },
    'anti-centered-text': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (style.textAlign === 'center' && node.textContent.trim().length > 100) {
        return { element: node, message: 'Left-align long blocks of text.' };
      }
      return null;
    },
    'anti-transparent-text': (node) => {
      if (!hasText(node)) return null;
      const style = window.getComputedStyle(node);
      if (style.color === 'rgba(0, 0, 0, 0)' || style.color === 'transparent') {
        return { element: node, message: 'Ensure text is visible.' };
      }
      return null;
    },
    'anti-absolute-positioning': (node) => {
      const style = window.getComputedStyle(node);
      if (style.position === 'absolute') {
        return { element: node, message: 'Prefer Flexbox or Grid.' };
      }
      return null;
    }
  };

  globalThis.DesignDOMRules = domRules;
})();
