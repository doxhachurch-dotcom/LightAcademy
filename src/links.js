/* =====================================================================
   LIENS : chaque indicateur, nom et compte mène à sa page
   ===================================================================== */
function canSee(p){try{return navFor().some(s=>s[1].some(i=>i[0]===p))}catch(e){return true}}

/* Indicateurs : destination selon le libellé */
const KPI_GO=[
 [/^Élèves inscrits|^Mes élèves/,()=>ui.role==='teacher'?"go('classes')":"go('eleves')"],
 [/^Encaissé/,()=>"go('scolarite',{},'enc')"],
 [/^Impayés|^Reste à payer|^Prochaine échéance/,()=>ui.role==='parent'?"go('paiements')":"go('recouvrement')"],
 [/^Trésorerie/,()=>"go('tresorerie')"],
 [/^Présence|^Absences|^Appels à faire/,()=>"go('presences')"],
 [/^Moyenne générale/,()=>ui.role==='parent'?"go('notes')":"go('bulletins')"],
 [/^Demandes d’inscription/,()=>"go('inscriptions')"],
 [/^Cours /,()=>"go('edt')"],
 [/^Messages/,()=>"go('communication')"],
 [/^Effectif/,()=>"go('salaries')"],
 [/^Masse salariale/,()=>"ui.payMonth=curMonth();go('paie')"],
 [/^Congés/,()=>"go('conges')"],
 [/^Déclarations/,()=>"go('declarations')"]];
function kpiGo(label){if(ui.page!=='dashboard')return '';const m=KPI_GO.find(([r])=>r.test(label));if(!m)return '';const js=m[1]();const p=(js.match(/go\('([a-z]+)'/)||[])[1];return p&&canSee(p)?js:''}
function kpi(label,value,sub='',icon='',tone='t-indigo',title=''){const g=kpiGo(label);return `<div class="card kpi${g?' click':''}"${g?` onclick="${g}" title="Ouvrir"`:''}><div class="label">${label}${g?`<span class="kpi-go">${ic('chevronRight',13)}</span>`:''}</div><div class="value" ${title?`title="${esc(title)}"`:''}>${value}</div>${sub?`<div class="sub">${sub}</div>`:''}</div>`}

/* Noms d'élèves, de salariés et numéros de compte cliquables partout */
function linkTargets(){const st={},em={};for(const s of students())st[s.name]=s.id;for(const e of S.employees)em[empName(e)]=e.id;return{st,em}}
function stuLink(id){if(ui.role==='parent')return null;if(ui.role==='teacher')return ()=>openStudentEdu(id);if(!canSee('eleves'))return null;return ()=>openStudent(id)}
function empLink(id){if(ui.role!=='admin'||!canSee('salaries'))return null;return ()=>openEmp(id)}
function bind(el,fn){if(!fn)return;el.classList.add('lnk');el.addEventListener('click',ev=>{ev.stopPropagation();fn()})}
function linkify(root){if(!ui.user||!S)return;let T;const t=()=>T||(T=linkTargets());
 root.querySelectorAll('.person:not([data-l]),.list-item:not([data-l])').forEach(el=>{el.dataset.l=1;if(el.closest('[onclick]')||el.closest('.paper')||el.closest('.sidebar')||el.closest('.topbar'))return;
  const n=el.querySelector('.n,.fw5,.fw6');if(!n)return;const name=n.textContent.trim();const sid=t().st[name],eid=t().em[name];
  const fn=sid?stuLink(sid):eid?empLink(eid):null;if(!fn)return;if(el.classList.contains('list-item')){el.classList.add('click');el.addEventListener('click',fn)}else bind(n,fn)});
 if(canSee('compta'))root.querySelectorAll('span.acc:not([data-l])').forEach(el=>{el.dataset.l=1;if(el.closest('[onclick]')||el.closest('.paper')||el.closest('select'))return;const a=el.textContent.trim();if(!/^\d{3,8}$/.test(a))return;bind(el,()=>{closeModal();ui.f.compta={acc:a};ui.tab.compta='gl';go('compta',{},'gl')})})}
(function(){let q=false;const run=()=>{q=false;try{linkify(document.getElementById('app'));linkify(document.getElementById('modal-root'))}catch(e){console.error(e)}};
 const obs=new MutationObserver(()=>{if(!q){q=true;queueMicrotask(run)}});
 window.addEventListener('DOMContentLoaded',()=>{for(const id of ['app','modal-root']){const el=document.getElementById(id);if(el)obs.observe(el,{childList:true,subtree:true})}});
 if(document.readyState!=='loading')for(const id of ['app','modal-root']){const el=document.getElementById(id);if(el)obs.observe(el,{childList:true,subtree:true})}})();
