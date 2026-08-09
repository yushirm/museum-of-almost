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