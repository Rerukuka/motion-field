const number = (label, value, min, max, step = 1) => ({ label, value, min, max, step, type:'number' });
const time = (label, value) => ({label,value,type:'time'});
const options = (label, value, choices) => ({label,value,choices,type:'select'});

export const tools = {
  kiln: {
    title:'Clay shrinkage calculator', model:'Three thrown forms',
    description:'Enter the finished dimension and the total shrinkage measured for your clay body.',
    fields:{size:number('Fired size (mm)',120,1,3000,.1),shrinkage:number('Linear shrinkage (%)',12,0,50,.1)}
  },
  datum: {
    title:'Plan scale calculator', model:'Coastal library massing',
    description:'Measure a rectangular room on a printed plan to find its actual dimensions and area.',
    fields:{length:number('Length on paper (mm)',84,.1,1200,.1),width:number('Width on paper (mm)',44,.1,1200,.1),scale:options('Scale','50',[['20','1:20'],['50','1:50'],['100','1:100'],['200','1:200']])}
  },
  brasa: {
    title:'Table order planner', model:'The ember grill',
    description:'Build an order from the sample menu and split the estimated bill by the number of guests.',
    fields:{peppers:number('Blistered peppers · €8',2,0,99),sardines:number('Grilled sardines · €17',2,0,99),flan:number('Burnt milk flan · €7',1,0,99),guests:number('Guests',2,1,99)}
  },
  relay: {
    title:'Title cue sheet', model:'Ridge relay antenna',
    description:'Set the length of each shot. Apply the timings to the title sequence and export its cue sheet.',
    submit:'Apply timings',
    fields:{ridge:number('The ridge (seconds)',3,.1,90,.01),station:number('The station (seconds)',3,.1,90,.01),door:number('The door (seconds)',3,.1,90,.01)}
  },
  scree: {
    title:'Trail time estimator', model:'The Traverse terrain',
    description:'Estimate moving time from your flat pace and the extra minutes you allow per 100 m of climbing.',
    fields:{distance:number('Distance (km)',14,.1,500,.1),climb:number('Elevation gain (m)',900,0,25000),pace:number('Flat pace (min/km)',7,1,60,.1),penalty:number('Extra min per 100 m climb',4,0,60,.1)}
  },
  formwerk: {
    title:'Type CSS generator', model:'Extruded lettering',
    description:'Adjust Geist’s weight, size and tracking, preview your specimen and copy the CSS.',
    submit:'Preview settings',
    fields:{weight:number('Weight',560,100,900),size:number('Size (px)',48,8,200),tracking:number('Letter spacing (px)',-1.5,-8,20,.1)}
  },
  'night-dial': {
    title:'Playback mixer', model:'Night Dial turntable',
    description:'Adjust volume and choose whether to keep each loop’s original tempo or use a custom BPM.',
    submit:'Apply to playback',
    fields:{volume:number('Volume (%)',36,0,100),mode:options('Tempo mode','track',[['track','Original track tempo'],['custom','Custom tempo']]),tempo:number('Custom tempo (BPM)',84,45,180)}
  },
  umbra: {
    title:'Shadow coverage calculator', model:'Sun, Earth and Moon',
    description:'Change the center-to-center offset in a simplified cross-section. The tool estimates the part of the lunar disk in each shadow.',
    fields:{offset:number('Offset (% of model range)',35,0,100)}
  },
  intertidal: {
    title:'Tide interpolation', model:'Rocky shore habitats',
    description:'Use consecutive low and high tides to estimate when the water reaches a chosen fraction of the rise. This is a mathematical sketch.',
    fields:{low:time('Low tide','07:15'),high:time('Following high tide','13:35'),rise:number('Fraction of the rise (%)',50,0,100)}
  },
  offcut: {
    title:'Booklet imposition planner', model:'Folded print signature',
    description:'Plan saddle-stitch printing. Enter the number of pages and get the left and right positions on both sides of every sheet.',
    fields:{pages:number('Pages, including covers',14,1,120),binding:options('Reading direction','ltr',[['ltr','Left to right'],['rtl','Right to left']])}
  }
};

const rows = (...lists) => ({ header:['Measure','Result'],rows:lists });
const fixed = (n, digits=1) => n.toFixed(digits);
const euros = cents => '€'+fixed(cents/100,2);
const minutes = (total) => {
  const n=Math.round(total), hours=Math.floor(n/60);
  return hours ? hours+' h '+n%60+' min' : n+' min';
};
const clock = (minutes) => {
  const day = Math.floor(minutes/1440), local = minutes%1440;
  return String(Math.floor(local/60)).padStart(2,'0')+':'+String(local%60).padStart(2,'0')+(day?' (+1 day)':'');
};
export const timecode = (centis) => {
  const m=Math.floor(centis/6000),s=Math.floor(centis/100)%60,c=centis%100;
  return [m,s].map(v=>String(v).padStart(2,'0')).join(':')+'.'+String(c).padStart(2,'0');
};

