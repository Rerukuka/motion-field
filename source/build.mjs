import { cp, mkdir, writeFile } from 'node:fs/promises';
import { studies } from './studies.mjs';
import { tools } from './utilities.js';

const out = new URL('../dist/', import.meta.url);
const source = new URL('./', import.meta.url);
await mkdir(new URL('assets/', out), { recursive: true });
for (const file of ['style.css', 'motion.js', 'art.js', 'utilities.js', 'workshop.js', 'model-blueprints.js', 'viewer.js']) {
  await cp(new URL(file, source), new URL('assets/' + file, out));
}
await writeFile(new URL('.nojekyll', out), '');

const escape = (text) => text.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const cover = (study, extra = '') => `<figure class="cover ${extra}">
  <img src="../assets/${study.id}.webp"
       srcset="../assets/${study.id}-640.webp 640w, ../assets/${study.id}.webp 1536w"
       sizes="${study.id === 'relay' ? '100vw' : '(max-width: 800px) 94vw, 56vw'}"
       width="1536" height="1024" alt="${escape(study.alt)}" fetchpriority="high">
  <figcaption>${escape(study.caption)}</figcaption>
</figure>`;
const intro = (study) => `<div class="hero-copy">
  <p class="genre">${study.genre}</p>
  <h1>${study.headline.map((line) => `<span>${escape(line)}</span>`).join('')}</h1>
  <p class="lede">${escape(study.note)}</p>
  ${['relay','night-dial'].includes(study.id)
    ? `<button class="action" type="button" data-play aria-pressed="false">${study.action}</button>`
    : `<a class="action" href="${({formwerk:'#word',umbra:'#progress',intertidal:'#progress'})[study.id] || '#explore'}">${study.action}</a>`}
</div>`;

const art = {
  kiln: (s) => cover(s, 'kiln-photo'),
  datum: (s) => cover(s, 'datum-photo'),
  brasa: (s) => cover(s, 'brasa-photo'),
  relay: (s) => `<div class="film-frame" data-shot="0">
    ${cover(s)}
    <div class="film-card" aria-hidden="true"><i></i><strong>Carrier lost</strong></div>
    <div class="film-meter" aria-hidden="true"><span data-clock>00:00</span><div><b></b></div><span data-runtime>00:09</span></div>
  </div>`,
  scree: (s) => cover(s, 'scree-photo'),
  formwerk: () => `<figure class="type-stage">
    <div class="type-ruler"><span>100</span><span>300</span><span>500</span><span>700</span><span>900</span></div>
    <strong data-specimen>FORM</strong>
    <figcaption>Geist Variable / Wght <output data-weight>240</output></figcaption>
  </figure>`,
  'night-dial': () => `<div class="turntable"><div class="tonearm"></div><div class="record" aria-hidden="true">
    <div class="record-label"><b>ND</b><span data-record-side>SIDE A</span></div>
  </div><p>Original loops / <span data-current-tempo>84 BPM</span></p></div>`,
  umbra: () => `<figure class="sky-stage"><canvas data-canvas role="img" aria-label="Diagram of the Moon passing through the shadow cast by Earth"></canvas>
    <figcaption><span>Earth’s shadow</span><span>Diagram to illustrate alignment</span></figcaption></figure>`,
  intertidal: () => `<figure class="shore-stage"><canvas data-canvas role="img" aria-label="Cross-section of three habitats on a rocky shore with a movable waterline"></canvas>
    <figcaption><span>Rocky coast</span><span>Habitat cross-section</span></figcaption></figure>`,
  offcut: () => `<div class="paper-stack" aria-hidden="true">
    <div class="sheet" data-cover="0"><small>Offcut / Misregister</small><b class="print-mark misprint"></b><span>A slight shift / 04</span></div>
    <div class="sheet" data-cover="1"><small>Offcut / The fold</small><b class="print-mark fold"></b><span>On the crease / 16</span></div>
    <div class="sheet" data-cover="2"><small>Offcut / Trim waste</small><b class="print-mark crop"></b><span>Outside the cut / 28</span></div>
  </div>`
};

