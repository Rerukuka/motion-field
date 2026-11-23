import * as T from './three.module.min.js';

const material = (color, roughness=.78, metalness=0) => new T.MeshStandardMaterial({color, roughness, metalness});
const vec = (coords) => new T.Vector3(...coords);
const turn = Math.PI * 2;

function mesh(group, geometry, surface, position=[0,0,0]) {
  const object = new T.Mesh(geometry, surface);
  object.position.set(...position);
  group.add(object);
  return object;
}

const box = (g, dims, m, pos) => mesh(g, new T.BoxGeometry(...dims),m,pos);
const cylinder = (g, radii, height, m, pos, divisions=48) => mesh(g,new T.CylinderGeometry(...radii,height,divisions),m,pos);
const sphere = (g,r,m,pos,detail=24) => mesh(g,new T.SphereGeometry(r,detail,Math.ceil(detail*.66)),m,pos);
const plate = (g, radius, tube, m, pos, segments=56) => {
  const ring = mesh(g,new T.TorusGeometry(radius,tube,7,segments),m,pos);
  ring.rotation.x=Math.PI/2;
  return ring;
};
const lathe = (g, profile, m, pos, divisions=48) => mesh(g,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),divisions),m,pos);

function beam(g,start,end,width,m) {
  const a=vec(start),b=vec(end);
  const object=box(g,[width,a.distanceTo(b),width],m,a.clone().add(b).multiplyScalar(.5).toArray());
  object.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());
  return object;
}
function pipe(g,points,r,m,segments=20) {
  return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(vec)),segments,r,7,false),m);
}

function kiln(g) {
  const pedestal=material('#a79072'), brown=material('#573627',.62), olive=material('#71604a',.84), amber=material('#98603c',.68);
  box(g,[4.25,.30,2.05],pedestal,[0,-.15,0]);
  lathe(g,[[0,.03],[.39,.03],[.52,.12],[.58,.55],[.46,1.02],[.22,1.24],[.17,1.44],[.21,1.5],[.13,1.51],[.11,1.43],[.13,1.05],[.24,.54],[.17,.14],[0,.10]],brown,[-1.2,0,0]);
  lathe(g,[[0,.025],[.31,.03],[.49,.10],[.7,.24],[.75,.51],[.69,.54],[.65,.34],[.5,.21],[.22,.13],[0,.13]],olive,[.05,0,.4]);
  lathe(g,[[0,.02],[.46,.03],[.61,.18],[.67,.53],[.57,.89],[.41,1.19],[.49,1.26],[.42,1.29],[.33,1.16],[.44,.68],[.48,.4],[.34,.16],[0,.16]],amber,[1.16,0,-.25]);
}

function datum(g) {
  const base=material('#617971'), concrete=material('#b7b3a6'), dark=material('#3d4b47'), glazing=material('#428183',.38,.12), ledge=material('#867e6b');
  box(g,[5.2,.21,3.25],base,[0,-.22,0]);
  for(let step=0;step<5;step++) box(g,[1.12,.13+step*.17,3.07],ledge,[-2.03+step*.72,step*.085-.14,.03]);
  box(g,[3.33,.16,1.66],concrete,[.53,.5,-.23]);
  box(g,[3.91,.15,1.87],concrete,[.82,1.56,-.25]);
  box(g,[1.31,1.06,1.69],concrete,[-.54,1.02,-.24]);
  box(g,[2.42,.89,.10],glazing,[1.03,1.03,.5]);
  box(g,[2.42,.89,.09],dark,[1.03,1.03,-1.03]);
  box(g,[.09,.89,1.54],glazing,[2.23,1.03,-.23]);
  for(let i=0;i<9;i++) box(g,[.08,1.06,.2],concrete,[-.12+i*.29,1.04,.61]);
  for(let i=0;i<7;i++) box(g,[.34,.08,.81],concrete,[-2.08+i*.18,.09+i*.067,.72]);
}

function brasa(g) {
  const iron=material('#343634',.42,.45), fire=material('#ad4734'), coal=material('#3d2922'), stem=material('#667744'), food=material('#b34123',.42);
  box(g,[3.7,.32,2.68],iron,[0,.17,0]);
  for(const x of [-1.57,1.57]) for(const z of [-1.1,1.1]) box(g,[.15,.48,.15],iron,[x,-.15,z]);
  box(g,[3.42,.07,2.38],coal,[0,.37,0]);
  for(let i=0;i<35;i++){
    const lump=mesh(g,new T.DodecahedronGeometry(.126+(i%4)*.026),i%5===0?fire:coal,[i%7*.46-1.38,.47,Math.floor(i/7)*.44-.88]);
    lump.rotation.set(i*.77,i*2.4,i*.91);
  }
  for(let i=0;i<12;i++) beam(g,[-1.71,.66,-1.18+i*.213],[1.71,.66,-1.18+i*.213],.044,iron);
  for(let i=0;i<4;i++){
    const x=-1.13+i*.72,z=(i%2)*.65-.33;
    pipe(g,[[x-.26,.79,z+.02],[x-.08,.88,z+.18],[x+.12,.85,z+.13],[x+.28,.74,z-.04]],.105,food);
    pipe(g,[[x-.27,.79,z+.03],[x-.34,.82,z+.1],[x-.39,.91,z+.15]],.026,stem,8);
  }
}

