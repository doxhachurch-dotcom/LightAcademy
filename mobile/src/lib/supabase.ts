import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Même projet Supabase que le CRM web Light Academy. La clé publique peut figurer
// dans l'application : ce sont les règles RLS de la base qui isolent chaque école,
// et les parents ne passent que par la fonction parent_view().
export const SUPABASE_URL = 'https://nxlizxdokrzxqbrghvgw.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_NmCaA7_cwPqM1-mn-X4jIw_oU9DOZwD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'la-auth-mobile',
  },
});

// Rafraîchit la session seulement quand l'application est au premier plan.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export async function must<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}
