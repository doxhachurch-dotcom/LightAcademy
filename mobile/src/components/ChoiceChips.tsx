import { Pressable, Text, View } from 'react-native';
import { font, useTheme } from '../lib/theme';
import { tap } from './ui';

/** Choix en pastilles qui passent à la ligne (destinataire, motif…). */
export function ChoiceChips({ items, value, onChange }: { items: { key: string; label: string }[]; value: string; onChange: (k: string) => void }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => { tap(); onChange(it.key); }}
            style={{ paddingHorizontal: 13, height: 38, borderRadius: 19, justifyContent: 'center', borderWidth: 1, borderColor: on ? '#C7D4FB' : t.border, backgroundColor: on ? t.primarySoft : t.card }}>
            <Text style={{ fontFamily: on ? font.semibold : font.regular, fontSize: 14, color: on ? t.primary : t.text2 }}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

