
// --- Auto-generated content script ---
// From: src/engine/rules.js
(function() {
const stripComments = (line) => {
  // Strip single-line JS/TS comments
  let cleaned = line.replace(/\/\/.*$/, '');
  // Strip single-line CSS block comments
  cleaned = cleaned.replace(/\/\*.*?\*\//g, '');
  return cleaned;
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
      lines.forEach((line, index) => {
        const cleaned = stripComments(line);
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: line.trim() });
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
      lines.forEach((line, index) => {
        const cleaned = stripComments(line);
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: line.trim() });
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
      lines.forEach((line, index) => {
        const cleaned = stripComments(line);
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: line.trim() });
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
      lines.forEach((line, index) => {
        const cleaned = stripComments(line);
        if (regex.test(cleaned)) {
          matches.push({ line: index + 1, snippet: line.trim() });
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


// From: src/extension/dom-rules.js
(function() {
  const isPureBlack = (colorStr) => {
    if (!colorStr) return false;
    // getComputedStyle returns rgb(r, g, b) or rgba(r, g, b, a)
    return colorStr === 'rgb(0, 0, 0)' || colorStr === 'rgba(0, 0, 0, 1)';
  };

  const isGenericBlue = (colorStr) => {
    if (!colorStr) return false;
    return colorStr === 'rgb(0, 0, 255)' || colorStr === 'rgba(0, 0, 255, 1)';
  };

  const domRules = {
    'anti-pure-black': (node) => {
      const style = window.getComputedStyle(node);
      return isPureBlack(style.color) || 
             isPureBlack(style.backgroundColor) || 
             isPureBlack(style.borderColor);
    },
    'anti-inter-default': (node) => {
      const style = window.getComputedStyle(node);
      const font = style.fontFamily || '';
      if (font.toLowerCase().includes('inter')) {
        if (style.letterSpacing === 'normal' && style.fontFeatureSettings === 'normal') {
          return true;
        }
      }
      return false;
    },
    'anti-bounce-ease': (node) => {
      const style = window.getComputedStyle(node);
      const transition = style.transitionTimingFunction || '';
      return transition.includes('cubic-bezier(0.175, 0.885, 0.32, 1.275)');
    },
    'anti-generic-blue': (node) => {
      const style = window.getComputedStyle(node);
      return isGenericBlue(style.color) || 
             isGenericBlue(style.backgroundColor) || 
             isGenericBlue(style.borderColor);
    }
  };

  globalThis.DesignDOMRules = domRules;
})();


// From: src/extension/content-core.js
(function() {
  let isActive = false;
  let scrollResizeListener = null;
  let activeOverlays = []; // Array of { element, overlayNode, updatePos() }
  let walkQueue = [];
  let isWalking = false;

  const ROOT_ID = 'design-audit-root';

  function getRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      document.body.appendChild(root);
    }
    return root;
  }

  function createOverlay(element, rule, domRule) {
    const overlay = document.createElement('div');
    overlay.className = 'design-audit-overlay';

    const badge = document.createElement('div');
    badge.className = 'design-audit-badge';
    badge.innerText = '!';

    const tooltip = document.createElement('div');
    tooltip.className = 'design-audit-tooltip';
    
    const tooltipId = document.createElement('span');
    tooltipId.className = 'design-audit-tooltip-id';
    tooltipId.innerText = rule.id;

    const tooltipDesc = document.createElement('span');
    tooltipDesc.className = 'design-audit-tooltip-desc';
    tooltipDesc.innerText = rule.description;

    tooltip.appendChild(tooltipId);
    tooltip.appendChild(tooltipDesc);
    badge.appendChild(tooltip);
    overlay.appendChild(badge);

    const updatePos = () => {
      const rect = element.getBoundingClientRect();
      overlay.style.top = `${window.scrollY + rect.top}px`;
      overlay.style.left = `${window.scrollX + rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    };

    updatePos();
    getRoot().appendChild(overlay);

    activeOverlays.push({ element, overlayNode: overlay, updatePos });
  }

  function walkChunk(deadline) {
    if (!isActive) return;

    while (walkQueue.length > 0 && deadline.timeRemaining() > 0) {
      const node = walkQueue.shift();
      
      // Skip our own injected UI
      if (node.closest(`#${ROOT_ID}`)) continue;
      
      // Check rules
      const rules = globalThis.DesignRules || [];
      const domRules = globalThis.DesignDOMRules || {};

      for (const rule of rules) {
        const evaluateDOM = domRules[rule.id];
        if (evaluateDOM && evaluateDOM(node)) {
          createOverlay(node, rule, evaluateDOM);
        }
      }
    }

    if (walkQueue.length > 0) {
      requestIdleCallback(walkChunk);
    } else {
      isWalking = false;
    }
  }

  function runAudit() {
    if (isWalking) return;
    
    walkQueue = Array.from(document.querySelectorAll('*'));
    isWalking = true;
    
    if (window.requestIdleCallback) {
      requestIdleCallback(walkChunk);
    } else {
      setTimeout(() => walkChunk({ timeRemaining: () => 50 }), 0);
    }
  }

  function setupSync() {
    if (scrollResizeListener) return;

    let ticking = false;
    scrollResizeListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          activeOverlays.forEach(o => o.updatePos());
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollResizeListener, { passive: true });
    window.addEventListener('resize', scrollResizeListener, { passive: true });
  }

  function teardown() {
    if (scrollResizeListener) {
      window.removeEventListener('scroll', scrollResizeListener);
      window.removeEventListener('resize', scrollResizeListener);
      scrollResizeListener = null;
    }
    
    const root = document.getElementById(ROOT_ID);
    if (root) {
      root.remove();
    }

    walkQueue = [];
    isWalking = false;
    activeOverlays = [];
  }

  function toggleAudit() {
    isActive = !isActive;
    
    if (isActive) {
      console.log('Design Audit toggled ON');
      setupSync();
      runAudit();
    } else {
      console.log('Design Audit toggled OFF');
      teardown();
    }
  }

  // Listen for background script message
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'TOGGLE_AUDIT') {
      toggleAudit();
    }
  });

})();

