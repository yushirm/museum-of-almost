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

  function mountReductionRegister() {
    const aperture = document.querySelector('#temporal-aperture');
    if (!aperture || document.querySelector('#reduction-register')) return;

    const details = document.createElement('details');
    details.id = 'reduction-register';
    details.className = 'temporal-aperture';
    details.innerHTML = `
      <summary>
        <span>THE REDUCTION REGISTER</span>
        <strong>WHAT SURVIVES THE LATCH?</strong>
      </summary>
      <div class="temporal-aperture-body">
        <p class="temporal-aperture-intro">Borrowed from scientific data reduction: a readable instrument is always a choice about what to preserve. COMMONS does not pretend its compact portrait is the source material itself. These are the deliberate reductions that make one shared “now” legible.</p>
        <dl class="temporal-aperture-grid" aria-label="How Commons reduces each public feed for the visible snapshot">
          <div>
            <dt>01 · USGS EARTH</dt>
            <dd><strong>EVENTS → SUMMARY</strong><span>The returned earthquake set becomes a count, strongest magnitude, mean depth, and a significant-event count. Individual event identities, coordinates, and timelines are not the headline portrait.</span></dd>
          </div>
          <div>
            <dt>02 · NOAA FLOW</dt>
            <dd><strong>MEASUREMENT → SPEED</strong><span>The visible snapshot keeps solar-wind speed and a local descriptive band. Source time remains available to the Sounding Well; no recent time-series history is turned into a trend.</span></dd>
          </div>
          <div>
            <dt>03 · NOAA SCALES</dt>
            <dd><strong>RECORD → G / S / R</strong><span>The current geomagnetic, solar-radiation, and radio-blackout categories stay separate. COMMONS does not combine them into one synthetic “space weather score.”</span></dd>
          </div>
          <div>
            <dt>04 · OPEN-METEO WEATHER</dt>
            <dd><strong>13 POINTS → RELATIONSHIPS</strong><span>Only current temperature, 10 m wind speed, and precipitation are requested at thirteen fixed coordinates. Ranges, means, pair differences, and the section are derived locally; no forecast history is requested.</span></dd>
          </div>
          <div>
            <dt>05 · NASA EONET EVENTS</dt>
            <dd><strong>OPEN SET → COUNTS</strong><span>Up to 500 open records become a total and the five most common categories. Titles and event coordinates are deliberately not reproduced in the visible snapshot.</span></dd>
          </div>
        </dl>
        <p class="temporal-aperture-note"><strong>Reduction is not reality.</strong> A value can be honestly calculated and still be only one projection of a richer source. The page keeps the transformation explicit so compactness is never mistaken for completeness.</p>
        <p class="temporal-aperture-intro"><strong>THE SAMPLING FLOOR · WHAT CAN FALL BETWEEN SAMPLES?</strong> Borrowed from sampling theory: a measurement can be accurate at the points it observes and still miss structure that lives between those points or between observation times.</p>
        <dl class="temporal-aperture-grid" aria-label="Sampling limits of the Commons snapshot">
          <div>
            <dt>SPACE</dt>
            <dd><strong>13 POINTS ARE NOT A PLANETARY FIELD</strong><span>The weather range belongs to these fixed stations only. Conditions between them can be warmer, colder, wetter, calmer, or windier without appearing here.</span></dd>
          </div>
          <div>
            <dt>TIME</dt>
            <dd><strong>ONE LATCH IS NOT A TREND</strong><span>A refresh shows another sample, not the path between samples. Short-lived changes can begin and end without ever appearing on this page because COMMONS does not poll continuously.</span></dd>
          </div>
          <div>
            <dt>WINDOWS</dt>
            <dd><strong>COUNTS MOVE WHEN WINDOWS MOVE</strong><span>Past-hour earthquakes and open-event totals are set-membership views. A changed count can reflect an event entering or leaving a reporting window or status set, not an instantaneous change in planetary activity.</span></dd>
          </div>
        </dl>
        <p class="temporal-aperture-note"><strong>No anti-aliasing claim.</strong> COMMONS does not sample densely enough in space or time to reconstruct everything the planet did between observations. The instrument shows what its samples support and leaves the unsampled world unsaid.</p>
        <p class="temporal-aperture-intro"><strong>THE CO-OCCURRENCE FIREWALL · ONE LATCH DOES NOT MAKE ONE CAUSE</strong> Borrowed from causal inference: putting unlike observations beside one another can invite a story the measurements did not establish. COMMONS treats shared display time as co-occurrence only.</p>
        <dl class="temporal-aperture-grid" aria-label="Causal interpretation limits of the Commons snapshot">
          <div>
            <dt>ADJACENCY</dt>
            <dd><strong>SAME SNAPSHOT ≠ CAUSAL LINK</strong><span>Earthquakes, near-Earth solar conditions, weather, and open-event records appear together because one visitor-triggered acquisition latched them together. Adjacency does not establish direction, mechanism, dependence, or common cause.</span></dd>
          </div>
          <div>
            <dt>ORDER</dt>
            <dd><strong>EARLIER ≠ EXPLANATION</strong><span>Even when source timestamps can be ordered, earlier and later observations alone do not identify a cause. A causal claim would require evidence and scientific assumptions beyond this single latched portrait.</span></dd>
          </div>
          <div>
            <dt>COMPARISON</dt>
            <dd><strong>NO CROSS-FEED STORY IS COMPUTED</strong><span>COMMONS does not correlate, regress, rank, predict, or score unlike feeds against one another. Its comparisons stay inside the declared scientific scope of each instrument.</span></dd>
          </div>
        </dl>
        <p class="temporal-aperture-note"><strong>The firewall:</strong> the page may say <em>these things were visible in one shared now</em>. It may not turn adjacency into explanation.</p>
        <p class="temporal-aperture-intro"><strong>THE CLAIM LICENSE · WHICH VERBS HAS THE SNAPSHOT EARNED?</strong> Borrowed from controlled scientific vocabularies: the strength of a sentence should not outrun the operation that produced it. COMMONS gives each kind of statement a verb boundary.</p>
        <dl class="temporal-aperture-grid" aria-label="Claim verbs licensed by the Commons snapshot">
          <div>
            <dt>OBSERVE</dt>
            <dd><strong>THE SOURCES REPORT</strong><span>Use for returned measurements, statuses, and set membership: a source reported a value, category, or currently open record in this acquisition.</span></dd>
          </div>
          <div>
            <dt>DERIVE</dt>
            <dd><strong>THE PAGE CALCULATES</strong><span>Use for transparent local transformations such as ranges, means, pair differences, geometry, and counts. The result belongs to the declared inputs and method, not to an unstated global population.</span></dd>
          </div>
          <div>
            <dt>COMPARE</dt>
            <dd><strong>THE SNAPSHOT CONTRASTS</strong><span>Use when two fixed windows or values are placed against one another inside one declared instrument. A contrast can describe difference without ranking importance, quality, risk, or cause.</span></dd>
          </div>
          <div>
            <dt>INFER</dt>
            <dd><strong>NOT LICENSED BY THIS PORTRAIT</strong><span>Do not use one latch to explain, predict, generalize to the whole planet, establish trend, or identify mechanism. Those verbs require evidence beyond this static cross-section.</span></dd>
          </div>
        </dl>
        <p class="temporal-aperture-note"><strong>The language rule:</strong> COMMONS may observe, derive, and compare where its methods support those verbs. It must stop before explanation becomes implication.</p>
      </div>`;

    aperture.insertAdjacentElement('afterend', details);
  }

  mountTemporalAperture();
  mountReductionRegister();

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

