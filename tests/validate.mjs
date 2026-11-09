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
assert.equal(new Set(data.periods.map(p=>p.id)).size,data.periods.length,'Duplicate period IDs');
const regionIDs=new Set(data.regions.map(r=>r.id));
const periodIDs=new Set(data.periods.map(p=>p.id));
const deep=data.events.filter(e=>e.deepDive);
const guide=data.events.filter(e=>!e.deepDive&&e.story);
const brief=data.events.filter(e=>!e.deepDive&&!e.story);
const missing=[];
const coverage=Object.fromEntries(data.regions.map(r=>[r.id,{region:r.name,deep:0,guide:0,brief:0}]));
const audit=[];
for(const e of data.events){
 assert(regionIDs.has(e.r),'Unknown region '+e.id);
 assert(periodIDs.has(e.p),'Unknown period '+e.id);
 assert(e.title&&e.dates&&e.desc,'Missing title, dates or introduction '+e.id);
 assert(Array.isArray(e.tags),'Missing tags '+e.id);
 assert(/^e[0-9]+$/.test(e.id),'Unexpected event ID '+e.id);
 const grade=e.deepDive?'deep':e.story?'guide':'brief';
 coverage[e.r][grade]++;
 const d=e.deepDive;
 const chars=d?[d.lead,d.setting,...(d.beats||[]).map(b=>b.text),d.outcome,d.world,d.limits,d.takeaway].join('').length: e.story?JSON.stringify(e.story).length: [e.desc,e.background,e.impact,e.debate].filter(Boolean).join('').length;
 audit.push({id:e.id,region:e.r,period:e.p,grade,chars,sourceLinks:d?.sources?.length||0});
}
for(const e of deep){
 const d=e.deepDive;
 assert(Array.isArray(d.beats)&&d.beats.length>=3,'Missing chronological process '+e.id);
 for(const beat of d.beats)assert(beat.when?.trim()&&beat.title?.trim()&&beat.text?.trim(),'Incomplete process node '+e.id);
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
 assert(regionIDs.has(link.frm)&&regionIDs.has(link.to),'Unknown interaction region '+JSON.stringify(link));
 assert(link.frm!==link.to,'Self-loop is not cross-region '+JSON.stringify(link));
 assert(link.name?.trim()&&link.detail?.trim(),'Empty relationship explanation '+JSON.stringify(link));
}
assert.equal(new Set(data.interactions.map(i=>i.id)).size,data.interactions.length,'Duplicate relationship IDs');
assert.equal(audit.length,deep.length+guide.length+brief.length,'Audit does not cover every event');
fs.mkdirSync('test-results',{recursive:true});
fs.writeFileSync('test-results/content-audit.json',JSON.stringify({generatedAt:new Date().toISOString(),total:audit.length,coverage,events:audit},null,2)+'\n');
console.log(JSON.stringify({events:data.events.length,deep:deep.length,guide:guide.length,brief:brief.length,interactions:data.interactions.length,static:'PASS',audit:'test-results/content-audit.json'}));
