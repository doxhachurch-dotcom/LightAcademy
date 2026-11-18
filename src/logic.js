/* ================= MODÈLE ================= */
const roles=()=>CHARTS[S.chart].roles;
const accLabel=a=>(a==='411'&&S.school?'Parents d’élèves':null)||S.customAcc[a]||CHARTS[S.chart].accounts[a]||'Compte '+a;
const client=id=>S.clients.find(c=>c.id===id)||{name:'—',currency:S.currency};
const supplier=id=>S.suppliers.find(c=>c.id===id)||{name:'—',currency:S.currency};
const emp=id=>S.employees.find(e=>e.id===id);
const treso=id=>S.treasury.find(t=>t.id===id);
const empName=e=>e?e.prenom+' '+e.nom:'—';
const country=()=>COUNTRIES[S.country];
const curMonth=()=>TODAY.slice(0,7)>YEAR+'-12'?YEAR+'-12':TODAY.slice(0,7);
function exMonths(){const out=[];for(let m=1;m<=12;m++){const k=YEAR+'-'+pad(m);if(k>TODAY.slice(0,7))break;out.push(k)}return out.length?out:[YEAR+'-01']}

function invTotals(i){let ht=0,tva=0;const by={};for(const l of i.lines){const h=(parseNum(l.qty))*(parseNum(l.price));const t=h*(parseNum(l.vat))/100;ht+=h;tva+=t;by[l.vat]=(by[l.vat]||0)+t}const c=i.currency||S.currency;return{ht:rnd(ht,c),tva:rnd(tva,c),ttc:rnd(rnd(ht,c)+rnd(tva,c),c),by}}
function matchIdx(){return cached('mi',()=>{const m={};for(const t of S.txs)if(t.match){const k=t.match.t+t.match.id;(m[k]=m[k]||[]).push(t)}return m})}
const invTtcLocal=i=>rnd(invTotals(i).ttc*(i.rate||1));
const invPaid=i=>rnd(sum((matchIdx()['inv'+i.id]||[]).map(t=>t.amount)));
function invStatus(i){if(i.status==='draft')return'draft';if(i.status==='cancelled')return'cancelled';const ttc=invTtcLocal(i),p=invPaid(i);if(p>=ttc-1)return'paid';if(i.due<TODAY)return'late';return p>0?'partial':'sent'}
const INV_ST={draft:['Brouillon','b-gray'],sent:['En attente','b-blue'],partial:['Partiellement payée','b-amber'],late:['En retard','b-red'],paid:['Payée','b-green'],cancelled:['Annulée','b-gray']};
const Q_ST={draft:['Brouillon','b-gray'],sent:['Envoyé','b-blue'],accepted:['Accepté','b-green'],refused:['Refusé','b-red'],invoiced:['Facturé','b-indigo']};
const purTtc=p=>rnd((p.ht+p.tva)*(p.rate||1));
const purPaid=p=>rnd(-sum((matchIdx()['pur'+p.id]||[]).map(t=>t.amount)));
function purStatus(p){const t=purTtc(p),pa=purPaid(p);if(pa>=t-1)return'paid';if(p.due<TODAY)return'late';return pa>0?'partial':'pending'}
const PUR_ST={pending:['À payer','b-blue'],partial:['Partiel','b-amber'],late:['En retard','b-red'],paid:['Payée','b-green']};
function tresoBalance(id){return cached('tb'+id,()=>{const t=treso(id);return rnd(t.opening+sum(S.txs.filter(x=>x.tid===id).map(x=>x.amount)))})}
const totalCash=()=>sum(S.treasury.map(t=>tresoBalance(t.id)));

