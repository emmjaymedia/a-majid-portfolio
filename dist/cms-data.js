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
export function study(project) {
  const e = escapeHTML;
  const para = text => e(text).replace(/\n/g, '<br>');
  const sections = [];
  const add = (id, heading, body) => sections.push({id, heading, body});

  add('overview', 'Overview', `<p>${para(project.description)}</p>`);
  if (project.problem?.trim()) add('problem', 'The problem', `<p>${para(project.problem)}</p>`);
  if (project.solution?.trim()) add('solution', 'The solution', `<p>${para(project.solution)}</p>`);
  if (project.flow?.length) {
    add('workflow', 'Workflow', `<ol class="study-flow">${project.flow.map(step => `<li>${e(step)}</li>`).join('')}</ol>`);
  }
  for (const [index, [heading, text]] of (project.chapters || []).entries()) {
    add('decision-' + (index + 1), heading, `<p>${para(text)}</p>`);
  }
  if (project.stack?.length) {
    add('tools', 'Tools & technologies', `<ul class="study-chips">${project.stack.map(tool => `<li>${e(tool)}</li>`).join('')}</ul>`);
  }
  const gallery = (project.gallery || []).filter(image => image.url && safeURL(image.url, true));
  if (gallery.length) {
    add('gallery', 'Project visuals', gallery.map(image => `
      <figure><img src="${e(safeURL(image.url, true))}" alt="${e(image.alt)}" loading="lazy">
        ${image.caption ? `<figcaption>${e(image.caption)}</figcaption>` : ''}
      </figure>`).join(''));
  }
  const links = (project.links || []).map(link => ({
    label: link.label,
    url: link.url ? safeURL(link.url, /^\/(?!\/)/.test(link.url)) : '',
    external: /^https?:/i.test(link.url || ''),
  })).filter(link => link.url);
  if (links.length) {
    add('links', 'Explore the project', `<div class="study-actions">${links.map(link =>
      `<a href="${e(link.url)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(link.label)} ↗</a>`
    ).join('')}</div>`);
  }

  const cover = project.cover && safeURL(project.cover, true);
  return `<article>
    <header class="study-header">
      <p class="eyebrow">${e(project.category)} · ${e(project.year)}</p>
      <h1>${e(project.title)}</h1>
      ${project.headline ? `<p class="study-deck">${e(project.headline)}</p>` : ''}
      ${project.role || project.status ? `<dl class="study-facts">
        ${project.role ? `<div><dt>Role</dt><dd>${e(project.role)}</dd></div>` : ''}
        ${project.status ? `<div><dt>Status</dt><dd>${e(project.status)}</dd></div>` : ''}
      </dl>` : ''}
    </header>
    ${cover ? `<figure class="study-cover"><img src="${e(cover)}" alt="${e(project.alt)}"></figure>` : ''}
    <div class="study-layout">
      ${sections.length > 1 ? `<nav class="study-index" aria-label="On this page"><p>On this page</p><ol>
        ${sections.map(section => `<li><a href="#${section.id}">${e(section.heading)}</a></li>`).join('')}
      </ol></nav>` : ''}
      <div class="study-sections">
        ${sections.map(section => `<section id="${section.id}"><h2>${e(section.heading)}</h2>${section.body}</section>`).join('')}
      </div>
    </div>
  </article>`;
}
