import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Chips, Muted, T } from './ui';
import { useParent } from '../lib/parent';
import { font } from '../lib/theme';
import { initials } from '../lib/format';

/** En-tête de l'espace parent + choix de l'enfant (si plusieurs). */
export function ParentHead({ kicker, title }: { kicker?: string; title: string }) {
  const { data, child, setChild } = useParent();
  const kids = data?.children || [];
  return (
    <View style={{ paddingTop: 8, paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Muted style={{ fontSize: 13.5 }}>{kicker || (child ? `${child.prenom || child.name} · ${child.classe}` : 'Espace parent')}</Muted>
          <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 2 }} numberOfLines={1}>{title}</T>
        </View>
        <Pressable accessibilityLabel="Mon compte" onPress={() => router.push('/compte')} hitSlop={6}
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#5B4CF0', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: font.semibold, fontSize: 14 }}>{initials(data?.member?.name || child?.parent?.name || '?')}</Text>
        </Pressable>
      </View>
      {kids.length > 1 ? (
        <View style={{ marginTop: 12 }}>
          <Chips items={kids.map((k) => ({ key: k.id, label: `${k.prenom || k.name} · ${k.classe}` }))} value={child?.id || ''} onChange={setChild} />
        </View>
      ) : null}
    </View>
  );
}
