import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChoiceChips } from '../../components/ChoiceChips';
import { Button, Label, Muted, T } from '../../components/ui';
import { useParent } from '../../lib/parent';
import { addDaysIso, fd, isSchoolDay, today, ucf, weekdayOf } from '../../lib/school';
import { font, useTheme } from '../../lib/theme';

const MOTIFS = ['Maladie', 'Rendez-vous médical', 'Raison familiale', 'Transport', 'Autre'];
const WEEK = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const dayLabel = (d: string) => {
  const t0 = today();
  if (d === t0) return "Aujourd'hui";
  if (d === addDaysIso(t0, 1)) return 'Demain';
  const [y, m, dd] = d.split('-').map(Number);
  return `${ucf(WEEK[new Date(y, m - 1, dd).getDay()].slice(0, 3))}. ${dd}/${String(m).padStart(2, '0')}`;
};

/** Feuille en bas d'écran : justifier une absence (mode=justify&att=…) ou en signaler une (mode=signal&student=…). */
export default function Absence() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const p = useLocalSearchParams<{ mode?: string; att?: string; student?: string }>();
  const { data, justify, signal } = useParent();
  const signalMode = p.mode === 'signal';
  const att = data?.attendance.find((a) => a.id === p.att);
  const kid = data?.children.find((k) => k.id === (signalMode ? p.student : att?.studentId));
  const days = useMemo(() => { const o: string[] = []; let d = today(); for (let i = 0; i < 30 && o.length < 8; i++) { if (isSchoolDay(d)) o.push(d); d = addDaysIso(d, 1); } return o; }, []);
  const [date, setDate] = useState(days[0] || today());
  const [motif, setMotif] = useState('Maladie');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!kid || (!signalMode && !att)) return null;

  const go = async () => {
    setBusy(true); setErr(null);
    const m = motif + (note.trim() ? ' – ' + note.trim() : '');
    try {
      if (signalMode) await signal(kid.id, date, m); else await justify(att!.id, m);
      router.back();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(15,23,42,.38)' }} onPress={() => router.back()} accessibilityLabel="Fermer" />
      <View style={{ backgroundColor: t.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 10, paddingBottom: Math.max(ins.bottom, 16) + 8 }}>
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: t.border, alignSelf: 'center', marginBottom: 14 }} />
        <T style={{ fontFamily: font.bold, fontSize: 20, letterSpacing: -0.3 }}>{signalMode ? 'Signaler une absence' : `Justifier ${att!.status === 'absent' ? "l'absence" : 'le retard'}`}</T>
        <Muted style={{ marginTop: 3, marginBottom: 16 }}>{signalMode ? `${kid.prenom || kid.name} · ${kid.classe}` : `${ucf(WEEK[weekdayOf(att!.date)])} ${fd(att!.date)} · ${kid.prenom || kid.name}`}</Muted>
        {signalMode ? (
          <View style={{ marginBottom: 16 }}>
            <Label>Jour d'absence</Label>
            <ChoiceChips items={days.map((d) => ({ key: d, label: dayLabel(d) }))} value={date} onChange={setDate} />
          </View>
        ) : null}
        <View style={{ marginBottom: 16 }}>
          <Label>Motif</Label>
          <ChoiceChips items={MOTIFS.map((m) => ({ key: m, label: m }))} value={motif} onChange={setMotif} />
        </View>
        <Label>Précisions (facultatif)</Label>
        <TextInput value={note} onChangeText={setNote} multiline placeholder="Ex. : certificat médical remis lundi" placeholderTextColor={t.faint} textAlignVertical="top"
          style={{ minHeight: 70, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 12, fontFamily: font.regular, fontSize: 15, color: t.text, backgroundColor: t.input }} />
        {err ? <Text style={{ color: t.danger, fontFamily: font.medium, marginTop: 10 }}>{err}</Text> : null}
        <Button label="Envoyer à l'école" onPress={go} loading={busy} style={{ marginTop: 16 }} />
      </View>
    </KeyboardAvoidingView>
  );
}
