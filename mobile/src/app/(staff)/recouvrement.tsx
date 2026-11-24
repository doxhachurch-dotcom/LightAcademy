import { router } from 'expo-router';
import { CircleCheck, MessageCircle } from 'lucide-react-native';
import { View } from 'react-native';
import { BackHeader, Card, Empty, IconButton, Ini, Muted, Row, Screen, T } from '../../components/ui';
import { openWhatsApp } from '../../lib/docs';
import { fdShort, money } from '../../lib/school';
import { useSchool } from '../../lib/store';
import { font, useTheme } from '../../lib/theme';

export default function Recouvrement() {
  const { t } = useTheme();
  const { school: s } = useSchool();
  if (!s) return null;
  const list = s.lateStudents;
  const total = list.reduce((a, x) => a + s.stuBal(x).late, 0);
  return (
    <Screen bottomInset={false}>
      <BackHeader back="Retour" onBack={() => router.back()} title="Relances" sub={`${list.length} élève(s) · ${money(total, s.cur)} échus impayés`} />
      <Muted style={{ marginBottom: 12, lineHeight: 19 }}>Touchez l'icône WhatsApp pour envoyer au parent un message de rappel déjà rédigé, avec le montant et la référence de paiement.</Muted>
      <Card pad={0} style={{ paddingHorizontal: 14, marginBottom: 30 }}>
        {list.map((x, i) => {
          const b = s.stuBal(x);
          return (
            <Row key={x.id} last={i === list.length - 1} left={<Ini name={x.name} tone="danger" />} title={x.name}
              subtitle={`${x.classe} · dû depuis le ${fdShort(b.oldest || '')}`}
              onPress={() => router.push(`/eleve/${x.id}`)}
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T style={{ fontFamily: font.semibold, color: t.danger, fontSize: 14 }}>{money(b.late, s.cur, true)}</T>
                  {x.parent?.phone ? <IconButton icon={MessageCircle} label="Relancer sur WhatsApp" color="#1FAA59" size={34} onPress={() => openWhatsApp(x.parent.phone, s.relanceMessage(x), s.s.country)} /> : null}
                </View>
              } />
          );
        })}
        {!list.length ? <Empty icon={CircleCheck} title="Aucun retard" text="Toutes les échéances échues sont réglées." /> : null}
      </Card>
    </Screen>
  );
}
