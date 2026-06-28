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

  function createOverlay(element, rule, result) {
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
    tooltipDesc.innerText = (result && result.message) ? result.message : rule.description;

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
        if (evaluateDOM) {
          const result = evaluateDOM(node);
          if (result) {
            createOverlay(node, rule, result);
          }
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
