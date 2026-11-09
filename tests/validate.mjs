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
assert.equal(data.periods.length,15);
const deep=data.events.filter(e=>e.deepDive);
const guide=data.events.filter(e=>!e.deepDive&&e.story);
const brief=data.events.filter(e=>!e.deepDive&&!e.story);
for(const e of deep){
 assert(e.deepDive.beats.length>=3,'Missing chronological process '+e.id);
 assert(e.deepDive.sources.length>=2,'Missing sources '+e.id);
}
console.log(JSON.stringify({events:data.events.length,deep:deep.length,guide:guide.length,brief:brief.length,interactions:data.interactions.length,static:'PASS'}));