const diagrams = {
  datum: `<figure class="drawing"><canvas data-canvas role="img" aria-label="Building section and marker for the selected floor"></canvas><figcaption>Section A / Coastal Library</figcaption></figure>`,
  scree: `<figure class="drawing"><canvas data-canvas role="img" aria-label="Illustrative course elevation profile with three segments"></canvas><figcaption>14 km / Elevation profile</figcaption></figure>`,
  kiln: `<figure class="kiln-detail"><div><img src="../assets/kiln.webp" width="1536" height="1024" alt="" loading="lazy"></div><figcaption>Detail / <span data-kiln-name>Bottle</span></figcaption></figure>`,
  formwerk: `<div class="input-group">
    <label for="word">Specimen text</label>
    <input id="word" data-word type="text" maxlength="12" value="FORM" autocomplete="off">
    <label for="weight">Weight</label>
    <input id="weight" data-dial type="range" min="100" max="900" value="240">
    <output data-readout for="weight">240</output>
    <div class="type-preview" data-specimen>FORM</div>
  </div>`,
  umbra: `<div class="input-group"><label for="progress">Moon position</label><input id="progress" data-dial type="range" min="0" max="100" value="19"><output data-readout for="progress">Penumbral</output></div>`,
  intertidal: `<div class="input-group"><label for="progress">Water level</label><input id="progress" data-dial type="range" min="0" max="100" value="83"><output data-readout for="progress">High tide</output></div>`
};

function workbench(s) {
  return `<section class="workbench" id="explore" tabindex="-1" aria-labelledby="explore-title">
    <div class="section-head"><h2 id="explore-title">${escape(s.second)}</h2><p>${escape(s.words)}</p></div>
    <div class="bench-grid">
      <div class="selection">
        <div class="choices" role="group" aria-label="${escape(s.nav)}">${s.entries.map(([tag, title], index) =>
          `<button class="choice" type="button" data-pick="${index}" aria-controls="selection-details" aria-pressed="${index === 0}"><span>${escape(tag)}</span><b>${escape(title)}</b></button>`
        ).join('')}</div>
        <div id="selection-details" class="reading" aria-live="polite" aria-atomic="true"><h3 data-detail-title>${escape(s.entries[0][2])}</h3><p data-detail-text>${escape(s.entries[0][3])}</p></div>
        ${s.id === 'night-dial' ? '<button class="action" type="button" data-play aria-pressed="false">Play the dial</button><p data-audio-error role="status"></p>' : ''}
        ${s.id === 'relay' ? '<button class="action" type="button" data-play aria-pressed="false">Play title sequence</button>' : ''}
      </div>
      ${['umbra','intertidal'].includes(s.id) ? '' : diagrams[s.id] || (s.id === 'offcut' ? art.offcut() : `<div class="bench-print" aria-hidden="true"><span data-print-tag>${escape(s.entries[0][0])}</span><b data-print-title>${escape(s.entries[0][s.id === 'brasa' ? 2 : 1])}</b></div>`)}
    </div>
  </section>`;
}

function workshop(s) {
  const t=tools[s.id];
  const controls=Object.entries(t.fields).map(([name,field])=>{
    const id='tool-'+name;
    let input;
    if(field.type==='select') {
      input=`<select id="${id}" name="${name}">${field.choices.map(([value,text])=>`<option value="${value}"${value===field.value?' selected':''}>${escape(text)}</option>`).join('')}</select>`;
    } else {
      const limits=field.type==='number'?` min="${field.min}" max="${field.max}" step="${field.step}" inputmode="decimal"`:'';
      input=`<input id="${id}" type="${field.type}" name="${name}" value="${field.value}"${limits} required>`;
    }
    return `<label for="${id}">${escape(field.label)}${input}</label>`;
  }).join('');
  return `<section class="workshop" id="tools" data-workshop tabindex="-1" aria-labelledby="tool-title">
  <div class="section-head"><h2 id="tool-title">${escape(t.title)}</h2><p>${escape(t.description)}</p></div>
  <div class="workshop-grid">
    <form aria-labelledby="tool-title"><div class="tool-fields">${controls}</div>
      <button class="action" type="submit">${t.submit||'Calculate'}</button>
      <p class="tool-status" data-result-status role="status"></p>
    </form>
    <div class="tool-result">
      ${s.id==='formwerk'?'<div class="type-sample" data-type-sample></div>':''}
      <div data-results></div>
      ${s.id==='formwerk'?'<pre data-code></pre><button class="quiet-action" type="button" data-copy>Copy CSS</button>':'<button class="quiet-action" type="button" data-download>Download CSV</button>'}
    </div>
  </div>
</section>
<section class="model-section" id="model" data-model tabindex="-1" aria-labelledby="model-title">
  <div class="model-heading"><div><p class="genre">3D model</p><h2 id="model-title">${escape(t.model)}</h2></div>
    <a class="quiet-action" href="../assets/models/${s.id}.glb" download>Download GLB</a></div>
  <div class="model-media">
    <img data-poster src="../assets/models/${s.id}.webp" width="900" height="563" loading="lazy" alt="${escape(t.model)} viewed from above and to the side">
    <div class="model-viewport" id="viewer" data-viewport hidden></div>
  </div>
  <div class="model-footer">
    <button class="action" type="button" data-open-model aria-controls="viewer" aria-expanded="false">Open 3D view</button>
    <div class="model-controls" data-model-controls aria-label="3D controls" role="group" hidden>
      <button type="button" data-orbit="left" aria-label="Rotate left">←</button>
      <button type="button" data-orbit="right" aria-label="Rotate right">→</button>
      <button type="button" data-orbit="up" aria-label="Tilt up">↑</button>
      <button type="button" data-orbit="down" aria-label="Tilt down">↓</button>
      <button type="button" data-orbit="in" aria-label="Zoom in">+</button>
      <button type="button" data-orbit="out" aria-label="Zoom out">−</button>
      <button type="button" data-orbit="reset">Reset view</button>
    </div>
  </div>
  <p class="tool-status" data-model-status role="status"></p>
</section>`;
}

