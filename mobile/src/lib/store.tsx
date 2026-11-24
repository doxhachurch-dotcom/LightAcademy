/* =====================================================================
   Données de l'école pour l'équipe (admin, professeur, compta, RH).

   - Lecture : la table school_state (une ligne par rubrique), comme le web.
   - Hors ligne : la dernière version est gardée sur le téléphone ; les
     encaissements et les appels faits sans réseau sont mis en file
     d'attente et envoyés dès que la connexion revient.
   - Écriture : chaque opération relit les rubriques concernées juste avant
     d'écrire (txs + seq, ou attendance + appelDone), applique le changement
     et réécrit seulement ces rubriques. Les modifications faites en même
     temps sur le CRM web ne sont donc jamais écrasées.
   ===================================================================== */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import type { Member } from './auth';
import { School, type Att, type State, type Tx } from './school';
import { supabase } from './supabase';

export type Op =
  | { id: string; kind: 'pay'; tx: Tx }
  | { id: string; kind: 'appel'; cid: string; date: string; studentIds: string[]; records: Att[] };

export type SyncStatus = 'ok' | 'syncing' | 'pending' | 'offline';

type Ctx = {
  school: School | null;
  loading: boolean;
  error: string | null;
  status: SyncStatus;
  pending: number;
  lastSync: string | null;
  refresh: () => Promise<void>;
  /** Enregistre un encaissement ; renvoie l'opération telle qu'elle apparaît (reçu provisoire si hors ligne). */
  pay: (tx: Tx) => Promise<Tx>;
  appel: (cid: string, date: string, studentIds: string[], records: Att[]) => Promise<void>;
};

const C = createContext<Ctx | null>(null);
const KEYS_PAY = ['txs', 'seq'];
const KEYS_APPEL = ['attendance', 'appelDone'];

const isNet = (e: unknown) => /fetch|network|timeout|Failed|offline/i.test(String((e as Error)?.message || e));

/** Applique une opération sur une copie de l'état (fonction pure, rejouable). */
export function applyOp(s: State, op: Op): State {
  if (op.kind === 'pay') {
    const txs = s.txs || [];
    if (txs.some((t) => t.id === op.tx.id)) return s;
    const tx = { ...op.tx };
    // Numéro de reçu déjà utilisé entre-temps (autre appareil) : on prend le suivant.
    if (txs.some((t) => t.ref === tx.ref)) tx.ref = new School(s).nextReceiptRef(tx.date).ref;
    const n = +(/(\d+)$/.exec(tx.ref || '')?.[1] || 0);
    return { ...s, txs: [...txs, tx], seq: { ...(s.seq || { inv: 0, rec: 0 }), rec: Math.max(s.seq?.rec || 0, n) } };
  }
  const ids = new Set(op.studentIds);
  const keep = (s.attendance || []).filter((a) => !(a.date === op.date && ids.has(a.studentId)));
  return { ...s, attendance: [...keep, ...op.records], appelDone: { ...(s.appelDone || {}), [op.date + '|' + op.cid]: true } };
}

