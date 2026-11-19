import { Stack } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { ParentStore } from '../../lib/parent';

export default function ParentLayout() {
  const { member } = useAuth();
  if (!member) return null;
  return (
    <ParentStore member={member}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ParentStore>
  );
}
