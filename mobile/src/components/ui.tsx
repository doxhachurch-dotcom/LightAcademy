import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { avatarColor, initials } from '../lib/format';
import { font, radius, useTheme, type Theme } from '../lib/theme';

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

/* ---------- Texte ---------- */
type TxtProps = { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number; selectable?: boolean; adjustsFontSizeToFit?: boolean };
export function T({ children, style, numberOfLines, selectable, adjustsFontSizeToFit }: TxtProps) {
  const { t } = useTheme();
  return (
    <Text selectable={selectable} numberOfLines={numberOfLines} adjustsFontSizeToFit={adjustsFontSizeToFit} style={[{ color: t.text, fontFamily: font.regular, fontSize: 15 }, style]}>
      {children}
    </Text>
  );
}
export const Muted = (p: TxtProps) => {
  const { t } = useTheme();
  return <T {...p} style={[{ color: t.muted, fontSize: 13 }, p.style]} />;
};

/* ---------- Écran ---------- */
export function Screen({
  children,
  refreshing,
  onRefresh,
  scroll = true,
  padded = true,
  bottomInset = true,
  footer,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
  padded?: boolean;
  bottomInset?: boolean;
  footer?: ReactNode;
}) {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const bg = (
    <LinearGradient
      colors={[t.bgTop, t.bg]}
      locations={[0, 0.35]}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
  const content = <View style={[padded && { paddingHorizontal: 16 }, { paddingBottom: bottomInset ? 110 : 24 }]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {bg}
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: ins.top + 6 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.primary} /> : undefined}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: ins.top + 6 }}>{children}</View>
      )}
      {footer}
    </View>
  );
}

/* ---------- En-tête de page ---------- */
export function PageHeader({ kicker, title, right, children }: { kicker?: string; title: string; right?: ReactNode; children?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ paddingTop: 8, paddingBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {kicker ? <Muted style={{ marginBottom: 4 }}>{kicker}</Muted> : null}
          <T style={{ fontFamily: font.bold, fontSize: 30, letterSpacing: -0.9, color: t.text }} numberOfLines={1}>
            {title}
          </T>
        </View>
        {right}
      </View>
      {children ? <View style={{ marginTop: 14 }}>{children}</View> : null}
    </View>
  );
}

/* ---------- Carte ---------- */
export function Card({ children, style, onPress, pad = 16 }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; pad?: number }) {
  const { t } = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.card,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: t.border,
    padding: pad,
    ...shadow(t),
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [base, style, pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 }]}
    >
      {children}
    </Pressable>
  );
}

export const shadow = (t: Theme): ViewStyle =>
  t.dark
    ? {}
    : Platform.select({
        ios: { shadowColor: t.shadow, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
        android: { elevation: 1 },
        default: { boxShadow: '0 8px 24px -18px rgba(16,24,40,0.35)' } as ViewStyle,
      }) || {};

/* ---------- Pastille d'icône ---------- */
export function IconBubble({ icon: Icon, color, bg, size = 32 }: { icon: LucideIcon; color: string; bg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size * 0.5} color={color} strokeWidth={2.1} />
    </View>
  );
}

/* ---------- Carte de chiffre ---------- */
export function Stat({ icon, color, bg, value, label, sub, onPress }: { icon: LucideIcon; color: string; bg: string; value: string | number; label: string; sub?: string; onPress?: () => void }) {
  const { t } = useTheme();
  return (
    <Card onPress={onPress} style={{ flex: 1, minHeight: 116 }} pad={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <IconBubble icon={icon} color={color} bg={bg} size={28} />
        <T style={{ fontFamily: font.medium, fontSize: 13, color: t.text2, flex: 1 }} numberOfLines={2}>
          {label}
        </T>
      </View>
      <T style={{ fontFamily: font.bold, fontSize: 28, letterSpacing: -0.8, marginTop: 10 }}>{value}</T>
      {sub ? <Muted style={{ fontSize: 12, marginTop: 2 }} numberOfLines={1}>{sub}</Muted> : null}
    </Card>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ name, size = 40, color }: { name?: string | null; size?: number; color?: string }) {
  const c = color || avatarColor(name);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontFamily: font.semibold, fontSize: size * 0.36, letterSpacing: 0.2 }}>{initials(name)}</Text>
    </View>
  );
}

