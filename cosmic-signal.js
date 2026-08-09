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

  function mountTemporalAperture() {
    const panel = document.querySelector('#sample-hold-panel');
    if (!panel || document.querySelector('#temporal-aperture')) return;

    const details = document.createElement('details');
    details.id = 'temporal-aperture';
    details.className = 'temporal-aperture';
    details.innerHTML = `
      <summary>
        <span>THE TEMPORAL APERTURE</span>
        <strong>“NOW” HAS FIVE DIFFERENT WIDTHS</strong>
      </summary>
      <div class="temporal-aperture-body">
        <p class="temporal-aperture-intro">The latch makes one coherent page update. It does not make the source observations simultaneous. Each feed answers a different kind of present.</p>
        <dl class="temporal-aperture-grid">
          <div>
            <dt>EARTH · USGS</dt>
            <dd><strong>ROLLING WINDOW</strong><span>Earthquakes reported in the past hour. A count over an interval, not an instant.</span></dd>
          </div>
          <div>
            <dt>FLOW · NOAA</dt>
            <dd><strong>LATEST MEASUREMENT</strong><span>The most recent solar-wind speed available from the service when this sample is acquired.</span></dd>
          </div>
          <div>
            <dt>SCALES · NOAA</dt>
            <dd><strong>CURRENT STATUS</strong><span>A current space-weather status product. Its meaning is categorical, not a synchronized sensor tick.</span></dd>
          </div>
          <div>
            <dt>WEATHER · OPEN-METEO</dt>
            <dd><strong>CURRENT FIELDS</strong><span>Thirteen fixed coordinates requested together and read as one weather sample for this page.</span></dd>
          </div>
          <div>
            <dt>EVENTS · NASA EONET</dt>
            <dd><strong>OPEN SET</strong><span>Events still listed as open. “Open” can persist across many moments; it is not an instantaneous measurement.</span></dd>
          </div>
        </dl>
        <p class="temporal-aperture-note"><strong>So what is the Museum's “now”?</strong> A transaction boundary: five unlike temporal products are allowed to settle, then become visible together. The boundary is exact; simultaneity is not claimed.</p>
      </div>`;

    panel.insertAdjacentElement('afterend', details);
  }

  mountTemporalAperture();

  load('./cosmic-signal-core.js', 'cosmicSignalCore', () => {
    load('./cosmic-signal-view.js', 'cosmicSignalView', () => {
      load('./cosmic-latency-core.js', 'cosmicLatencyCore', () => {
        load('./cosmic-latency.js', 'cosmicLatencyView', () => {
          load('./cosmic-escapement-core.js', 'celestialEscapementCore', () => {
            load('./cosmic-escapement.js', 'celestialEscapementView', () => {
              load('./planetary-heliodon-core.js', 'planetaryHeliodonCore', () => {
                load('./planetary-heliodon.js', 'planetaryHeliodonView', () => {
                  load('./witness-seal-core.js', 'witnessSealCore', () => {
                    load('./witness-seal.js', 'witnessSealView', () => {
                      load('./isolation-board-core.js', 'isolationBoardCore', () => {
                        load('./isolation-board.js', 'isolationBoardView', () => {
                          load('./exposure-plate-core.js', 'exposurePlateCore', () => {
                            load('./exposure-plate.js', 'exposurePlateView', () => {
                              load('./reverse-ledger-core.js', 'reverseLedgerCore', () => {
                                load('./reverse-ledger.js', 'reverseLedgerView', () => {
                                  load('./rest-score-core.js', 'restScoreCore', () => {
                                    load('./rest-score.js', 'restScoreView', () => {
                                      load('./offcut-drawer.js', 'offcutDrawerView', () => {
                                        load('./border-office-core.js', 'borderOfficeCore', () => {
                                          load('./border-office.js', 'borderOfficeView', () => {
                                            load('./load-bearing-sample-core.js', 'loadBearingSampleCore', () => {
                                              load('./load-bearing-sample.js', 'loadBearingSampleView', () => {
                                                load('./gauge-bench-core.js', 'gaugeBenchCore', () => {
                                                  load('./gauge-bench.js', 'gaugeBenchView', () => {
                                                    load('./shuffle-table-core.js', 'shuffleTableCore', () => {
                                                      load('./shuffle-table.js', 'shuffleTableView', () => {
                                                        load('./quorum-gate-core.js', 'quorumGateCore', () => {
                                                          load('./quorum-gate.js', 'quorumGateView', () => {
                                                            load('./shutter-cabinet-core.js', 'shutterCabinetCore', () => {
                                                              load('./shutter-cabinet.js', 'shutterCabinetView', () => {
                                                                load('./weather-score-core.js', 'weatherScoreCore', () => {
                                                                  load('./weather-score.js', 'weatherScoreView');
                                                                });
                                                              });
                                                            });
                                                          });
                                                        });
                                                      });
                                                    });
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  load('./solar-boundary-core.js', 'solarBoundaryCore', () => {
    load('./solar-boundary.js', 'solarBoundaryView');
  });

  load('./synoptic-alphabet-core.js', 'synopticAlphabetCore', () => {
    load('./synoptic-alphabet.js', 'synopticAlphabetView');
  });

  load('./faultline-core.js', 'faultlineCore', () => {
    load('./faultline.js', 'faultlineView');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);