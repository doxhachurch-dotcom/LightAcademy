import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle, Phone } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { BackHeader, Button, Card, Empty, IconButton, Ini, Muted, Pill, Progress, Row, Screen, Sec, T, Footer } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { bulletinHTML, call, openWhatsApp, sharePdf } from '../../../lib/docs';
import { fa, fd, fdShort, INV_LABEL, lastSchoolDays, money, ord } from '../../../lib/school';
import { useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

export default function Eleve() {
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { school: s } = useSchool();
  const { member } = useAuth();
  const finance = member?.role === 'admin' || member?.role === 'compta';
  const st = s?.student(String(id));
  if (!s || !st) return <Screen><BackHeader back="Élèves" onBack={() => router.back()} title="Élève introuvable" /></Screen>;

  const b = s.stuBal(st);
  const sy = s.syInv(st.id);
  const syDue = sy.reduce((a, i) => a + s.invTtc(i), 0), syPaid = sy.reduce((a, i) => a + s.invPaid(i), 0);
  const open = s.openInv(st.id)[0];
  const pays = s.payments(st.id);
  const graded = s.graded(st.level);
  const g = graded ? s.genAvg(st) : null;
  const rank = graded ? s.rankOf(st) : null;
  const att = s.attOf(st.id);
  const nAbs = att.filter((a) => a.status === 'absent').length, nRet = att.filter((a) => a.status === 'retard').length;
  const rate = s.presenceRate([st], lastSchoolDays(s.today, 60));
  const tag = finance ? s.stuTag(st) : null;
  const country = s.s.country;

  return (
    <Screen bottomInset={false} footer={
      <Footer>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {graded ? <Button variant="ghost" label="Bulletin" onPress={() => sharePdf(bulletinHTML(s, st), `Bulletin ${st.name}`)} style={{ flex: 1 }} /> : null}
          {finance && open ? <Button label={`Encaisser ${money(s.invRest(open), s.cur, true)}`} onPress={() => router.push({ pathname: '/encaisser', params: { student: st.id } })} style={{ flex: 1.6 }} /> : null}
          {!finance ? <Button variant="soft" label="Appeler le parent" icon={Phone} onPress={() => call(st.parent?.phone)} style={{ flex: 1.4 }} /> : null}
        </View>
      </Footer>
    }>
      <View style={{ paddingBottom: 100 }}>
        <BackHeader back="Élèves" onBack={() => router.back()} title={st.name} sub={`${st.classe}${st.matricule ? ' · Matricule ' + st.matricule : ''}`} />

        {finance ? (
          <Card style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Muted>Scolarité {s.s.schoolYear}</Muted>
              {tag ? <Pill small label={tag.tone === 'success' ? 'À jour' : tag.tone === 'danger' ? 'En retard' : `${tag.label} due`} tone={tag.tone} /> : null}
            </View>
            <T style={{ fontFamily: font.bold, fontSize: 22, letterSpacing: -0.5, marginTop: 6 }}>
              {money(syPaid, s.cur, true)} <Text style={{ fontFamily: font.regular, fontSize: 14, color: t.muted }}>payés sur {money(syDue, s.cur, true)}</Text>
            </T>
            <View style={{ marginVertical: 10 }}><Progress value={syDue ? syPaid / syDue : 0} /></View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {sy.map((i) => {
                const stt = s.invStatus(i);
                const color = stt === 'paid' ? t.success : stt === 'late' ? t.danger : stt === 'partial' || i.due <= s.today ? '#B45309' : t.faint;
                return (
                  <View key={i.id} style={{ flex: 1, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 9 }}>
                    <Muted style={{ fontSize: 11 }}>{ord(i.tranche || 1)} · {(s.s.tranches || [])[(i.tranche || 1) - 1] ?? ''} %</Muted>
                    <T style={{ fontFamily: font.semibold, fontSize: 14, marginTop: 2, color }}>{stt === 'paid' ? money(s.invTtc(i), s.cur, true) + ' ✓' : money(s.invRest(i), s.cur, true)}</T>
                    <Muted style={{ fontSize: 10.5, marginTop: 1 }}>{stt === 'paid' ? 'Payée' : `avant le ${fdShort(i.due)}`}</Muted>
                  </View>
                );
              })}
            </View>
            {b.late > 0.5 && b.rest > syDue - syPaid + 0.5 ? <Muted style={{ marginTop: 10, color: t.danger }}>Dont {money(b.rest - (syDue - syPaid), s.cur)} restant des années précédentes</Muted> : null}
          </Card>
        ) : null}

        <Card pad={0} style={{ paddingHorizontal: 14, marginBottom: 4 }}>
          <Row last left={<Ini name={st.parent?.name} tone="muted" />} title={st.parent?.name || 'Parent non renseigné'} subtitle={st.parent?.phone || 'Pas de numéro'}
            right={st.parent?.phone ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconButton icon={Phone} label="Appeler" color={t.primary} onPress={() => call(st.parent.phone)} size={36} />
                <IconButton icon={MessageCircle} label="WhatsApp" color="#1FAA59" onPress={() => openWhatsApp(st.parent.phone, `Bonjour ${st.parent.name}, `, country)} size={36} />
              </View>
            ) : undefined} />
        </Card>

        <Sec>Cette année</Sec>
        <Card pad={0} style={{ paddingHorizontal: 14 }}>
          {graded ? <Row title="Moyenne générale" subtitle={rank ? `Rang ${rank[0]} sur ${rank[1]}` : 'Pas encore de notes'} right={<T style={{ fontFamily: font.semibold }}>{fa(g)}{g != null ? ' /20' : ''}</T>} /> : null}
          <Row title="Présence" subtitle={`${nAbs} absence(s), ${nRet} retard(s)`} right={<T style={{ fontFamily: font.semibold }}>{Math.round(rate * 100)} %</T>} last={!finance} />
          {finance ? <Row last title="Dernier paiement" subtitle={pays[0] ? `${pays[0].ref} · ${fd(pays[0].date)}` : 'Aucun paiement'} right={pays[0] ? <T style={{ fontFamily: font.semibold }}>{money(pays[0].amount, s.cur, true)}</T> : undefined} onPress={pays[0] ? () => router.push(`/recu/${pays[0].id}`) : undefined} /> : null}
        </Card>

        {graded && !finance ? (
          <>
            <Sec>Moyennes par matière</Sec>
            <Card pad={0} style={{ paddingHorizontal: 14 }}>
              {s.subjOf(st.level).map((x, i, arr) => <Row key={x.id} last={i === arr.length - 1} title={x.name} right={<T style={{ fontFamily: font.semibold }}>{fa(s.subjAvg(st, x.id))}</T>} />)}
            </Card>
          </>
        ) : null}

        {finance ? (
          <>
            <Sec>Échéances</Sec>
            <Card pad={0} style={{ paddingHorizontal: 14 }}>
              {s.stuInv(st.id).slice().reverse().map((i, k, arr) => {
                const stt = s.invStatus(i);
                return <Row key={i.id} last={k === arr.length - 1} title={i.label || i.num || 'Facture'} subtitle={`${money(s.invTtc(i), s.cur)} · avant le ${fdShort(i.due)}`}
                  right={<Pill small label={stt === 'paid' ? INV_LABEL.paid : `${INV_LABEL[stt]} · ${money(s.invRest(i), s.cur, true)}`} tone={stt === 'paid' ? 'success' : stt === 'late' ? 'danger' : stt === 'partial' ? 'warning' : 'muted'} />} />;
              })}
            </Card>
            <Sec>Paiements</Sec>
            <Card pad={0} style={{ paddingHorizontal: 14 }}>
              {pays.length ? pays.map((p, k) => <Row key={p.id} last={k === pays.length - 1} title={p.ref || '—'} subtitle={`${fd(p.date)} · ${s.modeLabel(p.tid)}`} right={<T style={{ fontFamily: font.semibold }}>{money(p.amount, s.cur, true)}</T>} onPress={() => router.push(`/recu/${p.id}`)} />)
                : <Muted style={{ padding: 16 }}>Aucun paiement.</Muted>}
            </Card>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
