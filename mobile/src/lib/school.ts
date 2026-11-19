/* =====================================================================
   Règles de gestion reprises du CRM web Light Academy (src/*.js).
   Même calcul des soldes, des statuts d'échéance, des moyennes et des
   présences : le téléphone et le CRM affichent toujours les mêmes chiffres.
   ===================================================================== */

export type Parent = { civ?: string; name: string; phone?: string; mm?: string };
export type Student = {
  id: string; nom: string; prenom: string; name: string; classe: string; level: string; cycle?: string;
  matricule?: string; sexe?: string; parent: Parent; cantine?: boolean; transport?: boolean; nouveau?: boolean; type?: string;
};
export type Line = { desc: string; qty: number | string; price: number | string; vat: number | string; acc?: string };
export type Invoice = {
  id: string; num?: string; clientId: string; date: string; due: string; label?: string; sy?: string; tranche?: number;
  status?: string; rate?: number; currency?: string; lines: Line[];
};
export type Tx = {
  id: string; tid: string; date: string; label?: string; amount: number; acc?: string | null; ref?: string;
  match?: { t: 'inv' | 'pur'; id: string } | null; payer?: string; txref?: string;
};
export type Att = { id: string; date: string; studentId: string; status: 'absent' | 'retard'; justified?: boolean; motif?: string; minutes?: number };
export type Evaluation = {
  id: string; classId: string; subjectId: string; title: string; date: string; max: number; coef: number; term?: number;
  grades: Record<string, number>; classAvg?: number | null;
};
export type Subject = { id: string; name: string; short: string; coef: number; color: string; cycles: string[] };
export type Klass = { id: string; name: string; cycle: string; room?: string; teacherId?: string };
export type Lesson = { d: number; s: number; sub: string; t?: string; room?: string };
export type Treasury = { id: string; name: string; type: string; opening: number };
export type SchoolEvent = { id: string; date: string; title: string; type?: string };
export type Announcement = { id: string; title: string; body: string; audience: string; date: string; author?: string; pinned?: boolean };

/** État de l'école, tel qu'enregistré par rubrique dans la table school_state. */
export type State = {
  clients: Student[]; invoices: Invoice[]; txs: Tx[]; attendance: Att[]; evaluations: Evaluation[];
  subjects: Subject[]; classes: Klass[]; timetable: Record<string, Lesson[]>; assign: Record<string, Record<string, string>>;
  employees: { id: string; prenom: string; nom: string; poste?: string }[]; treasury: Treasury[];
  events: SchoolEvent[]; announcements: Announcement[]; published: Record<string, boolean>;
  appelDone: Record<string, boolean>; seq: { inv: number; rec: number; quote?: number };
  company: Record<string, string>; schoolYear: string; currency: string; country: string; tranches: number[];
  [k: string]: unknown;
};

/* ---------- utilitaires ---------- */
const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
const pd = (s: string) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
export const addDaysIso = (s: string, n: number) => { const d = pd(s); d.setDate(d.getDate() + n); return iso(d); };
export const sum = (a: number[]) => a.reduce((x, y) => x + (Number(y) || 0), 0);
export const parseNum = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v ?? '').replace(/[\s  ]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
};
export const uid = (p: string) => p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
export const ucf = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : '');

/* ---------- devises ---------- */
const CUR: Record<string, { sym: string; dec: number; words: string }> = {
  USD: { sym: '$', dec: 2, words: 'dollars américains' }, CDF: { sym: 'FC', dec: 0, words: 'francs congolais' },
  EUR: { sym: '€', dec: 2, words: 'euros' }, XOF: { sym: 'F CFA', dec: 0, words: 'francs CFA' }, XAF: { sym: 'F CFA', dec: 0, words: 'francs CFA' },
  GNF: { sym: 'GNF', dec: 0, words: 'francs guinéens' },
};
export const curDec = (c: string) => (CUR[c] || { dec: 2 }).dec;
export const rnd = (v: number, c = 'USD') => { const f = Math.pow(10, curDec(c)); return Math.round((Number(v) || 0) * f) / f; };
const groupFr = (n: number, dec: number) => {
  const [i, d] = Math.abs(n).toFixed(dec).split('.');
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '−' : '') + g + (d ? ',' + d : '');
};
/** « 1 250,00 $ » comme le CRM. `short` retire les centimes ronds (« 1 250 $ »). */
export function money(v: number, c = 'USD', short = false) {
  const k = CUR[c] || { sym: c, dec: 2 };
  const dec = short && Math.abs(v - Math.round(v)) < 0.005 ? 0 : k.dec;
  return `${groupFr(Number(v) || 0, dec)} ${k.sym}`;
}

