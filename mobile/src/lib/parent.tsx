/* =====================================================================
   Espace parent : les données viennent uniquement de la fonction Supabase
   parent_view(), qui ne renvoie que les enfants rattachés au compte.
   Les parents n'ont aucun accès direct à la table school_state.
   ===================================================================== */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import type { Member } from './auth';
import { School, type Announcement, type Evaluation, type Invoice, type Klass, type Lesson, type SchoolEvent, type State, type Student, type Subject, type Tx, type Att } from './school';
import { supabase } from './supabase';

export type ParentPayload = {
  school: string; member: { name: string | null; email: string };
  company: Record<string, string>; schoolYear: string; currency: string; tranches: number[]; country: string;
  children: Student[]; invoices: Invoice[]; payments: Tx[]; attendance: Att[]; evaluations: Evaluation[];
  subjects: Subject[]; classes: Klass[]; timetable: Record<string, Lesson[]>; teachers: Record<string, Record<string, string>>;
  announcements: Announcement[]; events: SchoolEvent[]; published: Record<string, boolean>;
  threads?: Thread[]; contacts?: Record<string, Contact[]>;
};
export type Msg = { from: 'parent' | 'staff'; text: string; date: string };
export type Thread = { id: string; studentId: string; with: string; subject: string; unread?: { staff?: boolean; parent?: boolean }; messages: Msg[] };
export type Contact = { id: string; name: string; role?: string };

type Ctx = {
  data: ParentPayload | null; school: School | null; loading: boolean; error: string | null; offline: boolean;
  child: Student | null; setChild: (id: string) => void; refresh: () => Promise<void>;
  threads: Thread[]; unread: number;
  contactName: (studentId: string, id: string) => string;
  send: (a: { student: string; text: string; to?: string; subject?: string; thread?: string }) => Promise<Thread>;
  markRead: (thread: string) => Promise<void>;
  justify: (attId: string, motif: string) => Promise<void>;
  signal: (student: string, date: string, motif: string) => Promise<void>;
};

/** Message d'erreur lisible (réseau absent, refus du serveur…). */
export function rpcError(m: string) {
  if (/fetch|network/i.test(m)) return 'Pas de connexion internet. Réessayez quand le réseau revient.';
  return m;
}
const C = createContext<Ctx | null>(null);

export function ParentStore({ member, children }: { member: Member; children: ReactNode }) {
  const KEY = 'la-parent-' + member.email;
  const [data, setData] = useState<ParentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data: d, error: e } = await supabase.rpc('parent_view');
    if (e) {
      const net = /fetch|network/i.test(e.message);
      setOffline(net);
      if (!net) setError(e.message);
      return;
    }
    setOffline(false); setError(null);
    setData(d as ParentPayload);
    AsyncStorage.setItem(KEY, JSON.stringify(d)).catch(() => {});
  }, [KEY]);

  useEffect(() => {
    (async () => {
      const c = await AsyncStorage.getItem(KEY).catch(() => null);
      if (c) { setData(JSON.parse(c)); setLoading(false); }
      await refresh();
      setLoading(false);
    })();
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') refresh(); });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [KEY]);

  const school = useMemo(() => {
    if (!data) return null;
    const s = {
      clients: data.children.map((c) => ({ ...c, type: 'eleve' })), invoices: data.invoices, txs: data.payments,
      attendance: data.attendance, evaluations: data.evaluations, subjects: data.subjects, classes: data.classes,
      timetable: data.timetable, assign: {}, employees: [], treasury: [], events: data.events || [], announcements: data.announcements || [],
      published: data.published || {}, appelDone: {}, seq: { inv: 0, rec: 0 }, company: data.company || {},
      schoolYear: data.schoolYear, currency: data.currency || 'USD', country: data.country, tranches: data.tranches || [60, 20, 20],
    } as State;
    return new School(s);
  }, [data]);

  const child = useMemo(() => {
    const kids = data?.children || [];
    return kids.find((k) => k.id === childId) || kids[0] || null;
  }, [data, childId]);

  const threads = useMemo(() => (data?.threads || []).slice().sort((a, b) => last(b).localeCompare(last(a))), [data]);
  const unread = threads.filter((t) => t.unread?.parent).length;

  const call = useCallback(async (fn: string, args: Record<string, unknown>) => {
    const { data: d, error: e } = await supabase.rpc(fn, args);
    if (e) throw new Error(rpcError(e.message));
    return d;
  }, []);

  const value = useMemo<Ctx>(() => ({
    data, school, loading, error, offline, child, setChild: setChildId, refresh, threads, unread,
    contactName(studentId, id) {
      if (id === 'admin') return 'Administration';
      return (data?.contacts?.[studentId] || []).find((c) => c.id === id)?.name || 'Enseignant';
    },
    async send({ student, text, to, subject, thread }) {
      const th = (await call('parent_send_message', { p_student: student, p_text: text, p_with: to || 'admin', p_subject: subject || null, p_thread: thread || null })) as Thread;
      // Mise à jour immédiate à l'écran, puis relecture complète.
      setData((d) => d && ({ ...d, threads: [...(d.threads || []).filter((t) => t.id !== th.id), th] }));
      refresh();
      return th;
    },
    async markRead(thread) {
      setData((d) => d && ({ ...d, threads: (d.threads || []).map((t) => (t.id === thread ? { ...t, unread: { ...t.unread, parent: false } } : t)) }));
      await call('parent_mark_read', { p_thread: thread }).catch(() => {});
    },
    async justify(attId, motif) {
      await call('parent_justify', { p_att: attId, p_motif: motif });
      setData((d) => d && ({ ...d, attendance: d.attendance.map((a) => (a.id === attId ? { ...a, justified: true, motif } : a)) }));
      refresh();
    },
    async signal(student, date, motif) {
      const a = (await call('parent_signal_absence', { p_student: student, p_date: date, p_motif: motif })) as Att;
      setData((d) => d && ({ ...d, attendance: [...d.attendance.filter((x) => x.id !== a.id), a] }));
      refresh();
    },
  }), [data, school, loading, error, offline, child, refresh, threads, unread, call]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

const last = (t: Thread) => t.messages[t.messages.length - 1]?.date || '';

export function useParent() {
  const v = useContext(C);
  if (!v) throw new Error('useParent hors ParentStore');
  return v;
}
