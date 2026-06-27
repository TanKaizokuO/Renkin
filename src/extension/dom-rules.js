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