(function attachCommonsNeighborRelation(root) {
  'use strict';

  function nearestInPlane(readings, selectedId) {
    const available = (Array.isArray(readings) ? readings : [])
      .filter((reading) => reading?.id && Number.isFinite(reading.x) && Number.isFinite(reading.y));
    const selected = available.find((reading) => reading.id === selectedId);
    if (!selected || available.length < 2) return null;

    const xs = available.map((reading) => reading.x);
    const ys = available.map((reading) => reading.y);
    const xSpan = Math.max(...xs) - Math.min(...xs) || 1;
    const ySpan = Math.max(...ys) - Math.min(...ys) || 1;

    return available
      .filter((reading) => reading.id !== selectedId)
      .map((reading) => ({
        id: reading.id,
        distance: Math.hypot(
          (reading.x - selected.x) / xSpan,
          (reading.y - selected.y) / ySpan
        )
      }))
      .sort((a, b) => a.distance - b.distance || String(a.id).localeCompare(String(b.id)))[0] || null;
  }

  function nearestOnEarth(stations, selectedId, distanceFn) {
    const list = Array.isArray(stations) ? stations : [];
    const selected = list.find((station) => station?.id === selectedId);
    if (!selected || typeof distanceFn !== 'function') return null;

    return list
      .filter((station) => station?.id && station.id !== selectedId)
      .map((station) => ({ id: station.id, distanceKm: distanceFn(selected, station) }))
      .filter((entry) => Number.isFinite(entry.distanceKm))
      .sort((a, b) => a.distanceKm - b.distanceKm || String(a.id).localeCompare(String(b.id)))[0] || null;
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = Object.freeze({
      ...module.exports,
      commonsNeighborRelation: Object.freeze({ nearestInPlane, nearestOnEarth })
    });
    return;
  }

  const document = root.document;
  const core = root.MuseumCommonsCore;
  if (!document || !core || !Array.isArray(core.STATIONS)) return;

  const section = document.querySelector('.phase-space-section');
  const readout = section?.querySelector('.phase-space-readout');
  if (!section || !readout || section.dataset.neighborRelation === 'true') return;
  section.dataset.neighborRelation = 'true';

  const relation = document.createElement('p');
  relation.className = 'phase-space-help phase-space-neighbor';
  relation.setAttribute('data-phase-neighbor', 'true');
  const existingHelp = readout.querySelector('.phase-space-help');
  if (existingHelp) existingHelp.before(relation);
  else readout.append(relation);

  function pointId(button) {
    const match = String(button?.textContent || '').trim().match(/^\d{2}/);
    return match?.[0] || null;
  }

  function readingFromButton(button) {
    const id = pointId(button);
    const x = Number.parseFloat(button?.style?.getPropertyValue('--phase-x'));
    const y = Number.parseFloat(button?.style?.getPropertyValue('--phase-y'));
    return { id, x, y };
  }

  function render() {
    const buttons = [...section.querySelectorAll('.phase-space-point')];
    if (!buttons.length) return;

    for (const button of buttons) {
      button.querySelector('.phase-space-neighbor-mark')?.remove();
      delete button.dataset.neighborRole;
      if (!button.dataset.neighborBaseLabel) {
        button.dataset.neighborBaseLabel = button.getAttribute('aria-label') || `Point ${pointId(button) || 'unknown'}`;
      }
      button.setAttribute('aria-label', button.dataset.neighborBaseLabel);
    }

    const selectedButton = buttons.find((button) => button.dataset.selected === 'true');
    const selectedId = pointId(selectedButton);
    if (!selectedId) {
      relation.textContent = 'Choose a point to compare nearness in measurement space with nearness on Earth.';
      return;
    }

    const plane = nearestInPlane(
      buttons.filter((button) => button.dataset.available === 'true').map(readingFromButton),
      selectedId
    );
    const earth = nearestOnEarth(core.STATIONS, selectedId, core.greatCircleDistanceKm);

    const roles = new Map();
    if (plane) roles.set(plane.id, 'state');
    if (earth) roles.set(earth.id, roles.get(earth.id) === 'state' ? 'both' : 'earth');

    for (const button of buttons) {
      const id = pointId(button);
      const role = roles.get(id);
      if (!role) continue;
      button.dataset.neighborRole = role;
      const marker = document.createElement('span');
      marker.className = 'phase-space-neighbor-mark';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = role === 'both' ? '◎' : role === 'state' ? '≈' : '⌖';
      button.append(marker);
      const suffix = role === 'both'
        ? '; nearest in this measurement space and nearest fixed station on Earth'
        : role === 'state'
          ? '; nearest in this measurement space'
          : '; nearest fixed station on Earth';
      button.setAttribute('aria-label', `${button.dataset.neighborBaseLabel}${suffix}`);
    }

    if (!earth) {
      relation.textContent = 'A nearest-neighbour comparison is unavailable for the selected point.';
      return;
    }

    const earthCopy = `⌖ POINT ${earth.id} is the nearest fixed station on Earth (${earth.distanceKm.toLocaleString('en')} km).`;
    if (!plane) {
      relation.textContent = `MEASUREMENT NEIGHBOUR UNAVAILABLE · ${earthCopy} One or both displayed variables are missing for this lens.`;
      return;
    }

    if (plane.id === earth.id) {
      relation.textContent = `GEOMETRIES AGREE · ◎ POINT ${plane.id} is nearest in this displayed measurement space and nearest on Earth (${earth.distanceKm.toLocaleString('en')} km).`;
      return;
    }

    relation.textContent = `GEOMETRIES DISAGREE · ≈ POINT ${plane.id} is nearest in this displayed measurement space. ${earthCopy}`;
  }

  section.addEventListener('click', (event) => {
    if (event.target?.closest?.('[data-phase-lens], .phase-space-point')) queueMicrotask(render);
  });
  document.addEventListener('museum:commons-snapshot', () => queueMicrotask(render));
  queueMicrotask(render);
})(typeof globalThis !== 'undefined' ? globalThis : this);
