import { mountArt } from './art.js';
import { timecode } from './utilities.js';

const body = document.body;
const site = body.dataset.study;
const entries = JSON.parse(document.querySelector('#study-data').textContent);
const pickers = [...document.querySelectorAll('[data-pick]')].filter(el => el !== body);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const dial = document.querySelector('[data-dial]');
const readout = document.querySelector('[data-readout]');
const canvas = document.querySelector('[data-canvas]');
const title = document.querySelector('[data-detail-title]');
const detail = document.querySelector('[data-detail-text]');
const print = document.querySelector('.bench-print');
const word = document.querySelector('[data-word]');
const specimens = [...document.querySelectorAll('[data-specimen]')];
const playButtons = [...document.querySelectorAll('[data-play]')];
const presets = {
  datum:[.05,.49,.92], scree:[.15,.57,.86],
  umbra:[.19,.37,.58], intertidal:[.83,.52,.13], formwerk:[240,560,880]
};
const paint = canvas ? mountArt(canvas,site,presets[site][0],reduced) : () => {};
let selected = 0;

function displaySelection(index) {
  selected = index;
  body.dataset.pick = index;
  pickers.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  title.textContent = entries[index][2];
  detail.textContent = entries[index][3];
  if (print) {
    print.querySelector('[data-print-tag]').textContent = site==='relay' ? pickers[index].querySelector('span').textContent : entries[index][0];
    print.querySelector('[data-print-title]').textContent = entries[index][site === 'brasa' ? 2 : 1];
    if (site === 'brasa' && !reduced.matches) {
      print.classList.remove('is-changing');
      void print.offsetWidth;
      print.classList.add('is-changing');
    }
  }
  if (site === 'kiln') document.querySelector('[data-kiln-name]').textContent = entries[index][1];
}

function setWeight(value) {
  dial.value = value;
  readout.textContent = value;
  document.querySelector('[data-weight]').textContent = value;
  specimens.forEach(element => { element.style.fontWeight = value; });
  dial.setAttribute('aria-valuetext', 'Weight ' + value);
}

function syncDialChoice(value) {
  const index = presets[site].indexOf(value);
  if (index >= 0) {
    displaySelection(index);
  } else {
    pickers.forEach(button => button.setAttribute('aria-pressed', 'false'));
    if (site !== 'formwerk') {
      const state = readout.textContent;
      title.textContent = state;
      detail.textContent = site === 'umbra' ? 'Use the Moon position control to compare shadow states.' : 'Use the water level control to uncover the habitats.';
    }
  }
}

function setDiagram(value, instant) {
  paint(value, instant);
  if (!dial) return;
  dial.value = Math.round(value * 100);
  if (site === 'umbra') {
    const distance = Math.abs(value - .58);
    readout.textContent = distance < .09 ? 'Total' : distance < .23 ? 'Partial' : distance < .45 ? 'Penumbral' : 'Outside the shadow';
  } else {
    readout.textContent = value >= .68 ? 'High tide' : value >= .32 ? 'Mid tide' : 'Low tide';
  }
  dial.setAttribute('aria-valuetext',readout.textContent);
}

let film = null;
if (site === 'relay') {
  const stage = document.querySelector('.film-frame');
  const meter = document.querySelector('.film-meter b');
  const clock = document.querySelector('[data-clock]');
  const runtime = document.querySelector('[data-runtime]');
  const card = document.querySelector('.film-card strong');
  let elapsed = 0, last = 0, requested = 0, playing = false;
  let starts=[0,3000,6000], length=9000;
  const formatMS=ms=>[Math.floor(ms/60000),Math.floor(ms/1000)%60].map(v=>String(v).padStart(2,'0')).join(':');
  const update = () => {
    const shot = elapsed>=starts[2]?2:elapsed>=starts[1]?1:0;
    stage.dataset.shot = shot;
    card.textContent = entries[shot][1];
    const timecode = formatMS(elapsed);
    if (clock.textContent !== timecode) clock.textContent = timecode;
    meter.style.transform = 'scaleX(' + elapsed/length + ')';
  };
  const state = (active, paused = false) => {
    playing = active;
    body.classList.toggle('is-playing', active);
    body.classList.toggle('is-paused', paused);
    playButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Pause sequence' : paused ? 'Resume sequence' : 'Play title sequence';
    });
  };
  const tick = (now) => {
    if (!playing) return;
    elapsed = Math.min(length,elapsed+now-last);
    last = now;
    update();
    if (elapsed < length) requested=requestAnimationFrame(tick);
    else { state(false); elapsed=0; }
  };
  film = {
    toggle(button) {
      if (playing) { cancelAnimationFrame(requested); state(false,true); return; }
      if (button.closest('.workbench')) {
        document.querySelector('.hero').scrollIntoView({block:'start'});
        playButtons[0].focus({preventScroll:true});
      }
      last=performance.now(); state(true); update(); requested=requestAnimationFrame(tick);
    },
    seek(index) { elapsed=starts[index]; update(); if (!playing) state(false,true); }
  };
  window.addEventListener('motion-field:relay', ({detail:{durations:[a,b,c]}}) => {
    cancelAnimationFrame(requested);
    state(false);
    starts=[0,a*10,(a+b)*10];length=(a+b+c)*10;
    pickers.forEach((button,i)=>{button.querySelector('span').textContent=timecode(starts[i]/10);});
    print.querySelector('[data-print-tag]').textContent=timecode(starts[selected]/10);
    elapsed=0;runtime.textContent=formatMS(length);update();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) { cancelAnimationFrame(requested); state(false,true); }
  });
}

