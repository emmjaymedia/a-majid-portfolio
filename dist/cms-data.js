export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value, local = false) {try {const u = new URL(value, location.origin);return ['https:','http:'].includes(u.protocol) && (local || u.origin !== location.origin || /^https?:/.test(value)) ? u.href : '';} catch {return '';}}
let clientPromise;
export async function client() {
  if (!clientPromise) clientPromise = (async()=>{const c=await fetch('/cms-config.json').then(r=>r.json());if(!c.supabaseUrl||!c.publishableKey)return null;const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.110.2');return createClient(c.supabaseUrl,c.publishableKey);})();
  return clientPromise;
}
export async function projects(admin=false) {
 const db=await client();
 if(db){const {data,error}=await db.from('portfolio_projects').select('*').order('sort_order');if(error)throw error;return data;}
 if(admin)throw new Error('Content service is not connected yet. Complete the setup in cms/SETUP.md.');
 return fetch('/projects.json').then(r=>{if(!r.ok)throw new Error('Projects could not be loaded.');return r.json()});
}
export function study(p) {
 const e=escapeHTML, para=t=>e(t).replace(/\n/g,'<br>');
 return `<p class="eyebrow">${e(p.category)} · ${e(p.year)}</p><h1>${e(p.title)}</h1><img class="cover" src="${e(safeURL(p.cover,true))}" alt="${e(p.alt)}"><section><h2>Overview</h2><p>${para(p.description)}</p></section>${[['The problem',p.problem],['The solution',p.solution]].filter(([,v])=>v?.trim()).map(([t,v])=>`<section><h2>${t}</h2><p>${para(v)}</p></section>`).join('')}${p.stack?.length?`<section><h2>Tools & technologies</h2><div class="chips">${p.stack.map(t=>`<span>${e(t)}</span>`).join('')}</div></section>`:''}${p.gallery?.map(g=>`<figure><img src="${e(safeURL(g.url,true))}" alt="${e(g.alt)}" loading="lazy">${g.caption?`<figcaption>${e(g.caption)}</figcaption>`:''}</figure>`).join('')||''}<div class="actions">${p.links?.filter(l=>safeURL(l.url)).map(l=>`<a class="button" href="${e(safeURL(l.url))}" target="_blank" rel="noopener noreferrer">${e(l.label)} ↗</a>`).join('')||''}</div>`;
}
