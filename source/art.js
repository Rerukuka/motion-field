function polygon(c, points, color) {
  c.fillStyle = color;
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath();
  c.fill();
}

function line(c, points, color, width = 1) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.stroke();
}

function disk(c, x, y, radius, color) {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2);
  c.fill();
}

function label(c, text, x, y, color, size = 15) {
  c.font = size + 'px monospace';
  c.fillStyle = color;
  c.fillText(text, x, y);
}

function noise(n) {
  const v = Math.sin(n * 93.823 + 34.312) * 43758.5453;
  return v - Math.floor(v);
}

const scenes = {
  datum(c, p) {
    c.fillStyle = '#e5e9e0'; c.fillRect(0, 0, 600, 300);
    for (let x = 20; x < 600; x += 20) line(c, [[x,0],[x,300]], '#d2dbd1');
    for (let y = 20; y < 300; y += 20) line(c, [[0,y],[600,y]], '#d2dbd1');
    polygon(c, [[0,106],[115,108],[195,141],[280,168],[364,230],[421,251],[600,267],[600,300],[0,300]], '#b4c1b4');
    polygon(c, [[55,85],[165,85],[165,125],[310,125],[310,170],[518,170],[518,186],[350,186],[350,220],[295,220],[295,172],[147,172],[147,130],[55,130]], '#4b5f56');
    for (let x = 335; x < 490; x += 34) line(c, [[x,134],[x,170]], '#667d70', 4);
    line(c, [[296,134],[514,134]], '#253c35', 4);
    const x = 110 + 356 * p, y = 76 + 83 * p;
    line(c, [[x,30],[x,y]], '#aa4836');
    disk(c, x, y, 7, '#aa4836');
    label(c, '+08.40', 30, 60, '#30443c');
    label(c, '+04.20', 195, 102, '#30443c');
    label(c, '+00.00', 436, 220, '#30443c');
  },
  scree(c, p) {
    c.fillStyle = '#d9d6c3'; c.fillRect(0, 0, 600, 300);
    const profile = [[38,233],[90,222],[142,190],[192,181],[245,151],[275,160],[314,102],[351,55],[393,73],[435,144],[482,162],[514,196],[571,222]];
    for (let y = 50; y < 250; y += 60) line(c, [[32,y],[580,y]], '#a6a390');
    polygon(c, [...profile,[571,248],[38,248]], '#b9b091');
    line(c, profile, '#615137', 4);
    let x = 38 + p * 533;
    const j = profile.findIndex(([v]) => v >= x);
    const [a,b] = [profile[Math.max(0,j-1)], profile[Math.max(0,j)]];
    const y = a[1] + (b[1]-a[1]) * (a[0] === b[0] ? 0 : (x-a[0])/(b[0]-a[0]));
    line(c, [[x,y],[x,251]], '#654421', 1.5);
    disk(c, x, y, 9, '#3a321f');
    disk(c, x, y, 4, '#d7e35b');
    [['0',38],['4',191],['9',374],['14 km',530]].forEach(([text,x]) => label(c,text,x,272,'#4f4938'));
  },
  umbra(c, p) {
    c.fillStyle = '#0c121a'; c.fillRect(0, 0, 600, 326);
    for (let i = 0; i < 185; i++) {
      const v = noise(i + 879);
      disk(c, noise(i+10)*600, noise(i+420)*326, .32+v*.95, 'rgba(197,215,217,' + (.16+v*.42) + ')');
    }
    polygon(c, [[176,133],[582,56],[582,294],[176,201]], '#273544');
    polygon(c, [[186,132],[587,151],[587,192],[186,198]], '#182029');
    for (const y of [95,231]) line(c, [[35,y],[131,y === 95 ? 134 : 196]], '#d89159');
    disk(c, 174, 166, 42, '#3d5867');
    polygon(c, [[146,144],[160,132],[181,135],[186,144],[175,153],[177,168],[157,171],[150,158]], '#708d85');
    polygon(c, [[184,177],[193,169],[205,176],[206,189],[183,204],[177,190]], '#78988a');
    label(c,'Earth',152,239,'#d5d9d9');
    label(c,'Sunlight',35,271,'#d3a783');
    const y = 60 + 195 * p, x = 437 + 43 * p, r = 23;
    disk(c, x, y, r, '#d7d2c1');
    c.save();
    c.beginPath(); c.arc(x,y,r,0,2*Math.PI); c.clip();
    const shadow = Math.max(0, 1 - Math.abs(p - .58) * 2.9);
    c.fillStyle = 'rgba(129,52,28,' + (.95 * shadow) + ')';
    c.fillRect(x-r, y-r, r*2, r*2);
    for (let i = 0; i < 14; i++) disk(c, x-21+noise(i+9)*42, y-21+noise(i+78)*42, 1+noise(i+5)*4, '#312e282e');
    c.restore();
    label(c,'Moon',x-16,y-34,'#e6d7ca');
  },
  intertidal(c, p) {
    c.fillStyle = '#c9d9c8'; c.fillRect(0,0,600,364);
    const rock = [[0,82],[88,103],[175,109],[228,147],[300,153],[350,202],[418,208],[476,252],[555,267],[600,291],[600,364],[0,364]];
    polygon(c, rock, '#746e59');
    polygon(c, [[0,160],[141,150],[241,201],[316,209],[389,255],[600,327],[600,364],[0,364]], '#575948');
    polygon(c, [[0,280],[160,238],[261,263],[398,294],[600,347],[600,364],[0,364]], '#43574a');
    for (let i=0; i<120; i++) {
      const x=noise(i+301)*600, y=noise(i+296)*360;
      if (y < 77+x*.35) continue;
      line(c, [[x,y],[x+2+noise(i+8)*11,y+2]], i%3 ? '#96917788' : '#292c2488');
    }
    for (let i=0; i<16; i++) disk(c, 25+noise(i+30)*190, 107+noise(i+48)*25, 2+noise(i+90)*4, '#b9ae76');
    for (let i=0; i<14; i++) disk(c, 232+noise(i+7)*110, 158+noise(i+81)*47, 2+noise(i+12)*4, '#272e29');
    for (let i=0; i<13; i++) {
      const x=420+noise(i+78)*170,y=275+noise(i+7)*32;
      line(c, [[x,y],[x-6,y-12],[x+3,y-23]], '#a5b37a', 3);
    }
    const water = 306 - p*187;
    c.fillStyle='#337b82a0'; c.fillRect(0,water,600,364-water);
    line(c, [[0,water],[600,water]], '#edf3d8', 2);
    for (let i=0; i<14; i++) {
      const x=noise(i+12)*570,y=water+noise(i+698)*(364-water);
      line(c, [[x,y],[x+18,y]], '#dcf1d244', 1);
    }
    label(c,'Upper',32,60,'#324439');
    label(c,'Middle',219,126,'#324439');
    label(c,'Lower',415,187,'#324439');
  }
};

export function mountArt(canvas, name, initial, reduced) {
  const context = canvas.getContext('2d');
  if (!context || !scenes[name]) return () => {};
  const height = name === 'umbra' ? 326 : name === 'intertidal' ? 364 : 300;
  let value = initial, frame = 0, previousSize = 0, previousValue = -1;
  const paint = () => {
    if (!canvas.clientWidth) return;
    const w = Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2));
    const h = Math.round(w * height / 600);
    if (w === previousSize && value === previousValue) return;
    previousSize=w;
    previousValue=value;
    if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; }
    context.setTransform(w/600,0,0,h/height,0,0);
    scenes[name](context, value);
  };
  new ResizeObserver(paint).observe(canvas);
  paint();
  return (target, instant = false) => {
    cancelAnimationFrame(frame);
    if (instant || reduced.matches) { value=target; paint(); return; }
    const start = performance.now(), from = value;
    function step(time) {
      const t = Math.min(1,(time-start)/650);
      value = from+(target-from)*(1-(1-t)**3);
      paint();
      if (t<1) frame=requestAnimationFrame(step);
    }
    frame=requestAnimationFrame(step);
  };
}
