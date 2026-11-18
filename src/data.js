/* ================= PLANS COMPTABLES ================= */
const CHARTS={
OHADA:{name:'SYSCOHADA révisé',
 roles:{bank:'521',cash:'571',mobile:'552',client:'411',supplier:'401',vatOut:'4431',vatIn:'4452',vatDue:'4441',vatCredit:'4449',sales:'706',capital:'101',retained:'121',salExp:'661',socExp:'664',taxExp:'641',salPay:'422',socPay:'431',taxPay:'447',incTaxPay:'447',suspense:'471',transfer:'585'},
 accounts:{'101':'Capital social','121':'Report à nouveau créditeur','131':'Résultat net : bénéfice','2441':'Matériel de bureau','2442':'Matériel informatique','401':'Fournisseurs, dettes en compte','411':'Clients','422':'Personnel, rémunérations dues','431':'Sécurité sociale','4431':'TVA facturée sur ventes','4452':'TVA récupérable sur achats','4441':'État, TVA due','4449':'État, crédit de TVA à reporter','447':'État, impôts retenus à la source','471':'Compte d’attente','521':'Banques locales','552':'Monnaie électronique (Mobile Money)','571':'Caisse','585':'Virements de fonds','6051':'Fournitures non stockables – eau','6052':'Fournitures non stockables – électricité','6053':'Autres énergies (carburant)','6055':'Fournitures de bureau','6056':'Petit matériel et outillage','6181':'Voyages et déplacements','6222':'Locations de bâtiments','624':'Entretien, réparations et maintenance','625':'Primes d’assurance','627':'Publicité, publications, relations publiques','628':'Frais de télécommunications','631':'Frais bancaires','6324':'Honoraires','634':'Redevances pour logiciels','638':'Autres charges externes','641':'Impôts et taxes directs','661':'Rémunérations directes versées au personnel','664':'Charges sociales','706':'Services vendus','7061':'Frais d’inscription et de réinscription','7062':'Frais de scolarité','7063':'Bibliothèque numérique','7064':'Transport scolaire','7065':'Frais d’examens et activités','7011':'Ventes de tenues et fournitures','601':'Achats de tenues et fournitures revendues','602':'Achats de denrées (cantine)','707':'Produits accessoires','71':'Subventions d’exploitation'},
 expense:['602','601','6055','6056','6051','6052','6053','6181','6222','624','625','627','628','631','6324','634','638','2442'],
 income:['7062','7061','7063','7064','7065','7011','707','71'],
 cr:{prod:[['Chiffre d’affaires',['70']],['Subventions d’exploitation',['71']],['Autres produits',['75','77','78','79']]],
     chg:[['Achats et fournitures',['60']],['Transports',['61']],['Services extérieurs',['62','63']],['Impôts et taxes',['64']],['Autres charges',['65']],['Charges de personnel',['66']],['Charges financières',['67']],['Dotations',['68','69']]]}},
PCG:{name:'Plan comptable général (France)',
 roles:{bank:'512',cash:'530',mobile:'517',client:'411',supplier:'401',vatOut:'44571',vatIn:'44566',vatDue:'44551',vatCredit:'44567',sales:'706',capital:'101',retained:'110',salExp:'641',socExp:'645',taxExp:'631',salPay:'421',socPay:'431',taxPay:'447',incTaxPay:'4421',suspense:'471',transfer:'580'},
 accounts:{'101':'Capital','110':'Report à nouveau','120':'Résultat de l’exercice','2183':'Matériel de bureau et informatique','401':'Fournisseurs','411':'Clients','421':'Personnel – rémunérations dues','4421':'Prélèvement à la source','431':'Sécurité sociale','447':'Autres impôts, taxes et versements assimilés','44571':'TVA collectée','44566':'TVA déductible','44551':'TVA à décaisser','44567':'Crédit de TVA à reporter','471':'Compte d’attente','512':'Banque','517':'Monnaie électronique','530':'Caisse','580':'Virements internes','6061':'Fournitures non stockables (eau, énergie)','6063':'Petit équipement','6064':'Fournitures administratives','6132':'Locations immobilières','6156':'Maintenance','616':'Primes d’assurance','6226':'Honoraires','6231':'Publicité','6251':'Voyages et déplacements','626':'Frais postaux et télécommunications','627':'Services bancaires','628':'Charges externes diverses','631':'Impôts et taxes sur rémunérations','641':'Rémunérations du personnel','645':'Charges de sécurité sociale','651':'Redevances pour logiciels','706':'Prestations de services','7061':'Frais d’inscription et de réinscription','7062':'Frais de scolarité','7063':'Bibliothèque numérique','7064':'Transport scolaire','7065':'Frais d’examens et activités','7011':'Ventes de tenues et fournitures','607':'Achats de tenues et fournitures revendues','602':'Achats de denrées (cantine)','708':'Produits des activités annexes','74':'Subventions d’exploitation'},
 expense:['602','607','6064','6063','6061','6251','6132','6156','616','6231','626','627','6226','651','628','2183'],
 income:['7062','7061','7063','7064','7065','7011','708','74'],
 cr:{prod:[['Chiffre d’affaires',['70']],['Subventions d’exploitation',['74']],['Autres produits',['75','76','77','78']]],
     chg:[['Achats et fournitures',['60']],['Services extérieurs',['61','62']],['Impôts et taxes',['63']],['Charges de personnel',['64']],['Autres charges',['65']],['Charges financières',['66']],['Charges exceptionnelles',['67']],['Dotations',['68']]]}}
};
// correspondance des catégories de dépenses entre plans (pour le jeu de démonstration)
const CAT={fourn:{OHADA:'6055',PCG:'6064'},petit:{OHADA:'6056',PCG:'6063'},elec:{OHADA:'6052',PCG:'6061'},carb:{OHADA:'6053',PCG:'6061'},voyage:{OHADA:'6181',PCG:'6251'},loyer:{OHADA:'6222',PCG:'6132'},maint:{OHADA:'624',PCG:'6156'},assur:{OHADA:'625',PCG:'616'},pub:{OHADA:'627',PCG:'6231'},tel:{OHADA:'628',PCG:'626'},banque:{OHADA:'631',PCG:'627'},hono:{OHADA:'6324',PCG:'6226'},logi:{OHADA:'634',PCG:'651'},immo:{OHADA:'2442',PCG:'2183'},cantine:{OHADA:'602',PCG:'602'},revente:{OHADA:'601',PCG:'607'},eau:{OHADA:'6051',PCG:'6061'}};