/* ---------- Pastille ---------- */
export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'violet' | 'pink' | 'muted';
export function toneColors(t: Theme, tone: Tone): [string, string] {
  switch (tone) {
    case 'primary': return [t.primary, t.primarySoft];
    case 'success': return [t.success, t.successSoft];
    case 'warning': return [t.dark ? t.warning : '#B45309', t.warningSoft];
    case 'danger': return [t.danger, t.dangerSoft];
    case 'violet': return [t.violet, t.violetSoft];
    case 'pink': return [t.pink, t.pinkSoft];
    default: return [t.muted, t.input];
  }
}
export function Pill({ label, tone = 'muted', color, bg, dot, small }: { label: string; tone?: Tone; color?: string; bg?: string; dot?: string; small?: boolean }) {
  const { t } = useTheme();
  const [c, b] = toneColors(t, tone);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: bg || b, borderRadius: radius.pill, paddingHorizontal: small ? 8 : 10, height: small ? 22 : 26 }}>
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} /> : null}
      <Text style={{ color: color || c, fontFamily: font.semibold, fontSize: small ? 11 : 12 }}>{label}</Text>
    </View>
  );
}

/* ---------- Boutons ---------- */
export function Button({
  label,
  onPress,
  icon: Icon,
  variant = 'primary',
  loading,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const { t } = useTheme();
  const map = {
    primary: { bg: t.primary, fg: '#fff', border: t.primary },
    soft: { bg: t.primarySoft, fg: t.primary, border: t.primarySoft },
    ghost: { bg: t.card, fg: t.text, border: t.border },
    danger: { bg: t.dangerSoft, fg: t.danger, border: t.dangerSoft },
  }[variant];
  const h = small ? 38 : 48;
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          height: h,
          borderRadius: 12,
          paddingHorizontal: small ? 14 : 20,
          backgroundColor: map.bg,
          borderWidth: 1,
          borderColor: map.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        variant === 'primary' && !t.dark && Platform.OS === 'ios' && { shadowColor: t.primary, shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={map.fg} />
      ) : (
        <>
          {Icon ? <Icon size={small ? 16 : 18} color={map.fg} strokeWidth={2.2} /> : null}
          <Text style={{ color: map.fg, fontFamily: font.semibold, fontSize: small ? 14 : 15.5 }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({ icon: Icon, onPress, color, bg, size = 40, label }: { icon: LucideIcon; onPress: () => void; color?: string; bg?: string; size?: number; label: string }) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg || t.card,
        borderWidth: bg ? 0 : 1,
        borderColor: t.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon size={size * 0.45} color={color || t.text2} strokeWidth={2} />
    </Pressable>
  );
}

/* ---------- Recherche ---------- */
export function SearchBar({ value, onChange, placeholder = 'Rechercher' }: { value: string; onChange: (s: string) => void; placeholder?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, gap: 8 }}>
      <Search size={17} color={t.faint} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.faint}
        style={{ flex: 1, color: t.text, fontFamily: font.regular, fontSize: 16, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}) }}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <X size={16} color={t.faint} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------- Onglets soulignés (comme le web) ---------- */
