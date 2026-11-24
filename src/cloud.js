/* =====================================================================
   SUPABASE : comptes en ligne et données partagées de l'établissement
   - Les comptes de démonstration restent en local (navigateur).
   - Les autres adresses se connectent à Supabase : les données de l'école
     sont enregistrées en ligne et partagées entre les membres de l'équipe.
   ===================================================================== */
const CLOUD={url:'https://nxlizxdokrzxqbrghvgw.supabase.co',key:'sb_publishable_NmCaA7_cwPqM1-mn-X4jIw_oU9DOZwD',lib:'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'};
const CLOUD_META='light-academy-cloud';
let SB=null,CL=null;
const ROLE_FR={admin:'Administrateur',prof:'Professeur',rh:'Ressources humaines',compta:'Comptabilité',parent:'Parent'};

function sbClient(){if(SB)return Promise.resolve(SB);return new Promise((res,rej)=>{const go_=()=>{try{SB=window.supabase.createClient(CLOUD.url,CLOUD.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'la-auth'}});SB.auth.onAuthStateChange(ev=>{if(ev==='PASSWORD_RECOVERY')openNewPassword()});res(SB)}catch(e){rej(e)}};
 if(window.supabase&&window.supabase.createClient)return go_();const s=document.createElement('script');s.src=CLOUD.lib;s.onload=go_;s.onerror=()=>rej(new Error('Serveur injoignable. Vérifiez la connexion internet.'));document.head.appendChild(s)})}
function fnv(str){let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(36)+':'+str.length}
const cacheKey=sid=>'light-academy-data-'+sid;
const authErr=e=>{const m=String(e&&e.message||e||'');if(/Invalid login/i.test(m))return 'Adresse e-mail ou mot de passe incorrect.';if(/not confirmed/i.test(m))return 'Adresse e-mail pas encore confirmée : ouvrez le lien reçu par e-mail.';if(/already registered/i.test(m))return 'Un compte existe déjà avec cette adresse. Utilisez « Se connecter » ou « Mot de passe oublié ».';if(/Password should/i.test(m))return 'Le mot de passe doit contenir au moins 6 caractères.';if(/fetch|network|injoignable/i.test(m)||!navigator.onLine)return 'Pas de connexion internet. La première connexion sur un appareil doit se faire en ligne ; ensuite, Light Academy fonctionne aussi hors ligne.';return m||'Une erreur est survenue.'};
function lgMsg(t,ok){const el=document.getElementById('lg-err');if(!el)return toast(t);el.textContent=t;el.className='note '+(ok?'ok':'warn')+' mb';el.style.display='flex'}
function lgBusy(b,txt){const x=document.querySelector('.login-btn');if(x){x.disabled=b;x.textContent=b?(txt||'Connexion…'):'Se connecter'}}

/* ---------- connexion ---------- */
doLogin=function(ev){ev.preventDefault();const em=val('lg-e').trim().toLowerCase(),pw=document.getElementById('lg-p').value;
 const local=(S.users||[]).find(u=>u.email.toLowerCase()===em&&u.pwd===hashPwd(em,pw));if(local||/@lightacademy\.com$/.test(em)){const err=login(em,pw);if(err)lgMsg(err);return}
 lgBusy(true);sbClient().then(sb=>sb.auth.signInWithPassword({email:em,password:pw})).then(({error})=>{if(error)throw error;return cloudEnter()}).catch(e=>{lgBusy(false);lgMsg(authErr(e))})};

