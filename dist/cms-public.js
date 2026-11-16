import {projects,escapeHTML as e,safeURL} from './cms-data.js';

function projectDestination(project){
 const links=(project.links||[]).map(link=>({...link,url:safeURL(link.url)})).filter(link=>link.url);
 const behance=links.find(link=>/^https?:\/\/(?:[a-z0-9-]+\.)*behance\.net(?:[/:?#]|$)/i.test(link.url));
 const live=links.find(link=>/live|website|demo/i.test(link.label||''));
 const chosen=behance||live||links[0];
 if(!chosen)return {url:'/projects/'+encodeURIComponent(project.slug),label:'View case study',external:false};
 return {url:chosen.url,label:behance?'View on Behance':live?'Visit live website':chosen.label||'View project',external:true};
}
function projectCard(p,i){
 const d=projectDestination(p);
 return `<article class="project" style="z-index:${i+1}"><a class="project-link" href="${e(d.url)}" ${d.external?'target="_blank" rel="noopener noreferrer"':''} aria-label="${e(p.title)} — ${e(d.label)}${d.external?' (opens in a new tab)':''}"><div class="project-media project-media-image" style="background:#f6f0e7"><img style="object-fit:contain" src="${e(safeURL(p.cover,true))}" alt="${e(p.alt)}" loading="lazy" decoding="async"><span class="project-open" aria-hidden="true">${e(d.label)} ↗</span></div><div class="project-meta"><h3>${e(p.title)}</h3><span>${e(p.category)} // ${e(p.year)}</span></div></a></article>`;
}

try{const list=await projects();document.querySelector('.project-list').innerHTML=list.filter(p=>p.published).map(projectCard).join('');window.dispatchEvent(new Event('projectsupdated'));}catch(error){console.error('Using built-in portfolio projects:',error.message);}
