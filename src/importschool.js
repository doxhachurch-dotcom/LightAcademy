/* =====================================================================
   IMPORT DU FICHIER DE L'ÉCOLE : un onglet par classe
   Colonnes : n° | Nom, postnom et prénom | F.A | 1 … 30 (versements) | Montant total | Montant payé
   Remplace la base des élèves, leurs échéances et leurs paiements.
   ===================================================================== */
const _nrm=s=>String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
function sheetLevel(title){const t=_nrm(title);const B=/\bB$/.test(t)&&!/\bEB$/.test(t);
 let id=null;if(/CRECHE/.test(t))id='cr';else if(/HUM/.test(t)){id=/SCIEN/.test(t)?'h1s':/LIT/.test(t)?'h1l':'h1c'}
 else{const n=(t.match(/^(\d)/)||[])[1];if(/MAT/.test(t))id='m'+n;else if(/PRIM/.test(t))id='p'+n;else if(/^7/.test(t))id='7eb';else if(/^8/.test(t))id='8eb'}
 if(!id)return null;return{base:id,id:B||(/^7E B$/.test(t))?id+'b':id}}
function _nameCol(rows){for(let k=0;k<rows.length;k++){const r=rows[k];for(let i=1;i<r.length;i++)if(r[i-1]===1&&typeof r[i]==='string'&&r[i].trim().length>3)return{row:k,c:i}}return null}
function isSchoolWorkbook(wb){let n=0;for(const name of wb.SheetNames){if(!sheetLevel(name))continue;const rows=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,raw:true,defval:''});if(_nameCol(rows))n++}return n>=2}
function readSchoolWorkbook(wb){const out=[];for(const name of wb.SheetNames){const lv=sheetLevel(name);if(!lv)continue;const rows=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,raw:true,defval:''});
 const p=_nameCol(rows);if(!p)continue;const cN=p.c,cF=cN+1,cV=Array.from({length:30},(_,k)=>cN+2+k);let cT=cN+32;
 const hdr=rows.slice(0,p.row).reverse().find(r=>r.some(c=>/montant total/i.test(String(c))));if(hdr)cT=hdr.findIndex(c=>/montant total/i.test(String(c)));
 const list=[];for(const r of rows.slice(p.row)){const nm=String(r[cN]||'').replace(/\s+/g,' ').trim();if(!nm||/TOTAL/i.test(nm)||typeof r[cN-1]!=='number')continue;
  const v=cV.map(i=>r[i]);list.push({n:nm,fa:+r[cF]||0,v:v.filter(x=>typeof x==='number'&&x>0),ok:v.some(x=>/^ok$/i.test(String(x).trim())),t:+r[cT]||0})}
 const tots=list.map(x=>x.t).filter(Boolean);out.push({sheet:String(name).trim(),lv,fee:tots.length?Math.max(...tots):0,rows:list})}return out}

/* noms congolais : « NOM POSTNOM PRÉNOM(S) » → prénom = dernier mot */
function splitName(full){const w=full.split(' ');if(w.length===1)return{prenom:'',nom:w[0]};const cap=x=>x.charAt(0)+x.slice(1).toLowerCase();return{prenom:cap(w[w.length-1]),nom:w.slice(0,-1).join(' ')}}

