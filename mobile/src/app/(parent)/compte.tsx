import { router } from 'expo-router';
import { CalendarDays, LogOut, MessageCircle, Phone } from 'lucide-react-native';
import { Alert, Platform, View } from 'react-native';
import { BackHeader, Button, Card, IconBubble, Muted, Row, Screen, Sec, Seg, T } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { call, openWhatsApp } from '../../lib/docs';
import { useParent } from '../../lib/parent';
import { fd } from '../../lib/school';
import { font, useTheme } from '../../lib/theme';

export default function Compte() {
  const { t, mode, setMode } = useTheme();
  const { data, child, school: s } = useParent();
  const { signOut, member } = useAuth();
  const co = data?.company || {};
  const wa = co.whatsapp || co.mobile || co.phone;
  const evs = (data?.events || []).filter((e) => e.date >= (s?.today || '')).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const out = () => {
    if (Platform.OS === 'web') { signOut(); return; }
    Alert.alert('Se déconnecter ?', '', [{ text: 'Annuler', style: 'cancel' }, { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() }]);
  };
  return (
    <Screen bottomInset={false}>
      <BackHeader back="Retour" onBack={() => router.back()} title="Mon compte" />
      <Card>
        <T style={{ fontFamily: font.semibold, fontSize: 17 }}>{member?.name || child?.parent?.name}</T>
        <Muted style={{ marginTop: 2 }}>{member?.email}</Muted>
        <Muted style={{ marginTop: 8 }}>{(data?.children || []).map((k) => `${k.prenom || k.name} (${k.classe})`).join(' · ')}</Muted>
      </Card>
      <Sec>L'école</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        <Row title={data?.school || co.name || 'École'} subtitle={[co.address, co.city].filter(Boolean).join(', ') || undefined} />
        {wa ? <Row left={<IconBubble icon={MessageCircle} color="#1FAA59" bg={t.successSoft} size={34} />} title="Écrire sur WhatsApp" subtitle={wa}
          onPress={() => openWhatsApp(wa, `Bonjour, je suis ${child?.parent?.name || ''}, parent de ${child?.name || ''} (${child?.classe || ''}). `, s?.s.country)} /> : null}
        {co.phone ? <Row last left={<IconBubble icon={Phone} color={t.primary} bg={t.primarySoft} size={34} />} title="Appeler l'école" subtitle={co.phone} onPress={() => call(co.phone)} /> : null}
      </Card>
      <Sec>Agenda de l'école</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {evs.length ? evs.map((e, i) => <Row key={e.id} last={i === evs.length - 1} left={<IconBubble icon={CalendarDays} color="#B45309" bg={t.warningSoft} size={34} />} title={e.title} subtitle={fd(e.date)} />)
          : <Muted style={{ padding: 16 }}>Rien de prévu.</Muted>}
      </Card>
      <Sec>Apparence</Sec>
      <Seg items={[{ key: 'light', label: 'Clair' }, { key: 'dark', label: 'Sombre' }, { key: 'auto', label: 'Automatique' }]} value={mode} onChange={setMode} />
      <View style={{ height: 18 }} />
      <Button variant="danger" icon={LogOut} label="Se déconnecter" onPress={out} style={{ marginBottom: 30 }} />
    </Screen>
  );
}
