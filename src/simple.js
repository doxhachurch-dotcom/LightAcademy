/* =====================================================================
   SIMPLIFICATION ET IMPORT / EXPORT PARTOUT
   - Paie : saisie simple (prime, absences, heures) et bulletin lisible
   - « Exporter » sur toutes les pages qui ont un tableau (Excel, CSV, PDF)
   - « Importer » pour le personnel, les variables de paie, les dépenses
     et les fournisseurs, avec modèle Excel à remplir
   ===================================================================== */

/* ---------------- PAIE : saisie simple ---------------- */
const _paieDetail=VIEWS.paie;
VIEWS.paie=function(){let out=_paieDetail();const tab=tabOf('prep');if(tab==='bulletins'&&S.runs[ui.payMonth]&&S.runs[ui.payMonth].status!=='validated')return out.replace('<div class="grid cols-3">',`<div class="flex-between mb"><span class="sm muted">Un bulletin par personne payée ce mois-ci.</span><span class="flex"><button class="btn btn-sm" onclick="openPayPerson()">${ic('plus',14)} Ajouter une personne</button><button class="btn btn-sm btn-primary" onclick="openNewSlip()">${ic('payslip',14)} Créer un bulletin</button></span></div><div class="grid cols-3">`);if(tab!=='prep')return out;
 const m=ui.payMonth,run=S.runs[m];if(!run)return out;const val_=run.status==='validated';
 if(ui.payDetail){return out.replace('<div class="card"><div class="table-wrap"><table><thead><tr><th>Salarié</th>',`<div class="flex-between mb"><span class="sm muted">Vue détaillée : heures supplémentaires et congés.</span><button class="btn btn-sm" onclick="ui.payDetail=false;render()">Revenir à la vue simple</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Salarié</th>`)}
 const i=out.indexOf('<div class="note');if(i<0)return out;const rr=payRows(m);const excl=Object.keys(run.excl||{}).filter(k=>run.excl[k]&&emp(k));const dis=val_?'disabled':'';const anyH=rr.some(r=>emp(r.emp).hourly);
 const inp=(e,k,ph)=>{const v=(run.vars[e.id]||{})[k];return `<input class="var-in" ${dis} value="${v||''}" placeholder="${ph||'0'}" onchange="setVar('${m}','${e.id}','${k}',this.value)">`};
 return out.slice(0,i)+(val_?`<div class="note ok mb">${ic('checkCircle',16)}<div>Paie validée : les montants sont verrouillés. Les bulletins sont prêts.</div></div>`:'')+
 `<div class="card"><div class="toolbar"><span class="sm"><b>Remplissez seulement ce qui change ce mois-ci.</b> <span class="muted">Le net se calcule tout seul.</span></span><span style="margin-left:auto" class="flex">${val_?'':`<button class="btn btn-sm" onclick="openPayPerson()">${ic('plus',14)} Ajouter une personne</button><button class="btn btn-sm" onclick="openNewSlip()">${ic('payslip',14)} Créer un bulletin</button><button class="btn btn-sm" onclick="openFileImport('paie')">${ic('arrowDown',14)} Importer</button>`}<button class="btn btn-sm" onclick="ui.payDetail=true;render()">Heures sup. et congés</button></span></div>
 <div class="table-wrap"><table class="pay-simple"><thead><tr><th>Salarié</th><th class="num">Salaire</th>${anyH?'<th class="num">Heures de cours</th>':''}<th class="num">Prime</th><th class="num">Heures d’absence</th><th class="num">Net à payer</th><th></th></tr></thead><tbody>${rr.map(r=>{const e=emp(r.emp);return `<tr><td><div class="person">${avatar(empName(e),30)}<div class="min0"><div class="n">${esc(empName(e))}</div><div class="s">${esc(e.poste)}</div></div></div></td><td class="num">${e.hourly?`<span class="muted">${money(e.hourly)} / h</span>`:money(e.base)}</td>${anyH?`<td class="num">${e.hourly?inp(e,'hrs'):'<span class="muted">—</span>'}</td>`:''}<td class="num">${inp(e,'prime')}</td><td class="num">${inp(e,'abs')}</td><td class="num"><b id="pn-${e.id}">${money(r.net)}</b><div class="xs muted">brut <span id="pg-${e.id}">${money(r.gross)}</span></div></td><td class="num nowrap">${e.hourly&&!((run.vars[e.id]||{}).hrs>0)?'<span class="xs muted">saisir les heures</span>':`<button class="btn btn-xs" onclick="openSlip('${m}','${e.id}')">${ic('eye',13)} Bulletin</button>`}${val_?'':` <button class="btn btn-xs" title="Retirer de la paie de ce mois" onclick="payExclude('${m}','${e.id}',true)">${ic('x',13)}</button>`}</td></tr>`}).join('')}</tbody>
 <tfoot><tr><td colspan="${anyH?5:4}">Total à verser</td><td class="num"><b id="pn-tot">${money(sum(rr.map(x=>x.net)))}</b><div class="xs muted">brut <span id="pg-tot">${money(sum(rr.map(x=>x.gross)))}</span></div></td><td></td></tr></tfoot></table></div>${excl.length&&!val_?`<div class="card-body sm muted" style="border-top:1px solid #eef1f5">Retiré(s) de ce mois : ${excl.map(k=>`${esc(empName(emp(k)))} <button class="link sm" onclick="payExclude('${m}','${k}',false)">rétablir</button>`).join(' · ')}</div>`:''}</div>`};