function relay(g) {
  const mast=material('#adb8b3',.36,.52), base=material('#2d3b43'), dish=material('#d1d7d0',.55,.25), signal=material('#ec8852');
  box(g,[3.7,.18,2.7],base,[0,-.09,0]);
  for(const x of [-.46,.46]) for(const z of [-.42,.42]){
    beam(g,[x,0,z],[x*.73,2.18,z*.73],.065,mast);
    beam(g,[x,.12,z],[-x*.85,.84,z*.85],.032,mast);
    beam(g,[x*.85,.84,z*.85],[-x*.77,1.53,z*.77],.032,mast);
    beam(g,[x*.77,1.53,z*.77],[-x*.73,2.18,z*.73],.032,mast);
  }
  box(g,[1.05,.16,.99],base,[0,2.12,0]);
  const reflector=new T.Group();
  reflector.position.set(0,2.44,0);
  reflector.rotation.z=-.53;
  g.add(reflector);
  lathe(reflector,[[0,0],[.23,.025],[.53,.084],[.81,.19],[1,.32],[1,.36],[.78,.24],[.54,.13],[.27,.061],[0,.035]],dish,[0,0,0]);
  for(let i=0;i<3;i++){
    const a=i*turn/3;
    beam(reflector,[Math.cos(a)*.84,.26,Math.sin(a)*.84],[0,.88,0],.037,mast);
  }
  sphere(reflector,.092,signal,[0,.87,0]);
  box(g,[.46,.32,.60],base,[1.22,.16,.5]);
  box(g,[.16,.15,.014],signal,[1.22,.18,.807]);
}

function scree(g) {
  const height=(x,z)=>.28+1.66*Math.exp(-((x-.62)**2*.49+(z+.31)**2*1.08))+.13*Math.sin(x*4.2+z)*Math.sin(z*3.8);
  const geometry=new T.PlaneGeometry(5.4,3.6,38,27).rotateX(-Math.PI/2);
  const points=geometry.attributes.position, colors=[];
  const rock=new T.Color('#9b5c45'), summit=new T.Color('#c0ac90'), low=new T.Color('#61564b');
  for(let i=0;i<points.count;i++){
    const y=height(points.getX(i),points.getZ(i));
    points.setY(i,y);
    const v=y<.75?low.clone().lerp(rock,y/.75):rock.clone().lerp(summit,Math.min(1,(y-.75)/1.3));
    colors.push(v.r,v.g,v.b);
  }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  mesh(g,geometry,new T.MeshStandardMaterial({vertexColors:true,flatShading:true,side:T.DoubleSide}));
  box(g,[5.4,.29,3.6],material('#756554'),[0,-.15,0]);
  const route=[[-2.45,.97],[-1.7,.67],[-1.07,-.1],[-.4,-.78],[.02,.04],[.47,-.6],[.88,-.3],[1.36,.26],[2.08,.67],[2.42,.97]];
  const path=route.map(([x,z])=>[x,height(x,z)+.085,z]);
  pipe(g,path,.031,material('#e1ef69'),44);
  for(const p of [path[0],path[6],path.at(-1)]) sphere(g,.064,material('#f4f3d2'),p,14);
}

function formwerk(g) {
  const ground=material('#a7b13c'), black=material('#253326',.42), side=material('#657349');
  box(g,[5.4,.20,2.36],ground,[0,-.1,0]);
  const glyphs=[
    [[0,0,1,5],[1,4,2,1],[1,2,1.55,1]],
    [[0,1,1,3],[2,1,1,3],[.5,0,2,1],[.5,4,2,1]],
    [[0,0,1,5],[1,4,1.65,1],[2.15,2.65,.85,1.35],[1,2.25,1.3,.85],[1.85,.85,.83,1.75],[2.45,0,.61,1.2]],
    [[0,0,.8,5],[2.55,0,.8,5],[.8,2.82,.8,1.37],[1.5,2.1,.8,1.25],[1.97,2.82,.7,1.37]]
  ];
  const unit=.276;
  glyphs.forEach((glyph,i)=>{
    for(const [x,y,w,h] of glyph) box(g,[w*unit,h*unit,.33],[black,black,side,black][i],[(x+w/2)*unit-2.07+i*1.1,(y+h/2)*unit+.006,0]);
  });
  for(let i=0;i<9;i++) box(g,[.013,.013,.19],black,[-2.23+i*.55,.018,.85]);
}

