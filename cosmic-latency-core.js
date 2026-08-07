(function attachCosmicLatencyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumCosmicLatencyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildCosmicLatencyCore() {
  'use strict';
  const SPEED_OF_LIGHT_KM_S = 299792.458;
  const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;
  const LANDMARKS = Object.freeze([
    Object.freeze({ id:'moon', name:'Moon', short:'nearest mirror', delaySeconds:384400/SPEED_OF_LIGHT_KM_S, distance:'average 384,400 km from Earth', note:'The Moon moves closer and farther during its orbit, so this uses NASA’s average orbital distance.' }),
    Object.freeze({ id:'sun', name:'Sun', short:'our star', delaySeconds:8.350022*60, distance:'about 150 million km from Earth', note:'NASA lists a one-way light time to the Sun of about 8.35 minutes.' }),
    Object.freeze({ id:'alpha-centauri', name:'Alpha Centauri A/B', short:'nearby suns', delaySeconds:4.37*SECONDS_PER_YEAR, distance:'about 4.37 light-years', note:'A light-year is a distance, but its name gives the latency away: light covers one light-year in one year.' }),
    Object.freeze({ id:'sirius', name:'Sirius', short:'bright night star', delaySeconds:8.6*SECONDS_PER_YEAR, distance:'about 8.6 light-years', note:'The brightest star in Earth’s night sky is already a message from years ago.' }),
    Object.freeze({ id:'galactic-center', name:'Milky Way center', short:'our galactic downtown', delaySeconds:26000*SECONDS_PER_YEAR, distance:'about 26,000 light-years', note:'The crowded center of our own galaxy is so far away that its light began travelling long before recorded history.' }),
    Object.freeze({ id:'andromeda', name:'Andromeda Galaxy', short:'nearest major galaxy', delaySeconds:2.5e6*SECONDS_PER_YEAR, distance:'about 2.5 million light-years', note:'The Andromeda light reaching Earth now began crossing intergalactic space roughly 2.5 million years ago.' }),
    Object.freeze({ id:'cmb', name:'Cosmic microwave background', short:'oldest observable light', delaySeconds:13.8e9*SECONDS_PER_YEAR, distance:'about 13.8 billion years of lookback time', note:'This is a lookback-time landmark, not a simple present-day distance. NASA describes this glow as the oldest light we can observe.' })
  ]);

  const integer = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits:0 }).format(value);
  function formatDelay(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return 'unavailable';
    if (seconds < 60) return `~${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) { const rounded=Math.round(seconds); return `~${Math.floor(rounded/60)} min ${rounded%60} sec`; }
    const years=seconds/SECONDS_PER_YEAR;
    if (years < 100) return `~${years.toFixed(years<10?2:1)} years`;
    if (years < 1e6) return `~${integer(years)} years`;
    if (years < 1e9) return `~${(years/1e6).toFixed(1).replace(/\.0$/,'')} million years`;
    return `~${(years/1e9).toFixed(1).replace(/\.0$/,'')} billion years`;
  }
  function formatUtc(ms) {
    if (!Number.isFinite(ms)) return 'unavailable';
    return new Date(ms).toISOString().replace('T',' ').replace(/\.\d{3}Z$/,' UTC');
  }
  function departureLabel(receptionMs, landmark) {
    if (!landmark || !Number.isFinite(landmark.delaySeconds)) return 'unavailable';
    if (landmark.delaySeconds <= 3600) return formatUtc(Math.round((receptionMs-landmark.delaySeconds*1000)/1000)*1000);
    return `${formatDelay(landmark.delaySeconds)} before reception`;
  }
  function logPosition(delaySeconds, landmarks=LANDMARKS) {
    const values=landmarks.map(x=>x.delaySeconds).filter(x=>Number.isFinite(x)&&x>0);
    if (!values.length || !Number.isFinite(delaySeconds) || delaySeconds<=0) return null;
    const min=Math.log10(Math.min(...values)), max=Math.log10(Math.max(...values));
    return min===max?50:((Math.log10(delaySeconds)-min)/(max-min))*100;
  }
  function snapshot(receptionMs) {
    const receivedAt=Number.isFinite(receptionMs)?receptionMs:Date.now();
    return LANDMARKS.map((landmark)=>({ ...landmark, delay:formatDelay(landmark.delaySeconds), position:logPosition(landmark.delaySeconds), lane:landmark.id==='sirius'||landmark.id==='andromeda'?1:0, departure:departureLabel(receivedAt,landmark) }));
  }
  function sentence(receptionMs, landmark) {
    if (!landmark) return 'Choose a signal source to inspect its light delay.';
    const received=formatUtc(receptionMs);
    if (landmark.delaySeconds<=3600) return `Received here ${received}. Light from ${landmark.name} left at about ${departureLabel(receptionMs,landmark)}.`;
    return `Received here ${received}. Light from ${landmark.name} began this leg of the journey ${formatDelay(landmark.delaySeconds)} earlier.`;
  }
  return Object.freeze({ SPEED_OF_LIGHT_KM_S, SECONDS_PER_YEAR, LANDMARKS, formatDelay, formatUtc, departureLabel, logPosition, snapshot, sentence });
});