/* ================= PAYS ================= */
const COUNTRIES={
CI:{name:'Côte d’Ivoire',flag:'🇨🇮',currency:'XOF',chart:'OHADA',vat:[18,9,0],city:'Abidjan',address:'Rue des Jardins, Cocody II Plateaux',phone:'+225 07 07 12 34 56',rc:'CI-ABJ-03-2021-B13-04512',taxId:'NCC 2104512 K',socId:'CNPS 412 587',k:1,sal:1,mm:['Orange Money','Wave','MTN MoMo'],bankName:'Banque Atlantique CI',
 payroll:{hours:173.33,smig:75000,pmss:0,hsA:15,hsB:50,leave:2.2,seniority:true,income:'CI',
  rules:[
   {id:'ret',label:'Retraite',org:'CNPS',base:'brut',ceil:3375000,sal:6.3,emp:7.7,ded:true},
   {id:'pf',label:'Prestations familiales',org:'CNPS',base:'brut',ceil:70000,sal:0,emp:5},
   {id:'mat',label:'Assurance maternité',org:'CNPS',base:'brut',ceil:70000,sal:0,emp:0.75},
   {id:'at',label:'Accidents du travail',org:'CNPS',base:'brut',ceil:70000,sal:0,emp:2},
   {id:'cmu',label:'Couverture maladie universelle (CMU)',org:'CNPS',fixedSal:1000,fixedEmp:1000},
   {id:'isp',label:'Impôt sur salaires – part patronale',org:'DGI',base:'brut',sal:0,emp:2.8,kind:'tax'},
   {id:'ta',label:'Taxe d’apprentissage',org:'DGI',base:'brut',sal:0,emp:0.4,kind:'tax'},
   {id:'fpc',label:'Formation professionnelle continue',org:'DGI',base:'brut',sal:0,emp:0.6,kind:'tax'}]},
 incomeNote:'ITS (réforme 2024) : barème mensuel progressif 0 % jusqu’à 75 000, puis 16 %, 21 %, 24 %, 28 % et 32 % au-delà de 8 000 000, diminué de la réduction pour charges de famille (RICF) selon le nombre de parts.'},
SN:{name:'Sénégal',flag:'🇸🇳',currency:'XOF',chart:'OHADA',vat:[18,10,0],city:'Dakar',address:'Route des Almadies, Ngor',phone:'+221 33 860 12 34',rc:'SN-DKR-2021-B-04512',taxId:'NINEA 008451236 2G3',socId:'IPRES 8 452 133',k:1,sal:1,mm:['Wave','Orange Money','Free Money'],bankName:'CBAO Groupe Attijariwafa',
 payroll:{hours:173.33,smig:64223,pmss:0,hsA:15,hsB:40,leave:2,seniority:false,income:'SN',
  rules:[
   {id:'iprg',label:'IPRES – régime général',org:'IPRES',base:'brut',ceil:432000,sal:5.6,emp:8.4,ded:true},
   {id:'iprc',label:'IPRES – régime cadre',org:'IPRES',base:'brut',ceil:1296000,sal:2.4,emp:3.6,ded:true,scope:'cadre'},
   {id:'pf',label:'Prestations familiales',org:'CSS',base:'brut',ceil:63000,sal:0,emp:7},
   {id:'at',label:'Accidents du travail',org:'CSS',base:'brut',ceil:63000,sal:0,emp:1},
   {id:'ipm',label:'IPM – assurance maladie',org:'IPM',base:'brut',ceil:250000,sal:3,emp:3},
   {id:'cfce',label:'Contribution forfaitaire à la charge de l’employeur (CFCE)',org:'DGID',base:'brut',sal:0,emp:3,kind:'tax'},
   {id:'trimf',label:'TRIMF',org:'DGID',kind:'tax',table:[[50000,75],[83333,300],[166666,400],[583333,1000],[1000000,1500],[1e15,3000]]}]},
 incomeNote:'IR : revenu annuel après abattement de 30 % (plafonné à 900 000) et cotisations retraite, barème 0 % jusqu’à 630 000 puis 20 %, 30 %, 35 %, 37 % et 40 % ; réduction pour charges de famille selon les parts. TRIMF selon la tranche de salaire.'},
CM:{name:'Cameroun',flag:'🇨🇲',currency:'XAF',chart:'OHADA',vat:[19.25,0],city:'Douala',address:'Boulevard de la Liberté, Akwa',phone:'+237 6 99 12 34 56',rc:'RC/DLA/2021/B/04512',taxId:'NIU M012112345678A',socId:'CNPS 312-4512587-A',k:1,sal:1.05,mm:['MTN MoMo','Orange Money'],bankName:'Afriland First Bank',
 payroll:{hours:173.33,smig:41875,pmss:0,hsA:20,hsB:30,leave:1.5,seniority:false,income:'CM',
  rules:[
   {id:'pvid',label:'Pension vieillesse, invalidité, décès',org:'CNPS',base:'brut',ceil:750000,sal:4.2,emp:4.2,ded:true},
   {id:'pf',label:'Prestations familiales',org:'CNPS',base:'brut',ceil:750000,sal:0,emp:7},
   {id:'at',label:'Accidents du travail',org:'CNPS',base:'brut',sal:0,emp:1.75},
   {id:'cfc',label:'Crédit foncier (CFC)',org:'DGI',base:'brut',sal:1,emp:1.5,kind:'tax'},
   {id:'fne',label:'Fonds national de l’emploi (FNE)',org:'DGI',base:'brut',sal:0,emp:1,kind:'tax'},
   {id:'rav',label:'Redevance audiovisuelle (RAV)',org:'DGI',kind:'tax',table:[[50000,0],[100000,750],[200000,1950],[300000,3250],[400000,4550],[500000,5850],[600000,7150],[700000,8450],[800000,9750],[900000,11050],[1000000,12350],[1e15,13000]]},
   {id:'tdl',label:'Taxe de développement local (TDL)',org:'DGI',kind:'tax',table:[[62000,0],[75000,250],[100000,500],[125000,750],[150000,1000],[200000,1250],[250000,1500],[300000,2000],[500000,2250],[1e15,2500]]}]},
 incomeNote:'IRPP : (brut annuel × 70 %) − cotisations CNPS − 500 000, barème 10 % jusqu’à 2 M, 15 % jusqu’à 3 M, 25 % jusqu’à 5 M, 35 % au-delà ; centimes additionnels communaux de 10 % ; aucune retenue sous 62 000 par mois.'},
GN:{name:'Guinée',flag:'🇬🇳',currency:'GNF',chart:'OHADA',vat:[18,0],city:'Conakry',address:'Quartier Kaloum, Avenue de la République',phone:'+224 622 12 34 56',rc:'RCCM/GN.KAL/2021/B/04512',taxId:'NIF 451258741',socId:'CNSS 45 125 874',k:15.2,sal:15.2,mm:['Orange Money','MTN MoMo'],bankName:'Ecobank Guinée',
 payroll:{hours:173.33,smig:550000,pmss:0,hsA:30,hsB:60,leave:2.5,seniority:false,income:'GN',
  rules:[
   {id:'cnss',label:'Sécurité sociale',org:'CNSS',base:'brut',ceil:2500000,sal:5,emp:18,ded:true},
   {id:'vf',label:'Versement forfaitaire',org:'DNI',base:'brut',sal:0,emp:6,kind:'tax'},
   {id:'ta',label:'Taxe d’apprentissage',org:'DNI',base:'brut',sal:0,emp:1.5,kind:'tax'}]},
 incomeNote:'RTS : barème mensuel progressif sur le salaire après CNSS, 0 % jusqu’à 1 000 000 GNF puis 5 %, 10 %, 15 % et 20 % au-delà de 20 000 000 GNF.'},
FR:{name:'France',flag:'🇫🇷',currency:'EUR',chart:'PCG',vat:[20,10,5.5,0],city:'Metz',address:'12 rue Serpenoise',phone:'+33 3 87 00 00 00',rc:'RCS Metz 912 345 678',taxId:'TVA FR12 912345678',socId:'URSSAF 577 000 123 456',k:1/655.957*1.6,sal:1/655.957*1.75,mm:['Lydia Pro'],bankName:'Banque Populaire',
 payroll:{hours:151.67,smig:1823.03,pmss:4005,hsA:25,hsB:50,leave:2.5,seniority:false,income:'FR',
  rules:[
   {id:'mal',label:'Maladie, maternité, invalidité, décès',org:'URSSAF',base:'brut',sal:0,emp:13,ded:true},
   {id:'vp',label:'Vieillesse plafonnée',org:'URSSAF',base:'ta',sal:6.9,emp:8.55,ded:true},
   {id:'vd',label:'Vieillesse déplafonnée',org:'URSSAF',base:'brut',sal:0.4,emp:2.11,ded:true},
   {id:'af',label:'Allocations familiales',org:'URSSAF',base:'brut',sal:0,emp:5.25,ded:true},
   {id:'at',label:'Accidents du travail',org:'URSSAF',base:'brut',sal:0,emp:0.76,ded:true},
   {id:'cho',label:'Assurance chômage',org:'URSSAF',base:'brut',ceil:16020,sal:0,emp:4,ded:true},
   {id:'ags',label:'AGS',org:'URSSAF',base:'brut',ceil:16020,sal:0,emp:0.25,ded:true},
   {id:'t1',label:'Retraite complémentaire T1',org:'Agirc-Arrco',base:'ta',sal:3.15,emp:4.72,ded:true},
   {id:'ceg1',label:'CEG T1',org:'Agirc-Arrco',base:'ta',sal:0.86,emp:1.29,ded:true},
   {id:'t2',label:'Retraite complémentaire T2',org:'Agirc-Arrco',base:'tb',sal:8.64,emp:12.95,ded:true},
   {id:'ceg2',label:'CEG T2',org:'Agirc-Arrco',base:'tb',sal:1.08,emp:1.62,ded:true},
   {id:'apec',label:'APEC',org:'Agirc-Arrco',base:'brut',ceil:16020,sal:0.024,emp:0.036,ded:true,scope:'cadre'},
   {id:'prev',label:'Prévoyance cadres',org:'Prévoyance',base:'ta',sal:0,emp:1.5,scope:'cadre'},
   {id:'mut',label:'Complémentaire santé',org:'Prévoyance',fixedSal:38,fixedEmp:38,ded:true},
   {id:'fnal',label:'FNAL',org:'URSSAF',base:'ta',sal:0,emp:0.1},
   {id:'csa',label:'Contribution solidarité autonomie',org:'URSSAF',base:'brut',sal:0,emp:0.3},
   {id:'csgd',label:'CSG déductible',org:'URSSAF',base:'csg',sal:6.8,emp:0,ded:true},
   {id:'csgn',label:'CSG non déductible',org:'URSSAF',base:'csg',sal:2.4,emp:0},
   {id:'crds',label:'CRDS',org:'URSSAF',base:'csg',sal:0.5,emp:0},
   {id:'fp',label:'Formation professionnelle',org:'URSSAF',base:'brut',sal:0,emp:0.55,kind:'tax'},
   {id:'tap',label:'Taxe d’apprentissage',org:'URSSAF',base:'brut',sal:0,emp:0.68,kind:'tax'},
   {id:'ds',label:'Contribution au dialogue social',org:'URSSAF',base:'brut',sal:0,emp:0.016,kind:'tax'}]},
 incomeNote:'Prélèvement à la source : taux personnalisé transmis par la DGFiP, appliqué au net imposable. Barèmes 2026 : PMSS 4 005 €, SMIC 1 823,03 €. Réduction générale (RGDU) non calculée dans cette version.'}
};
const ORG_INFO={CNPS:'Caisse nationale de prévoyance sociale',DGI:'Direction générale des impôts',IPRES:'Institution de prévoyance retraite',CSS:'Caisse de sécurité sociale',IPM:'Institution de prévoyance maladie',DGID:'Direction générale des impôts et domaines',CNSS:'Caisse nationale de sécurité sociale',DNI:'Direction nationale des impôts',URSSAF:'URSSAF','Agirc-Arrco':'Retraite complémentaire',Prévoyance:'Organisme de prévoyance',DGFiP:'Direction générale des finances publiques'};

