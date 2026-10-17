import {client,projects,study,safeURL,escapeHTML as e} from './cms-data.js';
import {contentFields,contentLists,websiteContent} from './site-content.js';
const $=s=>document.querySelector(s), form=$('#editor');let db,items=[],dirty=false,busy=false;
function status(message,error=false){$('#status').textContent=message;$('#status').dataset.error=error;}
function field(name){return form.elements.namedItem(name);}
function lock(value){busy=value;document.querySelectorAll('#editor button,#editor input,#editor textarea,#new,#back-overview,#logout,#content-editor input,#content-editor textarea,#content-editor button,#open-projects,#open-content,#content-back,#content-cancel').forEach(b=>b.disabled=value);}
function validURL(url,local=false){if(!url)return '';const safe=safeURL(url,local);if(!safe)throw new Error('Use a valid http or https URL.');return url;}
async function upload(file){if(!file)return '';if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)||file.size>5*1024*1024)throw new Error('Choose a JPG, PNG, WebP or AVIF image under 5 MB.');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[file.type];const path=crypto.randomUUID()+'.'+ext;const {error}=await db.storage.from('portfolio-media').upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;return db.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;}
function galleryRow(g={url:'',alt:'',caption:''}){const row=document.createElement('div');row.className='gallery-row';for(const [name,label] of [['url','Image URL'],['alt','Image description'],['caption','Caption (optional)']]){const lab=document.createElement('label');lab.textContent=label;const input=document.createElement('input');input.dataset.field=name;input.value=g[name]||'';input.required=name!=='caption';lab.append(input);row.append(lab);}const label=document.createElement('label');label.textContent='Upload image';const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,image/avif';label.append(input);row.append(label);input.onchange=async()=>{lock(true);try{row.querySelector('[data-field=url]').value=await upload(input.files[0]);dirty=true;status('Image uploaded. Save the project to apply it.');}catch(e){status(e.message,true)}finally{lock(false)}};const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Remove image';remove.onclick=()=>{row.remove();dirty=true};row.append(remove);$('#gallery').append(row);}
function values(){return {id:field('id').value||crypto.randomUUID(),title:field('title').value.trim(),slug:field('slug').value.trim(),category:field('category').value.trim(),year:Number(field('year').value),cover:validURL(field('cover').value.trim(),true),alt:field('alt').value.trim(),description:field('description').value.trim(),problem:field('problem').value.trim(),solution:field('solution').value.trim(),stack:field('stack').value.split(',').map(s=>s.trim()).filter(Boolean),links:[['Visit live website',field('live').value],['View on Behance',field('behance').value]].filter(([,url])=>url.trim()).map(([label,url])=>({label,url:validURL(url.trim())})),gallery:[...document.querySelectorAll('.gallery-row')].map(row=>Object.fromEntries([...row.querySelectorAll('[data-field]')].map(input=>[input.dataset.field,input.dataset.field==='url'?validURL(input.value.trim(),true):input.value.trim()]))),published:field('published').checked,sort_order:Number(field('sort_order').value)};}
function select(p){if(busy)return;if(dirty&&!confirm('Discard unsaved changes?'))return;form.reset();$('#gallery').replaceChildren();for(const name of ['id','title','slug','category','year','cover','alt','description','problem','solution','sort_order'])field(name).value=p[name]??'';field('stack').value=(p.stack||[]).join(', ');for(const [name,match] of [['behance',l=>l.url.includes('behance.net')],['live',l=>!l.url.includes('behance.net')]])field(name).value=p.links?.find(match)?.url||'';field('published').checked=!!p.published;(p.gallery||[]).forEach(galleryRow);$('#cover-preview').src=safeURL(p.cover,true);$('#cover-preview').hidden=!p.cover;$('#preview').hidden=true;$('#delete').hidden=!p.id;dirty=false;$('#toast').hidden=true;status('');$('#content-view').hidden=true;$('#overview').hidden=true;$('#editor-view').hidden=false;$('#view-label').textContent=p.id?'Edit project':'New project';$('#editor-heading').textContent=p.id?'Edit project':'New project';$('#save').textContent=p.id?'Save changes':'Create project';$('#editor-heading').focus();window.scrollTo(0,0);}
let toastTimer;
function toast(message){clearTimeout(toastTimer);$('#toast-message').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;},8000);}
function overview(){if(busy)return;if(dirty&&!confirm('Discard unsaved changes?'))return;dirty=false;form.reset();$('#gallery').replaceChildren();$('#preview').hidden=true;$('#preview').replaceChildren();$('#content-view').hidden=true;$('#open-projects').setAttribute('aria-current','page');$('#open-content').removeAttribute('aria-current');$('#editor-view').hidden=true;$('#overview').hidden=false;$('#view-label').textContent='Overview';status('');renderList();$('#overview-heading').focus();window.scrollTo(0,0);}
function renderList(){
 const live=items.filter(p=>p.published).length;
 $('#stat-total').textContent=items.length;$('#stat-live').textContent=live;$('#stat-draft').textContent=items.length-live;
 const query=$('#project-search').value.trim().toLowerCase(),filter=$('#project-filter').value;
 const shown=items.filter(p=>(filter==='all'||p.published===(filter==='live'))&&[p.title,p.category].join(' ').toLowerCase().includes(query));
 $('#result-count').textContent=shown.length+' of '+items.length+' projects';
 $('#list').innerHTML=shown.length?shown.map(p=>`<article class="project-entry"><img src="${e(safeURL(p.cover,true))}" alt="" loading="lazy"><div class="entry-info"><h3>${e(p.title)}</h3><p>${e(p.category)} / ${e(p.year)}</p></div><span class="visibility ${p.published?'is-live':'is-draft'}">${p.published?'Live':'Draft'}</span><div class="entry-actions">${p.published?`<a href="/projects/${encodeURIComponent(p.slug)}" target="_blank" rel="noopener noreferrer" aria-label="View ${e(p.title)} case study (opens in a new tab)">View ↗</a>`:''}<button type="button" class="secondary" data-edit="${e(p.id)}" aria-label="Edit ${e(p.title)}">Edit</button></div></article>`).join(''):`<div class="collection-empty"><h3>${items.length?'No matching projects':'Your collection starts here.'}</h3><p>${items.length?'Try another search or visibility filter.':'Create your first project to add it to your portfolio.'}</p></div>`;
 $('#list').querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>select(items.find(p=>p.id===button.dataset.edit)));
}
$('#open-projects').onclick=overview;$('#content-back').onclick=overview;$('#content-cancel').onclick=overview;
$('#project-search').oninput=renderList;$('#project-filter').onchange=renderList;
$('#back-overview').onclick=overview;$('#toast-close').onclick=()=>{$('#toast').hidden=true;clearTimeout(toastTimer)};
async function load(){items=await projects(true);renderList();}
async function session(){const {data:{user},error}=await db.auth.getUser();if(error||!user){$('#workspace').hidden=true;$('#login').hidden=false;$('#logout').hidden=true;return;}const {data,error:accessError}=await db.from('portfolio_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(accessError||!data){await db.auth.signOut();throw new Error('This account does not have portfolio editor access.');}$('#workspace').hidden=false;$('#login').hidden=true;$('#logout').hidden=false;await load();overview();}
$('#login-form').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{if(!db)throw new Error('Content service is not connected yet.');const {error}=await db.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});if(error)throw error;$('#password').value='';await session();}catch(e){status(e.message,true)}finally{button.disabled=false}};
$('#logout').onclick=async()=>{if(dirty&&!confirm('Discard unsaved changes and sign out?'))return;const {error}=await db.auth.signOut();if(error){status(error.message,true);return;}dirty=false;items=[];$('#toast').hidden=true;form.reset();$('#list').replaceChildren();$('#gallery').replaceChildren();$('#preview').replaceChildren();await session();status('Signed out.');};
$('#new').onclick=()=>select({year:new Date().getFullYear(),sort_order:Math.max(-1,...items.map(p=>p.sort_order))+1,published:false});
$('#add-gallery').onclick=()=>{galleryRow();dirty=true};
form.oninput=()=>{dirty=true;$('#preview').hidden=true};
$('#cover-upload').onchange=async e=>{lock(true);try{const url=await upload(e.target.files[0]);field('cover').value=url;$('#cover-preview').src=url;$('#cover-preview').hidden=false;dirty=true;status('Cover uploaded. Save the project to apply it.');}catch(e){status(e.message,true)}finally{lock(false)}};
$('#preview-button').onclick=()=>{try{if(!form.reportValidity())return;$('#preview').innerHTML=study(values());$('#preview').hidden=false;$('#preview').scrollIntoView({behavior:'smooth'});}catch(e){status(e.message,true)}};
form.onsubmit=async event=>{
 event.preventDefault();if(busy)return;lock(true);$('#save').textContent='Saving…';
 try{
  const p=values(),created=!field('id').value;
  if(!p.title||!p.description||!p.alt)throw new Error('Complete the required project details.');
  const {data,error}=await db.from('portfolio_projects').upsert(p,{onConflict:'id'}).select().single();
  if(error)throw error;if(!data)throw new Error('The save could not be confirmed. Please try again.');
  items=items.filter(item=>item.id!==data.id).concat(data).sort((a,b)=>a.sort_order-b.sort_order);
  dirty=false;lock(false);overview();toast(created?'Project created successfully.':'Project updated successfully.');
 }catch(error){status(error.code==='23505'?'That page address is already in use. Choose another.':error.message,true);}
 finally{lock(false);$('#save').textContent=field('id').value?'Save changes':'Create project';}
};
$('#delete').onclick=async()=>{if(!confirm('Delete this project permanently? Uploaded images remain stored.'))return;lock(true);try{const {error}=await db.from('portfolio_projects').delete().eq('id',field('id').value);if(error)throw error;items=items.filter(p=>p.id!==field('id').value);dirty=false;lock(false);overview();toast('Project deleted successfully.');}catch(e){status(e.message,true)}finally{lock(false)}};
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
try{db=await client();if(!db){status('Portfolio Studio is built but not connected. Complete cms/SETUP.md to enable secure sign-in and saving.',true);$('#login-form').querySelector('button').disabled=true;}else await session();}catch(e){status(e.message,true)}