function night(g) {
  const deck=material('#384239'), record=material('#121916',.34), groove=material('#2e3931',.38), brass=material('#dbaf65',.53,.36), silver=material('#b9bdb1',.33,.59);
  box(g,[4,.34,3.32],deck,[0,.03,0]);
  cylinder(g,[1.29,1.29],.14,silver,[-.38,.255,.06]);
  cylinder(g,[1.23,1.23],.04,record,[-.38,.352,.06]);
  for(let i=0;i<13;i++) plate(g,.49+i*.052,.0045,groove,[-.38,.377,.06],48);
  cylinder(g,[.41,.41],.018,brass,[-.38,.38,.06]);
  cylinder(g,[.035,.035],.084,silver,[-.38,.42,.06],18);
  cylinder(g,[.19,.20],.19,silver,[1.34,.3,-.99],28);
  pipe(g,[[1.34,.42,-.99],[1.34,.47,-.44],[1.11,.43,.28],[.89,.405,.63]],.035,silver,18);
  box(g,[.18,.13,.26],record,[.86,.39,.70]).rotation.y=.32;
  box(g,[.34,.045,.36],brass,[-1.64,.225,1.31]);
}

function umbra(g) {
  const sun=material('#f7b465'), earth=material('#317278'), rock=material('#c4b8a0');
  const star=sphere(g,.6,sun,[-1.77,0,0],32);
  star.material.emissive.set('#fca54b');
  star.material.emissiveIntensity=.34;
  sphere(g,.38,earth,[0,0,0],28);
  const moon=sphere(g,.167,rock,[1.7,.18,.08],24);
  for(let i=0;i<8;i++){
    const a=i*2.399,d=.145,y=.057*Math.sin(i*1.73);
    sphere(g,.026,material('#8d8071'),[moon.position.x+Math.cos(a)*d,moon.position.y+y,moon.position.z+Math.sin(a)*d],10);
  }
  const ghost=material('#626d75');
  ghost.transparent=true;ghost.opacity=.20;ghost.depthWrite=false;
  const cone=cylinder(g,[.40,.14],2.47,ghost,[1.2,0,0],32);
  cone.rotation.z=Math.PI/2;
  const orbital=plate(g,1.63,.012,material('#687e81'),[0,0,0],82);
  orbital.rotation.x=Math.PI*.57;
  const ray=material('#ce913f',.7);
  for(let i=0;i<2;i++) beam(g,[-2.15,(-1)**i*.54,0],[-.05,(-1)**i*.43,0],.009,ray);
}

function intertidal(g) {
  const clay=material('#716d56'), stone=material('#484d42'), moss=material('#b2a76b'), shell=material('#2d4444'), green=material('#536f46');
  const water=material('#42888a',.25);
  water.transparent=true;water.opacity=.48;water.depthWrite=false;
  box(g,[4.6,.24,2.84],stone,[0,-.12,0]);
  for(let i=0;i<5;i++){
    const width=.94,left=-1.83+i*.915, h=1.12-i*.17;
    box(g,[width,h,2.73],i%2?stone:clay,[left,h/2,0]);
    for(let j=0;j<5;j++){
      const x=left+Math.sin(i*3+j)*.31,z=j*.48-.92;
      if(i<2) sphere(g,.07+(j%3)*.023,moss,[x,h,z],10);
      else if(i<4){
        const bit=sphere(g,.088,shell,[x,h+.043,z],12);
        bit.scale.set(.65,1.2,.86);
      } else {
        pipe(g,[[x,h,z],[x-.065,h+.12,z+.04],[x+.027,h+.27,z-.01],[x-.032,h+.36,z-.045]],.018,green,10);
      }
    }
  }
  box(g,[2.54,.067,2.90],water,[1.07,.53,0]);
}

function offcut(g) {
  const ink=material('#a44132'), pale=material('#f0ddbd'), cream=material('#d5b993'), base=material('#71523e');
  box(g,[4.6,.16,3.65],base,[0,-.11,0]);
  for(let i=0;i<8;i++) box(g,[3.35,.027,2.65],i%2?pale:cream,[-.3+i*.007,.031+i*.027,-.2+i*.029]);
  box(g,[3.36,.061,2.68],ink,[-.25,.275,.03]);
  const folded=box(g,[1.75,.044,2.62],pale,[.61,.68,.04]);
  folded.rotation.z=.49;
  const line=plate(g,.42,.012,cream,[-1.1,.313,.1]);
  line.scale.set(.95,1.06,1);
  for(let i=0;i<3;i++) box(g,[.73-i*.11,.006,.026],cream,[-1,.312,.63+i*.12]);
  for(let i=0;i<2;i++) beam(g,[-.22,.313,-1.18+i*2.31],[-.22,.313,-.96+i*2.14],.02,cream);
}

const builders={kiln,datum,brasa,relay,scree,formwerk,'night-dial':night,umbra,intertidal,offcut};
export function modelFor(id) {
  const model=new T.Group();
  model.name=id;
  builders[id](model);
  return model;
}
