import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

export type Role = 'admin' | 'prof' | 'rh' | 'compta' | 'parent';
export type Member = {
  school_id: string; email: string; name: string | null; role: Role;
  employee_id: string | null; student_ids: string[] | null; school: string;
};
export const ROLE_FR: Record<Role, string> = { admin: 'Administrateur', prof: 'Professeur', rh: 'Ressources humaines', compta: 'Comptabilité', parent: 'Parent' };

type AuthState = {
  ready: boolean;
  session: Session | null;
  member: Member | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);
const MEMBER_KEY = 'la-member';

function authErr(m: string) {
  if (/invalid login/i.test(m)) return 'Adresse e-mail ou mot de passe incorrect.';
  if (/not confirmed/i.test(m)) return "Adresse e-mail pas encore confirmée : ouvrez le lien reçu par e-mail.";
  if (/network|fetch/i.test(m)) return 'Pas de connexion internet. Réessayez quand le réseau revient.';
  return m;
}

async function loadMember(email: string): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .select('school_id,email,name,role,employee_id,student_ids,active,schools(name)')
    .eq('email', email.toLowerCase())
    .eq('active', true);
  if (error) throw new Error(error.message);
  if (!data || !data.length) throw new Error("Cette adresse n'a pas d'accès Light Academy. Demandez à l'administrateur de l'école de l'ajouter dans Utilisateurs.");
  const m = data[0] as unknown as Member & { schools?: { name?: string } | null };
  return { ...m, school: m.schools?.name || '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async (s: Session | null) => {
    setSession(s);
    if (!s) { setMember(null); return; }
    try {
      const m = await loadMember(s.user.email || '');
      setMember(m); setError(null);
      AsyncStorage.setItem(MEMBER_KEY, JSON.stringify(m)).catch(() => {});
    } catch (e) {
      // Hors ligne : on garde le dernier accès connu pour pouvoir travailler sans réseau.
      const cached = await AsyncStorage.getItem(MEMBER_KEY).catch(() => null);
      const m = cached ? (JSON.parse(cached) as Member) : null;
      if (m && m.email === (s.user.email || '').toLowerCase() && /fetch|network/i.test((e as Error).message)) { setMember(m); return; }
      setError(authErr((e as Error).message)); setMember(null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      await hydrate(data.session);
      if (alive) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') hydrate(null);
      else if (event === 'TOKEN_REFRESHED') setSession(s);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [hydrate]);

  const value = useMemo<AuthState>(() => ({
    ready, session, member, error,
    async signIn(email, password) {
      const { data, error: e } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (e) throw new Error(authErr(e.message));
      await hydrate(data.session);
    },
    async signOut() {
      await supabase.auth.signOut().catch(() => {});
      await AsyncStorage.removeItem(MEMBER_KEY).catch(() => {});
      await hydrate(null);
    },
    async resetPassword(email) {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (e) throw new Error(authErr(e.message));
    },
  }), [ready, session, member, error, hydrate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth hors AuthProvider');
  return v;
}