export function StaffStore({ member, children }: { member: Member; children: ReactNode }) {
  const sid = member.school_id;
  const K = { state: 'la-state-' + sid, queue: 'la-queue-' + sid, meta: 'la-meta-' + sid };
  const [remote, setRemote] = useState<State | null>(null);
  const [queue, setQueue] = useState<Op[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>('syncing');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const meta = useRef<{ rev: number | null; last: string | null }>({ rev: null, last: null });
  const remoteRef = useRef<State | null>(null);
  const queueRef = useRef<Op[]>([]);
  const flushing = useRef(false);

  const saveRemote = useCallback((s: State) => {
    remoteRef.current = s; setRemote(s);
    AsyncStorage.setItem(K.state, JSON.stringify(s)).catch(() => {});
    AsyncStorage.setItem(K.meta, JSON.stringify(meta.current)).catch(() => {});
  }, [K.state, K.meta]);
  const saveQueue = useCallback((q: Op[]) => {
    queueRef.current = q; setQueue(q);
    AsyncStorage.setItem(K.queue, JSON.stringify(q)).catch(() => {});
  }, [K.queue]);

  /** Lit tout (première fois) ou seulement ce qui a changé depuis la dernière lecture. */
  const pull = useCallback(async (full = false) => {
    const { data: sc, error: e1 } = await supabase.from('schools').select('rev').eq('id', sid).single();
    if (e1) throw new Error(e1.message);
    if (!full && remoteRef.current && sc && sc.rev === meta.current.rev) return;
    let q = supabase.from('school_state').select('key,data,updated_at').eq('school_id', sid);
    if (!full && remoteRef.current && meta.current.last) q = q.gt('updated_at', meta.current.last);
    const { data: rows, error: e2 } = await q;
    if (e2) throw new Error(e2.message);
    const base: State = full || !remoteRef.current ? ({} as State) : { ...remoteRef.current };
    let last = meta.current.last;
    for (const r of rows || []) {
      if (r.key === '_import' || r.key === 'users') continue;
      (base as Record<string, unknown>)[r.key] = r.data;
      if (!last || r.updated_at > last) last = r.updated_at;
    }
    meta.current = { rev: sc?.rev ?? null, last };
    saveRemote(base);
  }, [sid, saveRemote]);

  /** Envoie les opérations en attente, une par une, dans l'ordre. */
  const flush = useCallback(async () => {
    if (flushing.current || !queueRef.current.length) return;
    flushing.current = true; setStatus('syncing');
    try {
      while (queueRef.current.length) {
        const op = queueRef.current[0];
        const keys = op.kind === 'pay' ? KEYS_PAY : KEYS_APPEL;
        const { data: rows, error: e } = await supabase.from('school_state').select('key,data').eq('school_id', sid).in('key', keys);
        if (e) throw new Error(e.message);
        const fresh = { ...(remoteRef.current as State) };
        for (const r of rows || []) (fresh as Record<string, unknown>)[r.key] = r.data;
        const next = applyOp(fresh, op);
        const up = keys.map((k) => ({ school_id: sid, key: k, data: (next as Record<string, unknown>)[k] ?? (k === 'appelDone' ? {} : []), updated_by: member.email }));
        const { error: e2 } = await supabase.from('school_state').upsert(up, { onConflict: 'school_id,key' });
        if (e2) throw new Error(e2.message);
        saveRemote({ ...(remoteRef.current as State), ...Object.fromEntries(keys.map((k) => [k, (next as Record<string, unknown>)[k]])) } as State);
        saveQueue(queueRef.current.slice(1));
      }
      await pull().catch(() => {});
      setStatus('ok'); setLastSync(new Date().toISOString());
    } catch (e) {
      setStatus(isNet(e) ? 'offline' : 'pending');
      if (!isNet(e)) setError((e as Error).message);
    } finally {
      flushing.current = false;
    }
  }, [sid, member.email, pull, saveRemote, saveQueue]);

  const refresh = useCallback(async () => {
    try {
      setStatus('syncing');
      if (queueRef.current.length) await flush();
      await pull(!remoteRef.current);
      setError(null); setStatus(queueRef.current.length ? 'pending' : 'ok'); setLastSync(new Date().toISOString());
    } catch (e) {
      setStatus(isNet(e) ? 'offline' : 'pending');
      if (!remoteRef.current) setError(isNet(e) ? "Pas de connexion internet et aucune donnée enregistrée sur ce téléphone." : (e as Error).message);
    }
  }, [flush, pull]);

  // Démarrage : données du téléphone d'abord (affichage immédiat), puis le serveur.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [s, q, m] = await Promise.all([K.state, K.queue, K.meta].map((k) => AsyncStorage.getItem(k).catch(() => null)));
      if (!alive) return;
      if (m) meta.current = JSON.parse(m);
      if (q) { queueRef.current = JSON.parse(q); setQueue(queueRef.current); }
      if (s) { remoteRef.current = JSON.parse(s); setRemote(remoteRef.current); setLoading(false); }
      await refresh();
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  // Mise à jour régulière tant que l'application est ouverte.
  useEffect(() => {
    const iv = setInterval(() => { if (AppState.currentState === 'active') refresh(); }, 45000);
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') refresh(); });
    return () => { clearInterval(iv); sub.remove(); };
  }, [refresh]);

  const enqueue = useCallback(async (op: Op) => {
    saveQueue([...queueRef.current, op]);
    setStatus('pending');
    flush();
  }, [flush, saveQueue]);

  const view = useMemo(() => {
    if (!remote) return null;
    let s = remote;
    for (const op of queue) s = applyOp(s, op);
    return new School(s);
  }, [remote, queue]);

  const value = useMemo<Ctx>(() => ({
    school: view, loading, error, status, pending: queue.length, lastSync, refresh,
    async pay(tx) {
      await enqueue({ id: tx.id, kind: 'pay', tx });
      return tx;
    },
    async appel(cid, date, studentIds, records) {
      await enqueue({ id: 'ap' + Date.now(), kind: 'appel', cid, date, studentIds, records });
    },
  }), [view, loading, error, status, queue.length, lastSync, refresh, enqueue]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useSchool() {
  const v = useContext(C);
  if (!v) throw new Error('useSchool hors StaffStore');
  return v;
}

/** Retrouve un encaissement après synchronisation (son n° de reçu peut avoir changé). */
export function findTx(school: School | null, id: string) {
  return (school?.s.txs || []).find((t) => t.id === id);
}
