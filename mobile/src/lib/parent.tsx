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
};

type Ctx = {
  data: ParentPayload | null; school: School | null; loading: boolean; error: string | null; offline: boolean;
  child: Student | null; setChild: (id: string) => void; refresh: () => Promise<void>;
};
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

  const value = useMemo<Ctx>(() => ({ data, school, loading, error, offline, child, setChild: setChildId, refresh }), [data, school, loading, error, offline, child, refresh]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useParent() {
  const v = useContext(C);
  if (!v) throw new Error('useParent hors ParentStore');
  return v;
}