function openSignup(){modal('Première connexion',`<p class="sm muted" style="margin-top:0">Utilisez l’adresse e-mail que l’administrateur de l’école a enregistrée pour vous. Si vous créez une nouvelle école, utilisez votre adresse professionnelle.</p><div id="su-err" class="note warn mb" style="display:none"></div><div class="form-grid">${field('Adresse e-mail','su-e','',{full:true,type:'email'})}${field('Mot de passe (6 caractères minimum)','su-p','',{full:true,type:'password'})}${field('Confirmer le mot de passe','su-p2','',{full:true,type:'password'})}</div>`,`<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" id="su-go" onclick="doSignup()">Créer mon mot de passe</button>`)}
function doSignup(){const em=val('su-e').trim().toLowerCase(),p=val('su-p'),p2=val('su-p2');const err=t=>{const el=document.getElementById('su-err');el.textContent=t;el.style.display='flex'};
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return err('Adresse e-mail invalide.');if(p.length<6)return err('Le mot de passe doit contenir au moins 6 caractères.');if(p!==p2)return err('Les deux mots de passe ne sont pas identiques.');
 const b=document.getElementById('su-go');b.disabled=true;b.textContent='Création…';
 sbClient().then(sb=>sb.auth.signUp({email:em,password:p,options:{emailRedirectTo:location.origin+location.pathname}})).then(({data,error})=>{if(error)throw error;closeModal();if(data.session)return cloudEnter();lgMsg('Compte créé. Ouvrez le lien de confirmation envoyé à '+em+', puis connectez-vous.',true)}).catch(e=>{b.disabled=false;b.textContent='Créer mon mot de passe';err(authErr(e))})}
function openForgot(){modal('Mot de passe oublié',`<p class="sm muted" style="margin-top:0">Vous recevrez un lien par e-mail pour choisir un nouveau mot de passe.</p><div class="form-grid">${field('Adresse e-mail','fg-e',val('lg-e')||'',{full:true,type:'email'})}</div>`,`<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="doForgot()">Envoyer le lien</button>`)}
function doForgot(){const em=val('fg-e').trim().toLowerCase();sbClient().then(sb=>sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname})).then(({error})=>{if(error)throw error;closeModal();lgMsg('Lien envoyé à '+em+'.',true)}).catch(e=>toast(authErr(e)))}
function openNewPassword(){modal('Nouveau mot de passe',`<div class="form-grid">${field('Nouveau mot de passe','np-p','',{full:true,type:'password'})}</div>`,`<button class="btn btn-primary" onclick="doNewPassword()">Enregistrer</button>`)}
function doNewPassword(){const p=val('np-p');if(p.length<6)return toast('6 caractères minimum');sbClient().then(sb=>sb.auth.updateUser({password:p})).then(({error})=>{if(error)throw error;closeModal();toast('Mot de passe modifié');cloudEnter()}).catch(e=>toast(authErr(e)))}

/* lien « Première connexion » et « Mot de passe oublié » sous le formulaire */
const _renderLoginLocal=renderLogin;
renderLogin=function(){_renderLoginLocal();const f=document.querySelector('.login form');if(f&&!document.getElementById('lg-more'))f.insertAdjacentHTML('afterend',`<div id="lg-more" class="flex-between sm" style="margin-top:14px"><button class="link sm" onclick="openSignup()">Première connexion ? Créer mon mot de passe</button><button class="link sm" onclick="openForgot()">Mot de passe oublié</button></div>`)};

/* ---------- entrée dans l'espace en ligne ---------- */
async function cloudEnter(){const sb=await sbClient();const {data:{session}}=await sb.auth.getSession();if(!session)throw new Error('Session expirée, reconnectez-vous.');const email=session.user.email.toLowerCase();
 const {data:ms,error}=await sb.from('members').select('school_id,email,name,role,employee_id,student_ids,active,schools(name)').eq('email',email).eq('active',true);if(error)throw error;
 if(!ms.length)return renderCreateSchool(email);
 const m=ms[0];if(m.role==='parent'){await sb.auth.signOut();lgBusy(false);return lgMsg('L’espace parent en ligne n’est pas encore ouvert. Contactez l’école.')}
 const {data:rows,error:e2}=await sb.from('school_state').select('key,data,updated_at').eq('school_id',m.school_id);if(e2)throw e2;
 CL={sid:m.school_id,school:m.schools&&m.schools.name,email,member:m,hashes:{},last:null,rev:null,pending:false,timer:null,status:'ok',members:[]};
 const imp=rows.find(r=>r.key==='_import');
 if(imp&&!rows.some(r=>r.key==='clients')){buildFromImport(imp.data);CL.status='pending';await pushNow(true);if(!CL.pending)await sb.from('school_state').delete().eq('school_id',CL.sid).eq('key','_import')}
 else if(!rows.length){CL.status='pending';S.users=[];pushNow(true)}else applyRows(rows,true);
 await refreshMembers();await readRev();writeMeta();enterAs(m);startWatch()}
