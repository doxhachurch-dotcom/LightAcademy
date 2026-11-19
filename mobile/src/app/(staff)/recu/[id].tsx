import { router, useLocalSearchParams } from 'expo-router';
import { FileText, MessageCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Footer, Muted, Pill, T } from '../../../components/ui';
import { openWhatsApp, receiptHTML, sharePdf } from '../../../lib/docs';
import { amountWords, fd, money, ucf } from '../../../lib/school';
import { findTx, useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

export default function Recu() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const { id, wa } = useLocalSearchParams<{ id: string; wa?: string }>();
  const { school: s, pending, status } = useSchool();
  const tx = findTx(s, String(id));
  const inv = tx?.match ? s?.invoice(tx.match.id) : undefined;
  const st = inv ? s?.student(inv.clientId) : undefined;
  const sent = useRef(false);
  const queued = status !== 'ok' && pending > 0;

  useEffect(() => {
    if (wa === '1' && s && tx && st?.parent?.phone && !sent.current) {
      sent.current = true;
      setTimeout(() => openWhatsApp(st.parent.phone, s.receiptMessage(tx), s.s.country), 500);
    }
  }, [wa, s, tx, st]);

  if (!s || !tx || !inv || !st) return null;
  const line = (k: string, v: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: t.border, gap: 12 }}>
      <Muted style={{ fontSize: 13.5 }}>{k}</Muted><T style={{ fontFamily: font.medium, fontSize: 14, flexShrink: 1, textAlign: 'right' }}>{v}</T>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: 170 }}>
        <Text onPress={() => router.back()} style={{ color: t.primary, fontFamily: font.medium, fontSize: 15, paddingVertical: 4 }}>‹ Fermer</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 14 }}>
          <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6 }}>Reçu</T>
          <Pill label={queued ? 'Envoi en attente' : 'Enregistré'} tone={queued ? 'warning' : 'success'} />
        </View>
        <Card>
          <Muted style={{ textAlign: 'center' }}>{tx.ref} · {fd(tx.date)}</Muted>
          <T style={{ textAlign: 'center', fontFamily: font.bold, fontSize: 34, letterSpacing: -1, marginTop: 8 }}>{money(tx.amount, s.cur)}</T>
          <Muted style={{ textAlign: 'center', marginTop: 4, marginBottom: 14 }}>{amountWords(tx.amount, s.cur)}</Muted>
          {line('Reçu de', tx.payer || st.parent?.name || '—')}
          {line("Pour l'élève", `${st.name} – ${st.classe}`)}
          {line('Objet', ucf(inv.label || ''))}
          {line('Mode', `${s.modeLabel(tx.tid)}${tx.txref ? ' · ' + tx.txref : ''}`)}
          {line('Reste sur cette échéance', money(s.invRest(inv), s.cur))}
          {line('Solde total du dossier', money(s.stuBal(st).rest, s.cur))}
        </Card>
        {queued ? <Muted style={{ marginTop: 12, lineHeight: 19 }}>Pas de connexion : le paiement est gardé sur ce téléphone et sera envoyé automatiquement. Le numéro de reçu peut changer si un autre poste a encaissé entre-temps.</Muted> : null}
      </ScrollView>
      <Footer>
        <View style={{ gap: 10 }}>
          <Button label="Envoyer au parent sur WhatsApp" icon={MessageCircle} onPress={() => openWhatsApp(st.parent?.phone, s.receiptMessage(tx), s.s.country)} style={{ backgroundColor: '#1FAA59', borderColor: '#1FAA59' }} />
          <Button variant="ghost" label="Partager le reçu en PDF" icon={FileText} onPress={() => sharePdf(receiptHTML(s, tx), `Reçu ${tx.ref}`)} />
        </View>
      </Footer>
    </View>
  );
}
