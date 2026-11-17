const fs=require('node:fs');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const example={rows:[
{week:'2026-11-02',opened:17,closed:15,overdue:4},
{week:'2026-11-09',opened:24,closed:19,overdue:7}
],notes:[{metric:'overdue',focus:'Review the overdue queue with the operations team.'},{metric:'closed',focus:'Check whether the current closure rate is sustainable.'}]};
function metrics(rows) {
 const weeks=new Map();
 for(const row of rows) {
  const week=String(row.week).trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(week)) throw Error('Use YYYY-MM-DD for week');
  const date=new Date(week+'T00:00:00Z');
  if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==week||date.getUTCDay()!==1||weeks.has(week)) throw Error('Each Monday needs a unique row');
  const values={};
  for(const key of ['opened','closed','overdue']) {
   if(!/^\d+$/.test(String(row[key]).trim())||!Number.isSafeInteger(Number(row[key]))) throw Error('Metrics must be non-negative whole numbers');
   values[key]=Number(row[key]);
  }
  weeks.set(week,values);
 }
 const [current,previous]=[...weeks.keys()].sort().reverse();
 if(!previous||Date.parse(current)-Date.parse(previous)!==604800000) throw Error('Supply two consecutive weeks');
 const latest=weeks.get(current), prior=weeks.get(previous);
 return {current,previous,latest,prior,changes:Object.fromEntries(Object.keys(latest).map(key=>[key,latest[key]-prior[key]]))};
}
function brief(data,response) {
 let highlights=[];
 try { highlights=JSON.parse(response).highlights; } catch {}
 const labels={opened:'Items opened',closed:'Items closed',overdue:'Items overdue'};
 const items=Object.keys(labels).map(key=>({metric:labels[key],current:data.latest[key],previous:data.prior[key],change:data.changes[key]}));
 const suggestions=Array.isArray(highlights)?highlights.filter(note=>typeof note?.metric==='string'&&Object.hasOwn(labels,note.metric)&&typeof note.focus==='string'&&note.focus.trim()&&!/\p{N}/u.test(note.focus)).slice(0,2).map(note=>labels[note.metric]+': '+note.focus.trim().slice(0,180)):[];
 return {week:data.current,previous:data.previous,items,suggestions};
}
const data=metrics(example.rows);
assert.deepEqual(data.changes,{opened:7,closed:4,overdue:3});
assert.deepEqual(metrics([...example.rows].reverse()),data);
assert.throws(()=>metrics([example.rows[0],example.rows[0]]));
assert.throws(()=>metrics([{...example.rows[0],opened:''},example.rows[1]]));
assert.throws(()=>metrics([example.rows[0],{...example.rows[1],week:'2026-11-16'}]));
assert.equal(brief(data,'fail').items[2].current,7);
assert.equal(brief(data,JSON.stringify({highlights:example.notes})).suggestions.length,2);
assert.equal(brief(data,'{"highlights":[{"metric":"overdue","focus":"100 overdue"}]}').suggestions.length,0);
const nodes=[];
function add(name,type,typeVersion,parameters,extra={}) {nodes.push({name,type:'n8n-nodes-base.'+type,typeVersion,parameters,id:randomUUID(),position:[nodes.length*240,300],...extra});}
add('Run now','manualTrigger',1,{});
add('Read weekly metrics','googleSheets',4.6,{operation:'read',documentId:{__rl:true,value:'REPLACE_WITH_SPREADSHEET_ID',mode:'id'},sheetName:{__rl:true,value:'Weekly Metrics',mode:'name'},options:{}});
add('Calculate metrics','code',2,{jsCode:metrics.toString()+'\nreturn [{json:metrics($input.all().map(item=>item.json))}];'});
const prompt='Draft up to two suggested next steps for an operations team based only on the metrics provided. Do not infer causes, write or spell out quantities, or make factual statements. Return a JSON object with highlights, an array of objects containing metric (opened, closed, or overdue) and focus (a short suggested action).';
add('Draft follow-up suggestions','httpRequest',4.2,{method:'POST',url:'https://api.openai.com/v1/chat/completions',authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',sendBody:true,specifyBody:'json',jsonBody:'={{ JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:'+JSON.stringify(prompt)+'},{role:"user",content:JSON.stringify($json)}],response_format:{type:"json_object"}}) }}',options:{timeout:15000}},{onError:'continueRegularOutput'});
add('Assemble brief','code',2,{jsCode:brief.toString()+"\nconst data = $('Calculate metrics').first().json;\nconst response = $input.first().json.choices?.[0]?.message?.content;\nreturn [{json:brief(data,response)}];"});
const connections=Object.fromEntries(nodes.slice(0,-1).map((node,i)=>[node.name,{main:[[{node:nodes[i+1].name,type:'main',index:0}]]}]));
add('Every Monday','scheduleTrigger',1.2,{rule:{interval:[{field:'weeks',weeksInterval:1,triggerAtDay:[1],triggerAtHour:9,triggerAtMinute:0}]}});
nodes.at(-1).position=[0,520];
connections['Every Monday']={main:[[{node:'Read weekly metrics',type:'main',index:0}]]};
fs.writeFileSync('workflow.json',JSON.stringify({name:'Weekly Operations Brief',nodes,connections,active:false,settings:{executionOrder:'v1',timezone:'Asia/Qatar'}},null,2));
fs.writeFileSync('weekly-metrics.csv','week,opened,closed,overdue\n'+example.rows.map(Object.values).map(row=>row.join(',')).join('\n')+'\n');
fs.writeFileSync('index.html',fs.readFileSync('replay.template','utf8').replace('/* CODE */',()=>[metrics,brief].join('\n')).replace('/* EXAMPLE */',()=>JSON.stringify(example)));
console.log('Eight checks passed');