/* ---------- Grand livre ---------- */
function ledger(){return cached('ledger',()=>{const E=[],R=roles();
 const op=sum(S.treasury.map(t=>t.opening));
 E.push({id:'an',date:YEAR+'-01-01',j:'AN',piece:'AN-'+YEAR,label:'À-nouveaux – ouverture de l’exercice',lines:[...S.treasury.map(t=>({acc:t.acc,d:t.opening,c:0,label:t.name})),{acc:R.capital,d:0,c:S.capital},{acc:R.retained,d:0,c:rnd(op-S.capital)}]});
 for(const i of S.invoices){if(i.status==='draft'||i.status==='cancelled')continue;const t=invTotals(i),r=i.rate||1;const ht=rnd(t.ht*r),tva=rnd(t.tva*r);const cn=client(i.clientId).name;const by={};for(const ln of i.lines){const k=ln.acc||R.sales;by[k]=(by[k]||0)+parseNum(ln.qty)*parseNum(ln.price)*r}const parts=Object.entries(by).map(([k,v])=>[k,rnd(v)]);const hts=rnd(sum(parts.map(p=>p[1])));const L=[{acc:R.client,d:rnd(hts+tva),c:0,label:cn},...parts.map(([k,v])=>({acc:k,d:0,c:v,label:cn}))];if(tva)L.push({acc:R.vatOut,d:0,c:tva,label:'TVA collectée'});E.push({id:'vt'+i.id,date:i.date,j:'VT',piece:i.num,label:'Facture '+i.num+' – '+cn,lines:L,src:{t:'inv',id:i.id}})}
 for(const p of S.purchases){const r=p.rate||1,ht=rnd(p.ht*r),tva=rnd(p.tva*r);const sn=supplier(p.supplierId).name;const L=[{acc:p.acc,d:ht,c:0,label:p.label}];if(tva)L.push({acc:R.vatIn,d:tva,c:0,label:'TVA déductible'});L.push({acc:R.supplier,d:0,c:rnd(ht+tva),label:sn});E.push({id:'ha'+p.id,date:p.date,j:'HA',piece:p.ref,label:sn+' – '+p.label,lines:L,src:{t:'pur',id:p.id}})}
 for(const t of S.txs){const tr=treso(t.tid);if(!tr)continue;const cp=t.match?(t.match.t==='inv'?R.client:R.supplier):(t.acc||R.suspense);const a=Math.abs(t.amount);E.push({id:'bq'+t.id,date:t.date,j:tr.journal,piece:t.ref||t.id.toUpperCase(),label:t.label,lines:t.amount>=0?[{acc:tr.acc,d:a,c:0},{acc:cp,d:0,c:a}]:[{acc:cp,d:a,c:0},{acc:tr.acc,d:0,c:a}],src:{t:'tx',id:t.id}})}
 for(const o of S.od)E.push(o);
 return E.sort((a,b)=>a.date.localeCompare(b.date)||(a.j==='AN'?-1:b.j==='AN'?1:0))})}
function balances(){return cached('bal',()=>{const B={};for(const e of ledger())for(const l of e.lines){const b=B[l.acc]=B[l.acc]||{d:0,c:0};b.d+=l.d;b.c+=l.c}for(const k in B){B[k].d=rnd(B[k].d);B[k].c=rnd(B[k].c)}return B})}
const solde=a=>{const b=balances()[a];return b?rnd(b.d-b.c):0};
function sumPrefix(prefixes,sign){const B=balances();let t=0;for(const a in B)if(prefixes.some(p=>a.startsWith(p)))t+=sign*(B[a].d-B[a].c);return rnd(t)}
function result(){const p=sumPrefix(['7'],-1),c=sumPrefix(['6'],1);return{prod:p,chg:c,res:rnd(p-c)}}
function monthFlow(prefixes,sign,m){let t=0;for(const e of ledger()){if(!e.date.startsWith(m))continue;for(const l of e.lines)if(prefixes.some(p=>l.acc.startsWith(p)))t+=sign*(l.d-l.c)}return rnd(t)}

/* ---------- Paie ---------- */
function postPayroll(m){const run=S.runs[m];const R=roles();const res=Object.values(run.results);const T=k=>rnd(sum(res.map(r=>r[k])));
 const gross=rnd(T('gross')+T('transport'));const L=[{acc:R.salExp,d:gross,c:0,label:'Salaires bruts et indemnités'},{acc:R.socExp,d:T('empSoc'),c:0,label:'Cotisations sociales patronales'}];
 if(T('empTax'))L.push({acc:R.taxExp,d:T('empTax'),c:0,label:'Taxes patronales sur salaires'});
 L.push({acc:R.socPay,d:0,c:rnd(T('salSoc')+T('empSoc')),label:'Cotisations sociales à reverser'});
 if(T('salTax')+T('empTax'))L.push({acc:R.taxPay,d:0,c:rnd(T('salTax')+T('empTax')),label:'Taxes sur salaires à reverser'});
 if(T('incomeTax'))L.push({acc:R.incTaxPay,d:0,c:T('incomeTax'),label:'Impôt sur salaires retenu'});
 L.push({acc:R.salPay,d:0,c:T('net'),label:'Salaires nets à payer'});
 S.od=S.od.filter(o=>!(o.src&&o.src.t==='pay'&&o.src.m===m));
 S.od.push({id:'pa'+m,date:lastDay(m),j:'PA',piece:'PAIE-'+m,label:'Paie de '+monthLabel(m),lines:L,src:{t:'pay',m}})}