function applyRows(rows,full){if(full){const keep=S;S={};}for(const r of rows){if(r.key==='_import')continue;S[r.key]=r.data;CL.hashes[r.key]=fnv(JSON.stringify(r.data));if(!CL.last||r.updated_at>CL.last)CL.last=r.updated_at}S.users=[];CACHE={};try{localStorage.setItem(cacheKey(CL.sid),JSON.stringify(S))}catch(e){}}
function enterAs(m){const u={id:'cloud:'+m.email,name:m.name||m.email,email:m.email,role:m.role,active:true,employeeId:m.employee_id||null,studentIds:m.student_ids||[]};if(u.role==='prof'&&!(u.employeeId&&emp(u.employeeId)))u.employeeId=S.persona&&S.persona.teacher;setAccess(u);closeModal();render();window.scrollTo(0,0);toast('Connecté à '+(CL.school||'votre établissement'))}
function writeMeta(){try{localStorage.setItem(cacheKey(CL.sid),JSON.stringify(S))}catch(e){}try{localStorage.setItem(CLOUD_META,JSON.stringify({sid:CL.sid,school:CL.school,email:CL.email,member:CL.member,hashes:CL.hashes,last:CL.last}))}catch(e){}}
async function refreshMembers(){const {data}=await SB.from('members').select('*').eq('school_id',CL.sid).order('created_at');CL.members=data||[]}
async function readRev(){const {data}=await SB.from('schools').select('rev,name').eq('id',CL.sid).single();if(data){CL.rev=data.rev;CL.school=data.name}}

/* ---------- création d'un établissement ---------- */
function renderCreateSchool(email){document.getElementById('app').innerHTML=`<div class="login"><div class="login-left"><div class="login-inner"><div class="flex" style="gap:12px;margin-bottom:40px"><div class="logo-sq" style="width:42px;height:42px;font-size:21px">L</div><div class="brand-name" style="font-size:22px">Light <span style="font-weight:400">Academy</span></div></div>
 <h1 class="login-title" style="font-size:30px">Créer votre établissement</h1><p class="muted" style="margin:8px 0 24px">Connecté en tant que <b>${esc(email)}</b>. Aucun établissement n’est encore rattaché à cette adresse.</p>
 <div class="field mb"><label>Nom de l’établissement</label><input id="cs-n" class="input lg" value="${esc(S.company&&S.company.name||'')}"></div><div class="field mb"><label>Votre nom</label><input id="cs-u" class="input lg" placeholder="Prénom Nom"></div>
 <div class="field mb"><label>Données de départ</label><label class="check" style="margin:6px 0"><input type="radio" name="cs-d" value="vide" checked> Base vide : classes, tarifs et paramètres seulement</label><label class="check"><input type="radio" name="cs-d" value="demo"> Avec les données de démonstration (pour tester)</label></div>
 <div id="lg-err" class="note warn mb" style="display:none"></div><button class="btn btn-primary w100 login-btn" onclick="doCreateSchool()">Créer l’établissement</button><button class="link sm" style="margin-top:14px" onclick="cloudLogout()">Utiliser une autre adresse</button>
 <p class="xs muted" style="margin-top:22px">Vous rejoignez une école existante ? Demandez à son administrateur d’ajouter votre adresse dans Administration › Utilisateurs.</p></div></div><div class="login-right"><div class="lr-inner"><div class="lr-kicker">Light Academy</div><div class="lr-title">Vos données,<br>en sécurité en ligne.</div></div></div></div>`}
