import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { Banknote, BookOpen, House, MessageCircle, type LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tap } from '../../../components/ui';
import { useParent } from '../../../lib/parent';
import { font, useTheme } from '../../../lib/theme';

const ICONS: Record<string, [LucideIcon, string]> = {
  famille: [House, 'Accueil'], scolarite: [BookOpen, 'Scolarité'], paiements: [Banknote, 'Paiements'], messages: [MessageCircle, 'Messages'],
};

function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const { unread } = useParent();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(ins.bottom, 8), borderTopColor: t.border }]}>
      {Platform.OS === 'ios' ? <BlurView intensity={60} tint={t.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'web' ? t.card : t.tabBar, opacity: Platform.OS === 'ios' ? 0.8 : 1 }]} />
      {state.routes.map((route, i) => {
        const on = state.index === i;
        const [Icon, label] = ICONS[route.name] || [House, route.name];
        const color = on ? t.primary : t.faint;
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label} style={styles.tab}
            onPress={() => { tap(); const ev = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!on && !ev.defaultPrevented) navigateToTab(route.key); }}>
            <View>
              <Icon size={22} color={color} strokeWidth={on ? 2.3 : 1.9} />
              {route.name === 'messages' && unread ? (
                <View style={{ position: 'absolute', top: -5, right: -10, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: t.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: t.card }}>
                  <Text style={{ color: '#fff', fontFamily: font.bold, fontSize: 9.5 }}>{unread}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 11, color, marginTop: 4 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ParentTabs() {
  return (
    <Tabs tabBar={(p: BottomTabBarProps) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="famille" />
      <Tabs.Screen name="scolarite" />
      <Tabs.Screen name="paiements" />
      <Tabs.Screen name="messages" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: 9, paddingHorizontal: 6, borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
