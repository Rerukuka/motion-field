import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../source/utilities.js';

const table = (id, fields) => compute(id, fields);
test('kiln reverses linear shrinkage and rejects impossible rates', () => {
  assert.equal(table('kiln',{size:'100',shrinkage:'20'}).rows[0][1],'125.0 mm');
  assert.throws(()=>table('kiln',{size:'100',shrinkage:'100'}));
});
test('datum converts both dimensions at the selected scale', () => {
  assert.deepEqual(table('datum',{length:'60',width:'30',scale:'50'}).rows.slice(0,2),[['Length','3.00 m'],['Width','1.50 m']]);
  assert.equal(table('datum',{length:'60',width:'30',scale:'50'}).rows[2][1],'4.50 m²');
  assert.deepEqual(table('datum',{length:'0.1',width:'0.1',scale:'20'}).rows,[['Length','2.0 mm'],['Width','2.0 mm'],['Rectangular area','4.0 mm²']]);
});
test('brasa calculates a bill in euros and handles a menu with no dishes', () => {
  assert.equal(table('brasa',{peppers:'2',sardines:'3',flan:'1',guests:'2'}).rows.at(-2)[1],'€74.00');
  assert.equal(table('brasa',{peppers:'0',sardines:'0',flan:'0',guests:'2'}).rows.at(-1)[1],'€0.00');
});
test('relay accumulates precise cue starts', () => {
  const result=table('relay',{ridge:'2.80',station:'3.20',door:'3.00'});
  assert.deepEqual(result.rows.map(row=>row[1]),['00:00.00','00:02.80','00:06.00','00:09.00']);
});
test('scree converts a flat speed and a climbing penalty into elapsed time', () => {
  const result=table('scree',{distance:'14',climb:'900',pace:'7',penalty:'4'});
  assert.equal(result.rows.at(-1)[1],'2 h 14 min');
});
test('formwerk produces usable font CSS with bounded values', () => {
  assert.match(table('formwerk',{weight:'820',size:'64',tracking:'-2'}).copy,/font-weight: 820;/);
  assert.throws(()=>table('formwerk',{weight:'820',size:'64',tracking:''}));
});
test('night dial converts a tempo into a beat interval', () => {
  assert.equal(table('night-dial',{volume:'35',mode:'custom',tempo:'120'}).rows[0][1],'500 ms');
  assert.equal(table('night-dial',{volume:'35',mode:'track'}).update.tempo,null);
});
test('umbra distinguishes a fully covered moon from distant alignment', () => {
  assert.equal(table('umbra',{offset:'0'}).rows[0][1],'Total');
  assert.equal(table('umbra',{offset:'100'}).rows[0][1],'Outside shadow');
});
test('intertidal works across midnight and rejects equal times', () => {
  assert.equal(table('intertidal',{low:'23:00',high:'05:00',rise:'50'}).rows[0][1],'02:00 (+1 day)');
  assert.throws(()=>table('intertidal',{low:'23:00',high:'23:00',rise:'50'}));
});
test('offcut pads a booklet, labels blanks and handles second sheet correctly', () => {
  const {rows}=table('offcut',{pages:'6',binding:'ltr'});
  assert.deepEqual(rows[0],['1','Blank | 1','2 | Blank']);
  assert.deepEqual(rows[1],['2','6 | 3','4 | 5']);
  assert.deepEqual(table('offcut',{pages:'4',binding:'rtl'}).rows[0],['1','1 | 4','3 | 2']);
});
