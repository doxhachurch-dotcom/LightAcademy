import { router } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chips, Empty, Ini, Loading, Muted, Pill, Row, SearchBar, T } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { normalize } from '../../../lib/format';
import { useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

export default function Eleves() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const { school: s, refresh, status } = useSchool();
  const { member } = useAuth();
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const finance = member?.role === 'admin' || member?.role === 'compta';
  const prof = member?.role === 'prof';

  const base = useMemo(() => {
    if (!s) return [];
    if (!prof) return s.students;
    const ids = new Set(s.myClasses(member?.employee_id || (s.s.persona as { teacher?: string })?.teacher).map((c) => c.id));
    return s.students.filter((x) => ids.has(x.level));
  }, [s, prof, member?.employee_id]);

  const cycles = useMemo(() => [...new Set((s?.classes || []).map((c) => c.cycle))], [s]);
  const chips = [{ key: 'all', label: 'Tous' }, ...(finance ? [{ key: 'late', label: 'En retard' }] : []), ...cycles.map((c) => ({ key: 'c:' + c, label: c })), ...(prof ? (s?.myClasses(member?.employee_id) || []).map((c) => ({ key: 'k:' + c.id, label: c.name })) : [])];

  const list = useMemo(() => {
    if (!s) return [];
    const nq = normalize(q.trim());
    const order = new Map(s.classes.map((c, i) => [c.id, i]));
    return base
      .filter((x) => f === 'all' || (f === 'late' ? s.stuBal(x).late > 0.5 : f.startsWith('c:') ? (s.klass(x.level)?.cycle === f.slice(2)) : x.level === f.slice(2)))
      .filter((x) => !nq || normalize(`${x.name} ${x.classe} ${x.parent?.name || ''} ${x.matricule || ''} ${x.parent?.phone || ''}`).includes(nq))
      .sort((a, b) => (f === 'late' ? s.stuBal(b).late - s.stuBal(a).late : 0) || a.name.localeCompare(b.name) || (order.get(a.level) ?? 0) - (order.get(b.level) ?? 0));
  }, [s, base, q, f]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: ins.top + 14, paddingHorizontal: 16, backgroundColor: t.bg }}>
        <Muted style={{ fontSize: 13.5 }}>{base.length} élèves · {prof ? `${s?.myClasses(member?.employee_id).length || 0} classe(s)` : `${s?.classes.length || 0} classes`}</Muted>
        <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 2, marginBottom: 12 }}>Élèves</T>
        <SearchBar value={q} onChange={setQ} placeholder="Nom, classe, parent, matricule…" />
        <View style={{ marginTop: 10, marginBottom: 6 }}><Chips items={chips} value={f} onChange={setF} /></View>
      </View>
      {!s ? <Loading /> : (
        <FlatList
          data={list}
          keyExtractor={(x) => x.id}
          onRefresh={refresh}
          refreshing={status === 'syncing'}
          initialNumToRender={20}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 6 }}
          ListEmptyComponent={<Empty icon={Users} title="Aucun élève" text={q ? 'Aucun résultat pour cette recherche.' : undefined} />}
          renderItem={({ item, index }) => {
            const tag = finance ? s.stuTag(item) : null;
            return (
              <View style={{ backgroundColor: t.card, paddingHorizontal: 14, borderLeftWidth: 1, borderRightWidth: 1, borderColor: t.border, borderTopWidth: index === 0 ? 1 : 0, borderBottomWidth: index === list.length - 1 ? 1 : 0, borderTopLeftRadius: index === 0 ? 16 : 0, borderTopRightRadius: index === 0 ? 16 : 0, borderBottomLeftRadius: index === list.length - 1 ? 16 : 0, borderBottomRightRadius: index === list.length - 1 ? 16 : 0 }}>
                <Row last={index === list.length - 1} left={<Ini name={item.name} />} title={item.name} subtitle={item.classe}
                  right={tag ? <Pill small label={tag.label} tone={tag.tone} /> : undefined} onPress={() => router.push(`/eleve/${item.id}`)} />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