async function doCreateSchool(){const n=val('cs-n').trim(),u=val('cs-u').trim(),mode=(document.querySelector('input[name=cs-d]:checked')||{}).value;if(!n)return lgMsg('Indiquez le nom de l’établissement.');lgBusy(true,'Création…');
 try{const sb=await sbClient();const {data:sid,error}=await sb.rpc('create_school',{p_name:n,p_user_name:u});if(error)throw error;S.company.name=n;if(mode==='vide')blankState();S.users=[];CL=null;await cloudEnter()}catch(e){lgBusy(false);lgMsg(authErr(e))}}
function blankState(){const k=['clients','invoices','quotes','purchases','txs','od','leaves','attendance','evaluations','threads','announcements','inscriptions'];for(const x of k)if(Array.isArray(S[x]))S[x]=[];
 for(const x of ['vat','decl','relances','appelDone','appr'])if(S[x]&&typeof S[x]==='object')S[x]={};S.seq={inv:0,quote:0,rec:0};const cm=curMonth(),vars={};S.employees.forEach(e=>vars[e.id]={hsA:0,hsB:0,prime:0,abs:0,cp:0,hrs:e.hourly?e.defHrs||40:0});S.runs={[cm]:{status:'draft',vars,results:{},paid:false,sent:{}}};if(S.persona)S.persona.children=[];for(const t of S.treasury||[])t.opening=0;S.capital=0}

/* ---------- enregistrement en ligne ---------- */
const _saveLocal=save;
save=function(){if(!CL)return _saveLocal();CACHE={};try{localStorage.setItem(cacheKey(CL.sid),JSON.stringify(S))}catch(e){}CL.pending=true;setSync(navigator.onLine?'pending':'offline');clearTimeout(CL.timer);if(navigator.onLine)CL.timer=setTimeout(()=>SB?pushNow():cloudResume(),1500)};
async function pushNow(first){if(!CL||!SB)return;clearTimeout(CL.timer);const rows=[],h={};for(const k of Object.keys(S)){if(k==='users'||k==='_import')continue;const j=JSON.stringify(S[k]);if(j===undefined)continue;const x=fnv(j);if(CL.hashes[k]!==x){rows.push({school_id:CL.sid,key:k,data:S[k],updated_by:CL.email});h[k]=x}}
 if(!rows.length){CL.pending=false;setSync('ok');return}if(!navigator.onLine){CL.pending=true;setSync('offline');return}setSync('saving');
 try{if(CL.last&&!first){const {data:rem}=await SB.from('school_state').select('key,data,updated_at').eq('school_id',CL.sid).in('key',rows.map(r=>r.key)).gt('updated_at',CL.last);for(const x of rem||[]){const row=rows.find(r=>r.key===x.key);if(!row)continue;const m=mergeData(x.data,S[x.key]);S[x.key]=m;row.data=m;h[x.key]=fnv(JSON.stringify(m))}if(rem&&rem.length){CACHE={};CL.merged=true}}
 for(let i=0;i<rows.length;i+=6){const {error}=await SB.from('school_state').upsert(rows.slice(i,i+6),{onConflict:'school_id,key'});if(error)throw error}Object.assign(CL.hashes,h);CL.pending=false;if(CL.merged){CL.merged=false;try{localStorage.setItem(cacheKey(CL.sid),JSON.stringify(S))}catch(e){}if(!document.querySelector('#modal-root .modal'))render();toast('Vos modifications hors ligne ont été fusionnées avec celles de vos collègues')}await readRev();const {data}=await SB.from('school_state').select('updated_at').eq('school_id',CL.sid).order('updated_at',{ascending:false}).limit(1);if(data&&data[0])CL.last=data[0].updated_at;writeMeta();setSync('ok')}
 catch(e){console.error(e);CL.pending=true;setSync('offline');clearTimeout(CL.timer);CL.timer=setTimeout(pushNow,15000)}}
