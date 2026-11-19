import { FileText, Smartphone } from 'lucide-react-native';
import { View } from 'react-native';
import { ParentHead } from '../../../components/Kids';
import { Card, IconBubble, Loading, Muted, Pill, Row, Screen, Sec, T } from '../../../components/ui';
import { receiptHTML, sharePdf } from '../../../lib/docs';
import { fd, fdShort, INV_LABEL, money, ord } from '../../../lib/school';
import { useParent } from '../../../lib/parent';
import { font, useTheme } from '../../../lib/theme';

export default function Paiements() {
  const { t } = useTheme();
  const { school: s, child, data, refresh } = useParent();
  if (!s || !child) return <Screen><Loading /></Screen>;
  const inv = s.stuInv(child.id);
  const pays = s.payments(child.id);
  const co = data?.company || {};
  return (
    <Screen onRefresh={refresh} refreshing={false}>
      <ParentHead kicker={`${child.prenom || child.name} · ${s.s.schoolYear}`} title="Paiements" />
      <Sec>Échéances</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {inv.map((i, k) => {
          const st = s.invStatus(i);
          const pct = (s.s.tranches || [])[(i.tranche || 1) - 1];
          return <Row key={i.id} last={k === inv.length - 1} title={i.sy === s.s.schoolYear ? `${ord(i.tranche || 1)} tranche${pct ? ` · ${pct} %` : ''}` : i.label || 'Échéance'} subtitle={`Échéance ${fd(i.due)}`}
            right={<View style={{ alignItems: 'flex-end', gap: 4 }}>
              <T style={{ fontFamily: font.semibold, color: st === 'paid' ? t.text : st === 'sent' && i.due > s.today ? t.faint : t.text }}>{money(st === 'paid' ? s.invTtc(i) : s.invRest(i), s.cur, true)}</T>
              <Pill small label={st === 'paid' ? 'Payée' : st === 'late' ? 'En retard' : st === 'partial' ? 'Partielle' : i.date > s.today ? 'Plus tard' : INV_LABEL[st]} tone={st === 'paid' ? 'success' : st === 'late' ? 'danger' : i.date > s.today ? 'muted' : 'warning'} />
            </View>} />;
        })}
      </Card>
      <Sec>Reçus</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {pays.length ? pays.map((p, k) => (
          <Row key={p.id} last={k === pays.length - 1} left={<IconBubble icon={FileText} color={t.primary} bg={t.primarySoft} size={36} />} title={p.ref || 'Reçu'} subtitle={`${fdShort(p.date)} · ${s.modeLabel(p.tid)}`}
            right={<T style={{ fontFamily: font.semibold }}>{money(p.amount, s.cur, true)}</T>} onPress={() => sharePdf(receiptHTML(s, p), `Reçu ${p.ref}`)} />
        )) : <Muted style={{ padding: 16 }}>Aucun paiement enregistré.</Muted>}
      </Card>
      <Card style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconBubble icon={Smartphone} color={t.primary} bg={t.primarySoft} size={38} />
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: font.semibold }}>Comment payer</T>
            <Muted style={{ marginTop: 3, lineHeight: 19 }}>À la caisse de l'école{co.mobile ? `, ou par Mobile Money au ${co.mobile}` : ' ou par Mobile Money'}{child.matricule ? ` en indiquant la référence ${child.matricule}` : ''}. Le reçu apparaît ici dès l'encaissement.</Muted>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
