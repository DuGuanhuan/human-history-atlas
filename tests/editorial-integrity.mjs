import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('history-data.json','utf8'));
const grades={complete:0,guide:0,summary:0};
const coverage=Object.fromEntries(data.regions.map(r=>[r.id,{name:r.name,complete:0,guide:0,summary:0}]));
const warnings=[],rows=[];
for(const event of data.events){
 const d=event.deepDive,grade=d?'complete':event.story?'guide':'summary';
 grades[grade]++;coverage[event.r][grade]++;
 const body=d?[d.lead,d.setting,...(d.beats||[]).map(b=>b.text),d.outcome,d.world,d.limits,d.takeaway].join(''):'';
 const links=d?.sources||[];
 const domains=links.map(s=>{try{return new URL(s[1]).hostname.replace(/^www\./,'')}catch{return null}}).filter(Boolean);
 if(d){
  assert(d.beats.length>=3&&d.beats.length<=6,'Expected 3–6 process nodes: '+event.id);
  assert(body.length>=600,'Long-form article below threshold: '+event.id);
  assert(links.length>=2,'Missing source entries: '+event.id);
  for(const [label,url,scope] of links)assert(label&&scope&&/^https:\/\//.test(url),'Incomplete source: '+event.id);
  if(new Set(domains).size<2)warnings.push(event.id+': fewer than two source domains; independence unverified');
  if(!/不|未|争|限|难|推|证/.test(d.limits))warnings.push(event.id+': uncertainty needs human review');
 }
 rows.push({id:event.id,region:event.r,period:event.p,grade,characters:body.length,sourceEntries:links.length,sourceDomains:[...new Set(domains)],claimLevelVerified:false});
}
assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
for(const link of data.interactions){
 assert(link.frm!==link.to,'Self relation: '+link.id);
 if(!/证|据|推|争|可能|记录|文献|考古|联系|贸易|传播|迁徙/.test(link.detail))warnings.push(link.id+': evidence classification needs review');
}
const report={generatedAt:new Date().toISOString(),disclaimer:'Structural audit only: long-form drafts are NOT verified historical features. No claims or sources have been independently verified by this script.',totals:grades,coverage,relations:data.interactions.length,verifiedComplete:0,unverifiedLongForm:grades.complete,remainingForVerifiedComplete:rows.length,warnings,events:rows};
fs.mkdirSync('test-results',{recursive:true});
fs.writeFileSync('test-results/editorial-integrity.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({events:rows.length,grades,relationships:data.interactions.length,warnings:warnings.length,verifiedComplete:0}));
