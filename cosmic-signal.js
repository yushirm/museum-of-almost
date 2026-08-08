(function loadCosmicModules(root) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = require('./cosmic-signal-core.js');
    return;
  }
  const document = root.document;
  if (!document) return;

  function load(src, marker, next) {
    const existing = document.querySelector(`script[data-${marker}]`);
    if (existing) {
      if (existing.dataset.ready === 'true') next?.();
      else existing.addEventListener('load', () => next?.(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.dataset[marker] = 'true';
    script.addEventListener('load', () => {
      script.dataset.ready = 'true';
      next?.();
    }, { once: true });
    document.body.append(script);
  }

  load('./cosmic-signal-core.js', 'cosmicSignalCore', () => {
    load('./cosmic-signal-view.js', 'cosmicSignalView', () => {
      load('./cosmic-latency-core.js', 'cosmicLatencyCore', () => {
        load('./cosmic-latency.js', 'cosmicLatencyView', () => {
          load('./cosmic-escapement-core.js', 'celestialEscapementCore', () => {
            load('./cosmic-escapement.js', 'celestialEscapementView', () => {
              load('./planetary-heliodon-core.js', 'planetaryHeliodonCore', () => {
                load('./planetary-heliodon.js', 'planetaryHeliodonView', () => {
                  load('./witness-seal-core.js', 'witnessSealCore', () => {
                    load('./witness-seal.js', 'witnessSealView');
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  load('./faultline-core.js', 'faultlineCore', () => {
    load('./faultline.js', 'faultlineView');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