function declGroups(m,live){const run=S.runs[m];if(!run)return[];const R=roles();const res=run.status==='validated'?Object.values(run.results):(live?payable(m).map(e=>calcPay(e,run.vars[e.id]||{},m)):[]);const G={};
 const add=(org,kind,amt)=>{const acc=kind==='social'?R.socPay:kind==='tax'?R.taxPay:R.incTaxPay;const key=org+'|'+acc;if(!G[key])G[key]={key,org,acc,kind,amount:0,what:kind==='social'?'Cotisations sociales':kind==='tax'?'Taxes sur salaires':'Impôt retenu à la source'};else if(G[key].kind!==kind)G[key].what='Impôts et taxes sur salaires';G[key].amount+=amt};
 for(const r of res){for(const c of r.cots)add(c.org,c.kind,c.sal+c.emp);for(const t of r.taxes)add(t.org,'income',t.amount)}
 return Object.values(G).filter(g=>g.amount>0).map(g=>({...g,amount:rnd(g.amount)})).sort((a,b)=>b.amount-a.amount)}
function runResults(m){const run=S.runs[m];if(!run)return[];if(run.status==='validated')return S.employees.filter(e=>run.results[e.id]).map(e=>run.results[e.id]);return cached('rr'+m,()=>payable(m).map(e=>calcPay(e,run.vars[e.id]||{},m)))}
function payable(m){const run=S.runs[m];return S.employees.filter(e=>e.status!=='Sorti'&&(!e.hourly||((run&&run.vars[e.id]||{}).hrs>0)))}
function leaveBalance(e){const months=exMonths().filter(m=>m>=e.entry.slice(0,7)).length;const acq=rnd(S.payroll.leave*months,'EUR');const taken=sum(S.leaves.filter(l=>l.empId===e.id&&l.type==='Congés payés'&&l.status==='approved'&&l.from.startsWith(YEAR)).map(l=>l.days));return{n1:e.cpN1||0,acq,taken,solde:rnd((e.cpN1||0)+acq-taken,'EUR')}}

/* ---------- TVA ---------- */
function vatOf(m){return cached('vat'+m,()=>{let out=0,inn=0;for(const i of S.invoices){if(i.status==='draft'||i.status==='cancelled'||!i.date.startsWith(m))continue;out+=invTotals(i).tva*(i.rate||1)}for(const p of S.purchases){if(p.date.startsWith(m))inn+=p.tva*(p.rate||1)}out=rnd(out);inn=rnd(inn);return{out,in:inn,due:rnd(out-inn)}})}
function postVat(m){CACHE={};const v=vatOf(m),R=roles();const L=[];if(v.out)L.push({acc:R.vatOut,d:v.out,c:0,label:'TVA collectée'});if(v.in)L.push({acc:R.vatIn,d:0,c:v.in,label:'TVA déductible'});if(v.due>0)L.push({acc:R.vatDue,d:0,c:v.due,label:'TVA due'});else if(v.due<0)L.push({acc:R.vatCredit,d:-v.due,c:0,label:'Crédit de TVA'});
 S.od=S.od.filter(o=>!(o.src&&o.src.t==='vat'&&o.src.m===m));if(L.length)S.od.push({id:'tva'+m,date:lastDay(m),j:'OD',piece:'TVA-'+m,label:'Déclaration de TVA – '+monthLabel(m),lines:L,src:{t:'vat',m}});S.vat[m]={declared:true,paid:(S.vat[m]||{}).paid||false}}