/* ---------------- PAIE : ajouter une personne, créer un bulletin, retirer du mois ---------------- */
const _payableBase=payable;
payable=function(m){const run=S.runs[m];return _payableBase(m).filter(e=>!(run&&run.excl&&run.excl[e.id]))};
function payRows(m){const run=S.runs[m];if(run.status==='validated')return runResults(m);const rr=runResults(m);
 return S.employees.filter(e=>e.status!=='Sorti'&&!(run.excl&&run.excl[e.id])).map(e=>rr.find(r=>r.emp===e.id)||calcPay(e,run.vars[e.id]||{},m))}
function payExclude(m,eid,on){const run=S.runs[m];if(!run||run.status==='validated')return;run.excl=run.excl||{};if(on)run.excl[eid]=true;else delete run.excl[eid];save();render();toast(on?empName(emp(eid))+' retiré(e) de la paie de '+monthLabel(m):'Rétabli(e) dans la paie')}
function openPayPerson(){modal('Ajouter une personne à la paie',`<div class="form-grid">${field('Prénom','pp-p','')}${field('Nom','pp-n','')}${field('Poste','pp-po','',{full:true,attrs:'placeholder="Ex. : Institutrice 3e primaire"'})}
 <div class="field full"><label>Type de paie</label><div class="seg"><button type="button" class="active" id="pp-tm" onclick="ppType('m')">Salaire mensuel</button><button type="button" id="pp-th" onclick="ppType('h')">Payé à l’heure (vacataire)</button></div></div>
 <div id="pp-box-m" class="pp-box">${field('Salaire mensuel brut ('+S.currency+')','pp-b','',{attrs:'inputmode="decimal" placeholder="0"'})}</div><div id="pp-box-h" class="pp-box" style="display:none">${field('Taux horaire ('+S.currency+')','pp-h','',{attrs:'inputmode="decimal" placeholder="0"'})}${field('Heures ce mois','pp-hh','',{attrs:'inputmode="decimal" placeholder="0"'})}</div>
 ${selectF('Payé par','pp-pay',S.treasury.map(t=>[t.id,t.name]),(S.treasury.find(t=>t.type==='bank')||S.treasury[0]||{}).id)}${field('Téléphone','pp-t','')}</div><p class="hint">Les autres informations (contrat, n° CNSS…) peuvent être complétées plus tard dans Personnel.</p>`,
 `<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="savePayPerson()">Ajouter</button>`)}
function ppType(t){document.getElementById('pp-tm').classList.toggle('active',t==='m');document.getElementById('pp-th').classList.toggle('active',t==='h');document.getElementById('pp-box-m').style.display=t==='m'?'':'none';document.getElementById('pp-box-h').style.display=t==='h'?'':'none'}
function savePayPerson(){const p=val('pp-p').trim(),n=val('pp-n').trim();if(!p||!n)return toast('Prénom et nom obligatoires','err');const hourly=document.getElementById('pp-th').classList.contains('active');
 const b=numFR(val('pp-b')),h=numFR(val('pp-h')),hh=numFR(val('pp-hh'));if(hourly?!(h>0):!(b>0))return toast(hourly?'Indiquez le taux horaire':'Indiquez le salaire mensuel','err');
 const e={id:uid('em'),prenom:p,nom:n,sexe:'',poste:val('pp-po')||'',dept:'',statut:'Non-cadre',contrat:hourly?'Vacataire':'CDI',entry:TODAY,end:'',base:hourly?0:rnd(b),hourly:hourly?rnd(h):0,defHrs:40,hours:S.payroll.hours||173.33,primeFixe:0,logement:0,transport:0,parts:1,pas:0,pay:val('pp-pay'),matricule:'MAT-'+String(101+S.employees.length),socNum:'',phone:val('pp-t'),email:'',iban:'',cpN1:0,cpTaken:0,birth:''};
 S.employees.push(e);for(const k in S.runs){const run=S.runs[k];if(run.status==='draft')run.vars[e.id]={hsA:0,hsB:0,prime:0,abs:0,cp:0,hrs:hourly?(k===ui.payMonth?hh:40):0}}
 save();closeModal();render();toast(empName(e)+' ajouté(e) à la paie')}
function openNewSlip(){const m=ui.payMonth,run=S.runs[m];const list=S.employees.filter(e=>e.status!=='Sorti');
 modal('Créer un bulletin',`<div class="form-grid">${selectF('Personne','ns-e',list.map(e=>[e.id,empName(e)+' · '+(e.poste||'')]),list[0]&&list[0].id,{full:true,attrs:'onchange="nsFill()"'})}<div id="ns-h-box">${field('Heures de cours','ns-h','')}</div>${field('Prime','ns-pr','')}${field('Heures d’absence','ns-ab','')}</div>
 <p class="hint">Mois : ${ucf(monthLabel(m))}. Pour une personne qui n’est pas dans la liste, utilisez « Ajouter une personne ».</p>`,
 `<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveNewSlip()">Créer le bulletin</button>`);nsFill()}
