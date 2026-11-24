import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth';
import { dark, light, ThemeCtx, type ThemeMode } from '../lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const { ready, session, member } = useAuth();
  const signedIn = !!session && !!member;
  const parent = signedIn && member?.role === 'parent';
  useEffect(() => { if (ready) SplashScreen.hideAsync().catch(() => {}); }, [ready]);
  if (!ready) return null;
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !parent}>
        <Stack.Screen name="(staff)" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={parent}>
        <Stack.Screen name="(parent)" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  useEffect(() => {
    AsyncStorage.getItem('theme').then((v) => { if (v === 'light' || v === 'dark' || v === 'auto') setModeState(v); });
  }, []);
  const value = useMemo(() => {
    const isDark = mode === 'dark' || (mode === 'auto' && system === 'dark');
    return { t: isDark ? dark : light, mode, setMode: (m: ThemeMode) => { setModeState(m); AsyncStorage.setItem('theme', m).catch(() => {}); } };
  }, [mode, system]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeCtx.Provider value={value}>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: value.t.bg }}>
            <StatusBar style={value.t.dark ? 'light' : 'dark'} />
            <Gate />
          </View>
        </AuthProvider>
      </ThemeCtx.Provider>
    </SafeAreaProvider>
  );
}
