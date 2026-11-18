/* =====================================================================
   EMPLOI DU TEMPS : créer, modifier et supprimer des cours ; horaires ;
   modifier et supprimer les événements du calendrier
   ===================================================================== */
const _SLOTS0=SLOTS.slice(),_SLOTE0=SLOTE.slice();
function applySlots(){const h=S&&S.slots;const a=h&&h.s&&h.s.length?h.s:_SLOTS0,b=h&&h.e&&h.e.length?h.e:_SLOTE0;SLOTS.splice(0,SLOTS.length,...a);SLOTE.splice(0,SLOTE.length,...b)}
const _renderEdt=render;render=function(){try{applySlots()}catch(e){}return _renderEdt()};
const canEditEdt=()=>ui.role==='admin'&&(!ui.access||ui.access==='admin');

VIEWS.edt=function(){const tab=tabOf('edt');const f=F();if(ui.params.classId){f.mode='c';f.c=ui.params.classId;ui.params={}}
 const ed=canEditEdt();
 let h=head('Emploi du temps',`Semaine type · ${S.schoolYear}`,ed?(tab==='cal'?`<button class="btn btn-primary" onclick="openEventForm()">${ic('plus',16)} Événement</button>`:`<button class="btn" onclick="openSlotsForm()">${ic('clock',16)} Horaires</button><button class="btn btn-primary" onclick="openLessonForm()">${ic('plus',16)} Ajouter un cours</button>`):'')+tabs([['edt','Emploi du temps'],['cal','Calendrier scolaire']],tab);
 if(tab==='cal')return h+calView();
 let lessons,mode;if(ui.role==='parent'){const k=curKid();h+=kidSwitch();lessons=(S.timetable[k.level]||[]).map(l=>({...l,cid:k.level}));mode='c'}else if(ui.role==='teacher'&&f.mode!=='c'){mode='t';lessons=S.classes.flatMap(c=>(S.timetable[c.id]||[]).filter(l=>l.t===TEACHER_ID()).map(l=>({...l,cid:c.id})))}else{mode=f.mode||'c';if(mode==='t'){const tid=f.t||S.persona.teacher;lessons=S.classes.flatMap(c=>(S.timetable[c.id]||[]).filter(l=>l.t===tid).map(l=>({...l,cid:c.id})))}else{const list=ui.role==='teacher'?myClasses():S.classes;const cid=f.c&&clsById(f.c)?f.c:(list[0]||{}).id;f.c=cid;lessons=(S.timetable[cid]||[]).map(l=>({...l,cid}))}}
 const teachers=S.employees.filter(e=>ed||Object.values(S.assign).some(a=>Object.values(a).includes(e.id)));
 const bar=ui.role==='parent'?'':`<div class="toolbar">${ui.role==='admin'?`<div class="seg"><button class="${mode==='c'?'active':''}" onclick="setF('mode','c')">Par classe</button><button class="${mode==='t'?'active':''}" onclick="setF('mode','t')">Par enseignant</button></div>`:`<div class="seg"><button class="${mode==='t'?'active':''}" onclick="setF('mode','t')">Mon emploi du temps</button><button class="${mode==='c'?'active':''}" onclick="setF('mode','c')">Par classe</button></div>`}${mode==='c'?`<select class="input w-auto" onchange="setF('c',this.value)">${options((ui.role==='teacher'?myClasses():S.classes).map(c=>[c.id,c.name]),f.c)}</select>`:ui.role==='admin'?`<select class="input w-auto" onchange="setF('t',this.value)">${options(teachers.map(e=>[e.id,tName(e)]),f.t||S.persona.teacher)}</select>`:''}<span class="muted sm" style="margin-left:auto">${lessons.length} h / semaine${ed?' · cliquez sur un créneau pour ajouter ou modifier un cours':''}</span></div>`;
 const brk=SLOTE[1]&&SLOTS[2]&&SLOTE[1]<SLOTS[2]?`<div class="tt-break">Récréation · ${SLOTE[1]} – ${SLOTS[2]}</div>`:'';
 return h+`<div class="card">${bar}<div class="table-wrap"><div class="tt">${['',...WD].map(d=>`<div class="tt-h">${d}</div>`).join('')}${SLOTS.map((s,si)=>`${si===2?brk:''}<div class="tt-time">${s}<span>${SLOTE[si]||''}</span></div>${[1,2,3,4,5].map(d=>{const l=lessons.find(x=>x.d===d&&x.s===si);
  if(!l)return ed&&mode==='c'?`<div class="tt-cell add" onclick="openLessonForm('${f.c}',${d},${si})" title="Ajouter un cours"><span>${ic('plus',16)}</span></div>`:'<div class="tt-cell"></div>';
  const sb=subj(l.sub);return `<div class="tt-cell"><div class="lesson${ed?' edit':''}" style="--c:${sb.color}" ${ed?`onclick="openLessonForm('${l.cid}',${d},${si})" title="Modifier ce cours"`:''}><b>${esc(sb.name)}</b><span>${mode==='t'?esc((clsById(l.cid)||{}).name||''):esc(tName(emp(l.t)))}</span><span>${esc(l.room||'')}</span></div></div>`}).join('')}`).join('')}</div></div></div>`};