function nsFill(){const e=emp(val('ns-e'));const v=(S.runs[ui.payMonth].vars[e.id])||{};document.getElementById('ns-h-box').style.display=e.hourly?'':'none';document.getElementById('ns-h').value=v.hrs||'';document.getElementById('ns-pr').value=v.prime||'';document.getElementById('ns-ab').value=v.abs||''}
function saveNewSlip(){const m=ui.payMonth,run=S.runs[m];const e=emp(val('ns-e'));if(!e)return;if(e.hourly&&!(numFR(val('ns-h'))>0))return toast('Indiquez les heures de cours du mois','err');
 const v=run.vars[e.id]=run.vars[e.id]||{hsA:0,hsB:0,prime:0,abs:0,cp:0,hrs:0};v.prime=numFR(val('ns-pr'));v.abs=numFR(val('ns-ab'));if(e.hourly)v.hrs=numFR(val('ns-h'));if(run.excl)delete run.excl[e.id];
 save();closeModal();render();openSlip(m,e.id)}

/* ---------------- BULLETIN SIMPLE ---------------- */
const _slipDetail=slipHTML;
slipHTML=function(r,e,m){if(ui.slipDetail)return _slipDetail(r,e,m);const co=S.company;const run=S.runs[m];
 const soc=sum(r.cots.filter(c=>c.kind!=='tax').map(c=>c.sal)),tx=sum(r.cots.filter(c=>c.kind==='tax').map(c=>c.sal));const empCh=r.empSoc+r.empTax;
 const orgs=[...new Set(r.cots.filter(c=>c.emp>0).map(c=>c.org))].join(', ');
 const line=(l,a,cls='')=>`<tr class="${cls}"><td>${l}</td><td class="num">${a}</td></tr>`;
 return `<div class="paper slip slip-simple"><div class="paper-head"><div><div class="co">${esc(co.name)}</div>${co.motto?`<div class="motto">${esc(co.motto)}</div>`:''}<div class="xs" style="line-height:1.6;margin-top:6px">${esc(co.address)}, ${esc(co.city)}<br>${esc(co.phone||'')}</div></div><div style="text-align:right"><div class="doc-title">Bulletin de paie</div><div class="sm">${ucf(monthLabel(m))}</div><div class="xs muted">Payé le ${fds(addDays(lastDay(m),-2))}${run.status!=='validated'?' · provisoire':''}</div></div></div>
 <div class="slip-who"><div><b>${esc(empName(e))}</b><div class="xs muted">${esc(e.poste)} · ${esc(e.contrat)} depuis le ${fds(e.entry)}</div></div><div class="xs muted" style="text-align:right">Matricule ${esc(e.matricule||'')}${e.socNum?'<br>N° CNSS '+esc(e.socNum):''}</div></div>
 <table class="slip-t"><tbody>
 ${r.gains.map(g=>line(esc(g.label),(g.amount<0?'− ':'')+nfmt(Math.abs(g.amount)))).join('')}
 ${line('Salaire brut',nfmt(r.gross),'tot')}
 ${soc?line('Retenue CNSS (part du salarié)','− '+nfmt(soc)):''}${tx?line('Autres retenues sur salaire','− '+nfmt(tx)):''}
 ${line(esc((r.taxes[0]||{}).label||'Impôt sur le revenu'),'− '+nfmt(r.incomeTax))}
 ${r.transport?line('Indemnité de transport','+ '+nfmt(r.transport)):''}
 </tbody></table>
 <div class="netbox"><span>Net à payer</span><b>${money(r.net)}</b></div>
 <div class="slip-foot"><div><span class="muted">Payé en plus par l’école${orgs?' ('+esc(orgs)+')':''}</span><b>${money(empCh)}</b></div><div><span class="muted">Coût total pour l’école</span><b>${money(r.cost)}</b></div></div>
 <div class="legal">Montants en ${CUR[S.currency].name}. Conservez ce bulletin. Version détaillée (bases et taux) disponible sur demande.</div></div>`};
