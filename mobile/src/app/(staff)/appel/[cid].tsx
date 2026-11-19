import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BackHeader, Button, Card, Footer, IconButton, Muted, Pill, Row, Screen, Sec, tap } from '../../../components/ui';
import { fmtDayName } from '../../../lib/format';
import { openWhatsApp } from '../../../lib/docs';
import { uid, type Att } from '../../../lib/school';
import { useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

type K = 'p' | 'a' | 'r';

export default function Appel() {
  const { t } = useTheme();
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const { school: s, appel } = useSchool();
  const k = s?.klass(String(cid));
  const date = s?.today || '';
  const sts = useMemo(() => (s && k ? s.stuOfClass(k.id) : []), [s, k]);
  const init = useMemo(() => {
    const m: Record<string, K> = {};
    for (const st of sts) { const r = (s?.s.attendance || []).find((a) => a.date === date && a.studentId === st.id); m[st.id] = r ? (r.status === 'absent' ? 'a' : 'r') : 'p'; }
    return m;
  }, [sts, s, date]);
  const [m, setM] = useState<Record<string, K> | null>(null);
  const [saved, setSaved] = useState(false);
  const cur = m || init;
  if (!s || !k) return null;
  const cnt = (x: K) => Object.values(cur).filter((v) => v === x).length;
  const done = s.appelDone(date, k.id);

  const save = async () => {
    const recs: Att[] = [];
    for (const [sid, v] of Object.entries(cur)) {
      if (v === 'p') continue;
      const old = (s.s.attendance || []).find((a) => a.date === date && a.studentId === sid && (a.status === 'absent') === (v === 'a'));
      recs.push(old || { id: uid('at'), date, studentId: sid, status: v === 'a' ? 'absent' : 'retard', justified: false, motif: '', minutes: v === 'r' ? 10 : 0 });
    }
    await appel(k.id, date, sts.map((x) => x.id), recs);
    setSaved(true);
  };

  const absents = sts.filter((x) => cur[x.id] === 'a');
  const btn = (st: string, v: K) => {
    const on = cur[st] === v;
    const [c, bg, bd] = v === 'p' ? [t.success, t.successSoft, '#BFE8D3'] : v === 'a' ? [t.danger, t.dangerSoft, '#F8C6D2'] : ['#B45309', t.warningSoft, '#F3D9A6'];
    return (
      <Pressable key={v} onPress={() => { tap(); setM({ ...cur, [st]: v }); setSaved(false); }} hitSlop={4}
        style={{ width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: on ? bg : t.card, borderColor: on ? bd : t.border }}>
        <Text style={{ fontFamily: font.bold, fontSize: 14, color: on ? c : t.faint }}>{v.toUpperCase()}</Text>
      </Pressable>
    );
  };

  return (
    <Screen bottomInset={false} footer={!saved ? (
      <Footer>
        <Button label={done ? "Mettre à jour l'appel" : "Valider l'appel"} onPress={save} />
        <Muted style={{ textAlign: 'center', marginTop: 8, fontSize: 12 }}>P = présent · A = absent · R = retard</Muted>
      </Footer>
    ) : undefined}>
      <View style={{ paddingBottom: 130 }}>
        <BackHeader back="Classes" onBack={() => router.back()} title={`Appel · ${k.name}`} sub={`${fmtDayName(new Date())} · ${sts.length} élèves`} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Pill label={`${cnt('p')} présents`} tone="success" />
          <Pill label={`${cnt('a')} absents`} tone="danger" />
          <Pill label={`${cnt('r')} retard(s)`} tone="warning" />
          {done && !saved ? <Pill label="Déjà fait aujourd'hui" tone="primary" /> : null}
        </View>
        {saved ? (
          <Card style={{ marginBottom: 12, backgroundColor: t.successSoft, borderColor: t.successSoft }}>
            <Text style={{ color: t.success, fontFamily: font.semibold, fontSize: 15 }}>Appel enregistré : {cnt('a')} absent(s), {cnt('r')} retard(s)</Text>
            <Muted style={{ marginTop: 4 }}>Il sera envoyé au CRM dès que le téléphone a du réseau.</Muted>
          </Card>
        ) : null}
        {saved && absents.length ? (
          <>
            <Sec>Prévenir les parents des absents</Sec>
            <Card pad={0} style={{ paddingHorizontal: 14, marginBottom: 12 }}>
              {absents.map((x, i) => (
                <Row key={x.id} last={i === absents.length - 1} title={x.name} subtitle={x.parent?.name || ''}
                  right={x.parent?.phone ? <IconButton icon={MessageCircle} label="WhatsApp" color="#1FAA59" size={36}
                    onPress={() => openWhatsApp(x.parent.phone, `Bonjour ${x.parent.name}, ${x.prenom || x.name} est noté(e) absent(e) aujourd'hui (${k.name}). Merci de nous en indiquer le motif. ${s.s.company?.name || ''}`, s.s.country)} /> : <Muted>Pas de n°</Muted>} />
              ))}
            </Card>
            <Button variant="ghost" label="Terminer" onPress={() => router.back()} />
          </>
        ) : null}
        {!saved ? (
          <Card pad={0} style={{ paddingHorizontal: 14 }}>
            {sts.map((x, i) => (
              <Row key={x.id} last={i === sts.length - 1} title={x.name} right={<View style={{ flexDirection: 'row', gap: 6 }}>{(['p', 'a', 'r'] as K[]).map((v) => btn(x.id, v))}</View>} />
            ))}
          </Card>
        ) : !absents.length ? <Button variant="ghost" label="Terminer" onPress={() => router.back()} /> : null}
      </View>
    </Screen>
  );
}
