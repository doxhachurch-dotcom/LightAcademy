import { router } from 'expo-router';
import { MessageCircle, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Empty, Ini, Loading, Muted, Screen, Seg, T, tap } from '../../../components/ui';
import { openWhatsApp } from '../../../lib/docs';
import { useParent, type Thread } from '../../../lib/parent';
import { fd, when } from '../../../lib/school';
import { font, useTheme } from '../../../lib/theme';

export default function Messages() {
  const { t } = useTheme();
  const { data, threads, school: s, contactName, refresh, child } = useParent();
  const [tab, setTab] = useState<'conv' | 'ann'>('conv');
  if (!data || !s) return <Screen><Loading /></Screen>;
  const ann = (data.announcements || []).slice().sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
  const co = data.company || {};
  const wa = co.whatsapp || co.mobile || co.phone;
  const kids = new Map(data.children.map((k) => [k.id, k]));

  const row = (th: Thread, i: number) => {
    const lastMsg = th.messages[th.messages.length - 1];
    const who = contactName(th.studentId, th.with);
    const kid = kids.get(th.studentId);
    const unread = !!th.unread?.parent;
    return (
      <Pressable key={th.id} onPress={() => { tap(); router.push(`/conversation/${th.id}`); }}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i === threads.length - 1 ? 0 : 1, borderBottomColor: t.border, opacity: pressed ? 0.6 : 1 })}>
        <Ini name={who} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T style={{ fontFamily: unread ? font.semibold : font.medium, fontSize: 15 }} numberOfLines={1}>{who}{data.children.length > 1 && kid ? <Text style={{ color: t.muted, fontFamily: font.regular }}> · {kid.prenom}</Text> : null}</T>
          <Muted numberOfLines={1} style={{ marginTop: 2, color: unread ? t.text2 : t.muted }}>{th.subject} · {lastMsg?.from === 'parent' ? 'Vous : ' : ''}{lastMsg?.text}</Muted>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Muted style={{ fontSize: 12 }}>{lastMsg ? when(lastMsg.date) : ''}</Muted>
          {unread ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.primary }} /> : <View style={{ height: 9 }} />}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen onRefresh={refresh} refreshing={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingTop: 8, paddingBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Muted style={{ fontSize: 13.5 }}>Espace parent</Muted>
          <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 2 }}>Messages</T>
        </View>
        <Pressable accessibilityLabel="Nouveau message" onPress={() => { tap(); router.push({ pathname: '/nouveau-message', params: { student: child?.id || '' } }); }}
          style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={22} color="#fff" strokeWidth={2.4} />
        </Pressable>
      </View>
      <Seg items={[{ key: 'conv', label: 'Conversations' }, { key: 'ann', label: ann.length ? `Annonces · ${ann.length}` : 'Annonces' }]} value={tab} onChange={setTab} />
      <View style={{ height: 14 }} />
      {tab === 'conv' ? (
        <>
          <Card pad={0} style={{ paddingHorizontal: 14 }}>
            {threads.length ? threads.map(row) : <Empty icon={MessageCircle} title="Aucune conversation" text="Écrivez à l'administration ou à un enseignant avec le bouton +." />}
          </Card>
          <Muted style={{ marginTop: 14, marginHorizontal: 4, lineHeight: 19, fontSize: 12.5 }}>Vos messages arrivent dans la rubrique Communication de l'école. Réponse en général sous 24 h ouvrées.</Muted>
          {wa ? <Button label="Urgence : WhatsApp de l'école" icon={MessageCircle} style={{ marginTop: 14, backgroundColor: '#1FAA59', borderColor: '#1FAA59' }}
            onPress={() => openWhatsApp(wa, `Bonjour, je suis ${child?.parent?.name || ''}, parent de ${child?.name || ''} (${child?.classe || ''}). `, s.s.country)} /> : null}
        </>
      ) : (
        <Card pad={0} style={{ paddingHorizontal: 14 }}>
          {ann.length ? ann.map((a, i) => (
            <View key={a.id} style={{ paddingVertical: 12, borderBottomWidth: i === ann.length - 1 ? 0 : 1, borderBottomColor: t.border }}>
              <T style={{ fontFamily: font.semibold }}>{a.pinned ? '📌 ' : ''}{a.title}</T>
              <Muted style={{ marginTop: 2, fontSize: 12 }}>{fd(a.date)}{a.author ? ` · ${a.author}` : ''}</Muted>
              <T style={{ marginTop: 6, fontSize: 14.5, lineHeight: 21, color: t.text2 }}>{a.body}</T>
            </View>
          )) : <Muted style={{ padding: 16 }}>Aucune annonce pour le moment.</Muted>}
        </Card>
      )}
    </Screen>
  );
}