let contentRecord;
function contentLabel(label,control){const el=document.createElement('label');el.textContent=label;el.append(control);return el;}
function contentInput(value,type='text'){const input=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type==='email'?'email':'text';input.value=value??'';return input;}
function contentListRow(container,kind,item){
 const row=document.createElement('div');row.className='content-list-row';
 const fields=kind==='tags'?[['value','Skill / service',item]]:kind==='links'?[['label','Link label',item.label],['url','Link URL',item.url]]:[['url','Image URL',item.url],['alt','Image description',item.alt]];
 for(const [name,label,value] of fields){const input=contentInput(value);input.dataset.itemField=name;row.append(contentLabel(label,input));}
 if(kind==='images'){
 const image=document.createElement('img');image.className='thumb';image.alt='Image preview';image.src=safeURL(item.url,true);image.hidden=!item.url;row.prepend(image);
 const file=document.createElement('input');file.type='file';file.accept='image/jpeg,image/png,image/webp,image/avif';row.append(contentLabel('Upload replacement image',file));
 row.querySelector('[data-item-field=url]').oninput=event=>{image.src=safeURL(event.target.value,true);image.hidden=!event.target.value;};
 file.onchange=async()=>{if(!file.files[0])return;lock(true);try{const url=await upload(file.files[0]);row.querySelector('[data-item-field=url]').value=url;image.src=url;image.hidden=false;dirty=true;status('Image uploaded. Save website changes to publish it.');}catch(error){status(error.message,true)}finally{lock(false)}};
 }
 const actions=document.createElement('div');actions.className='content-row-actions';
 for(const [label,action] of [['Move up',()=>{const previous=row.previousElementSibling;if(previous){container.insertBefore(row,previous);dirty=true;}}],['Move down',()=>{const next=row.nextElementSibling;if(next){container.insertBefore(next,row);dirty=true;}}],['Remove',()=>{row.remove();dirty=true;}]]){const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=label;button.onclick=action;actions.append(button);}row.append(actions);container.append(row);
}
function renderContent(){
 const root=$('#content-fields');root.replaceChildren();const c=contentRecord.content;
 for(const group of [...new Set(contentFields.map(f=>f[4]))]){
 const section=document.createElement('fieldset');section.className='content-section';const legend=document.createElement('legend');legend.textContent=group;section.append(legend);
 for(const [key,label,,kind] of contentFields.filter(f=>f[4]===group)){
 const input=contentInput(c[key],kind==='textarea'||kind==='meta'?'textarea':kind==='email'?'email':'text');input.dataset.contentField=key;section.append(contentLabel(label,input));
 if(['image','poster'].includes(kind)){const preview=document.createElement('img');preview.className='thumb';preview.alt=label+' preview';preview.src=safeURL(c[key],true);preview.hidden=!c[key];section.append(preview);input.oninput=()=>{preview.src=safeURL(input.value,true);preview.hidden=!input.value;};const file=document.createElement('input');file.type='file';file.accept='image/jpeg,image/png,image/webp,image/avif';section.append(contentLabel('Upload '+label.toLowerCase(),file));file.onchange=async()=>{if(!file.files[0])return;lock(true);try{input.value=await upload(file.files[0]);preview.src=input.value;preview.hidden=false;dirty=true;status('Image uploaded. Save website changes to publish it.');}catch(error){status(error.message,true)}finally{lock(false)}};}
 }
 root.append(section);
 }
 for(const [key,label,,kind] of contentLists){const section=document.createElement('fieldset');section.className='content-section';const legend=document.createElement('legend');legend.textContent=label;section.append(legend);const rows=document.createElement('div');rows.dataset.contentList=key;(c[key]||[]).forEach(item=>contentListRow(rows,kind,item));section.append(rows);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='+ Add '+(kind==='images'?'image':kind==='tags'?'skill / service':'link');button.onclick=()=>{contentListRow(rows,kind,kind==='tags'?'':{url:'',label:'',alt:''});dirty=true;};section.append(button);root.append(section);}
 const visibility=document.createElement('fieldset');visibility.className='content-section';const legend=document.createElement('legend');legend.textContent='Visible sections';visibility.append(legend);for(const [key,label] of [['showAbout','Show About section'],['showProjects','Show Projects section'],['showContact','Show Contact section']]){const input=document.createElement('input');input.type='checkbox';input.dataset.contentField=key;input.checked=c[key]!==false;visibility.append(contentLabel(label,input));}root.append(visibility);
}
$('#open-content').onclick=async()=>{
 if(busy)return;if(dirty&&!confirm('Discard unsaved changes?'))return;
 lock(true);try{const row=await websiteContent();contentRecord=row;dirty=false;renderContent();$('#overview').hidden=true;$('#editor-view').hidden=true;$('#content-view').hidden=false;$('#view-label').textContent='Website content';$('#open-content').setAttribute('aria-current','page');$('#open-projects').removeAttribute('aria-current');status('');$('#toast').hidden=true;$('#content-heading').focus();window.scrollTo(0,0);}catch(error){status('Could not load website content: '+error.message,true)}finally{lock(false)}
};
$('#content-editor').oninput=()=>{dirty=true;};
$('#content-editor').onsubmit=async event=>{
 event.preventDefault();if(busy)return;lock(true);$('#save-content').textContent='Saving…';
 try{
 const c={...contentRecord.content};
 for(const input of document.querySelectorAll('[data-content-field]'))c[input.dataset.contentField]=input.type==='checkbox'?input.checked:input.value.trim();
 for(const [key,,,kind] of contentLists)c[key]=[...document.querySelector(`[data-content-list="${key}"]`).children].map(row=>kind==='tags'?row.querySelector('[data-item-field=value]').value.trim():Object.fromEntries([...row.querySelectorAll('[data-item-field]')].map(i=>[i.dataset.itemField,i.value.trim()]))).filter(item=>kind==='tags'?item:kind==='links'?item.url||item.label:item.url||item.alt);
 for(const [key,,,kind] of contentFields){if(c[key]&&['url','image','poster','video'].includes(kind))validURL(c[key],true);}
 for(const [key,,,kind] of contentLists){if(kind!=='tags')for(const item of c[key]){if(!item.url)throw new Error('Add a URL or remove the empty '+(kind==='images'?'image':'link')+'.');validURL(item.url,kind==='images');if(kind==='images'&&!item.alt)throw new Error('Add a description for each carousel image.');if(kind==='links'&&!item.label)throw new Error('Add a label for each social link.');}}
 const {data,error}=await db.from('portfolio_site_content').update({content:c,revision:contentRecord.revision+1}).eq('id','main').eq('revision',contentRecord.revision).select().maybeSingle();
 if(error)throw error;if(!data)throw new Error('Website content changed in another session. Copy your edits, return to the overview and reopen Website content before saving.');contentRecord=data;dirty=false;lock(false);overview();toast('Website content updated successfully.');
 }catch(error){status(error.message,true)}finally{lock(false);$('#save-content').textContent='Save website changes';}
};