export function Tabs<K extends string>({ items, value, onChange }: { items: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void }) {
  const { t } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 22, borderBottomWidth: 1, borderBottomColor: t.border, minWidth: '100%' }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => {
              tap();
              onChange(it.key);
            }}
            style={{ paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: on ? t.primary : 'transparent', marginBottom: -1, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Text style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 14.5, color: on ? t.text : t.muted }}>{it.label}</Text>
            {it.count !== undefined ? (
              <View style={{ minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: on ? t.primarySoft : t.input, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: font.semibold, color: on ? t.primary : t.muted }}>{it.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Puces de filtre ---------- */
export function Chips<K extends string>({ items, value, onChange, wrap }: { items: { key: K; label: string; dot?: string }[]; value: K; onChange: (k: K) => void; wrap?: boolean }) {
  const { t } = useTheme();
  const list = items.map((it) => {
    const on = it.key === value;
    return (
      <Pressable
        key={it.key}
        onPress={() => {
          tap();
          onChange(it.key);
        }}
        style={{ height: 34, paddingHorizontal: 14, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: on ? t.primarySoft : t.card, borderWidth: 1, borderColor: on ? t.primarySoft : t.border }}
      >
        {it.dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: it.dot }} /> : null}
        <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: on ? t.primary : t.text2 }}>{it.label}</Text>
      </Pressable>
    );
  });
  if (wrap) return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{list}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
      {list}
    </ScrollView>
  );
}

/* ---------- Titres de section ---------- */
export function SectionTitle({ title, right, style }: { title: string; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 10 }, style]}>
      <T style={{ fontFamily: font.semibold, fontSize: 17, letterSpacing: -0.3, flex: 1 }}>{title}</T>
      {right}
    </View>
  );
}

export function LinkText({ label, onPress }: { label: string; onPress: () => void }) {
  const { t } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={{ color: t.primary, fontFamily: font.semibold, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

/* ---------- États ---------- */
export function Empty({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 8 }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: t.input, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Icon size={26} color={t.faint} />
      </View>
      <T style={{ fontFamily: font.semibold, fontSize: 16, textAlign: 'center' }}>{title}</T>
      {text ? <Muted style={{ textAlign: 'center', fontSize: 14, lineHeight: 20 }}>{text}</Muted> : null}
      {action ? <View style={{ marginTop: 10 }}>{action}</View> : null}
    </View>
  );
}

export function Loading() {
  const { t } = useTheme();
  return (
    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
      <ActivityIndicator color={t.primary} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTheme();
  return (
    <Card style={{ backgroundColor: t.dangerSoft, borderColor: t.dangerSoft, marginTop: 8 }}>
      <T style={{ color: t.danger, fontFamily: font.semibold }}>Chargement impossible</T>
      <Muted style={{ marginTop: 4 }}>{message}</Muted>
      {onRetry ? <View style={{ marginTop: 10, alignSelf: 'flex-start' }}><Button small variant="ghost" label="Réessayer" onPress={onRetry} /></View> : null}
    </Card>
  );
}

/* ---------- Ligne de liste ---------- */
export function Row({ left, title, subtitle, right, onPress, last }: { left?: ReactNode; title: string; subtitle?: string; right?: ReactNode; onPress?: () => void; last?: boolean }) {
  const { t } = useTheme();
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: t.border }}>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T style={{ fontFamily: font.medium, fontSize: 15.5 }} numberOfLines={1}>{title}</T>
        {subtitle ? <Muted numberOfLines={1} style={{ marginTop: 2 }}>{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {inner}
    </Pressable>
  );
}

/* ---------- Champ de formulaire ---------- */
export function Field({ label, required, hint, error, ...props }: TextInputProps & { label: string; required?: boolean; hint?: string; error?: string }) {
  const { t } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: t.text2, marginBottom: 7 }}>
        {label}
        {required ? <Text style={{ color: t.danger }}> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={t.faint}
        {...props}
        onFocus={(e) => { setFocus(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); props.onBlur?.(e); }}
        style={[
          {
            minHeight: props.multiline ? 96 : 48,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? t.danger : focus ? t.primary : t.border,
            backgroundColor: t.card,
            paddingHorizontal: 14,
            paddingTop: props.multiline ? 12 : 0,
            color: t.text,
            fontFamily: font.regular,
            fontSize: 16,
            textAlignVertical: props.multiline ? 'top' : 'center',
            ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
          },
          props.style,
        ]}
      />
      {error ? <Text style={{ color: t.danger, fontSize: 12.5, marginTop: 5, fontFamily: font.medium }}>{error}</Text> : hint ? <Muted style={{ fontSize: 12.5, marginTop: 5 }}>{hint}</Muted> : null}
    </View>
  );
}