/* ---------- formulaire de cours ---------- */
function openLessonForm(cid,d,s){const f=F();cid=cid||f.c||(S.classes[0]||{}).id;d=d||1;s=s==null?0:s;const L=(S.timetable[cid]||[]).find(x=>x.d===d&&x.s===s);const c=clsById(cid)||{};
 const subs=subjOf(cid);const sub=L?L.sub:(subs[0]||{}).id;const t=L?L.t:((S.assign[cid]||{})[sub]||'');
 modal(L?'Modifier le cours':'Ajouter un cours',`<div class="form-grid">${selectF('Classe','lf-c',S.classes.map(x=>[x.id,x.name]),cid,{attrs:'onchange="lessonClassChange()"'})}${selectF('Jour','lf-d',WD.map((w,i)=>[i+1,w]),d)}${selectF('Créneau','lf-s',SLOTS.map((x,i)=>[i,x+' – '+(SLOTE[i]||'')]),s)}${selectF('Matière','lf-sub',subs.map(x=>[x.id,x.name]),sub,{attrs:'onchange="lessonSubChange()"'})}${selectF('Enseignant','lf-t',[['','—']].concat(S.employees.map(e=>[e.id,tName(e)])),t)}${field('Salle','lf-r',L?L.room:(c.room||''))}</div><div id="lf-err" class="note warn mt" style="display:none"></div>`,
 `${L?`<button class="btn" style="margin-right:auto;color:#d92d20" onclick="delLesson('${cid}',${d},${s})">Supprimer</button>`:''}<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveLesson(${L?`'${cid}',${d},${s}`:'null'})">${L?'Enregistrer':'Ajouter'}</button>`)}
function lessonClassChange(){const cid=val('lf-c');const el=document.getElementById('lf-sub');el.innerHTML=options(subjOf(cid).map(x=>[x.id,x.name]),'');document.getElementById('lf-r').value=(clsById(cid)||{}).room||'';lessonSubChange()}
function lessonSubChange(){const cid=val('lf-c'),sub=val('lf-sub');const t=(S.assign[cid]||{})[sub];if(t)document.getElementById('lf-t').value=t}
function saveLesson(oc,od,os){const cid=val('lf-c'),d=+val('lf-d'),s=+val('lf-s'),sub=val('lf-sub'),t=val('lf-t'),room=val('lf-r').trim();const err=m=>{const e=document.getElementById('lf-err');e.textContent=m;e.style.display='flex'};
 if(!sub)return err('Choisissez une matière.');
 const same=oc&&oc===cid&&od===d&&os===s;
 if(!same&&(S.timetable[cid]||[]).some(x=>x.d===d&&x.s===s))return err('Cette classe a déjà un cours le '+WD[d-1].toLowerCase()+' à '+SLOTS[s]+'. Modifiez ce cours ou choisissez un autre créneau.');
 if(t){const busy=S.classes.find(c=>(S.timetable[c.id]||[]).some(x=>x.d===d&&x.s===s&&x.t===t&&!(c.id===oc&&od===d&&os===s)));if(busy)return err(tName(emp(t))+' a déjà cours en '+busy.name+' le '+WD[d-1].toLowerCase()+' à '+SLOTS[s]+'.')}
 if(room){const used=S.classes.find(c=>c.id!==cid&&(S.timetable[c.id]||[]).some(x=>x.d===d&&x.s===s&&x.room&&x.room.toLowerCase()===room.toLowerCase()));if(used)return err('La salle « '+room+' » est déjà occupée par la '+used.name+' sur ce créneau.')}
 if(oc)S.timetable[oc]=(S.timetable[oc]||[]).filter(x=>!(x.d===od&&x.s===os));
 (S.timetable[cid]=S.timetable[cid]||[]).push({d,s,sub,t,room});if(t){S.assign[cid]=S.assign[cid]||{};if(!S.assign[cid][sub])S.assign[cid][sub]=t}
 save();closeModal();render();toast(oc?'Cours modifié':'Cours ajouté')}
