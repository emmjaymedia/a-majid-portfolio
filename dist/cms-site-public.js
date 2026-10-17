import {websiteContent,applyContent} from './site-content.js';
try{const row=await websiteContent();applyContent(row.content);}catch(error){console.error('Using built-in website content:',error.message);}
