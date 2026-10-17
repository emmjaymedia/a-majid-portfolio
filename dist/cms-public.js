import {projects,escapeHTML as e,safeURL} from './cms-data.js';
try {
 const list=await projects();const container=document.querySelector('.project-list');
 container.innerHTML=list.filter(p=>p.published).map((p,i)=>`<article class="project" style="z-index:${i+1}"><a class="project-link" href="/projects/${encodeURIComponent(p.slug)}" aria-label="Read ${e(p.title)} case study"><div class="project-media project-media-image" style="background:#f6f0e7"><img style="object-fit:contain" src="${e(safeURL(p.cover,true))}" alt="${e(p.alt)}" loading="lazy" decoding="async"><span class="project-open" aria-hidden="true">View case study ↗</span></div><div class="project-meta"><h3>${e(p.title)}</h3><span>${e(p.category)} // ${e(p.year)}</span></div></a></article>`).join('');
 window.dispatchEvent(new Event('projectsupdated'));
} catch(error){console.error('Using built-in portfolio projects:',error.message);}