function page(s) {
  const i = studies.indexOf(s);
  const next = studies[(i + 1) % studies.length];
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(s.note)}">
  <meta name="theme-color" content="${['#e8e0d2','#e7e8e3','#572018','#0c131c','#dedbcb','#d5fa50','#171b19','#12171e','#d7e7dc','#eddbc3'][i]}">
  <title>${escape(s.name)} — ${s.genre}</title>
  <link rel="icon" href="../assets/icon.png" type="image/png">
  <link rel="stylesheet" href="../assets/fonts.css"><link rel="stylesheet" href="../assets/style.css">
  <script type="module" src="../assets/motion.js"></script>
  <script type="module" src="../assets/workshop.js"></script>
</head><body class="${s.id}" data-study="${s.id}" data-pick="0">
  <a class="skip" href="#main">Skip to content</a>
  <header class="mast"><a class="brand" href="./" aria-label="${escape(s.name)} home">${escape(s.name)}</a><nav aria-label="Site"><a href="#tools">Tool</a><a href="#model">3D</a><a href="../">All sites</a></nav></header>
  <main id="main" class="study" tabindex="-1">
    <section class="hero" aria-label="${escape(s.genre)}">${intro(s)}${art[s.id](s)}${['umbra','intertidal'].includes(s.id) ? diagrams[s.id] : ''}</section>
    ${workbench(s)}
    ${workshop(s)}
  </main>
  <footer class="foot"><span>Motion Field / ${s.genre} concept</span><a href="../${next.id}/">Next study: ${escape(next.name)}</a></footer>
  <script type="application/json" id="study-data">${JSON.stringify(s.entries).replace(/</g, '\\u003c')}</script>
</body></html>`;
}
for (const s of studies) {
  await mkdir(new URL(s.id + '/', out), { recursive: true });
  await writeFile(new URL(s.id + '/index.html', out), page(s).replace(/[ \t]+$/gm,''));
}

await writeFile(new URL('index.html', out), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Ten independent websites that treat motion as part of the subject.">
<title>Motion Field — Ten studies in motion</title>
<link rel="icon" href="assets/icon.png" type="image/png">
<link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/style.css">
</head><body class="index-page">
<a class="skip" href="#collection">Skip to the studies</a>
<header class="mast"><a class="brand" href="./">Motion Field</a><nav aria-label="Collection"><a href="#collection">Browse the studies</a></nav></header>
<main><section class="index-hero"><div><p class="genre">A collection of independent websites</p><h1>Motion<br>Field<span>.</span></h1></div><p>Ten subjects, from fired clay to a lunar eclipse. Each has its own way of moving.</p></section>
<section class="index-grid" id="collection" aria-label="Ten studies">
${studies.map((s) => `<a class="index-card theme-${s.id}" href="${s.id}/">
  <div class="tile" aria-hidden="true">${s.alt ? `<img src="assets/${s.id}-640.webp" alt="" width="640" height="427" loading="lazy">` : `<span class="miniature">${({formwerk:'Aa','night-dial':'ND',umbra:'',intertidal:'',offcut:'Offcut'})[s.id]}</span>`}</div>
  <div class="index-key"><h2>${escape(s.name)}</h2><span>${s.genre}</span></div><p>${escape(tools[s.id].title)} · 3D model</p></a>`).join('')}
</section></main><footer class="foot"><span>Motion Field / Web design &amp; creative coding</span><a href="https://github.com/Rerukuka/motion-field">Source on GitHub</a></footer>
</body></html>`);

