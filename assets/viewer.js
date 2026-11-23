import * as T from './three.module.min.js';
import { modelFor } from './model-blueprints.js';

export function createViewer(root, id, label) {
  const frame = root.querySelector('[data-viewport]');
  const canvas = document.createElement('canvas');
  const renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'low-power'});
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, .03, 100);
  const object = modelFor(id);
  const bounds = new T.Box3().setFromObject(object);
  const center = bounds.getCenter(new T.Vector3());
  const radius = bounds.getBoundingSphere(new T.Sphere()).radius;
  center.y-=radius*.11;
  const background = getComputedStyle(root).getPropertyValue('--model-paper').trim() || '#c1b5a5';
  scene.background = new T.Color(background);
  scene.add(object);
  scene.add(new T.HemisphereLight('#fff2dd','#475354',2.28));
  const key=new T.DirectionalLight('#fff3df',2.16);
  key.position.set(-4,8,4); scene.add(key);
  const edge=new T.DirectionalLight('#c8e0ed',.85);
  edge.position.set(4,3,-3); scene.add(edge);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.02;
  canvas.tabIndex=0;
  canvas.setAttribute('aria-label',label+'. Use arrow keys to rotate, plus or minus to zoom, and Home to reset.');
  canvas.setAttribute('role','img');
  frame.append(canvas);
  let theta=.64, phi=.99, zoom=1, drag=null, renderId=0, lastWidth=0, lastHeight=0;

  function render() {
    const {clientWidth:width,clientHeight:height}=frame;
    if (!width || !height) return;
    if(width!==lastWidth || height!==lastHeight){
      lastWidth=width;lastHeight=height;
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.updateProjectionMatrix();
    }
    const halfFov=T.MathUtils.degToRad(camera.fov/2);
    const fit=Math.min(halfFov,Math.atan(Math.tan(halfFov)*camera.aspect));
    const distance=radius/Math.sin(fit)/zoom*.97;
    camera.position.set(
      center.x+distance*Math.sin(phi)*Math.sin(theta),
      center.y+distance*Math.cos(phi),
      center.z+distance*Math.sin(phi)*Math.cos(theta)
    );
    camera.lookAt(center);
    renderer.render(scene,camera);
    canvas.dataset.ready='true';
  }
  function schedule() {
    if (renderId) return;
    renderId=requestAnimationFrame(() => {renderId=0;render();});
  }
  function adjust(action) {
    switch(action){
      case 'left': theta-=.25; break;
      case 'right': theta+=.25; break;
      case 'up': phi=Math.max(.19,phi-.18); break;
      case 'down': phi=Math.min(2.87,phi+.18); break;
      case 'in': zoom=Math.min(2.3,zoom*1.2); break;
      case 'out': zoom=Math.max(.63,zoom/1.2); break;
      case 'reset': theta=.64;phi=.99;zoom=1; break;
    }
    schedule();
  }
  canvas.addEventListener('keydown', event=>{
    const control={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out',Home:'reset'}[event.key];
    if(control){event.preventDefault();adjust(control);}
  });
  canvas.addEventListener('pointerdown', event=>{
    if (drag || event.button!==0) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event=>{
    if (event.pointerId!==drag?.id) return;
    theta-=(event.clientX-drag.x)*.009;
    phi=T.MathUtils.clamp(phi+(event.clientY-drag.y)*.008,.19,2.87);
    drag.x=event.clientX; drag.y=event.clientY; schedule();
  });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(type,event=>{
    if(event.pointerId===drag?.id) drag=null;
  });
  const handlers=new AbortController();
  canvas.addEventListener('webglcontextlost',()=>root.dispatchEvent(new Event('model-unavailable')),{once:true,signal:handlers.signal});
  root.querySelectorAll('[data-orbit]').forEach(button=>button.addEventListener('click',()=>adjust(button.dataset.orbit),{signal:handlers.signal}));
  const observer=new ResizeObserver(schedule);
  observer.observe(frame);
  schedule();
  return {dispose(){
    handlers.abort();
    observer.disconnect();
    cancelAnimationFrame(renderId);
    object.traverse(node=>{if(node.isMesh){node.geometry.dispose();node.material.dispose();}});
    renderer.dispose();
    canvas.remove();
  }};
}
