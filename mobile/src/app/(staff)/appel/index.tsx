import { router } from 'expo-router';
import { ClipboardCheck } from 'lucide-react-native';
import { BackHeader, Card, Empty, Muted, Pill, Row, Screen } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { isSchoolDay } from '../../../lib/school';
import { useSchool } from '../../../lib/store';

export default function AppelIndex() {
  const { school: s } = useSchool();
  const { member } = useAuth();
  if (!s) return null;
  const prof = member?.role === 'prof';
  const list = prof ? s.myClasses(member?.employee_id || (s.s.persona as { teacher?: string })?.teacher) : s.classes;
  const done = list.filter((c) => s.appelDone(s.today, c.id)).length;
  return (
    <Screen bottomInset={false}>
      <BackHeader back="Retour" onBack={() => router.back()} title="Faire l'appel" sub={isSchoolDay(s.today) ? `${done} appel(s) fait(s) sur ${list.length} aujourd'hui` : "Aujourd'hui n'est pas un jour de classe"} />
      <Card pad={0} style={{ paddingHorizontal: 14, marginBottom: 30 }}>
        {list.map((c, i) => {
          const ok = s.appelDone(s.today, c.id);
          return <Row key={c.id} last={i === list.length - 1} title={c.name} subtitle={`${s.stuOfClass(c.id).length} élèves${c.room ? ' · ' + c.room : ''}`}
            right={<Pill small label={ok ? 'Fait' : 'À faire'} tone={ok ? 'success' : 'warning'} />} onPress={() => router.push(`/appel/${c.id}`)} />;
        })}
        {!list.length ? <Empty icon={ClipboardCheck} title="Aucune classe" text="Aucune classe n'est rattachée à votre compte." /> : null}
      </Card>
      {!isSchoolDay(s.today) ? <Muted style={{ textAlign: 'center' }}>Vous pouvez quand même enregistrer un appel pour aujourd'hui.</Muted> : null}
    </Screen>
  );
}