function numWords(n0: number): string {
  let n = Math.floor(Math.abs(n0));
  if (!n) return 'zéro';
  const u = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const t = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const b100 = (x: number, end: boolean) => {
    if (x < 20) return u[x];
    const d = Math.floor(x / 10), r = x % 10;
    if (d === 7 || d === 9) return t[d] + (d === 7 && r === 1 ? ' et ' : '-') + u[10 + r];
    let s = t[d];
    if (r === 1 && d < 8) s += ' et un'; else if (r) s += '-' + u[r]; else if (d === 8 && end) s += 's';
    return s;
  };
  const b1000 = (x: number, end: boolean) => {
    const c = Math.floor(x / 100), r = x % 100; let s = '';
    if (c) { s = c > 1 ? u[c] + ' cent' : 'cent'; if (!r && c > 1 && end) s += 's'; }
    if (r) s += (s ? ' ' : '') + b100(r, end);
    return s;
  };
  let s = '';
  for (const [v, w] of [[1e9, 'milliard'], [1e6, 'million'], [1e3, 'mille']] as const) {
    const q = Math.floor(n / v);
    if (q) { s += (v === 1e3 ? (q === 1 ? 'mille' : b1000(q, false) + ' mille') : b1000(q, true) + ' ' + w + (q > 1 ? 's' : '')) + ' '; n %= v; }
  }
  if (n) s += b1000(n, true);
  return s.trim();
}
export function amountWords(a: number, c = 'USD') {
  const ent = Math.floor(Math.abs(a) + 1e-9), cts = Math.round((Math.abs(a) - ent) * 100);
  const unit = (CUR[c] || { words: c }).words;
  return ucf(numWords(ent)) + ' ' + unit + (curDec(c) && cts ? ' et ' + numWords(cts) + ' cents' : '');
}

/* ---------- calendrier scolaire ---------- */
export const SLOTS = ['07:30', '08:30', '09:45', '10:45', '11:45'];
export const SLOTE = ['08:30', '09:30', '10:45', '11:45', '12:45'];
export const WD = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const HOLI = [['2026-04-04', '2026-04-19'], ['2026-07-03', '2026-08-31'], ['2026-12-19', '2027-01-03']];
export const isSchoolDay = (d: string) => { const w = pd(d).getDay(); return w >= 1 && w <= 5 && !HOLI.some(([a, b]) => d >= a && d <= b); };
export function lastSchoolDays(end: string, n: number) {
  const o: string[] = []; let d = end;
  for (let i = 0; i < 150 && o.length < n; i++) { if (isSchoolDay(d) && d >= '2026-09-01') o.push(d); d = addDaysIso(d, -1); }
  return o;
}

export const MODES = [
  { tid: 'c1', label: 'Espèces' },
  { tid: 'm1', label: 'Mobile Money' },
  { tid: 'b1', label: 'Banque' },
] as const;
export const ord = (n: number) => (n === 1 ? '1re' : n + 'e');

/* ---------- modèle calculé (indexé une fois par version des données) ---------- */
export type InvStatus = 'draft' | 'sent' | 'partial' | 'late' | 'paid' | 'cancelled';
export const INV_LABEL: Record<InvStatus, string> = { draft: 'Brouillon', sent: 'À payer', partial: 'Partielle', late: 'En retard', paid: 'Payée', cancelled: 'Annulée' };

export class School {
  s: State;
  cur: string;
  private paidIdx = new Map<string, Tx[]>();
  private invByStu = new Map<string, Invoice[]>();
  private invById = new Map<string, Invoice>();
  private attByStu = new Map<string, Att[]>();
  private memo = new Map<string, unknown>();
  today = today();

  constructor(s: State) {
    this.s = s;
    this.cur = s.currency || 'USD';
    for (const t of s.txs || []) if (t.match) { const k = t.match.t + t.match.id; const l = this.paidIdx.get(k) || []; l.push(t); this.paidIdx.set(k, l); }
    for (const i of s.invoices || []) {
      this.invById.set(i.id, i);
      if (i.status === 'draft' || i.status === 'cancelled') continue;
      const l = this.invByStu.get(i.clientId) || []; l.push(i); this.invByStu.set(i.clientId, l);
    }
    for (const a of s.attendance || []) { const l = this.attByStu.get(a.studentId) || []; l.push(a); this.attByStu.set(a.studentId, l); }
  }
  private m<T>(k: string, f: () => T): T { if (!this.memo.has(k)) this.memo.set(k, f()); return this.memo.get(k) as T; }