function delLesson(cid,d,s){S.timetable[cid]=(S.timetable[cid]||[]).filter(x=>!(x.d===d&&x.s===s));save();closeModal();render();toast('Cours supprimé')}

/* ---------- horaires des créneaux ---------- */
function openSlotsForm(){modal('Horaires des cours',`<p class="sm muted" style="margin-top:0">Les créneaux s’appliquent à toutes les classes. La récréation se place entre le 2e et le 3e créneau.</p><div class="slot-grid">${SLOTS.map((x,i)=>`<div class="slot-row"><span class="fw5">Créneau ${i+1}</span><input type="time" class="input sm" id="sl-s${i}" value="${x}"><span class="muted">→</span><input type="time" class="input sm" id="sl-e${i}" value="${SLOTE[i]||''}"></div>`).join('')}</div>`,
 `<button class="btn" style="margin-right:auto" onclick="S.slots=null;save();closeModal();render();toast('Horaires par défaut rétablis')">Rétablir</button><button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveSlots()">Enregistrer</button>`)}
function saveSlots(){const s=SLOTS.map((_,i)=>val('sl-s'+i)),e=SLOTS.map((_,i)=>val('sl-e'+i));for(let i=0;i<s.length;i++){if(!s[i]||!e[i]||s[i]>=e[i])return toast('Créneau '+(i+1)+' : l’heure de fin doit suivre l’heure de début');if(i&&s[i]<e[i-1])return toast('Créneau '+(i+1)+' : il commence avant la fin du précédent')}S.slots={s,e};save();closeModal();render();toast('Horaires enregistrés')}

/* ---------- événements : modification et suppression ---------- */
const _calViewEdt=calView;
calView=function(){let h=_calViewEdt();if(!canEditEdt())return h;const byKey={};for(const e of S.events)(byKey[e.date+'|'+e.title]=byKey[e.date+'|'+e.title]||[]).push(e.id);
 h=h.replace(/<div class="cal-c ([^"]*)" onclick="openEventForm\('(\d{4}-\d\d-\d\d)'\)"><span class="cal-d">(\d+)<\/span>((?:<div class="cal-ev"[^>]*>[^<]*<\/div>)*)<\/div>/g,(m,cls,d,n,evs)=>{const ids=S.events.filter(e=>e.date===d).map(e=>e.id);let k=0;
  evs=evs.replace(/<div class="cal-ev"/g,()=>`<div class="cal-ev" onclick="event.stopPropagation();openEventEdit('${ids[k++]}')" title="Modifier"`);return `<div class="cal-c ${cls}" onclick="openEventForm('${d}')"><span class="cal-d">${n}</span>${evs}</div>`});
 return h};
function openEventEdit(id){const e=S.events.find(x=>x.id===id);if(!e)return;modal('Modifier l’événement',`<div class="form-grid">${field('Intitulé','evf-t',e.title,{full:true})}${field('Date','evf-d',e.date,{type:'date'})}${selectF('Type','evf-y',Object.entries(EVT).map(([k,v])=>[k,v[0]]),e.type)}</div>`,
 `<button class="btn" style="margin-right:auto;color:#d92d20" onclick="delEvent('${id}')">Supprimer</button><button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="updEvent('${id}')">Enregistrer</button>`)}
function updEvent(id){const e=S.events.find(x=>x.id===id);const t=val('evf-t').trim();if(!t)return toast('Intitulé obligatoire');Object.assign(e,{title:t,date:val('evf-d')||e.date,type:val('evf-y')});save();closeModal();render();toast('Événement modifié')}
function delEvent(id){S.events=S.events.filter(x=>x.id!==id);save();closeModal();render();toast('Événement supprimé')}
