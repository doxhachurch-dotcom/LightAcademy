import { Stack } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { StaffStore } from '../../lib/store';

export default function StaffLayout() {
  const { member } = useAuth();
  if (!member) return null;
  return (
    <StaffStore member={member}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="eleve/[id]" />
        <Stack.Screen name="encaisser" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="recu/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="appel/index" />
        <Stack.Screen name="appel/[cid]" />
        <Stack.Screen name="recouvrement" />
      </Stack>
    </StaffStore>
  );
}
