import { router } from 'expo-router';
import { Landmark, Smartphone, Wallet } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, Chips, IconBubble, Ini, Kpi, LinkText, Loading, Muted, PageHeader, Progress, Row, Screen, SearchBar, Sec, T } from '../../../components/ui';
import { normalize } from '../../../lib/format';
import { fdShort, money } from '../../../lib/school';
import { useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

export default function Finances() {
  const { t } = useTheme();
  const { school: s, refresh, status } = useSchool();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('');
  const pays = useMemo(() => {
    if (!s) return [];
    const nq = normalize(q.trim());
    return s.payments().filter((p) => (!mode || p.tid === mode) && (!nq || normalize(`${p.ref} ${p.label} ${p.payer || ''}`).includes(nq))).slice(0, 60);
  }, [s, q, mode]);
  if (!s) return <Screen><Loading /></Screen>;
  const y = s.yearTotals;
  const late = s.lateStudents.reduce((a, x) => a + s.stuBal(x).late, 0);
  const icon = (type: string) => (type === 'cash' ? Wallet : type === 'bank' ? Landmark : Smartphone);
  return (
    <Screen onRefresh={refresh} refreshing={status === 'syncing'}>
      <PageHeader kicker={`Année ${s.s.schoolYear}`} title="Finances" />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Muted>Encaissé sur l'année</Muted>
          <Muted>{y.fact ? Math.round((y.paid / y.fact) * 100) : 0} % recouvré</Muted>
        </View>
        <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 4 }}>{money(y.paid, s.cur, true)}</T>
        <Muted style={{ marginBottom: 10 }}>sur {money(y.fact, s.cur, true)} facturés</Muted>
        <Progress value={y.fact ? y.paid / y.fact : 0} />
      </Card>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Kpi label="Reste à encaisser" value={money(y.rest, s.cur, true)} sub="Toutes tranches" />
        <Kpi label="Échu impayé" value={money(late, s.cur, true)} sub={`${s.lateStudents.length} élève(s) · relancer`} subTone="danger" onPress={() => router.push('/recouvrement')} />
      </View>

      <Sec right={<Muted style={{ fontSize: 12 }}>{money(s.totalCash, s.cur, true)}</Muted>}>Trésorerie</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {(s.s.treasury || []).map((tr, i, arr) => (
          <Row key={tr.id} last={i === arr.length - 1} left={<IconBubble icon={icon(tr.type)} color={t.primary} bg={t.primarySoft} size={36} />} title={tr.name} right={<T style={{ fontFamily: font.semibold }}>{money(s.tresoBalance(tr.id), s.cur, true)}</T>} />
        ))}
      </Card>

      <Sec right={<LinkText label="Relances" onPress={() => router.push('/recouvrement')} />}>Encaissements</Sec>
      <SearchBar value={q} onChange={setQ} placeholder="Élève ou n° de reçu" />
      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <Chips items={[{ key: '', label: 'Tous' }, { key: 'c1', label: 'Espèces' }, { key: 'm1', label: 'Mobile Money' }, { key: 'b1', label: 'Banque' }]} value={mode} onChange={setMode} />
      </View>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {pays.map((p, i) => {
          const st = s.paymentStudent(p);
          return <Row key={p.id} last={i === pays.length - 1} left={<Ini name={st?.name} />} title={st?.name || p.label || '—'} subtitle={`${p.ref} · ${fdShort(p.date)} · ${s.modeLabel(p.tid)}`}
            right={<T style={{ fontFamily: font.semibold, color: t.success }}>+{money(p.amount, s.cur, true)}</T>} onPress={() => router.push(`/recu/${p.id}`)} />;
        })}
        {!pays.length ? <Muted style={{ padding: 16 }}>Aucun encaissement.</Muted> : null}
      </Card>
    </Screen>
  );
}
