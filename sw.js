/* Light Academy – fonctionnement hors ligne
   - l'application et ses bibliothèques sont gardées sur l'appareil
   - les données passent toujours par l'application (jamais mises en cache ici) */
const VERSION='la-v1';
const CORE=['./','./index.html',
 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',
 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{mode:u.startsWith('http')?'cors':'same-origin'})).catch(()=>null)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(/supabase\.co$/.test(u.hostname))return; /* données : toujours en direct */
 if(r.mode==='navigate'||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname))){
  /* page : réseau d'abord, copie locale si pas de connexion */
  e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html').then(x=>x||caches.match('./'))));return}
 if(/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)||u.origin===location.origin){
  /* bibliothèques et polices : copie locale d'abord */
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})))}
});