async function pullRemote(){if(!CL||!SB||CL.pending)return;try{const {data}=await SB.from('schools').select('rev').eq('id',CL.sid).single();if(!data||data.rev===CL.rev)return setSync('ok');
 let q=SB.from('school_state').select('key,data,updated_at').eq('school_id',CL.sid);if(CL.last)q=q.gt('updated_at',CL.last);const {data:rows,error}=await q;if(error)throw error;CL.rev=data.rev;
 const changed=(rows||[]).filter(r=>CL.hashes[r.key]!==fnv(JSON.stringify(r.data)));applyRows(rows||[],false);writeMeta();if(changed.length&&!document.querySelector('#modal-root .modal')){render();toast('Données mises à jour par un collègue')}setSync('ok')}catch(e){setSync('offline')}}
/* fusion : listes d'éléments avec identifiant → union (la version de cet appareil l'emporte), objets → fusion des clés */
// Fusion fine d'un élément modifié des deux côtés (CRM web et espace parent de l'application mobile) :
// - conversation : on réunit les messages des deux versions, sans en perdre aucun ;
// - absence justifiée par la famille : la justification est conservée.
function mergeItem(r,l){if(!r||!l||r===l||typeof r!=='object'||typeof l!=='object')return l;
 if(Array.isArray(r.messages)&&Array.isArray(l.messages)){const k=m=>m.date+'|'+m.from+'|'+m.text;const kl=new Set(l.messages.map(k)),kr=new Set(r.messages.map(k));const extra=r.messages.filter(m=>!kl.has(k(m))),mine=l.messages.filter(m=>!kr.has(k(m)));const ru=r.unread||{},lu=l.unread||{};const u={staff:extra.some(m=>m.from==='parent')?true:!!lu.staff,parent:mine.some(m=>m.from!=='parent')||extra.some(m=>m.from!=='parent')?true:!!(ru.parent!==undefined?ru.parent:lu.parent)};return Object.assign({},l,{messages:extra.length?[...l.messages,...extra].sort((a,b)=>String(a.date).localeCompare(String(b.date))):l.messages,unread:u})}
 if(r.justifiedBy==='famille'&&r.justified&&!l.justified&&r.studentId===l.studentId)return Object.assign({},l,{justified:true,motif:r.motif,justifiedBy:'famille'});
 return l}
function mergeData(remote,local){if(Array.isArray(remote)&&Array.isArray(local)&&local.every(x=>x&&typeof x==='object'&&'id' in x)&&remote.every(x=>x&&typeof x==='object'&&'id' in x)){const out=remote.slice();const idx=new Map(out.map((x,i)=>[x.id,i]));for(const x of local){if(idx.has(x.id))out[idx.get(x.id)]=mergeItem(out[idx.get(x.id)],x);else out.push(x)}return out}
 if(remote&&local&&typeof remote==='object'&&typeof local==='object'&&!Array.isArray(remote)&&!Array.isArray(local))return {...remote,...local};return local}
function startWatch(){if(CL.watch)return;CL.watch=setInterval(pullRemote,45000);window.addEventListener('focus',pullRemote);window.addEventListener('online',()=>cloudResume());window.addEventListener('offline',()=>setSync('offline'));window.addEventListener('beforeunload',e=>{if(CL&&CL.pending){pushNow();e.preventDefault();e.returnValue=''}})}
function setSync(s){if(!CL)return;CL.status=s;const el=document.getElementById('sync-st');if(el)el.outerHTML=syncChip()}
function syncChip(){if(!CL)return '';const m={ok:['Enregistré en ligne','ok'],pending:['Modifications en attente','wait'],saving:['Enregistrement…','wait'],offline:['Hors ligne : enregistré sur cet appareil','off']}[CL.status]||['','ok'];return `<span id="sync-st" class="sync ${m[1]} hide-sm" title="${esc(CL.school||'')}"><i></i>${m[0]}</span>`}

