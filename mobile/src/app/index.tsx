import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function Index() {
  const { member } = useAuth();
  if (!member) return <Redirect href="/login" />;
  return <Redirect href={member.role === 'parent' ? '/famille' : '/accueil'} />;
}
