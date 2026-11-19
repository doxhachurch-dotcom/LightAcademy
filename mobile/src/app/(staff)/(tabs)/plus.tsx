import { router } from 'expo-router';
import { ClipboardCheck, LogOut, MessageCircle, RefreshCw } from 'lucide-react-native';
import { Alert, Platform, View } from 'react-native';
import { SyncChip } from '../../../components/Sync';
import { Button, Card, IconBubble, Muted, PageHeader, Row, Screen, Sec, Seg, T } from '../../../components/ui';
import { ROLE_FR, useAuth } from '../../../lib/auth';
import { useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

export default function Plus() {
  const { t, mode, setMode } = useTheme();
  const { member, signOut } = useAuth();
  const { refresh, pending, lastSync } = useSchool();
  const finance = member?.role === 'admin' || member?.role === 'compta';
  const out = () => {
    const go = () => signOut();
    const msg = pending ? `${pending} modification(s) ne sont pas encore envoyées. Si vous vous déconnectez, elles seront perdues.` : 'Vous devrez saisir à nouveau votre mot de passe.';
    if (Platform.OS === 'web') { if (confirm(msg)) go(); return; }
    Alert.alert('Se déconnecter ?', msg, [{ text: 'Annuler', style: 'cancel' }, { text: 'Se déconnecter', style: 'destructive', onPress: go }]);
  };
  return (
    <Screen>
      <PageHeader title="Plus" />
      <Card>
        <T style={{ fontFamily: font.semibold, fontSize: 17 }}>{member?.name || member?.email}</T>
        <Muted style={{ marginTop: 2 }}>{member?.email}</Muted>
        <Muted style={{ marginTop: 6 }}>{member ? ROLE_FR[member.role] : ''} · {member?.school}</Muted>
        <View style={{ marginTop: 12 }}><SyncChip /></View>
        {lastSync ? <Muted style={{ marginTop: 6, fontSize: 12 }}>Dernière synchronisation : {new Date(lastSync).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Muted> : null}
      </Card>
      <Sec>Raccourcis</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {member?.role !== 'rh' ? <Row left={<IconBubble icon={ClipboardCheck} color={t.primary} bg={t.primarySoft} size={34} />} title="Faire l'appel" onPress={() => router.push('/appel')} /> : null}
        {finance ? <Row left={<IconBubble icon={MessageCircle} color="#1FAA59" bg={t.successSoft} size={34} />} title="Relances WhatsApp" onPress={() => router.push('/recouvrement')} /> : null}
        <Row last left={<IconBubble icon={RefreshCw} color={t.text2} bg={t.input} size={34} />} title="Synchroniser maintenant" subtitle={pending ? `${pending} en attente d'envoi` : 'Tout est à jour'} onPress={refresh} />
      </Card>
      <Sec>Apparence</Sec>
      <Seg items={[{ key: 'light', label: 'Clair' }, { key: 'dark', label: 'Sombre' }, { key: 'auto', label: 'Automatique' }]} value={mode} onChange={setMode} />
      <Muted style={{ marginTop: 22, lineHeight: 19 }}>Les autres rubriques (comptabilité, paie, emploi du temps, paramètres) restent sur le CRM web, avec les mêmes données.</Muted>
      <Button variant="danger" icon={LogOut} label="Se déconnecter" onPress={out} style={{ marginTop: 18 }} />
    </Screen>
  );
}
