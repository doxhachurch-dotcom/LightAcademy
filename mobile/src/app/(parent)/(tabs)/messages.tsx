import { CalendarDays, LogOut, MessageCircle, Phone } from 'lucide-react-native';
import { Alert, Platform, View } from 'react-native';
import { ParentHead } from '../../../components/Kids';
import { Button, Card, IconBubble, Muted, Row, Screen, Sec, Seg, T } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { call, openWhatsApp } from '../../../lib/docs';
import { fd } from '../../../lib/school';
import { useParent } from '../../../lib/parent';
import { font, useTheme } from '../../../lib/theme';

export default function Messages() {
  const { t, mode, setMode } = useTheme();
  const { data, child, refresh, school: s } = useParent();
  const { signOut, member } = useAuth();
  const co = data?.company || {};
  const today = s?.today || '';
  const ann = (data?.announcements || []).slice().sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
  const evs = (data?.events || []).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const wa = co.whatsapp || co.mobile || co.phone;
  const out = () => {
    if (Platform.OS === 'web') { signOut(); return; }
    Alert.alert('Se déconnecter ?', '', [{ text: 'Annuler', style: 'cancel' }, { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() }]);
  };
  return (
    <Screen onRefresh={refresh} refreshing={false}>
      <ParentHead kicker={data?.school || co.name} title="L'école" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {wa ? <Button label="WhatsApp" icon={MessageCircle} style={{ flex: 1, backgroundColor: '#1FAA59', borderColor: '#1FAA59' }}
          onPress={() => openWhatsApp(wa, `Bonjour, je suis ${child?.parent?.name || member?.name || ''}, parent de ${child?.name || ''} (${child?.classe || ''}). `, s?.s.country)} /> : null}
        {co.phone ? <Button variant="ghost" label="Appeler" icon={Phone} style={{ flex: 1 }} onPress={() => call(co.phone)} /> : null}
      </View>
      <Sec>Annonces</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {ann.length ? ann.map((a, i) => (
          <View key={a.id} style={{ paddingVertical: 12, borderBottomWidth: i === ann.length - 1 ? 0 : 1, borderBottomColor: t.border }}>
            <T style={{ fontFamily: font.semibold }}>{a.title}</T>
            <Muted style={{ marginTop: 2, fontSize: 12 }}>{fd(a.date)}{a.author ? ` · ${a.author}` : ''}</Muted>
            <T style={{ marginTop: 6, fontSize: 14.5, lineHeight: 21, color: t.text2 }}>{a.body}</T>
          </View>
        )) : <Muted style={{ padding: 16 }}>Aucune annonce pour le moment.</Muted>}
      </Card>
      <Sec>Agenda</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {evs.length ? evs.map((e, i) => <Row key={e.id} last={i === evs.length - 1} left={<IconBubble icon={CalendarDays} color="#B45309" bg={t.warningSoft} size={34} />} title={e.title} subtitle={fd(e.date)} />)
          : <Muted style={{ padding: 16 }}>Rien de prévu.</Muted>}
      </Card>
      <Sec>Mon compte</Sec>
      <Card>
        <T style={{ fontFamily: font.semibold }}>{member?.name || child?.parent?.name}</T>
        <Muted style={{ marginTop: 2 }}>{member?.email}</Muted>
      </Card>
      <View style={{ marginTop: 12 }}>
        <Seg items={[{ key: 'light', label: 'Clair' }, { key: 'dark', label: 'Sombre' }, { key: 'auto', label: 'Automatique' }]} value={mode} onChange={setMode} />
      </View>
      <Button variant="danger" icon={LogOut} label="Se déconnecter" onPress={out} style={{ marginTop: 16 }} />
    </Screen>
  );
}
