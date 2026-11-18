'use strict';
/* ================= UTILITAIRES ================= */
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=s=>{const[y,m,d]=String(s).slice(0,10).split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const addDays=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return iso(d)};
const TODAY=iso(new Date());
const YEAR='2026';
const MO=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MOL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const fd=s=>{if(!s)return'—';const d=pd(s);return d.getDate()+' '+MO[d.getMonth()]+' '+d.getFullYear()};
const fds=s=>{if(!s)return'—';const d=pd(s);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()};
const monthLabel=m=>{const[y,mm]=m.split('-').map(Number);return MOL[mm-1]+' '+y};
const ucf=s=>s?s[0].toUpperCase()+s.slice(1):s;
const lastDay=m=>{const[y,mm]=m.split('-').map(Number);return iso(new Date(y,mm,0))};
const nextMonth=m=>{let[y,mm]=m.split('-').map(Number);mm++;if(mm>12){mm=1;y++}return y+'-'+pad(mm)};
const prevMonth=m=>{let[y,mm]=m.split('-').map(Number);mm--;if(mm<1){mm=12;y--}return y+'-'+pad(mm)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const sum=a=>a.reduce((x,y)=>x+(Number(y)||0),0);
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=p=>p+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ================= DEVISES ================= */
const CUR={XOF:{sym:'F CFA',dec:0,name:'Franc CFA BCEAO (XOF)'},XAF:{sym:'F CFA',dec:0,name:'Franc CFA BEAC (XAF)'},GNF:{sym:'GNF',dec:0,name:'Franc guinéen (GNF)'},EUR:{sym:'€',dec:2,name:'Euro (EUR)'},USD:{sym:'$',dec:2,name:'Dollar US (USD)'},GBP:{sym:'£',dec:2,name:'Livre sterling (GBP)'},MAD:{sym:'MAD',dec:2,name:'Dirham marocain (MAD)'},NGN:{sym:'₦',dec:0,name:'Naira (NGN)'},GHS:{sym:'GH₵',dec:2,name:'Cedi (GHS)'},CDF:{sym:'FC',dec:0,name:'Franc congolais (CDF)'},CAD:{sym:'$ CA',dec:2,name:'Dollar canadien (CAD)'}};
const EURV={EUR:1,XOF:1/655.957,XAF:1/655.957,GNF:1/10000,USD:0.87,GBP:1.16,MAD:0.092,NGN:0.00057,GHS:0.075,CDF:0.0003,CAD:0.63};
const curDec=c=>(CUR[c]||{dec:2}).dec;
function rnd(v,c){const f=Math.pow(10,curDec(c||S.currency));return Math.round((Number(v)||0)*f)/f}
function money(v,c){c=c||S.currency;const k=CUR[c]||{sym:c,dec:2};return (Number(v)||0).toLocaleString('fr-FR',{minimumFractionDigits:k.dec,maximumFractionDigits:k.dec})+' '+k.sym}
function nfmt(v,c){const d=curDec(c||S.currency);return (Number(v)||0).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function compact(v){const a=Math.abs(v),s=v<0?'−':'';if(a>=1e9)return s+(a/1e9).toLocaleString('fr-FR',{maximumFractionDigits:2})+' Md';if(a>=1e6)return s+(a/1e6).toLocaleString('fr-FR',{maximumFractionDigits:1})+' M';if(a>=1e4)return s+Math.round(a/1e3).toLocaleString('fr-FR')+' k';return s+a.toLocaleString('fr-FR',{maximumFractionDigits:0})}
const mshort=v=>compact(v)+' '+(CUR[S.currency]||{sym:''}).sym;
const pct=(x,d=1)=>(isFinite(x)?x*100:0).toLocaleString('fr-FR',{maximumFractionDigits:d})+' %';
const rate=x=>(Number(x)||0).toLocaleString('fr-FR',{maximumFractionDigits:3})+' %';
const parseNum=v=>{if(typeof v==='number')return v;const n=parseFloat(String(v||'').replace(/\s| | /g,'').replace(',','.'));return isNaN(n)?0:n};

/* ================= ICÔNES ================= */
const P={
home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
receipt:'<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
bank:'<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>',
wallet:'<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
chart:'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
pie:'<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
payslip:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h4M15 15h1"/>',
calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
settings:'<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',
check:'<path d="M20 6 9 17l-5-5"/>',
checkCircle:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
swap:'<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
chevronRight:'<path d="m9 18 6-6-6-6"/>',
chevronLeft:'<path d="m15 18-6-6 6-6"/>',
arrowUp:'<path d="M7 17 17 7M7 7h10v10"/>',
arrowDown:'<path d="M17 7 7 17M17 17H7V7"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
refresh:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
logo:'<path d="M4 4h7a7 7 0 0 1 0 14H4z"/><path d="M14 18h6"/>',
};
const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n]||''}</svg>`;
const AV=[['#eef2ff','#4338ca'],['#ecfdf3','#067647'],['#fff4ed','#c4320a'],['#fdf2fa','#c11574'],['#f0f9ff','#026aa2'],['#fef6ee','#b93815'],['#f4f3ff','#5925dc'],['#f0fdf9','#107569']];
function avatar(name,size=32){let h=0;for(const c of String(name))h=(h*31+c.charCodeAt(0))>>>0;const[bg,fg]=AV[h%AV.length];const ini=String(name).replace(/^(M\.|Mme)\s+/,'').split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();return `<div class="avatar" style="width:${size}px;height:${size}px;background:${bg};color:${fg};font-size:${Math.round(size*.37)}px">${esc(ini)}</div>`}
const badge=(t,c='b-gray',dot=true)=>`<span class="badge ${c}${dot?' dot':''}">${t}</span>`;

/* ================= CACHE ================= */
let CACHE={};
function cached(k,fn){if(!(k in CACHE))CACHE[k]=fn();return CACHE[k]}

/* ================= MODALES / TOASTS ================= */
function modal(title,body,foot='',cls=''){document.getElementById('modal-root').innerHTML=`<div class="overlay" onmousedown="if(event.target===this)closeModal()"><div class="modal ${cls}" role="dialog" aria-modal="true"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" onclick="closeModal()" aria-label="Fermer">${ic('x')}</button></div><div class="modal-body">${body}</div>${foot?`<div class="modal-foot">${foot}</div>`:''}</div></div>`}
function closeModal(){const r=document.getElementById('modal-root');if(r)r.innerHTML=''}
function confirmBox(title,text,okLabel,action,danger){modal(title,`<p style="margin:0">${text}</p>`,`<button class="btn" onclick="closeModal()">Annuler</button><button class="btn ${danger?'btn-danger':'btn-primary'}" onclick="${action}">${okLabel}</button>`)}
function toast(msg,type='ok'){const el=document.createElement('div');el.className='toast'+(type==='err'?' err':'');el.innerHTML=ic(type==='err'?'alert':'checkCircle',18)+`<span>${msg}</span>`;document.getElementById('toast-root').appendChild(el);setTimeout(()=>el.classList.add('out'),2800);setTimeout(()=>el.remove(),3200)}
async function copyText(t,msg){try{await navigator.clipboard.writeText(t);toast(msg||'Copié dans le presse-papiers')}catch(e){toast('Copie impossible dans ce navigateur','err')}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* ================= FORMULAIRES ================= */
const field=(l,id,v='',o={})=>`<div class="field${o.full?' full':''}"><label for="${id}">${l}</label><input id="${id}" type="${o.type||'text'}" class="input" value="${esc(v??'')}" ${o.attrs||''}>${o.hint?`<div class="hint">${o.hint}</div>`:''}</div>`;
const selectF=(l,id,opts,v,o={})=>`<div class="field${o.full?' full':''}"><label for="${id}">${l}</label><select id="${id}" class="input" ${o.attrs||''}>${opts.map(([k,t])=>`<option value="${esc(k)}" ${String(k)===String(v)?'selected':''}>${esc(t)}</option>`).join('')}</select>${o.hint?`<div class="hint">${o.hint}</div>`:''}</div>`;
const areaF=(l,id,v='',o={})=>`<div class="field full"><label for="${id}">${l}</label><textarea id="${id}" class="input" rows="${o.rows||3}">${esc(v||'')}</textarea></div>`;
const val=id=>{const e=document.getElementById(id);return e?String(e.value).trim():''};
const options=(list,v)=>list.map(([k,t])=>`<option value="${esc(k)}" ${String(k)===String(v)?'selected':''}>${esc(t)}</option>`).join('');

/* ================= GRAPHIQUES ================= */
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v)));const n=v/p;return(n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p}
function barChart({labels,series,h=240,max,fmt=compact}){const W=660,pl=56,pr=8,pt=12,pb=28;const all=series.flatMap(s=>s.values);const M=max||niceMax(Math.max(1,...all.map(Math.abs)));const ih=h-pt-pb,iw=W-pl-pr,n=labels.length,gw=iw/n,ns=series.length;const bw=Math.max(5,Math.min(24,(gw*.66-(ns-1)*3)/ns));
let g='';for(const t of [0,.25,.5,.75,1]){const y=pt+ih-ih*t;g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-8}" y="${y+4}" text-anchor="end" class="ax">${compact(M*t)}</text>`}
let b='';labels.forEach((lb,i)=>{const gx=pl+i*gw+(gw-(ns*bw+(ns-1)*3))/2;series.forEach((s,j)=>{const v=Math.max(0,s.values[i]||0);const bh=v>0?Math.max(2,v/M*ih):0;const x=gx+j*(bw+3);b+=`<rect x="${x.toFixed(1)}" y="${(pt+ih-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3.5" fill="${s.color}"><title>${esc(s.name)} — ${esc(lb)} : ${esc(fmt(v))}</title></rect>`});b+=`<text x="${(pl+i*gw+gw/2).toFixed(1)}" y="${h-8}" text-anchor="middle" class="ax">${esc(lb)}</text>`});
return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img">${g}${b}</svg>`}
function lineChart({labels,series,h=230,fmt=compact,min}){const W=660,pl=56,pr=12,pt=14,pb=28;const all=series.flatMap(s=>s.values);const lo=min!=null?min:Math.min(0,...all);const M=niceMax(Math.max(1,...all)-lo)+lo;const ih=h-pt-pb,iw=W-pl-pr,n=labels.length;const X=i=>pl+(n<=1?iw/2:i*iw/(n-1)),Y=v=>pt+ih-(v-lo)/(M-lo)*ih;
let g='';for(const t of [0,.25,.5,.75,1]){const v=lo+(M-lo)*t,y=Y(v);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-8}" y="${y+4}" text-anchor="end" class="ax">${compact(v)}</text>`}
let s='';series.forEach((se,k)=>{const pts=se.values.map((v,i)=>[X(i),Y(v)]);if(!pts.length)return;const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');if(k===0&&!se.dash)s+=`<path d="${d} L${pts[pts.length-1][0].toFixed(1)} ${pt+ih} L${pts[0][0].toFixed(1)} ${pt+ih}Z" fill="${se.color}" opacity=".08"/>`;s+=`<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2.4" ${se.dash?'stroke-dasharray="6 6"':''} stroke-linejoin="round" stroke-linecap="round"/>`;pts.forEach((p,i)=>s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="#fff" stroke="${se.color}" stroke-width="2"><title>${esc(se.name)} — ${esc(labels[i])} : ${esc(fmt(se.values[i]))}</title></circle>`)});
const xl=labels.map((l,i)=>`<text x="${X(i).toFixed(1)}" y="${h-8}" text-anchor="middle" class="ax">${esc(l)}</text>`).join('');
return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img">${g}${s}${xl}</svg>`}
function hbars(items,o={}){const M=o.max||Math.max(1,...items.map(i=>i.value));return `<div class="hbars">${items.map(i=>`<div><div class="hbar-top"><span class="ellipsis">${esc(i.label)}</span><span class="fw5 num">${i.text||compact(i.value)}</span></div><div class="progress"><span style="width:${Math.max(0,Math.min(100,i.value/M*100)).toFixed(1)}%;background:${i.color||o.color||'var(--primary)'}"></span></div>${i.sub?`<div class="xs muted" style="margin-top:4px">${i.sub}</div>`:''}</div>`).join('')}</div>`}
const legend=items=>`<div class="legend">${items.map(([l,c])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>`;
const C1='#4f46e5',C2='#c7cbe0',C3='#12b76a',C4='#f79009';