  get students(): Student[] { return this.m('st', () => (this.s.clients || []).filter((c) => c.type === 'eleve' || !c.type)); }
  student(id: string) { return this.m('stu', () => new Map(this.students.map((x) => [x.id, x]))).get(id); }
  klass(id: string) { return (this.s.classes || []).find((c) => c.id === id); }
  /** classes dans l'ordre du CRM (crèche → secondaire) */
  get classes(): Klass[] { return this.s.classes || []; }
  stuOfClass(cid: string) {
    return this.m('soc' + cid, () => this.students.filter((x) => x.level === cid).sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom)));
  }
  modeLabel(tid: string) { return tid === 'c1' ? 'Espèces' : tid === 'm1' ? 'Mobile Money' : 'Banque'; }

  /* factures */
  invoice(id: string) { return this.invById.get(id); }
  invTtc(i: Invoice) {
    let ht = 0, tva = 0;
    for (const l of i.lines || []) { const h = parseNum(l.qty) * parseNum(l.price); ht += h; tva += (h * parseNum(l.vat)) / 100; }
    const c = i.currency || this.cur;
    return rnd(rnd(rnd(ht, c) + rnd(tva, c), c) * (i.rate || 1), this.cur);
  }
  invPaid(i: Invoice) { return rnd(sum((this.paidIdx.get('inv' + i.id) || []).map((t) => t.amount)), this.cur); }
  invRest(i: Invoice) { return Math.max(0, rnd(this.invTtc(i) - this.invPaid(i), this.cur)); }
  invStatus(i: Invoice): InvStatus {
    if (i.status === 'draft') return 'draft';
    if (i.status === 'cancelled') return 'cancelled';
    const ttc = this.invTtc(i), p = this.invPaid(i);
    if (p >= ttc - 1) return 'paid';
    if (i.due < this.today) return 'late';
    return p > 0 ? 'partial' : 'sent';
  }
  stuInv(id: string) { return (this.invByStu.get(id) || []).slice().sort((a, b) => a.due.localeCompare(b.due)); }
  syInv(id: string) { return this.stuInv(id).filter((i) => i.sy === this.s.schoolYear); }
  openInv(id: string) { return this.stuInv(id).filter((i) => this.invStatus(i) !== 'paid'); }
  stuBal(st: Student) {
    return this.m('sb' + st.id, () => {
      let due = 0, paid = 0, late = 0; let oldest: string | null = null;
      for (const i of this.stuInv(st.id)) {
        const t = this.invTtc(i), p = this.invPaid(i); due += t; paid += p;
        if (i.due < this.today && t - p > 0.5) { late += t - p; if (!oldest || i.due < oldest) oldest = i.due; }
      }
      return { due: rnd(due, this.cur), paid: rnd(paid, this.cur), rest: rnd(due - paid, this.cur), late: rnd(late, this.cur), oldest };
    });
  }
  /** pastille d'état affichée dans la liste des élèves */
  stuTag(st: Student): { label: string; tone: 'success' | 'warning' | 'danger' } {
    const b = this.stuBal(st);
    if (b.late > 0.5) return { label: '−' + money(b.late, this.cur, true), tone: 'danger' };
    const open = this.openInv(st.id)[0];
    if (open && open.due <= addDaysIso(this.today, 30)) return { label: `${ord(open.tranche || 1)} tranche`, tone: 'warning' };
    return { label: 'À jour', tone: 'success' };
  }
  get lateStudents() { return this.m('ls', () => this.students.filter((x) => this.stuBal(x).late > 0.5).sort((a, b) => this.stuBal(b).late - this.stuBal(a).late)); }
  payments(stuId?: string) {
    return (this.s.txs || [])
      .filter((t) => t.match && t.match.t === 'inv' && (!stuId || this.invById.get(t.match.id)?.clientId === stuId))
      .sort((a, b) => b.date.localeCompare(a.date) || String(b.ref).localeCompare(String(a.ref)));
  }
  paymentStudent(t: Tx) { const i = t.match ? this.invById.get(t.match.id) : undefined; return i ? this.student(i.clientId) : undefined; }

  /* trésorerie */
  tresoBalance(id: string) { const t = (this.s.treasury || []).find((x) => x.id === id); return t ? rnd(t.opening + sum((this.s.txs || []).filter((x) => x.tid === id).map((x) => x.amount)), this.cur) : 0; }
  get totalCash() { return rnd(sum((this.s.treasury || []).map((t) => this.tresoBalance(t.id))), this.cur); }
  cashedIn(month: string) { return rnd(sum((this.s.txs || []).filter((t) => t.match?.t === 'inv' && t.date.startsWith(month)).map((t) => t.amount)), this.cur); }
  get yearTotals() {
    return this.m('yt', () => {
      const inv = (this.s.invoices || []).filter((i) => i.sy === this.s.schoolYear && i.status !== 'draft' && i.status !== 'cancelled');
      const fact = sum(inv.map((i) => this.invTtc(i))), paid = sum(inv.map((i) => this.invPaid(i)));
      return { fact: rnd(fact, this.cur), paid: rnd(paid, this.cur), rest: rnd(fact - paid, this.cur) };
    });
  }

  /* reçus */
  nextReceiptRef(date: string) {
    let n = this.s.seq?.rec || 0;
    for (const t of this.s.txs || []) { const m = /^REC-\d{4}-(\d+)$/.exec(t.ref || ''); if (m) n = Math.max(n, +m[1]); }
    return { n: n + 1, ref: 'REC-' + date.slice(0, 4) + '-' + String(n + 1).padStart(5, '0') };
  }
  receiptMessage(t: Tx) {
    const i = t.match ? this.invById.get(t.match.id) : undefined; const st = i && this.student(i.clientId);
    if (!i || !st) return '';
    return `Bonjour ${st.parent?.name || ''}, nous accusons réception de ${money(t.amount, this.cur)} pour ${st.name} (${st.classe}) – ${i.label}. Reçu n° ${t.ref} du ${fds(t.date)}. Merci. ${this.s.company?.name || ''}`;
  }
  relanceMessage(st: Student) {
    const b = this.stuBal(st);
    return `Bonjour ${st.parent?.name || ''}, sauf erreur de notre part, il reste ${money(b.late, this.cur)} à régler pour la scolarité de ${st.name} (${st.classe}). Merci de passer à l'économat ou de payer par Mobile Money en indiquant la référence ${st.matricule || ''}. ${this.s.company?.name || ''}`;
  }

  /* présences */
  attOf(id: string) { return (this.attByStu.get(id) || []).slice().sort((a, b) => b.date.localeCompare(a.date)); }
  presenceRate(sts: Student[], days: string[]) {
    const set = new Set(sts.map((x) => x.id)), ds = new Set(days);
    const ab = (this.s.attendance || []).filter((a) => a.status === 'absent' && ds.has(a.date) && set.has(a.studentId)).length;
    const tot = sts.length * days.length;
    return tot ? 1 - ab / tot : 1;
  }
  absentToday() { return (this.s.attendance || []).filter((a) => a.date === this.today && a.status === 'absent').length; }
  appelDone(date: string, cid: string) { return !!(this.s.appelDone || {})[date + '|' + cid]; }

  /* enseignement */
  myClasses(teacherId?: string | null) {
    if (!teacherId) return [];
    return this.classes.filter((c) => c.teacherId === teacherId || Object.values(this.s.assign?.[c.id] || {}).includes(teacherId));
  }
  teacherName(id?: string) { const e = (this.s.employees || []).find((x) => x.id === id); return e ? `${e.prenom} ${e.nom}` : ''; }
  subjOf(cid: string) { const c = this.klass(cid); return c ? (this.s.subjects || []).filter((x) => x.cycles.includes(c.cycle)) : []; }
  graded(cid: string) { return (this.klass(cid) || { cycle: '' }).cycle !== 'Maternelle'; }
  evalsOf(cid: string, sid: string) { return (this.s.evaluations || []).filter((e) => e.classId === cid && e.subjectId === sid).sort((a, b) => a.date.localeCompare(b.date)); }
  subjAvg(st: Student, sid: string) {
    let t = 0, c = 0;
    for (const e of this.evalsOf(st.level, sid)) { const g = e.grades?.[st.id]; if (g == null || (g as unknown) === '') continue; t += (g / e.max) * 20 * e.coef; c += e.coef; }
    return c ? t / c : null;
  }
  genAvg(st: Student) {
    return this.m('ga' + st.id, () => {
      let t = 0, c = 0;
      for (const x of this.subjOf(st.level)) { const a = this.subjAvg(st, x.id); if (a == null) continue; t += a * x.coef; c += x.coef; }
      return c ? t / c : null;
    });
  }
  rankOf(st: Student): [number, number] | null {
    const l = this.stuOfClass(st.level).map((x) => ({ id: x.id, a: this.genAvg(x) })).filter((x) => x.a != null).sort((a, b) => (b.a as number) - (a.a as number));
    const i = l.findIndex((x) => x.id === st.id);
    return i < 0 ? null : [i + 1, l.length];
  }
  lessons(cid: string, day: number) { return (this.s.timetable?.[cid] || []).filter((l) => l.d === day).sort((a, b) => a.s - b.s); }
  subject(id: string) { return (this.s.subjects || []).find((x) => x.id === id); }
}

export const fa = (a: number | null | undefined) => (a == null || isNaN(a) ? '—' : a.toFixed(2).replace('.', ','));
export const fds = (s?: string) => { if (!s) return '—'; const d = pd(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const fd = (s?: string) => { if (!s) return '—'; const d = pd(s); return `${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
export const fdShort = (s?: string) => { if (!s) return '—'; const d = pd(s); return `${d.getDate()} ${MO[d.getMonth()]}`; };
export const weekdayOf = (s: string) => pd(s).getDay();