function parse(id, input) {
  const values = {};
  for (const [key,field] of Object.entries(tools[id].fields)) {
    if(id==='night-dial' && key==='tempo' && values.mode==='track') continue;
    const raw = String(input[key] ?? '').trim();
    const fail = () => { throw new Error(field.label+' is outside the supported range.'); };
    if (field.type==='time') {
      const parts=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(raw);
      if(!parts) fail();
      values[key]=Number(parts[1])*60+Number(parts[2]);
    } else if (field.type==='select') {
      if(!field.choices.some(([value])=>value===raw)) fail();
      values[key]=raw;
    } else {
      const n=Number(raw);
      if(!raw||!Number.isFinite(n)||n<field.min||n>field.max||Math.abs((n-field.min)/field.step-Math.round((n-field.min)/field.step))>1e-7) fail();
      values[key]=n;
    }
  }
  return values;
}

function overlap(a,b,d) {
  if (d >= a+b) return 0;
  if (d <= Math.abs(a-b)) return Math.PI*Math.min(a,b)**2;
  const aAngle=Math.acos((d*d+a*a-b*b)/(2*d*a));
  const bAngle=Math.acos((d*d+b*b-a*a)/(2*d*b));
  return a*a*aAngle+b*b*bAngle-.5*Math.sqrt((-d+a+b)*(d+a-b)*(d-a+b)*(d+a+b));
}

const calculators = {
  kiln({size,shrinkage}) {
    const wet=size/(1-shrinkage/100);
    return rows(['Size to make',fixed(wet)+' mm'],['Shrinkage allowance',fixed(wet-size)+' mm']);
  },
  datum({length,width,scale}) {
    const l=length*Number(scale)/1000,w=width*Number(scale)/1000;
    const dimension = m => m<.1 ? fixed(m*1000,1)+' mm' : fixed(m,2)+' m';
    const area=l*w;
    return rows(['Length',dimension(l)],['Width',dimension(w)],['Rectangular area',area<.01?fixed(area*1e6,1)+' mm²':fixed(area,2)+' m²']);
  },
  brasa({peppers,sardines,flan,guests}) {
    const total=peppers*800+sardines*1700+flan*700;
    return rows(['Blistered peppers × '+peppers,euros(peppers*800)],['Grilled sardines × '+sardines,euros(sardines*1700)],
      ['Burnt milk flan × '+flan,euros(flan*700)],['Estimated total',euros(total)],['Per guest · '+guests,euros(total/guests)]);
  },
  relay({ridge,station,door}) {
    const durations=[ridge,station,door].map(v=>Math.round(v*100));
    const [a,b,c]=durations;
    return {header:['Scene','In','Out'],rows:[
      ['The ridge',timecode(0),timecode(a)],
      ['The station',timecode(a),timecode(a+b)],
      ['The door',timecode(a+b),timecode(a+b+c)],
      ['End',timecode(a+b+c),'—']
    ],update:{durations}};
  },
  scree({distance,climb,pace,penalty}) {
    const flat=distance*pace, gain=climb/100*penalty;
    return rows(['Flat equivalent',minutes(flat)],['Climbing allowance',minutes(gain)],['Estimated moving time',minutes(flat+gain)]);
  },
  formwerk({weight,size,tracking}) {
    return {...rows(['Weight',String(weight)],['Size',size+' px'],['Letter spacing',tracking+' px']),
      copy:`font-family: "Geist", sans-serif;\nfont-weight: ${weight};\nfont-size: ${size}px;\nletter-spacing: ${tracking}px;`,update:{weight,size,tracking}};
  },
  'night-dial'({volume,mode,tempo}) {
    if(mode==='track')return {...rows(['Tempo','Original track tempo'],['Volume level',volume+'%']),update:{volume,tempo:null}};
    return {...rows(['Beat interval',Math.round(60000/tempo)+' ms'],['Tempo',tempo+' BPM'],['Volume level',volume+'%']),update:{volume,tempo}};
  },
  umbra({offset}) {
    const distance=offset*.036;
    const inner=overlap(1.4,1,distance)/Math.PI;
    const outer=overlap(2.15,1,distance)/Math.PI;
    const state = inner>.99999 ? 'Total' : inner>0 ? 'Partial' : outer>0 ? 'Penumbral' : 'Outside shadow';
    return rows(['Phase',state],['Within the umbra',fixed(inner*100)+'%'],['Within penumbra only',fixed(Math.max(0,outer-inner)*100)+'%']);
  },
  intertidal({low,high,rise}) {
    const span=(high-low+1440)%1440;
    if(!span || span>720) throw new Error('Enter consecutive tides within twelve hours of one another.');
    const portion=Math.acos(1-2*rise/100)/Math.PI;
    const elapsed=Math.round(span*portion);
    return rows(['Estimated time at this water level',clock(low+elapsed)],['After low tide',minutes(elapsed)],['Before high tide',minutes(span-elapsed)]);
  },
  offcut({pages,binding}) {
    const sheets=Math.ceil(pages/4), total=sheets*4;
    const placed=(a,b)=> (binding==='ltr'?[a,b]:[b,a]).map(n=>n<=pages?n:'Blank').join(' | ');
    const out=Array.from({length:sheets},(_,i)=>[String(i+1),placed(total-i*2,1+i*2),placed(2+i*2,total-1-i*2)]);
    return {header:['Sheet','Front · left | right','Back · left | right'],rows:out,note:sheets+' sheets · '+(total-pages)+' blank pages'};
  }
};

export function compute(id, input) {
  return calculators[id](parse(id,input));
}
