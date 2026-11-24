import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChoiceChips } from '../../components/ChoiceChips';
import { Button, Field, Footer, Label, T } from '../../components/ui';
import { useParent } from '../../lib/parent';
import { font, useTheme } from '../../lib/theme';

export default function NouveauMessage() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const p = useLocalSearchParams<{ student?: string }>();
  const { data, send } = useParent();
  const kids = data?.children || [];
  const [kid, setKid] = useState(String(p.student || kids[0]?.id || ''));
  const contacts = data?.contacts?.[kid] || [{ id: 'admin', name: 'Administration' }];
  const [to, setTo] = useState('admin');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async () => {
    if (!text.trim()) return setErr('Écrivez votre message.');
    setBusy(true); setErr(null);
    try {
      const th = await send({ student: kid, text, to: contacts.some((c) => c.id === to) ? to : 'admin', subject });
      router.replace(`/conversation/${th.id}`);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <Text onPress={() => router.back()} style={{ color: t.primary, fontFamily: font.medium, fontSize: 15, paddingVertical: 4 }}>‹ Annuler</Text>
        <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 4, marginBottom: 18 }}>Nouveau message</T>
        {kids.length > 1 ? (
          <View style={{ marginBottom: 16 }}>
            <Label>Enfant</Label>
            <ChoiceChips items={kids.map((k) => ({ key: k.id, label: `${k.prenom || k.name} · ${k.classe}` }))} value={kid} onChange={(k) => { setKid(k); setTo('admin'); }} />
          </View>
        ) : null}
        <View style={{ marginBottom: 16 }}>
          <Label>Destinataire</Label>
          <ChoiceChips items={contacts.map((c) => ({ key: c.id, label: c.id === 'admin' ? c.name : `${c.name}${c.role && c.role !== 'Titulaire' ? ' · ' + c.role.split(',')[0] : c.role === 'Titulaire' ? ' · Titulaire' : ''}` }))} value={to} onChange={setTo} />
        </View>
        <Field label="Objet" value={subject} onChangeText={setSubject} placeholder="Ex. : Sortie scolaire, paiement, devoirs…" />
        <Label>Message</Label>
        <TextInput value={text} onChangeText={setText} multiline placeholder="Votre message à l'école" placeholderTextColor={t.faint} textAlignVertical="top"
          style={{ minHeight: 130, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 13, fontFamily: font.regular, fontSize: 15, lineHeight: 21, color: t.text, backgroundColor: t.input }} />
        {err ? <Text style={{ color: t.danger, fontFamily: font.medium, marginTop: 12 }}>{err}</Text> : null}
      </ScrollView>
      <Footer><Button label="Envoyer" onPress={go} loading={busy} /></Footer>
    </View>
  );
}