export function Label({ children, required }: { children: string; required?: boolean }) {
  const { t } = useTheme();
  return (
    <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: t.text2, marginBottom: 8 }}>
      {children}
      {required ? <Text style={{ color: t.danger }}> *</Text> : null}
    </Text>
  );
}

/* ---------- Barre de progression ---------- */
export function Progress({ value, color }: { value: number; color?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: t.input, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: color || t.primary }} />
    </View>
  );
}

/* ---------- Initiales en carré doux (comme les listes du CRM) ---------- */
export function Ini({ name, size = 38, tone }: { name?: string | null; size?: number; tone?: 'danger' | 'muted' }) {
  const { t } = useTheme();
  const [bg, fg] = tone === 'danger' ? [t.dangerSoft, t.danger] : tone === 'muted' ? [t.input, t.text2] : [t.dark ? t.primarySoft : '#EEF0FE', t.dark ? t.primary : '#4F46E5'];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: fg, fontFamily: font.semibold, fontSize: size * 0.34 }}>{initials(name)}</Text>
    </View>
  );
}

/* ---------- Titre de section en petites capitales ---------- */
export function Sec({ children, right }: { children: string; right?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8, marginHorizontal: 4 }}>
      <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 12, letterSpacing: 0.6, color: t.faint, textTransform: 'uppercase' }}>{children}</Text>
      {right}
    </View>
  );
}

/* ---------- Carte chiffre clé ---------- */
export function Kpi({ label, value, sub, subTone, onPress }: { label: string; value: string; sub?: string; subTone?: 'success' | 'danger'; onPress?: () => void }) {
  const { t } = useTheme();
  return (
    <Card onPress={onPress} pad={14} style={{ flex: 1 }}>
      <Muted style={{ fontSize: 12.5 }} numberOfLines={1}>{label}</Muted>
      <T style={{ fontFamily: font.bold, fontSize: 21, letterSpacing: -0.5, marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>{value}</T>
      {sub ? <Muted style={{ fontSize: 12, marginTop: 3, color: subTone ? (subTone === 'success' ? t.success : t.danger) : t.muted }} numberOfLines={1}>{sub}</Muted> : null}
    </Card>
  );
}

/* ---------- Choix segmenté ---------- */
export function Seg<K extends string>({ items, value, onChange }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.dark ? t.cardAlt : '#EEF1F5', borderRadius: 12, padding: 3, gap: 3 }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => { tap(); onChange(it.key); }} style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 38, borderRadius: 10 }, on && { backgroundColor: t.card, ...shadow(t) }]}>
            <Text numberOfLines={1} style={{ fontFamily: on ? font.semibold : font.regular, fontSize: 13.5, color: on ? t.text : t.text2 }}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- En-tête avec retour ---------- */
export function BackHeader({ back, onBack, title, sub, right }: { back: string; onBack: () => void; title: string; sub?: string; right?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ paddingTop: 4, paddingBottom: 14 }}>
      <Pressable onPress={onBack} hitSlop={10} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
        <Text style={{ color: t.primary, fontFamily: font.medium, fontSize: 15 }}>‹ {back}</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 4 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T style={{ fontFamily: font.bold, fontSize: 24, letterSpacing: -0.6 }} numberOfLines={2}>{title}</T>
          {sub ? <Muted style={{ marginTop: 3 }} numberOfLines={1}>{sub}</Muted> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

/* ---------- Pied d'écran fixe (bouton principal) ---------- */
export function Footer({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(ins.bottom, 14), backgroundColor: t.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border }}>
      {children}
    </View>
  );
}
