import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('history-data.json','utf8'));
const match=html.match(/<script id="history-data" type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
assert(match,'Missing embedded data');
assert.deepEqual(JSON.parse(match[1]),data,'Embedded data differs from JSON');
const js=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert(js,'Missing app script');
new vm.Script(js[1],{filename:'index.html'});
assert.equal(new Set(data.events.map(e=>e.id)).size,data.events.length,'Duplicate event IDs');
assert.equal(data.regions.length,8);
assert.equal(new Set(data.regions.map(r=>r.id)).size,8);
assert.equal(data.periods.length,15);
const regionIDs=new Set(data.regions.map(r=>r.id));
const periodIDs=new Set(data.periods.map(p=>p.id));
const deep=data.events.filter(e=>e.deepDive);
const guide=data.events.filter(e=>!e.deepDive&&e.story);
const brief=data.events.filter(e=>!e.deepDive&&!e.story);
const missing=[];
for(const e of data.events){
 assert(regionIDs.has(e.r),'Unknown region '+e.id);
 assert(periodIDs.has(e.p),'Unknown period '+e.id);
 assert(e.title&&e.dates,'Missing title or dates '+e.id);
}
for(const e of deep){
 const d=e.deepDive;
 assert(d.beats.length>=3,'Missing chronological process '+e.id);
 assert(d.sources.length>=2,'Missing sources '+e.id);
 for(const field of ['lead','setting','outcome','world','limits','takeaway'])assert(typeof d[field]==='string'&&d[field].trim(),'Missing '+field+' '+e.id);
 for(const source of d.sources){
  assert(Array.isArray(source)&&source.length>=3,'Malformed source '+e.id);
  assert(/^https:\/\//.test(source[1]),'Non-HTTPS source '+e.id);
  assert(source[2]?.trim(),'Missing source scope '+e.id);
 }
 const chars=[d.lead,d.setting,...d.beats.map(b=>b.text),d.outcome,d.world,d.limits,d.takeaway].join('').length;
 if(chars<600)missing.push(e.id+' '+chars+' chars');
}
assert.equal(missing.length,0,'Deep dives below 600-character editorial threshold: '+missing.join(', '));
for(const link of data.interactions){
 assert(periodIDs.has(link.p),'Unknown interaction period '+JSON.stringify(link));
}
console.log(JSON.stringify({events:data.events.length,deep:deep.length,guide:guide.length,brief:brief.length,interactions:data.interactions.length,static:'PASS'}));
