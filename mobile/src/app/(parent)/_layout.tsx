import { Stack } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { ParentStore } from '../../lib/parent';

export default function ParentLayout() {
  const { member } = useAuth();
  if (!member) return null;
  return (
    <ParentStore member={member}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="matiere/[sid]" />
        <Stack.Screen name="compte" />
        <Stack.Screen name="nouveau-message" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="absence" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
    </ParentStore>
  );
}
