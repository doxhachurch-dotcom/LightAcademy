import { Text, View } from 'react-native';
import { useSchool } from '../lib/store';
import { font, useTheme } from '../lib/theme';

/** Pastille d'état de l'enregistrement en ligne (comme le CRM web). */
export function SyncChip() {
  const { t } = useTheme();
  const { status, pending } = useSchool();
  const [label, c, bg] =
    status === 'ok' ? ['Enregistré en ligne', t.success, t.successSoft]
    : status === 'syncing' ? ['Synchronisation…', t.primary, t.primarySoft]
    : status === 'offline' ? [pending ? `Hors ligne · ${pending} en attente` : 'Hors ligne', '#B45309', t.warningSoft]
    : [`${pending} modification(s) en attente`, '#B45309', t.warningSoft];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: bg, borderRadius: 99, paddingHorizontal: 10, height: 24 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
      <Text style={{ color: c, fontFamily: font.semibold, fontSize: 11.5 }}>{label}</Text>
    </View>
  );
}