function importSchoolData(data,opts={}){const fa=opts.fa??200;const LBL={cr:'Crèche',m1:'1re maternelle',m2:'2e maternelle',m3:'3e maternelle',p1:'1re primaire',p2:'2e primaire',p3:'3e primaire',p4:'4e primaire',p5:'5e primaire',p6:'6e primaire','7eb':'7e EB','8eb':'8e EB',h1s:'1re H. Scientifique',h1c:'1re H. Commerciale et gestion',h1l:'1re H. Littéraire'};
 /* 1. classes et tarifs */
 const used=new Set(data.map(d=>d.lv.id));
 for(const d of data){const {id,base}=d.lv;let f=S.fees.find(x=>x.id===id);
  if(!f){const b=S.fees.find(x=>x.id===base);f={...b,id,name:(LBL[base]||b.name)+' B'};S.fees.splice(S.fees.indexOf(b)+1,0,f);
   const bc=S.classes.find(c=>c.id===base);if(bc){S.classes.splice(S.classes.indexOf(bc)+1,0,{...bc,id,name:f.name});S.assign[id]=JSON.parse(JSON.stringify(S.assign[base]||{}));S.timetable[id]=JSON.parse(JSON.stringify(S.timetable[base]||[]))}}
  const same=data.filter(x=>x.lv.base===d.lv.base&&x.fee).map(x=>x.fee);f.scol=d.fee||(same.length?Math.min(...same):f.scol);f.insc=fa;f.reinsc=fa}
 /* 2. on vide les élèves, factures et paiements existants */
 const ids=new Set(students().map(s=>s.id));S.clients=S.clients.filter(c=>!ids.has(c.id));S.invoices=S.invoices.filter(i=>!ids.has(i.clientId));
 const keepInv=new Set(S.invoices.map(i=>i.id));S.txs=S.txs.filter(t=>!(t.match&&t.match.t==='inv'&&!keepInv.has(t.match.id)));
 for(const k of ['attendance','evaluations','threads','inscriptions'])if(Array.isArray(S[k]))S[k]=[];S.appelDone={};S.appr={};S.relances={};if(S.persona)S.persona.children=[];
 S.seq.inv=0;S.seq.rec=0;
 /* 3. élèves, échéances, paiements */
 const TR=[{n:1,date:'2026-09-01',due:'2026-11-05',pct:S.tranches[0]},{n:2,date:'2026-11-05',due:'2027-02-05',pct:S.tranches[1]},{n:3,date:'2027-02-05',due:'2027-04-05',pct:S.tranches[2]}].map(t=>({...t,sy:S.schoolYear}));
 let n=0,ntx=0;const report={eleves:0,classes:used.size,paye:0,ok:[],doublons:[]};const seen={};
 const mkInv=(st,tr)=>{S.seq.inv++;const inv={id:'iv'+S.seq.inv,num:'F-'+tr.date.slice(0,4)+'-'+String(S.seq.inv).padStart(5,'0'),clientId:st.id,date:tr.date,due:tr.due,currency:S.currency,rate:1,lines:feeLines(st,tr),status:'sent',notes:'',label:`${ord(tr.n)} tranche ${tr.sy}`,sy:tr.sy,tranche:tr.n};S.invoices.push(inv);return inv};
 const pay=(st,invs,amount,date,what)=>{let left=amount;for(let k=0;k<invs.length&&left>0.004;k++){const inv=invs[k];const due=rnd(invTotals(inv).ttc-sum(S.txs.filter(t=>t.match&&t.match.t==='inv'&&t.match.id===inv.id).map(t=>t.amount)));const a=k===invs.length-1?left:Math.min(left,due);if(a<=0.004)continue;
   ntx++;S.seq.rec++;S.txs.push({id:'txi'+ntx,tid:'c1',date,label:`Espèces – ${st.name} (${st.classe}) – ${what}`,amount:rnd(a),acc:null,match:{t:'inv',id:inv.id},ref:'REC-'+date.slice(0,4)+'-'+String(S.seq.rec).padStart(5,'0')});left=rnd(left-a)}};
 for(const d of data){const f=S.fees.find(x=>x.id===d.lv.id);for(const r0 of d.rows){const r={n:r0.n,fa:+r0.fa||0,v:r0.v||[],ok:!!r0.ok};n++;const {prenom,nom}=splitName(r.n);
  const st={id:'el'+n,type:'eleve',prenom,nom,name:(prenom?prenom+' ':'')+nom.toUpperCase(),sexe:'',level:f.id,classe:f.name,cycle:f.cycle,matricule:'LAIS-'+String(26000+n),birth:'',nouveau:true,cantine:false,transport:false,parent:{civ:'',name:'',phone:'',mm:''},country:S.company.country,city:S.company.city,currency:S.currency,terms:15,email:'',notes:r.ok?'Mention « OK » dans le fichier d’origine (sans montant)':''};
  S.clients.push(st);report.eleves++;const key=_nrm(r.n);(seen[key]=seen[key]||[]).push(f.name);if(r.ok)report.ok.push(st.name+' ('+f.name+')');
  const invs=TR.filter(t=>t.date<=TODAY).map(t=>mkInv(st,t));const total=r.fa+sum(r.v);
  const all=sum(invs.map(i=>invTotals(i).ttc));if(total>all+0.004)invs.push(...TR.filter(t=>t.date>TODAY).map(t=>mkInv(st,t)));
  if(r.fa)pay(st,invs,r.fa,'2026-09-01','frais administratifs');r.v.forEach((a,k)=>pay(st,invs,a,k===0?'2026-09-15':'2026-10-15','versement '+(k+1)));report.paye+=total}}
 report.doublons=Object.entries(seen).filter(([k,v])=>v.length>1).map(([k,v])=>k+' : '+v.join(', '));
 CACHE={};return report}

/* bouton dans la fenêtre « Importer des élèves » */
async function impSchoolFile(file){try{await loadLib('xlsx');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});if(!isSchoolWorkbook(wb))return false;const data=readSchoolWorkbook(wb);const nb=sum(data.map(d=>d.rows.length));
 modal('Remplacer la base des élèves',`<p style="margin-top:0">Ce fichier contient <b>${nb} élèves</b> répartis dans <b>${data.length} classes</b>, avec les frais administratifs et les versements.</p><div class="note warn mb">${ic('alert',16)}<div>Les élèves actuels, leurs échéances et leurs paiements seront remplacés. Les présences, notes et messages liés aux anciens élèves seront aussi effacés.</div></div>${field('Frais administratifs par élève ('+S.currency+')','isf-fa','200')}`,
 `<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" id="isf-go">Remplacer la base</button>`);
 document.getElementById('isf-go').onclick=()=>{const r=importSchoolData(data,{fa:parseNum(val('isf-fa'))||0});save();closeModal();go('eleves');toast(r.eleves+' élèves importés');if(r.doublons.length)setTimeout(()=>toast('À vérifier : '+r.doublons.length+' nom(s) en double'),1500)};return true}catch(e){toast(e.message);return true}}
const _impFileBase=impFile;
impFile=async function(file){if(file&&/\.(xlsx|xlsm|xls|ods)$/i.test(file.name)&&await impSchoolFile(file))return;return _impFileBase(file)};

/* première ouverture d'un établissement préparé avec un fichier d'élèves */
function buildFromImport(imp){seed('CD');blankState();if(imp.company)Object.assign(S.company,imp.company);importSchoolData(imp.data,{fa:imp.fa??200});S.users=[];return S}
