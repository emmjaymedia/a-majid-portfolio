import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const projects=JSON.parse(readFileSync('dist/projects.json'));
assert.equal(projects.length,8);assert.equal(new Set(projects.map(p=>p.slug)).size,8);
for(const p of projects){assert.match(p.slug,/^[a-z0-9]+(-[a-z0-9]+)*$/);assert.ok(existsSync('dist'+p.cover));assert.ok(p.description);}
// Test rendering with malicious content and optional sections, without a browser or network.
let source=readFileSync('dist/cms-data.js','utf8').replace(/export /g,'');
source+='\n globalThis.testAPI={study,safeURL,escapeHTML};';
const context={URL,location:{origin:'https://example.com'}};vm.createContext(context);vm.runInContext(source,context);
const {study,safeURL}=context.testAPI;
const minimal=study({...projects[0],title:'<script>alert(1)</script>',description:'<img onerror=alert(1)>',problem:'',solution:'',stack:[],links:[{label:'Bad',url:'javascript:alert(1)'}]});
assert.ok(!minimal.includes('<script>'));assert.ok(!minimal.includes('<img onerror'));assert.ok(!minimal.includes('The problem'));assert.ok(!minimal.includes('The solution'));assert.ok(!minimal.includes('Tools & technologies'));assert.ok(!minimal.includes('javascript:'));
const full=study({...projects[0],problem:'A problem',solution:'A solution',stack:['React'],gallery:[{url:'/images/example.png',alt:'Example',caption:'Caption'}]});
for(const text of ['The problem','The solution','Tools & technologies','Caption'])assert.ok(full.includes(text));
assert.equal(safeURL('javascript:alert(1)'), '');assert.equal(safeURL('data:text/html,test',true),'');
console.log('PASS: project migration, assets, optional case-study sections, safe URLs and escaped content.');

const config=JSON.parse(readFileSync("vercel.json"));
if(config.cleanUrls) for(const rule of config.rewrites||[]) assert.ok(!rule.destination.endsWith(".html"), "Clean-URL rewrite destinations must omit .html");
