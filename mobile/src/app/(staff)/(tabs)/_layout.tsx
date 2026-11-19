import { router } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { ChartLine, ClipboardCheck, Ellipsis, House, Plus, Users, type LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tap } from '../../../components/ui';
import { useAuth, type Role } from '../../../lib/auth';
import { font, useTheme } from '../../../lib/theme';

const ICONS: Record<string, [LucideIcon, string]> = {
  accueil: [House, 'Accueil'],
  eleves: [Users, 'Élèves'],
  action: [Plus, 'Encaisser'],
  finances: [ChartLine, 'Finances'],
  plus: [Ellipsis, 'Plus'],
};
/** Onglets visibles selon le rôle (mêmes droits que le CRM web). */
const VISIBLE: Record<Exclude<Role, 'parent'>, string[]> = {
  admin: ['accueil', 'eleves', 'action', 'finances', 'plus'],
  compta: ['accueil', 'eleves', 'action', 'finances', 'plus'],
  prof: ['accueil', 'eleves', 'action', 'plus'],
  rh: ['accueil', 'eleves', 'plus'],
};

function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const { member } = useAuth();
  const role = (member?.role || 'admin') as Exclude<Role, 'parent'>;
  const show = VISIBLE[role] || VISIBLE.admin;
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(ins.bottom, 8), borderTopColor: t.border }]}>
      {Platform.OS === 'ios' ? <BlurView intensity={60} tint={t.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'web' ? t.card : t.tabBar, opacity: Platform.OS === 'ios' ? 0.8 : 1 }]} />
      {state.routes.map((route, i) => {
        if (!show.includes(route.name)) return null;
        const on = state.index === i;
        const [Icon, label0] = ICONS[route.name] || [House, route.name];
        if (route.name === 'action') {
          const label = role === 'prof' ? 'Appel' : label0;
          return (
            <Pressable key={route.key} accessibilityRole="button" accessibilityLabel={label} style={styles.tab}
              onPress={() => { tap(); router.push(role === 'prof' ? '/appel' : '/encaisser'); }}>
              <View style={[styles.fab, { backgroundColor: t.primary, shadowColor: t.primary }]}>
                {role === 'prof' ? <ClipboardCheck size={24} color="#fff" strokeWidth={2.3} /> : <Plus size={26} color="#fff" strokeWidth={2.5} />}
              </View>
              <Text style={{ fontFamily: font.medium, fontSize: 11, color: t.muted, marginTop: 3 }}>{label}</Text>
            </Pressable>
          );
        }
        const color = on ? t.primary : t.faint;
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label0} style={styles.tab}
            onPress={() => {
              tap();
              const ev = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!on && !ev.defaultPrevented) navigateToTab(route.key);
            }}>
            <Icon size={22} color={color} strokeWidth={on ? 2.3 : 1.9} />
            <Text style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 11, color, marginTop: 4 }}>{label0}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p: BottomTabBarProps) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="accueil" />
      <Tabs.Screen name="eleves" />
      <Tabs.Screen name="action" />
      <Tabs.Screen name="finances" />
      <Tabs.Screen name="plus" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: 8, paddingHorizontal: 6, borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  fab: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: -26, shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
});
