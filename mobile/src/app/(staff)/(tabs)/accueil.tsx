import { router } from 'expo-router';
import { Banknote, ClipboardCheck, Landmark, MessageCircle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SyncChip } from '../../../components/Sync';
import { Card, Empty, ErrorBox, Ini, Kpi, Loading, Muted, Row, Screen, Sec, T, tap } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { fmtDayName } from '../../../lib/format';
import { fdShort, isSchoolDay, lastSchoolDays, money, SLOTE, SLOTS, type School } from '../../../lib/school';
import { useSchool } from '../../../lib/store';
import { font, useTheme } from '../../../lib/theme';

function Head({ title }: { title: string }) {
  const { t } = useTheme();
  const { member } = useAuth();
  const ini = String(member?.name || member?.email || '?').split(/[\s@.]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={{ paddingTop: 8, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Muted style={{ fontSize: 13.5 }}>{fmtDayName(new Date())}</Muted>
          <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 2 }} numberOfLines={1}>{title}</T>
        </View>
        <Pressable onPress={() => router.push('/plus')} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#5B4CF0', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: font.semibold, fontSize: 14 }}>{ini}</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 10 }}><SyncChip /></View>
    </View>
  );
}

function Quick({ items }: { items: { icon: typeof Banknote; label: string; go: () => void }[] }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
      {items.map((q) => (
        <Pressable key={q.label} onPress={() => { tap(); q.go(); }} style={({ pressed }) => ({ flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}>
          <q.icon size={22} color={t.primary} strokeWidth={1.9} />
          <Text style={{ fontFamily: font.medium, fontSize: 11.5, color: t.text2 }} numberOfLines={1}>{q.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Admin({ s }: { s: School }) {
  const month = s.today.slice(0, 7);
  const [y, m] = month.split('-').map(Number);
  const prev = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, '0')}`;
  const cm = s.cashedIn(month), pm = s.cashedIn(prev);
  const late = s.lateStudents;
  const lateAmt = late.reduce((a, x) => a + s.stuBal(x).late, 0);
  const n = s.students.length;
  const abs = s.absentToday();
  const days = lastSchoolDays(s.today, 1);
  const rate = days.length && days[0] === s.today ? s.presenceRate(s.students, days) : null;
  const recent = s.payments().slice(0, 5);
  const diff = pm ? Math.round(((cm - pm) / pm) * 100) : null;
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Kpi label="Encaissé ce mois" value={money(cm, s.cur, true)} sub={diff == null ? 'Ce mois-ci' : `${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)} % vs mois dernier`} subTone={diff == null ? undefined : diff >= 0 ? 'success' : 'danger'} onPress={() => router.push('/finances')} />
        <Kpi label="Échu impayé" value={money(lateAmt, s.cur, true)} sub={`${late.length} élève(s) en retard`} subTone={late.length ? 'danger' : undefined} onPress={() => router.push('/recouvrement')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Kpi label="Présence du jour" value={rate == null ? '—' : `${Math.round(rate * 100)} %`} sub={isSchoolDay(s.today) ? `${abs} absent(s) sur ${n}` : 'Pas de classe aujourd’hui'} onPress={() => router.push('/appel')} />
        <Kpi label="Trésorerie" value={money(s.totalCash, s.cur, true)} sub="Caisse, banque, Mobile Money" onPress={() => router.push('/finances')} />
      </View>
      <Quick items={[
        { icon: Banknote, label: 'Encaisser', go: () => router.push('/encaisser') },
        { icon: ClipboardCheck, label: 'Appel', go: () => router.push('/appel') },
        { icon: MessageCircle, label: 'Relancer', go: () => router.push('/recouvrement') },
        { icon: Landmark, label: 'Trésorerie', go: () => router.push('/finances') },
      ]} />
      <Sec>Derniers encaissements</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {recent.length ? recent.map((tx, i) => {
          const st = s.paymentStudent(tx);
          return <Row key={tx.id} last={i === recent.length - 1} left={<Ini name={st?.name} />} title={st?.name || '—'} subtitle={`${st?.classe || ''} · ${s.modeLabel(tx.tid)} · ${fdShort(tx.date)}`}
            right={<T style={{ fontFamily: font.semibold }}>{money(tx.amount, s.cur, true)}</T>} onPress={() => router.push(`/recu/${tx.id}`)} />;
        }) : <Empty icon={Banknote} title="Aucun encaissement" text="Les paiements enregistrés apparaîtront ici." />}
      </Card>
    </>
  );
}

function Teacher({ s, teacherId }: { s: School; teacherId: string | null }) {
  const { t } = useTheme();
  const mine = s.myClasses(teacherId);
  const dow = new Date().getDay();
  const lessons = mine.flatMap((c) => s.lessons(c.id, dow).filter((l) => !teacherId || l.t === teacherId).map((l) => ({ ...l, cid: c.id, cname: c.name }))).sort((a, b) => a.s - b.s);
  const todo = isSchoolDay(s.today) ? mine.filter((c) => !s.appelDone(s.today, c.id)) : [];
  const nStu = mine.reduce((a, c) => a + s.stuOfClass(c.id).length, 0);
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Kpi label="Mes classes" value={String(mine.length)} sub={`${nStu} élèves`} />
        <Kpi label="Appels à faire" value={String(todo.length)} sub={todo.length ? todo.map((c) => c.name).join(', ') : 'Tout est fait'} subTone={todo.length ? 'danger' : 'success'} onPress={() => router.push('/appel')} />
      </View>
      <Sec>{isSchoolDay(s.today) ? 'Mon programme du jour' : 'Pas de cours aujourd’hui'}</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {lessons.length ? lessons.map((l, i) => {
          const sub = s.subject(l.sub);
          const done = s.appelDone(s.today, l.cid);
          return <Row key={i} last={i === lessons.length - 1}
            left={<View style={{ width: 48 }}><T style={{ fontFamily: font.semibold, fontSize: 14 }}>{SLOTS[l.s]}</T><Muted style={{ fontSize: 11.5 }}>{SLOTE[l.s]}</Muted></View>}
            title={`${sub?.name || l.sub} · ${l.cname}`} subtitle={l.room || ''}
            right={<Text style={{ fontFamily: font.semibold, fontSize: 12, color: done ? t.success : t.primary }}>{done ? 'Appel fait' : 'Faire l’appel'}</Text>}
            onPress={() => router.push(`/appel/${l.cid}`)} />;
        }) : <Empty icon={ClipboardCheck} title="Aucun cours" text={mine.length ? 'Votre emploi du temps est vide pour aujourd’hui.' : "Aucune classe n'est rattachée à votre compte. Demandez à l'administrateur de lier votre fiche salarié."} />}
      </Card>
    </>
  );
}

function Rh({ s }: { s: School }) {
  const days = lastSchoolDays(s.today, 20);
  const up = (s.s.events || []).filter((e) => e.date >= s.today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Kpi label="Élèves" value={String(s.students.length)} sub={`${s.classes.length} classes`} />
        <Kpi label="Présence (20 j)" value={`${Math.round(s.presenceRate(s.students, days) * 100)} %`} sub={`${s.absentToday()} absent(s) aujourd’hui`} />
      </View>
      <Sec>À venir</Sec>
      <Card pad={0} style={{ paddingHorizontal: 14 }}>
        {up.map((e, i) => <Row key={e.id} last={i === up.length - 1} title={e.title} subtitle={fdShort(e.date)} />)}
        {!up.length ? <Empty icon={ClipboardCheck} title="Rien de prévu" /> : null}
      </Card>
    </>
  );
}

export default function Accueil() {
  const { school: s, loading, error, refresh, status } = useSchool();
  const { member } = useAuth();
  const first = String(member?.name || '').trim().split(/\s+/)[0];
  return (
    <Screen onRefresh={refresh} refreshing={status === 'syncing' && !!s}>
      <Head title={first ? `Bonjour ${first}` : 'Bonjour'} />
      {!s ? (error ? <ErrorBox message={error} onRetry={refresh} /> : <Loading />) : loading ? <Loading /> :
        member?.role === 'prof' ? <Teacher s={s} teacherId={member.employee_id || (s.s.persona as { teacher?: string } | undefined)?.teacher || null} /> :
        member?.role === 'rh' ? <Rh s={s} /> : <Admin s={s} />}
    </Screen>
  );
}