/* ---------- interface ---------- */
const _topbarCloud=topbar;
topbar=function(){const h=_topbarCloud();return CL?h.replace('<div class="topbar-right">','<div class="topbar-right">'+syncChip()):h};
const _logoutLocal=logout;
logout=function(){if(!CL)return _logoutLocal();cloudLogout()};
async function cloudLogout(){if(CL&&CL.pending){try{await pushNow()}catch(e){}if(CL.pending&&!confirm('Des modifications n’ont pas encore été envoyées (pas de connexion). Si vous vous déconnectez maintenant, elles seront perdues. Continuer ?'))return}try{localStorage.removeItem(CLOUD_META);if(CL)localStorage.removeItem(cacheKey(CL.sid));localStorage.removeItem(SESSION_KEY)}catch(e){}try{const sb=await sbClient();await sb.auth.signOut()}catch(e){}CL=null;location.hash='';location.reload()}

/* utilisateurs : en ligne, les comptes sont ceux de Supabase */
const _usersLocal=VIEWS.utilisateurs;
VIEWS.utilisateurs=function(){if(!CL)return _usersLocal();const M=CL.members;
 return head('Utilisateurs',`${M.length} compte(s) · ${esc(CL.school||'')}`,`<button class="btn btn-primary" onclick="openMemberForm()">${ic('plus',16)} Ajouter un utilisateur</button>`)+
 `<div class="card"><div class="table-wrap"><table><thead><tr><th>Nom</th><th>Adresse e-mail</th><th>Rôle</th><th class="hide-md">Fiche salarié</th><th>Statut</th><th></th></tr></thead><tbody>${M.map(m=>{const e=m.employee_id&&emp(m.employee_id);const me=m.email===CL.email;return `<tr><td class="fw5">${esc(m.name||'—')}${me?' <span class="xs muted">(vous)</span>':''}</td><td class="sm">${esc(m.email)}</td><td>${badge(ROLE_FR[m.role]||m.role,ACCESS[m.role]?ACCESS[m.role].badge:'b-gray')}</td><td class="hide-md sm">${e?esc(empName(e)):'<span class="muted">—</span>'}</td><td>${m.active?badge('Actif','b-green'):badge('Désactivé','b-gray')}</td><td class="num">${me?'':`<button class="btn btn-xs" onclick="openMemberForm('${esc(m.email)}')">Modifier</button>`}</td></tr>`}).join('')}</tbody></table></div></div>
 <div class="card mt"><div class="card-body sm">Pour donner accès à quelqu’un : ajoutez son adresse e-mail et son rôle ici. La personne ouvre ensuite Light Academy, clique sur <b>« Première connexion ? Créer mon mot de passe »</b> et utilise cette même adresse.</div></div>`};
function openMemberForm(email){const m=email?CL.members.find(x=>x.email===email):{email:'',name:'',role:'prof',employee_id:'',active:true};
 modal(email?'Modifier l’utilisateur':'Ajouter un utilisateur',`<div class="form-grid">${field('Nom','mb-n',m.name,{full:true})}${email?`<div class="field full"><label>Adresse e-mail</label><div class="input" style="display:flex;align-items:center;background:var(--gray-50)">${esc(m.email)}</div></div>`:field('Adresse e-mail','mb-e','',{full:true,type:'email'})}${selectF('Rôle','mb-r',[['admin','Administrateur'],['prof','Professeur'],['rh','Ressources humaines'],['compta','Comptabilité']],m.role)}${selectF('Fiche salarié','mb-emp',[['','—']].concat(S.employees.map(e=>[e.id,empName(e)+' · '+e.poste])),m.employee_id||'')}${email?`<label class="check field full"><input type="checkbox" id="mb-a" ${m.active?'checked':''}> Compte actif</label>`:''}</div>`,
 `${email?`<button class="btn" style="margin-right:auto;color:#d92d20" onclick="delMember('${esc(email)}')">Retirer l’accès</button>`:''}<button class="btn" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveMember(${email?`'${esc(email)}'`:'null'})">Enregistrer</button>`)}
