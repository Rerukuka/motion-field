import { compute, tools } from './utilities.js';

const root=document.querySelector('[data-workshop]');
const id=document.body.dataset.study;
const definition=tools[id];
const form=root.querySelector('form');
const results=root.querySelector('[data-results]');
const pre=root.querySelector('[data-code]');
const message=root.querySelector('[data-result-status]');
const sample=root.querySelector('[data-type-sample]');
const exportButton=root.querySelector('[data-download],[data-copy]');
const storeKey='motion-field:tools:'+id+':1';
let latest;
let previousInput;

function syncTempoField() {
  if(id!=='night-dial')return;
  form.elements.tempo.disabled=form.elements.mode.value==='track';
}

function render(data) {
  const {header,rows,note,copy,update}=data;
  const table=document.createElement('table');
  const caption=table.createCaption();
  caption.className='visually-hidden';
  caption.textContent=definition.title+' results';
  const headings=table.createTHead().insertRow();
  for(const text of header){
    const cell=document.createElement('th');cell.scope='col';cell.textContent=text;headings.append(cell);
  }
  const body=table.createTBody();
  for(const values of rows){
    const row=body.insertRow();
    for(const [index,text] of values.entries()){
      const cell=document.createElement(index ? 'td' : 'th');
      if(!index) cell.scope='row';
      cell.textContent=text;row.append(cell);
    }
  }
  results.replaceChildren(table);
  if(note){
    const summary=document.createElement('p');summary.textContent=note;results.append(summary);
  }
  if(pre)pre.textContent=copy;
  if(sample){
    sample.style.fontWeight=update.weight;
    sample.style.setProperty('--sample-size',update.size+'px');
    sample.style.letterSpacing=update.tracking+'px';
    sample.textContent=document.querySelector('#word').value.trim()||'FORM';
  }
  if(update) window.dispatchEvent(new CustomEvent('motion-field:'+id,{detail:update}));
}

function run(store=false) {
  const values=Object.fromEntries(new FormData(form));
  try {
    latest=compute(id,values);
    render(latest);
    previousInput=values;
    message.textContent=store?'Results updated.':'';
    root.toggleAttribute('data-dirty',false);
    exportButton.disabled=false;
    if(store) try {localStorage.setItem(storeKey,JSON.stringify(values));} catch {}
  } catch (error) {message.textContent=error.message;}
}

try {
  const inputs=JSON.parse(localStorage.getItem(storeKey));
  if(inputs && compute(id,inputs)) for(const [name,value] of Object.entries(inputs)){
    const field=form.elements.namedItem(name);
    if(field)field.value=value;
  }
} catch {}
syncTempoField();
run();
form.addEventListener('submit',event=>{event.preventDefault();run(true);});
form.addEventListener('input',()=>{
  syncTempoField();
  const current=Object.fromEntries(new FormData(form));
  const dirty=JSON.stringify(current)!==JSON.stringify(previousInput);
  root.toggleAttribute('data-dirty',dirty);
  exportButton.disabled=dirty;
  message.textContent=dirty?'Apply your changes to update the result.':'';
});
if(sample)document.querySelector('#word').addEventListener('input',event=>{sample.textContent=event.target.value.trim()||'FORM';});

const escaped = value => '"'+String(value).replaceAll('"','""')+'"';
root.querySelector('[data-download]')?.addEventListener('click',()=>{
  if(!latest) return;
  const csv=[latest.header,...latest.rows].map(row=>row.map(escaped).join(',')).join('\r\n');
  const address=URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=address;link.download=id+'-results.csv';link.click();
  setTimeout(()=>URL.revokeObjectURL(address),1000);
  message.textContent='Results exported as CSV.';
});
root.querySelector('[data-copy]')?.addEventListener('click',async()=>{
  if(!latest?.copy) return;
  try {await navigator.clipboard.writeText(latest.copy);message.textContent='CSS copied to clipboard.';}
  catch {
    const selection=getSelection(), range=document.createRange();
    range.selectNodeContents(pre);selection.removeAllRanges();selection.addRange(range);
    message.textContent='CSS selected. Use your browser’s copy command.';
  }
});

const view=document.querySelector('[data-model]');
const open=view.querySelector('[data-open-model]');
const poster=view.querySelector('[data-poster]');
const stage=view.querySelector('[data-viewport]');
const controls=view.querySelector('[data-model-controls]');
const modelStatus=view.querySelector('[data-model-status]');
let viewer, busy=false;
function showModel(opened) {
  stage.hidden=!opened;
  controls.hidden=!opened;
  poster.hidden=opened;
  open.textContent=opened?'Close 3D view':'Open 3D view';
  open.setAttribute('aria-expanded',String(opened));
}
function showFallback() {
  showModel(false);
  modelStatus.textContent='Interactive 3D is unavailable in this browser. You can view the image or download the model.';
}
view.addEventListener('model-unavailable',()=>{
  viewer?.dispose();viewer=undefined;
  showFallback();
});
open.addEventListener('click',async()=>{
  if(busy) return;
  if(viewer && !stage.hidden){
    showModel(false);
    modelStatus.textContent='';
    return;
  }
  busy=true;
  modelStatus.textContent='Loading model…';
  try {
    stage.hidden=false;poster.hidden=true;
    if(!viewer){
      const {createViewer}=await import('./viewer.js');
      viewer=createViewer(view,id,definition.model);
    }
    showModel(true);
    modelStatus.textContent='Model ready. Drag to rotate, or use the controls.';
  } catch {
    showFallback();
  } finally {busy=false;}
});
