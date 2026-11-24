import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { Button, Field, Muted, T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { font, useTheme } from '../lib/theme';

export default function Login() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const { signIn, resetPassword, error: authError, session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null);

  // Compte connecté mais sans accès à une école : on affiche la raison et on ferme la session.
  useEffect(() => {
    if (authError && session) { setMsg({ text: authError }); supabase.auth.signOut().catch(() => {}); }
  }, [authError, session]);

  const submit = async () => {
    if (!email.trim() || !password) return setMsg({ text: 'Saisissez votre adresse e-mail et votre mot de passe.' });
    setBusy(true); setMsg(null);
    try { await signIn(email, password); } catch (e) { setMsg({ text: (e as Error).message }); } finally { setBusy(false); }
  };
  const forgot = async () => {
    if (!email.trim()) return setMsg({ text: "Saisissez d'abord votre adresse e-mail, puis touchez « Mot de passe oublié »." });
    try { await resetPassword(email); setMsg({ text: 'Un e-mail vient de vous être envoyé pour choisir un nouveau mot de passe.', ok: true }); }
    catch (e) { setMsg({ text: (e as Error).message }); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[t.bgTop, t.bg]} locations={[0, 0.45]} style={{ position: 'absolute', inset: 0 } as never} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: ins.top + 64, paddingHorizontal: 26, paddingBottom: ins.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}><Logo size={68} /></View>
        <T style={{ textAlign: 'center', fontFamily: font.bold, fontSize: 25, letterSpacing: -0.5, marginTop: 18 }}>Light Academy</T>
        <Muted style={{ textAlign: 'center', fontSize: 14, marginTop: 6, marginBottom: 32, lineHeight: 20 }}>Gestion scolaire et financière{'\n'}Connectez-vous avec votre compte de l'école</Muted>
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="username" placeholder="vous@ecole.com" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={submit} returnKeyType="go" />
        {msg ? (
          <View style={{ backgroundColor: msg.ok ? t.successSoft : t.dangerSoft, borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <Text style={{ color: msg.ok ? t.success : t.danger, fontFamily: font.medium, fontSize: 13.5, lineHeight: 19 }}>{msg.text}</Text>
          </View>
        ) : null}
        <Button label="Se connecter" onPress={submit} loading={busy} style={{ marginTop: 6 }} />
        <Pressable onPress={forgot} hitSlop={8} style={{ alignSelf: 'center', marginTop: 18 }}>
          <Text style={{ color: t.primary, fontFamily: font.medium, fontSize: 14 }}>Mot de passe oublié ?</Text>
        </Pressable>
        <View style={{ flex: 1, minHeight: 40 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ShieldCheck size={16} color={t.muted} />
          <Muted style={{ fontSize: 12.5 }}>Fonctionne aussi sans connexion internet</Muted>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