async function saveMember(email){const row={name:val('mb-n').trim(),role:val('mb-r'),employee_id:val('mb-emp')||null};if(email){row.active=document.getElementById('mb-a').checked}else{row.email=val('mb-e').trim().toLowerCase();row.school_id=CL.sid;if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email))return toast('Adresse e-mail invalide')}
 const q=email?SB.from('members').update(row).eq('school_id',CL.sid).eq('email',email):SB.from('members').insert(row);const {error}=await q;if(error)return toast(/duplicate/i.test(error.message)?'Cette adresse a déjà un accès':error.message);await refreshMembers();closeModal();render();toast(email?'Utilisateur modifié':'Accès ajouté')}
async function delMember(email){if(!confirm('Retirer l’accès de '+email+' ?'))return;const {error}=await SB.from('members').delete().eq('school_id',CL.sid).eq('email',email);if(error)return toast(error.message);await refreshMembers();closeModal();render();toast('Accès retiré')}

/* ---------- démarrage ---------- */
const _bootLocal=boot;
function regSW(){try{if(/^https?:$/.test(location.protocol)&&!document.querySelector('link[rel=manifest]'))for(const [r,h] of [['manifest','manifest.webmanifest'],['icon','icon-192.png'],['apple-touch-icon','icon-192.png']]){const l=document.createElement('link');l.rel=r;l.href=h;document.head.appendChild(l)}}catch(e){}try{if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{})}catch(e){}}
function isDirty(){return Object.keys(S).some(k=>k!=='users'&&k!=='_import'&&CL.hashes[k]!==fnv(JSON.stringify(S[k])))}
let _resuming=false;
async function cloudResume(){if(_resuming||!CL)return;if(!navigator.onLine)return setSync('offline');_resuming=true;
 try{const sb=await sbClient();const {data,error}=await sb.auth.getSession();
  if(!data||!data.session){if(error||!navigator.onLine){setSync('offline');return}return cloudLogout()}
  if(CL.email!==data.session.user.email.toLowerCase()){CL=null;return cloudEnter()}
  await refreshMembers();if(CL.pending||isDirty()){CL.pending=true;await pushNow()}await pullRemote();startWatch();if(!CL.pending)setSync('ok')}
 catch(e){setSync('offline')}finally{_resuming=false}}
boot=function(){regSW();let meta=null;try{meta=JSON.parse(localStorage.getItem(CLOUD_META)||'null')}catch(e){}const authInUrl=/access_token=|type=recovery|type=signup/.test(location.hash);
 if(!meta&&!authInUrl)return _bootLocal();
 if(meta){let cache=null;try{cache=JSON.parse(localStorage.getItem(cacheKey(meta.sid))||'null')}catch(e){}
  if(cache){S=cache;S.users=[];CL={sid:meta.sid,school:meta.school,email:meta.email,member:meta.member,hashes:meta.hashes||{},last:meta.last,rev:null,pending:false,status:'pending',members:[]};CL.pending=isDirty();const h=location.hash.slice(1);enterAs(meta.member);if(VIEWS[h]){ui.page=h;render()}setSync(navigator.onLine?(CL.pending?'pending':'saving'):'offline');
   window.addEventListener('online',()=>cloudResume());window.addEventListener('offline',()=>setSync('offline'));return cloudResume()}
  else{_bootLocal();if(navigator.onLine)sbClient().then(async sb=>{const {data}=await sb.auth.getSession();if(data&&data.session)cloudEnter()}).catch(()=>{});return}}
 _bootLocal();sbClient().then(async sb=>{const {data}=await sb.auth.getSession();if(data&&data.session)cloudEnter()}).catch(()=>{})};
