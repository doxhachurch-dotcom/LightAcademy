import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { BackHeader, Card, Kpi, Muted, Row, Screen, Sec, T } from '../../../components/ui';
import { useParent } from '../../../lib/parent';
import { fa, fdShort } from '../../../lib/school';
import { font } from '../../../lib/theme';

const num = (v: number) => (Math.round(v * 100) / 100).toString().replace('.', ',');

export default function Matiere() {
  const { sid } = useLocalSearchParams<{ sid: string }>();
  const { school: s, child, data } = useParent();
  if (!s || !child) return null;
  const sub = s.subject(String(sid));
  const evs = s.evalsOf(child.level, String(sid)).slice().reverse();
  const mine = s.subjAvg(child, String(sid));
  let a = 0, c = 0;
  for (const e of evs) if (e.classAvg != null) { a += Number(e.classAvg) * e.coef; c += e.coef; }
  const cls = c ? a / c : null;
  const teacher = data?.teachers?.[child.level]?.[String(sid)];
  return (
    <Screen bottomInset={false}>
      <BackHeader back="Notes" onBack={() => router.back()} title={sub?.name || 'Matière'} sub={[teacher, sub ? `coefficient ${sub.coef}` : ''].filter(Boolean).join(' · ')} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Kpi label={`Moyenne de ${child.prenom || child.name}`} value={fa(mine)} sub="sur 20" />
        <Kpi label="Moyenne de la classe" value={fa(cls)} sub={mine != null && cls != null ? (mine >= cls ? '▲ au-dessus' : '▼ en dessous') : 'sur 20'} subTone={mine != null && cls != null ? (mine >= cls ? 'success' : 'danger') : undefined} />
      </View>
      <Sec>Évaluations</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14, marginBottom: 30 }}>
        {evs.length ? evs.map((e, i) => {
          const g = e.grades?.[child.id];
          return <Row key={e.id} last={i === evs.length - 1} title={e.title}
            subtitle={[fdShort(e.date), e.coef !== 1 ? `coef. ${e.coef}` : '', e.classAvg != null ? `classe ${num(Number(e.classAvg) * e.max / 20)}` : ''].filter(Boolean).join(' · ')}
            right={<T style={{ fontFamily: font.semibold }}>{g == null ? 'Absent' : `${num(g)} / ${e.max}`}</T>} />;
        }) : <Muted style={{ padding: 16 }}>Pas encore de note dans cette matière.</Muted>}
      </Card>
    </Screen>
  );
}
