import { router, useLocalSearchParams } from 'expo-router';
import { SendHorizontal } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Muted, T } from '../../../components/ui';
import { useParent } from '../../../lib/parent';
import { fd, when } from '../../../lib/school';
import { font, useTheme } from '../../../lib/theme';

export default function Conversation() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, data, contactName, send, markRead } = useParent();
  const th = threads.find((x) => x.id === String(id));
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => { if (th?.unread?.parent) markRead(th.id); }, [th?.id, th?.unread?.parent, markRead]);
  if (!th) return null;
  const kid = data?.children.find((k) => k.id === th.studentId);
  const who = contactName(th.studentId, th.with);

  const go = async () => {
    const v = text.trim();
    if (!v) return;
    setBusy(true); setErr(null);
    try { await send({ student: th.studentId, text: v, thread: th.id }); setText(''); setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 150); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  let lastDay = '';
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: t.card, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <Text onPress={() => router.back()} style={{ color: t.primary, fontFamily: font.medium, fontSize: 15, paddingVertical: 4 }}>‹ Messages</Text>
        <T style={{ fontFamily: font.bold, fontSize: 20, letterSpacing: -0.4, marginTop: 4 }} numberOfLines={2}>{th.subject}</T>
        <Muted style={{ marginTop: 2 }}>{who}{kid ? ` · ${kid.prenom} (${kid.classe})` : ''}</Muted>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: 24 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        {th.messages.map((m, i) => {
          const me = m.from === 'parent';
          const day = m.date.split(' ')[0];
          const sep = day !== lastDay; lastDay = day;
          return (
            <View key={i}>
              {sep ? <Muted style={{ textAlign: 'center', fontSize: 12, marginVertical: 10 }}>{fd(day)}</Muted> : null}
              <View style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%', backgroundColor: me ? t.primary : t.card, borderWidth: me ? 0 : 1, borderColor: t.border,
                borderRadius: 16, borderBottomRightRadius: me ? 5 : 16, borderBottomLeftRadius: me ? 16 : 5, paddingVertical: 10, paddingHorizontal: 13 }}>
                <Text style={{ color: me ? '#fff' : t.text, fontFamily: font.regular, fontSize: 15, lineHeight: 21 }}>{m.text}</Text>
              </View>
              <Muted style={{ fontSize: 11, marginTop: 3, marginBottom: 10, textAlign: me ? 'right' : 'left', marginHorizontal: 4 }}>{me ? '' : (th.with === 'admin' ? 'École' : who) + ' · '}{when(m.date)}</Muted>
            </View>
          );
        })}
      </ScrollView>
      {err ? <Text style={{ color: t.danger, fontFamily: font.medium, fontSize: 13, paddingHorizontal: 16, paddingBottom: 6 }}>{err}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Math.max(ins.bottom, 12), backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.border }}>
        <TextInput value={text} onChangeText={setText} placeholder="Écrire un message…" placeholderTextColor={t.faint} multiline
          style={{ flex: 1, minHeight: 42, maxHeight: 120, borderWidth: 1, borderColor: t.border, borderRadius: 21, paddingHorizontal: 15, paddingTop: 11, paddingBottom: 10, fontFamily: font.regular, fontSize: 15, color: t.text, backgroundColor: t.bg }} />
        <Pressable accessibilityLabel="Envoyer" onPress={go} disabled={busy || !text.trim()}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: text.trim() ? t.primary : t.input, alignItems: 'center', justifyContent: 'center' }}>
          {busy ? <ActivityIndicator color="#fff" /> : <SendHorizontal size={19} color={text.trim() ? '#fff' : t.faint} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
