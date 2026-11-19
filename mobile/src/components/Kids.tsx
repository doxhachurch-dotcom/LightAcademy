import { View } from 'react-native';
import { Chips, Muted, T } from './ui';
import { useParent } from '../lib/parent';
import { font } from '../lib/theme';

/** En-tête de l'espace parent + choix de l'enfant (si plusieurs). */
export function ParentHead({ kicker, title }: { kicker?: string; title: string }) {
  const { data, child, setChild } = useParent();
  const kids = data?.children || [];
  return (
    <View style={{ paddingTop: 8, paddingBottom: 12 }}>
      <Muted style={{ fontSize: 13.5 }}>{kicker || (child ? `${child.prenom || child.name} · ${child.classe}` : 'Espace parent')}</Muted>
      <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 2 }} numberOfLines={1}>{title}</T>
      {kids.length > 1 ? (
        <View style={{ marginTop: 12 }}>
          <Chips items={kids.map((k) => ({ key: k.id, label: `${k.prenom || k.name} · ${k.classe}` }))} value={child?.id || ''} onChange={setChild} />
        </View>
      ) : null}
    </View>
  );
}