/* ================= MOTEUR DE PAIE ================= */
function prog(x,br){let t=0,prev=0;for(const[up,r]of br){if(x>prev)t+=(Math.min(x,up)-prev)*r/100;prev=up}return t}
const INCOME={
 CI:c=>{const b=c.taxable;let t=prog(b,[[75000,0],[240000,16],[800000,21],[2400000,24],[8000000,28],[1e15,32]]);const ricf={1:0,1.5:5500,2:11000,2.5:16500,3:22000,3.5:27500,4:33000,4.5:38500,5:44000}[c.emp.parts||1]||0;return[{label:'Impôt sur traitements et salaires (ITS)',base:b,amount:Math.max(0,t-ricf),org:'DGI'}]},
 SN:c=>{const ann=c.gross*12,abat=Math.min(ann*.3,900000),base=Math.max(0,ann-abat-c.ded*12);let ir=prog(base,[[630000,0],[1500000,20],[4000000,30],[8000000,35],[13500000,37],[1e15,40]]);const red={1:0,1.5:.1,2:.15,2.5:.2,3:.25,3.5:.3,4:.35,4.5:.4,5:.45}[c.emp.parts||1]||0;return[{label:'Impôt sur le revenu (IR)',base:base/12,amount:ir*(1-red)/12,org:'DGID'}]},
 CM:c=>{if(c.gross<62000)return[{label:'IRPP',base:0,amount:0,org:'DGI'}];const base=Math.max(0,c.gross*12*.7-c.ded*12-500000);const ir=prog(base,[[2000000,10],[3000000,15],[5000000,25],[1e15,35]])/12;return[{label:'IRPP',base:base/12,amount:ir,org:'DGI'},{label:'Centimes additionnels communaux (10 % IRPP)',base:ir,rate:10,amount:ir*.1,org:'DGI'}]},
 GN:c=>{const b=c.taxable;return[{label:'Retenue sur traitements et salaires (RTS)',base:b,amount:prog(b,[[1000000,0],[5000000,5],[10000000,10],[20000000,15],[1e15,20]]),org:'DNI'}]},
 FR:c=>{const b=c.taxable+c.nonDedCsg;return[{label:'Impôt sur le revenu prélevé à la source',base:b,rate:c.emp.pas||0,amount:b*(c.emp.pas||0)/100,org:'DGFiP'}]}
};
function seniorityYears(emp,m){const a=pd(emp.entry),b=pd(lastDay(m));let y=b.getFullYear()-a.getFullYear();if(b.getMonth()<a.getMonth()||(b.getMonth()===a.getMonth()&&b.getDate()<a.getDate()))y--;return Math.max(0,y)}
function calcPay(emp,v,m,cfg){
 cfg=cfg||S.payroll;v=v||{};const cur=S.currency,r=x=>rnd(x,cur);
 const hourly=emp.hourly||emp.base/(emp.hours||cfg.hours);const gains=[];
 const g=(label,base,rateTxt,amount)=>{amount=r(amount);if(amount)gains.push({label,base,rate:rateTxt,amount})};
 if(emp.hourly)g('Heures de cours (taux horaire '+nfmt(emp.hourly)+')',v.hrs||0,'',(v.hrs||0)*emp.hourly);else g('Salaire de base',emp.hours||cfg.hours,'',emp.base);
 if(v.abs)g('Absence non rémunérée',v.abs,'',-v.abs*hourly);
 if(cfg.seniority&&!emp.hourly){const y=seniorityYears(emp,m);const p=y>=2?Math.min(25,y):0;if(p)g('Prime d’ancienneté ('+y+' ans)',emp.base,p,emp.base*p/100)}
 if(emp.primeFixe)g('Prime de fonction','','',emp.primeFixe);
 if(emp.logement)g('Indemnité de logement','','',emp.logement);
 if(v.hsA)g('Heures supplémentaires +'+cfg.hsA+' %',v.hsA,'',v.hsA*hourly*(1+cfg.hsA/100));
 if(v.hsB)g('Heures supplémentaires +'+cfg.hsB+' %',v.hsB,'',v.hsB*hourly*(1+cfg.hsB/100));
 if(v.prime)g('Prime exceptionnelle','','',v.prime);
 const gross=r(sum(gains.map(x=>x.amount)));
 const pm=cfg.pmss||0;const cadre=emp.statut==='Cadre';
 const cots=[];let ded=0,salSoc=0,salTax=0,empSoc=0,empTax=0,nonDedCsg=0,empHealth=0;
 for(const rl of cfg.rules){if(rl.scope==='cadre'&&!cadre)continue;if(rl.scope==='noncadre'&&cadre)continue;
  let base=null,s=0,e=0;
  if(rl.table){const row=rl.table.find(t=>gross<=t[0]);s=r(row?row[1]:0);}
  else if(rl.fixedSal!=null||rl.fixedEmp!=null){s=r(rl.fixedSal||0);e=r(rl.fixedEmp||0);if(rl.org==='Prévoyance')empHealth+=e}
  else{
   if(rl.base==='ta')base=Math.min(gross,pm||gross);
   else if(rl.base==='tb')base=pm?Math.max(0,Math.min(gross,8*pm)-pm):0;
   else if(rl.base==='csg')base=0.9825*Math.min(gross+empHealth,4*pm||1e15)+Math.max(0,gross+empHealth-(4*pm||1e15));
   else base=rl.ceil?Math.min(gross,rl.ceil):gross;
   base=r(base);s=r(base*(rl.sal||0)/100);e=r(base*(rl.emp||0)/100);
   if(rl.org==='Prévoyance')empHealth+=e;
  }
  if(!s&&!e)continue;
  const kind=rl.kind||'social';
  cots.push({id:rl.id,label:rl.label,org:rl.org,base,sal:s,emp:e,rs:rl.sal,re:rl.emp,kind,table:!!rl.table,fixed:rl.fixedSal!=null||rl.fixedEmp!=null});
  if(rl.ded)ded+=s; if(rl.id==='csgn'||rl.id==='crds')nonDedCsg+=s;
  if(kind==='tax'){salTax+=s;empTax+=e}else{salSoc+=s;empSoc+=e}
 }
 const taxable=r(gross-ded);
 const taxes=(INCOME[cfg.income]||(()=>[]))({gross,taxable,ded,emp,nonDedCsg}).map(t=>({...t,amount:r(t.amount),base:t.base!=null?r(t.base):null}));
 const incomeTax=r(sum(taxes.map(t=>t.amount)));
 const transport=r(emp.transport||0);
 const net=r(gross-salSoc-salTax-incomeTax+transport);
 return{emp:emp.id,month:m,gains,gross,cots,taxes,ded:r(ded),taxable:cfg.income==='FR'?r(taxable+nonDedCsg):taxable,incomeTax,transport,salSoc:r(salSoc),salTax:r(salTax),empSoc:r(empSoc),empTax:r(empTax),net,cost:r(gross+empSoc+empTax+transport),cp:v.cp||0}
}

let S;
function workDays(a,b){let n=0;for(let d=a;d<=b;d=addDays(d,1)){const w=pd(d).getDay();if(w!==0&&w!==6)n++}return n}
