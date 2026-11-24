import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, CircleAlert, FileText, Megaphone } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { ParentHead } from '../../../components/Kids';
import { Card, Empty, ErrorBox, IconBubble, Kpi, Loading, Muted, Row, Screen, Sec } from '../../../components/ui';
import { fa, fd, fdShort, lastSchoolDays, money, ord } from '../../../lib/school';
import { useParent } from '../../../lib/parent';
import { font, useTheme } from '../../../lib/theme';

export default function Famille() {
  const { t } = useTheme();
  const { school: s, child, data, loading, error, refresh, offline } = useParent();
  if (!s || !child) return <Screen>{loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={refresh} /> : <Empty icon={CircleAlert} title="Aucun enfant rattaché" text="Demandez à l'école de rattacher vos enfants à votre compte." />}</Screen>;

  const sy = s.syInv(child.id);
  const due = sy.reduce((a, i) => a + s.invTtc(i), 0), paid = sy.reduce((a, i) => a + s.invPaid(i), 0);
  const next = s.openInv(child.id)[0];
  const b = s.stuBal(child);
  const graded = s.graded(child.level);
  const g = graded ? s.genAvg(child) : null;
  const att = s.attOf(child.id);
  const rate = s.presenceRate([child], lastSchoolDays(s.today, 60));
  const unjust = att.filter((a) => a.status === 'absent' && !a.justified).slice(0, 2);
  const pub = !!data?.published?.[child.level];
  const ann = (data?.announcements || []).slice().sort((a, x) => x.date.localeCompare(a.date)).slice(0, 2);
  const evs = (data?.events || []).filter((e) => e.date >= s.today).sort((a, x) => a.date.localeCompare(x.date)).slice(0, 2);
  const pname = child.parent?.name || data?.member?.name || '';

  const items = [
    ...unjust.map((a) => ({ k: a.id, icon: CircleAlert, c: t.danger, bg: t.dangerSoft, title: `${a.status === 'absent' ? 'Absent' : 'En retard'} le ${fdShort(a.date)}`, sub: 'Absence non justifiée · contactez l’école', go: () => router.push('/scolarite') })),
    ...(pub ? [{ k: 'bul', icon: FileText, c: t.primary, bg: t.primarySoft, title: 'Bulletin du 1er trimestre', sub: 'Disponible', go: () => router.push('/scolarite') }] : []),
    ...ann.map((a) => ({ k: a.id, icon: Megaphone, c: t.violet, bg: t.violetSoft, title: a.title, sub: fd(a.date), go: () => router.push('/messages') })),
    ...evs.map((e) => ({ k: e.id, icon: CalendarDays, c: '#B45309', bg: t.warningSoft, title: e.title, sub: fd(e.date), go: () => router.push('/messages') })),
  ];

  return (
    <Screen onRefresh={refresh} refreshing={false}>
      <ParentHead kicker={offline ? 'Espace parent · hors ligne' : 'Espace parent'} title={`Bonjour ${pname}`.trim()} />
      <LinearGradient colors={['#3A6AF4', '#1F46C9']} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={{ borderRadius: 16, padding: 16 }}>
        <Text style={{ color: '#fff', opacity: 0.85, fontFamily: font.regular, fontSize: 13.5 }}>{next ? `Reste à payer · ${ord(next.tranche || 1)} tranche` : `Scolarité ${s.s.schoolYear}`}</Text>
        <Text style={{ color: '#fff', fontFamily: font.bold, fontSize: 30, letterSpacing: -0.8, marginTop: 4 }}>{next ? money(s.invRest(next), s.cur, true) : 'Tout est réglé'}</Text>
        {next ? <Text style={{ color: '#fff', opacity: 0.85, fontSize: 13, fontFamily: font.regular }}>À régler avant le {fd(next.due)}</Text> : null}
        <View style={{ height: 7, borderRadius: 7, backgroundColor: 'rgba(255,255,255,.22)', marginTop: 14, overflow: 'hidden' }}>
          <View style={{ width: `${due ? Math.min(100, (paid / due) * 100) : 0}%`, height: '100%', backgroundColor: '#fff', borderRadius: 7 }} />
        </View>
        <Text style={{ color: '#fff', opacity: 0.85, fontSize: 12.5, marginTop: 7, fontFamily: font.regular }}>{money(paid, s.cur, true)} payés sur {money(due, s.cur, true)}{b.late > 0.5 ? ` · ${money(b.late, s.cur, true)} en retard` : ''}</Text>
      </LinearGradient>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Kpi label="Moyenne générale" value={graded ? (g == null ? '—' : `${fa(g)} /20`) : 'Maternelle'} sub={graded ? '1er trimestre' : 'Pas de notes chiffrées'} onPress={() => router.push('/scolarite')} />
        <Kpi label="Présence" value={`${Math.round(rate * 100)} %`} sub={`${att.filter((a) => a.status === 'absent').length} absence(s)`} onPress={() => router.push('/scolarite')} />
      </View>
      <Sec>À savoir</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {items.length ? items.map((it, i) => (
          <Row key={it.k} last={i === items.length - 1} left={<IconBubble icon={it.icon} color={it.c} bg={it.bg} size={36} />} title={it.title} subtitle={it.sub} onPress={it.go} right={<Muted style={{ fontSize: 18 }}>›</Muted>} />
        )) : <Muted style={{ padding: 16 }}>Rien de nouveau pour le moment.</Muted>}
      </Card>
    </Screen>
  );
}