const _openSlipBase=openSlip;
openSlip=function(m,eid){_openSlipBase(m,eid);const f=document.querySelector('#modal-root .modal-foot');if(f&&!document.getElementById('slip-mode')){f.insertAdjacentHTML('beforeend',`<button class="btn" id="slip-mode" onclick="ui.slipDetail=!ui.slipDetail;openSlip('${m}','${eid}')">${ui.slipDetail?'Version simple':'Version détaillée'}</button><button class="btn" onclick="printSlip()">${ic('file',16)} Imprimer / PDF</button>`)}};
function printSlip(){const p=document.querySelector('#modal-root .paper');if(!p)return;const w=window.open('','_blank');if(!w){toast('Autorisez les fenêtres pour imprimer','err');return}
 const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bulletin</title><style>${css}body{background:#fff;padding:24px}.paper{box-shadow:none;border:0;margin:0 auto}</style></head><body>${p.outerHTML}<script>setTimeout(()=>print(),300)<\/script></body></html>`);w.document.close()}

/* ---------------- EXPORT UNIVERSEL ---------------- */
const NO_EXPORT=['eleves','dashboard','parametres'];
function pageTables(){return [...document.querySelectorAll('.content table')].filter(t=>t.offsetParent!==null&&t.querySelector('tbody tr'))}
function tableTitle(t,i){const c=t.closest('.card');const h=c&&c.querySelector('.card-head h3');return (h&&h.textContent.trim())||(document.querySelector('.page-head h1')||{}).textContent+(i?' ('+(i+1)+')':'')}
function cellText(td){const f=td.querySelector('input,select');if(f)return f.tagName==='SELECT'?(f.selectedOptions[0]||{}).text||'':f.value;return td.innerText.replace(/\s*\n\s*/g,' · ').trim()}
function tableData(t){const head=[...t.querySelectorAll('thead th')].map(th=>th.innerText.trim());let rows=[...t.querySelectorAll('tbody tr,tfoot tr')].map(tr=>[...tr.children].map(cellText));
 const keep=head.map((h,i)=>h!==''||rows.some(r=>r[i]&&!/^(Bulletin|Ouvrir|Modifier|Voir)$/.test(r[i])));const H=head.filter((_,i)=>keep[i]);rows=rows.map(r=>r.filter((_,i)=>keep[i]));return{H,rows}}
const asNum=s=>{const x=String(s).replace(/[\s  ]/g,'').replace(/(\$|€|FC|CDF|USD|XOF|XAF|GNF|%)$/,'');return /^-?\d+(,\d+)?$/.test(x)?parseFloat(x.replace(',','.')):s};
function openTableExport(){const T=pageTables();if(!T.length)return toast('Aucun tableau à exporter sur cette page');
 modal('Exporter',`<div class="form-grid">${T.length>1?selectF('Tableau','tx-t',T.map((t,i)=>[i,tableTitle(t,i)]),0,{full:true}):''}</div><div class="sec-title" style="margin-top:${T.length>1?16:0}px">Format</div><div class="fmt-grid">${[['xlsx','Excel','.xlsx'],['csv','CSV','pour Excel'],['pdf','PDF','à imprimer']].map(([k,l,s],i)=>`<label class="fmt"><input type="radio" name="tx-f" value="${k}" ${i===0?'checked':''}><span class="ic-box">${ic(k==='pdf'?'file':'receipt',16)}</span><b>${l}</b><small>${s}</small></label>`).join('')}</div><p class="hint mt">Le fichier reprend le tableau tel qu’il est affiché, avec vos filtres.</p>`,
 `<button class="btn" style="margin-right:auto" onclick="tableExportGo(true)">${ic('copy',16)} Copier</button><button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="tableExportGo(false)">${ic('upload',16)} Exporter</button>`)}
async function tableExportGo(copy){const T=pageTables();const i=T.length>1?+val('tx-t'):0;const t=T[i];if(!t){closeModal();return toast('Aucun tableau à exporter sur cette page')}const {H,rows}=tableData(t);const title=tableTitle(t,i);const fmt=(document.querySelector('input[name=tx-f]:checked')||{}).value||'xlsx';
 const base=title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+TODAY;
 if(copy){copyText([H,...rows].map(r=>r.join('\t')).join('\n'),'Tableau copié : collez-le dans Excel');closeModal();return}
 try{if(fmt==='csv'){const q=v=>/[;"\n]/.test(v)?'"'+String(v).replace(/"/g,'""')+'"':v;download(base+'.csv',new Blob(['﻿'+[H,...rows].map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}))}
  else if(fmt==='xlsx'){await loadLib('xlsx');const ws=XLSX.utils.aoa_to_sheet([H,...rows.map(r=>r.map(asNum))]);ws['!cols']=H.map((h,k)=>({wch:Math.min(40,Math.max(10,h.length,...rows.map(r=>String(r[k]||'').length)))}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,title.slice(0,30).replace(/[\\/?*[\]:]/g,' '));const out=XLSX.write(wb,{bookType:'xlsx',type:'array'});download(base+'.xlsx',new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))}
  else{await loadLib('jspdf');await loadLib('autotable');const doc=new jspdf.jsPDF({orientation:H.length>6?'landscape':'portrait',unit:'pt'});doc.setFontSize(13);doc.text(S.company.name,40,40);doc.setFontSize(10);doc.text(title+' · '+fds(TODAY),40,58);doc.autoTable({head:[H],body:rows,startY:72,styles:{fontSize:8,cellPadding:4},headStyles:{fillColor:[31,82,229]}});download(base+'.pdf',doc.output('blob'))}
  closeModal()}catch(e){toast(e.message,'err')}}

/* ---------------- IMPORT GÉNÉRIQUE ---------------- */
const IMPORTS={
 salaries:{title:'Importer le personnel',page:'salaries',
  fields:[['nom','Nom',['nom','name','nomdefamille'],true],['prenom','Prénom',['prenom','firstname'],true],['sexe','Sexe',['sexe','genre','sex']],['poste','Poste',['poste','fonction','emploi']],['dept','Service',['service','departement','dept']],['contrat','Contrat',['contrat','typecontrat']],['entry','Date d’entrée',['datedentree','dateentree','entree','dateembauche','datedembauche','embauche','debut']],['base','Salaire de base',['salairedebase','salaire','base','salairemensuel']],['hourly','Taux horaire',['tauxhoraire','horaire']],['phone','Téléphone',['telephone','tel','phone','portable']],['email','E-mail',['email','mail','courriel']],['matricule','Matricule',['matricule','numero','id']]],
  example:[['MUKENDI','Rachel','F','Directrice','Direction','CDI','01/09/2020','1365','','+243 81 000 0000','direction@ecole.cd','MAT-001'],['KANKU','Moïse','M','Professeur de biologie','Secondaire','Vacataire','04/09/2023','','8','+243 82 000 0000','','MAT-002']],
  apply(rows){let add=0,upd=0;for(const r of rows){if(!r.nom&&!r.prenom)continue;let e=S.employees.find(x=>(r.matricule&&x.matricule===r.matricule)||(slug(x.nom)===slug(r.nom||'')&&slug(x.prenom)===slug(r.prenom||'')));
   const hourly=numFR(r.hourly)||0,base=numFR(r.base)||0;const patch={nom:r.nom||'',prenom:r.prenom||'',...(r.sexe?{sexe:toSexe(r.sexe)}:{}),...(r.poste?{poste:r.poste}:{}),...(r.dept?{dept:r.dept}:{}),...(r.contrat?{contrat:r.contrat}:{}),...(r.entry?{entry:toDate(r.entry)||TODAY}:{}),...(base?{base}:{}),...(hourly?{hourly,base:0}:{}),...(r.phone?{phone:r.phone}:{}),...(r.email?{email:r.email}:{}),...(r.matricule?{matricule:r.matricule}:{})};
   if(e){Object.assign(e,patch);upd++}else{e={id:uid('em'),sexe:'',poste:'',dept:'',statut:'Non-cadre',contrat:hourly?'Vacataire':'CDI',entry:TODAY,end:'',base:0,hourly:0,defHrs:40,hours:S.payroll.hours||173.33,primeFixe:0,logement:0,transport:0,parts:1,pas:0,pay:'b1',matricule:'MAT-'+String(100+S.employees.length+1),socNum:'',phone:'',email:'',iban:'',cpN1:0,cpTaken:0,birth:'',...patch};S.employees.push(e);
    for(const k in S.runs){const run=S.runs[k];if(run.status==='draft'){run.vars[e.id]={hsA:0,hsB:0,prime:0,abs:0,cp:0,hrs:e.hourly?e.defHrs:0}}}add++}}
   return add+' salarié(s) ajouté(s), '+upd+' mis à jour'}},
 paie:{title:'Importer les variables de paie',page:'paie',
  fields:[['matricule','Matricule',['matricule','numero']],['nom','Nom',['nom','salarie','name','nomcomplet']],['prenom','Prénom',['prenom']],['prime','Prime',['prime','primes','bonus']],['abs','Heures d’absence',['absences','absence','heuresdabsence','abs']],['hrs','Heures de cours',['heuresdecours','heures','hrs']],['hsA','Heures sup. +30 %',['hs30','heuressup30','hsa']],['hsB','Heures sup. +60 %',['hs60','heuressup60','hsb']],['cp','Jours de congé',['conges','cp','joursdeconge']]],
  example:()=>S.employees.slice(0,3).map(e=>[e.matricule,e.nom,e.prenom,'0','0',e.hourly?'40':'','','','']),
  apply(rows){const m=ui.payMonth,run=S.runs[m];if(!run||run.status!=='draft')return 'La paie de ce mois est déjà validée';let n=0,miss=[];
   for(const r of rows){const full=slug((r.nom||'')+' '+(r.prenom||''));const e=S.employees.find(x=>(r.matricule&&x.matricule===r.matricule)||slug(x.nom+' '+x.prenom)===full||slug(x.prenom+' '+x.nom)===full||(!r.prenom&&slug(empName(x))===slug(r.nom||'')));if(!e){if(r.nom||r.matricule)miss.push(r.nom||r.matricule);continue}
    const v=run.vars[e.id]=run.vars[e.id]||{};for(const k of ['prime','abs','hrs','hsA','hsB','cp'])if(r[k]!==''&&r[k]!=null)v[k]=Math.max(0,numFR(r[k]));n++}
   return n+' salarié(s) mis à jour'+(miss.length?' · non trouvés : '+miss.slice(0,4).join(', ')+(miss.length>4?'…':''):'')}},
 achats:{title:'Importer des dépenses',page:'achats',
  fields:[['date','Date',['date','datefacture'],true],['fournisseur','Fournisseur',['fournisseur','supplier','tiers','beneficiaire']],['label','Libellé',['libelle','description','objet','designation'],true],['montant','Montant',['montant','montantht','total','prix','amount'],true],['categorie','Catégorie',['categorie','type','nature','compte']],['ref','N° de facture',['reference','ref','facture','numero']]],
  example:[['05/11/2026','SNEL','Électricité – novembre','210','Électricité','F-1234'],['10/11/2026','Papeterie du Centre','Cahiers et craies','85','Fournitures','']],
  apply(rows){const CK={fourn:/fourniture|papet|cahier/,petit:/petit|equip|materiel/,elec:/elec|snel|courant/,carb:/carbu|essence|gasoil/,voyage:/voyage|deplac|transport/,loyer:/loyer|bail/,maint:/entretien|repar|maint/,assur:/assur/,pub:/pub|communic/,tel:/tel|internet|airtel|vodacom|orange/,banque:/banque|frais banc/,hono:/honor|consult/,eau:/eau|regideso/};
   let n=0;for(const r of rows){const amt=numFR(r.montant);if(!(amt>0))continue;const nm=(r.fournisseur||'Divers').trim();let s=S.suppliers.find(x=>slug(x.name)===slug(nm));
    const t=slug((r.categorie||'')+' '+(r.label||'')+' '+nm);const k=Object.keys(CK).find(c=>CK[c].test(t));const acc=k&&CAT[k]?CAT[k][S.chart]:(s?s.acc:CAT.fourn[S.chart]);
    if(!s){s={id:uid('sp'),name:nm,acc,vat:false,currency:S.currency,country:S.company.country,email:'',phone:''};S.suppliers.push(s)}
    const d=toDate(r.date)||TODAY;S.purchases.push({id:uid('pu'),supplierId:s.id,ref:r.ref||'',date:d,due:d,label:r.label||'Dépense',acc,currency:S.currency,rate:1,ht:rnd(amt),vatRate:0,tva:0});n++}
   return n+' dépense(s) importée(s)'}},
 tiers:{title:'Importer des fournisseurs',page:'tiers',
  fields:[['name','Nom',['nom','name','fournisseur','raisonsociale'],true],['phone','Téléphone',['telephone','tel','phone']],['email','E-mail',['email','mail']]],
  example:[['SNEL','+243 81 000 0000',''],['Papeterie du Centre','+243 99 000 0000','contact@papeterie.cd']],
  apply(rows){let a=0,u=0;for(const r of rows){if(!r.name)continue;const s=S.suppliers.find(x=>slug(x.name)===slug(r.name));if(s){if(r.phone)s.phone=r.phone;if(r.email)s.email=r.email;u++}else{S.suppliers.push({id:uid('sp'),name:r.name.trim(),acc:CAT.fourn[S.chart],vat:false,currency:S.currency,country:S.company.country,email:r.email||'',phone:r.phone||''});a++}}return a+' fournisseur(s) ajouté(s), '+u+' mis à jour'}}};
const _hk=s=>slug(String(s||'')).replace(/[^a-z0-9]/g,'');
/* nombres écrits à la française : 1 234,50 · 1.234,50 · 95,5 */
function numFR(v){if(typeof v==='number')return v;let x=String(v==null?'':v).replace(/[\s\u202f\u00a0$€]/g,'').replace(/(FC|CDF|USD)$/i,'');if(!x)return 0;if(x.includes(',')&&x.includes('.'))x=x.lastIndexOf(',')>x.lastIndexOf('.')?x.replace(/\./g,'').replace(',','.'):x.replace(/,/g,'');else if(x.includes(','))x=/,\d{3}$/.test(x)&&!/^0,/.test(x)&&x.split(',').length>2?x.replace(/,/g,''):x.replace(',','.');const n=parseFloat(x);return isNaN(n)?0:n}
/* élèves : retrouver par matricule ou par nom (dans un sens ou dans l'autre) */
function findStudent(r){const L=students();if(r.matricule){const x=L.find(s=>s.matricule&&_hk(s.matricule)===_hk(r.matricule));if(x)return x}const n=_hk(r.eleve||r.nom||'');if(!n)return null;
 return L.find(s=>_hk(s.nom+s.prenom)===n||_hk(s.prenom+s.nom)===n||_hk(s.name)===n)||L.find(s=>_hk(s.nom)===n&&(!r.classe||_hk(s.classe)===_hk(r.classe)))||null}
IMPORTS.notes={title:'Importer des notes',page:'notes',
 fields:[['eleve','Élève (nom complet)',['eleve','nom','nomcomplet','nompostnomprenom','nometprenom','student'],true],['matricule','Matricule',['matricule']],['classe','Classe',['classe','class']],['matiere','Matière',['matiere','discipline','cours','subject'],true],['note','Note',['note','points','resultat','score'],true],['max','Noté sur',['sur','notesur','max','bareme','total']],['titre','Évaluation',['evaluation','devoir','titre','interrogation','examen']],['date','Date',['date']],['trimestre','Trimestre',['trimestre','periode','term']]],
 example:()=>students().slice(0,3).map((s,i)=>[s.nom+' '+s.prenom,s.matricule,s.classe,'Français',String(12+i),'20','Interrogation 1',fds(TODAY),'1']),
 apply(rows){let n=0;const miss=new Set(),nosub=new Set();const evs={};
  for(const r of rows){if(r.note===''||r.note==null)continue;const st=findStudent(r);if(!st){miss.add(r.eleve||r.matricule);continue}
   const sb=(S.subjects||[]).find(x=>_hk(x.name)===_hk(r.matiere)||_hk(x.short)===_hk(r.matiere)||_hk(x.id)===_hk(r.matiere))||(S.subjects||[]).find(x=>_hk(x.name).startsWith(_hk(r.matiere).slice(0,5)));if(!sb){nosub.add(r.matiere);continue}
   const max=numFR(r.max)||20,title=(r.titre||'Évaluation').trim(),date=toDate(r.date)||TODAY,term=parseInt(r.trimestre)||1;const key=[st.level,sb.id,title,date,term,max].join('|');
   let ev=evs[key]||S.evaluations.find(e=>e.classId===st.level&&e.subjectId===sb.id&&e.title===title&&e.date===date&&e.term===term);
   if(!ev){ev={id:uid('ev'),classId:st.level,subjectId:sb.id,title,date,max,coef:1,term,grades:{}};S.evaluations.push(ev)}evs[key]=ev;ev.grades[st.id]=Math.min(max,Math.max(0,numFR(r.note)));n++}
  return n+' note(s) importée(s) dans '+Object.keys(evs).length+' évaluation(s)'+(miss.size?' · élèves non trouvés : '+[...miss].slice(0,3).join(', ')+(miss.size>3?'…':''):'')+(nosub.size?' · matières inconnues : '+[...nosub].slice(0,3).join(', '):'')}};
IMPORTS.familles={title:'Compléter les fiches élèves',page:'eleves',
 fields:[['eleve','Élève (nom complet)',['eleve','nom','nomcomplet','nompostnomprenom','nometprenom'],true],['matricule','Matricule',['matricule']],['classe','Classe',['classe']],['sexe','Sexe',['sexe','genre']],['birth','Date de naissance',['datedenaissance','naissance','ne','nele']],['parent','Parent / tuteur',['parent','tuteur','responsable','pere','mere','nomduparent']],['phone','Téléphone',['telephone','tel','phone','contact','telephoneduparent']],['mm','Mobile Money',['mobilemoney','mpesa','orangemoney','airtelmoney']],['email','E-mail',['email','mail']]],
 example:()=>students().slice(0,3).map(s=>[s.nom+' '+s.prenom,s.matricule,s.classe,'F','12/03/2017','Mme '+s.nom,'+243 81 000 0000','M-Pesa','']),
 apply(rows){let n=0;const miss=[];for(const r of rows){const st=findStudent(r);if(!st){if(r.eleve)miss.push(r.eleve);continue}
   if(r.sexe)st.sexe=toSexe(r.sexe);if(r.birth)st.birth=toDate(r.birth)||st.birth;st.parent=st.parent||{civ:'',name:'',phone:'',mm:''};if(r.parent)st.parent.name=r.parent;if(r.phone)st.parent.phone=r.phone;if(r.mm)st.parent.mm=r.mm;if(r.email)st.email=r.email;n++}
  return n+' fiche(s) complétée(s)'+(miss.length?' · non trouvés : '+miss.slice(0,3).join(', ')+(miss.length>3?'…':''):'')}};

let IMP=null;
function openFileImport(key){const c=IMPORTS[key];IMP={key,rows:null,heads:null,map:{}};
 modal(c.title,`<label class="drop" id="gi-drop"><input type="file" id="gi-f" accept=".xlsx,.xls,.ods,.csv,.txt,.json" style="display:none" onchange="giFile(this.files[0])">${ic('arrowDown',26)}<b>Choisissez un fichier</b><span class="sm muted">Excel, CSV ou JSON · ou glissez-le ici</span></label>
 <div class="flex-between mt"><span class="sm muted">Colonnes attendues : ${c.fields.map(f=>f[1]+(f[3]?' *':'')).join(', ')}</span><button class="link sm" onclick="giTemplate('${key}')">Télécharger le modèle Excel</button></div><div id="gi-res"></div>`,
 `<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" id="gi-go" disabled onclick="giGo()">Importer</button>`,'wide');
 const d=document.getElementById('gi-drop');d.ondragover=e=>{e.preventDefault();d.classList.add('over')};d.ondragleave=()=>d.classList.remove('over');d.ondrop=e=>{e.preventDefault();d.classList.remove('over');giFile(e.dataTransfer.files[0])}}
async function giTemplate(key){const c=IMPORTS[key];const ex=typeof c.example==='function'?c.example():c.example;try{await loadLib('xlsx');const ws=XLSX.utils.aoa_to_sheet([c.fields.map(f=>f[1]),...ex]);ws['!cols']=c.fields.map(f=>({wch:Math.max(14,f[1].length+2)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Modèle');download('modele-'+key+'.xlsx',new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))}catch(e){toast(e.message,'err')}}
async function giFile(file){if(!file)return;const c=IMPORTS[IMP.key];let A;
 try{if(/\.json$/i.test(file.name)){const j=JSON.parse(await file.text());const arr=Array.isArray(j)?j:Object.values(j).find(Array.isArray)||[];const hs=[...new Set(arr.flatMap(o=>Object.keys(o)))];A=[hs,...arr.map(o=>hs.map(h=>o[h]))]}
  else if(/\.(csv|txt)$/i.test(file.name)){A=parseCSV(await file.text())}
  else{await loadLib('xlsx');const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});A=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:''})}}catch(e){return toast('Fichier illisible : '+e.message,'err')}
 A=A.filter(r=>r.some(x=>String(x).trim()!==''));let hi=A.findIndex(r=>r.filter(x=>c.fields.some(f=>f[2].includes(_hk(x))||_hk(f[1])===_hk(x))).length>=1);if(hi<0)hi=0;
 IMP.heads=A[hi].map(x=>String(x).trim());IMP.rows=A.slice(hi+1);IMP.map={};
 for(const f of c.fields){const i=IMP.heads.findIndex(h=>f[2].includes(_hk(h))||_hk(f[1])===_hk(h));IMP.map[f[0]]=i}
 giRender(file.name)}
function giRender(name){const c=IMPORTS[IMP.key];const ok=c.fields.filter(f=>f[3]).every(f=>IMP.map[f[0]]>=0);
 document.getElementById('gi-res').innerHTML=`<div class="note ${ok?'ok':'warn'} mt">${ic(ok?'checkCircle':'alert',16)}<div><b>${esc(name)}</b> · ${IMP.rows.length} ligne(s). ${ok?'Vérifiez les colonnes puis cliquez sur Importer.':'Associez les colonnes marquées * pour continuer.'}</div></div>
 <div class="map-grid mt">${c.fields.map(f=>`<label class="field"><span class="sm">${f[1]}${f[3]?' *':''}</span><select class="input sm" onchange="IMP.map['${f[0]}']=+this.value;giRender('${esc(name)}')"><option value="-1">— ignorer —</option>${IMP.heads.map((h,i)=>`<option value="${i}" ${IMP.map[f[0]]===i?'selected':''}>${esc(h||'Colonne '+(i+1))}</option>`).join('')}</select></label>`).join('')}</div>
 <div class="table-wrap mt"><table><thead><tr>${c.fields.filter(f=>IMP.map[f[0]]>=0).map(f=>`<th>${f[1]}</th>`).join('')}</tr></thead><tbody>${IMP.rows.slice(0,5).map(r=>`<tr>${c.fields.filter(f=>IMP.map[f[0]]>=0).map(f=>`<td class="sm">${esc(fmtCell(r[IMP.map[f[0]]]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${IMP.rows.length>5?`<p class="xs muted">… et ${IMP.rows.length-5} autre(s) ligne(s)</p>`:''}`;
 const b=document.getElementById('gi-go');b.disabled=!ok;b.textContent='Importer '+IMP.rows.length+' ligne(s)'}
const fmtCell=v=>v instanceof Date?fds(iso(v)):String(v==null?'':v);
function giGo(){const c=IMPORTS[IMP.key];const rows=IMP.rows.map(r=>{const o={};for(const f of c.fields){const i=IMP.map[f[0]];o[f[0]]=i>=0?(r[i] instanceof Date?iso(r[i]):String(r[i]==null?'':r[i]).trim()):''}return o});const msg=c.apply(rows);save();closeModal();render();toast(msg)}

/* ---------------- BOUTONS AJOUTÉS AUX PAGES ---------------- */
const IMPORT_ON={salaries:'salaries',achats:'achats',tiers:'tiers',notes:'notes'};
const _renderSimple=render;
render=function(){const r=_renderSimple();try{addPageButtons()}catch(e){console.error(e)}return r};
function addPageButtons(){const a=document.querySelector('.content .page-head .actions');if(!a||a.querySelector('[data-io]'))return;const p=ui.page;let h='';
 if(p==='eleves'&&ui.access==='admin')h+=`<button class="btn" data-io onclick="openFileImport('familles')">${ic('users',16)} Compléter les fiches</button>`;
 if(IMPORT_ON[p]&&ui.role!=='parent'&&!(ui.access==='prof'&&p!=='notes'))h+=`<button class="btn" data-io onclick="openFileImport('${IMPORT_ON[p]}')">${ic('arrowDown',16)} Importer</button>`;
 if(p==='paie'&&S.runs[ui.payMonth]&&S.runs[ui.payMonth].status==='draft'&&ui.role==='admin')h+=`<button class="btn" data-io onclick="openNewSlip()">${ic('plus',16)} Nouveau bulletin</button>`;
 if(!NO_EXPORT.includes(p)&&pageTables().length)h+=`<button class="btn" data-io onclick="openTableExport()">${ic('upload',16)} Exporter</button>`;
 if(h)a.insertAdjacentHTML('afterbegin',h)}

/* Aucun fournisseur : on propose d'en créer un avant la dépense */
const _openPurFormBase=openPurForm;
openPurForm=function(id){if(!id&&!S.suppliers.length){modal('Nouvelle dépense',`<p>Ajoutez d’abord le fournisseur (ou la personne payée), puis la dépense.</p>`,`<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="closeModal();openSupForm()">Ajouter un fournisseur</button>`);return}return _openPurFormBase(id)};