const tracks = [
  {bpm:84, root:110, notes:[0,null,7,null,12,7,null,3], type:'sine'},
  {bpm:108,root:98, notes:[0,3,null,7,0,10,7,null],type:'triangle'},
  {bpm:66,root:73.42,notes:[0,null,5,null,7,null,12,null],type:'sine'}
];
let audio, master, timer, beat=0, audioOn=false, audioPending=false, tempo, volume=.36;
function synth(frequency, when, duration, peak, type) {
  const oscillator = audio.createOscillator(), envelope = audio.createGain();
  oscillator.frequency.value=frequency;
  oscillator.type=type;
  envelope.gain.setValueAtTime(.0001,when);
  envelope.gain.exponentialRampToValueAtTime(peak,when+.035);
  envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
  oscillator.connect(envelope).connect(master);
  oscillator.start(when); oscillator.stop(when+duration+.01);
}
function beatLoop() {
  const track = tracks[selected], interval = 60/(tempo||track.bpm), when=audio.currentTime+.015;
  const note=track.notes[beat%track.notes.length];
  if (beat%2===0) synth(track.root/2,when,interval*.76,.24,'sine');
  if (note!==null) synth(track.root*2**(note/12),when,interval*.92,.15,track.type);
  beat++;
  timer=setTimeout(beatLoop,interval*1000);
}
function updateAudio() {
  body.classList.toggle('is-playing',audioOn);
  playButtons.forEach(button => {
    button.setAttribute('aria-pressed',String(audioOn));
    button.textContent=audioOn ? 'Pause the dial' : 'Play the dial';
  });
}
async function toggleAudio() {
  if (audioPending) return;
  audioPending=true;
  const error=document.querySelector('[data-audio-error]');
  try {
    if (audioOn) {
      clearTimeout(timer); audioOn=false;
      master.gain.setTargetAtTime(.0001,audio.currentTime,.035);
    } else {
      audio ??= new AudioContext();
      if (!master) { master=audio.createGain(); master.connect(audio.destination); }
      await audio.resume();
      master.gain.setTargetAtTime(volume,audio.currentTime,.035);
      audioOn=true; beatLoop();
    }
    error.textContent='';
  } catch {
    error.textContent='Audio could not start in this browser.';
  } finally {
    audioPending=false;
  }
  updateAudio();
}

pickers.forEach((button,index) => button.addEventListener('click', () => {
  displaySelection(index);
  const value=presets[site]?.[index];
  if (site === 'formwerk') setWeight(value);
  else if (canvas) {
    setDiagram(value);
    if (dial) {
      canvas.scrollIntoView({block:'center',behavior:reduced.matches ? 'instant' : 'smooth'});
    }
  }
  if (film) {
    film.seek(index);
    document.querySelector('.hero').scrollIntoView({block:'start',behavior:reduced.matches ? 'instant' : 'smooth'});
    playButtons[0].focus({preventScroll:true});
  }
  if (site === 'night-dial') {
    beat=0; document.querySelector('[data-record-side]').textContent='SIDE ' + 'ABC'[index];
    document.querySelector('[data-current-tempo]').textContent=(tempo||tracks[selected].bpm)+' BPM';
    if (audioOn) { clearTimeout(timer); beatLoop(); }
  }
}));

if (word) word.addEventListener('input', () => {
  const text = word.value.trim() || 'FORM';
  specimens.forEach(element => {
    element.textContent=text;
    element.style.setProperty('--specimen-length', Math.max(4, [...text].length));
  });
});
if (dial) {
  if (site === 'formwerk') setWeight(presets[site][0]);
  else setDiagram(presets[site][0], true);
  dial.addEventListener('input', () => {
    const value=Number(dial.value);
    if (site === 'formwerk') setWeight(value);
    else setDiagram(value/100,true);
    syncDialChoice(site === 'formwerk' ? value : value/100);
  });
}
playButtons.forEach(button => button.addEventListener('click', () => film ? film.toggle(button) : toggleAudio()));

if (site === 'night-dial') {
  const turntable = document.querySelector('.turntable');
  new IntersectionObserver(([entry]) => turntable.classList.toggle('is-offscreen', !entry.isIntersecting)).observe(turntable);
  window.addEventListener('motion-field:night-dial', ({detail})=>{
    tempo=detail.tempo;volume=detail.volume/100;
    document.querySelector('[data-current-tempo]').textContent=(tempo||tracks[selected].bpm)+' BPM';
    if(audioOn) {
      master.gain.setTargetAtTime(volume,audio.currentTime,.035);
      clearTimeout(timer);beatLoop();
    }
  });
}
