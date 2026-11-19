import { FileText } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { ParentHead } from '../../../components/Kids';
import { Button, Card, Empty, Loading, Muted, Pill, Row, Screen, Seg, T } from '../../../components/ui';
import { bulletinHTML, sharePdf } from '../../../lib/docs';
import { fa, fd, SLOTE, SLOTS, WD } from '../../../lib/school';
import { useParent } from '../../../lib/parent';
import { font, useTheme } from '../../../lib/theme';

export default function Scolarite() {
  const { t } = useTheme();
  const { school: s, child, data, refresh } = useParent();
  const [tab, setTab] = useState<'notes' | 'abs' | 'edt'>('notes');
  const wd = new Date().getDay();
  const [day, setDay] = useState(wd >= 1 && wd <= 5 ? wd : 1);
  if (!s || !child) return <Screen><Loading /></Screen>;
  const graded = s.graded(child.level);
  const teachers = data?.teachers?.[child.level] || {};
  const pub = !!data?.published?.[child.level];
  const classAvg = (sid: string) => {
    let a = 0, c = 0;
    for (const e of s.evalsOf(child.level, sid)) if (e.classAvg != null) { a += Number(e.classAvg) * e.coef; c += e.coef; }
    return c ? a / c : null;
  };
  const att = s.attOf(child.id);
  const lessons = s.lessons(child.level, day);

  return (
    <Screen onRefresh={refresh} refreshing={false}>
      <ParentHead title="Scolarité" />
      <Seg items={[{ key: 'notes', label: 'Notes' }, { key: 'abs', label: 'Absences' }, { key: 'edt', label: 'Emploi du temps' }]} value={tab} onChange={setTab} />
      <View style={{ height: 14 }} />
      {tab === 'notes' ? (!graded ? <Empty icon={FileText} title="Pas de notes chiffrées" text="En maternelle, le suivi se fait avec l'enseignante." /> : (
        <>
          <Card pad={0} style={{ paddingHorizontal: 14 }}>
            {s.subjOf(child.level).map((x) => (
              <Row key={x.id} title={x.name} subtitle={[teachers[x.id], classAvg(x.id) != null ? `classe ${fa(classAvg(x.id))}` : ''].filter(Boolean).join(' · ')}
                right={<T style={{ fontFamily: font.semibold }}>{fa(s.subjAvg(child, x.id))}</T>} />
            ))}
            <Row last title="Moyenne générale" subtitle="Sur 20, coefficients du bulletin" right={<T style={{ fontFamily: font.bold, color: t.primary }}>{fa(s.genAvg(child))}</T>} />
          </Card>
          <View style={{ marginTop: 14 }}>
            {pub ? <Button variant="ghost" icon={FileText} label="Télécharger le bulletin (PDF)" onPress={() => sharePdf(bulletinHTML(s, child, teachers), `Bulletin ${child.name}`)} />
              : <Muted style={{ textAlign: 'center' }}>Le bulletin sera disponible après le conseil de classe.</Muted>}
          </View>
        </>
      )) : null}
      {tab === 'abs' ? (
        <Card pad={0} style={{ paddingHorizontal: 14 }}>
          {att.length ? att.map((a, i) => (
            <Row key={a.id} last={i === att.length - 1} title={`${a.status === 'absent' ? 'Absence' : `Retard${a.minutes ? ` (${a.minutes} min)` : ''}`} · ${fd(a.date)}`} subtitle={a.motif || undefined}
              right={<Pill small label={a.justified ? 'Justifiée' : 'Non justifiée'} tone={a.justified ? 'success' : 'warning'} />} />
          )) : <Muted style={{ padding: 16 }}>Aucune absence ni retard. Bravo !</Muted>}
        </Card>
      ) : null}
      {tab === 'edt' ? (
        <>
          <Seg items={WD.map((w, i) => ({ key: String(i + 1), label: w.slice(0, 3) }))} value={String(day)} onChange={(k) => setDay(+k)} />
          <Card pad={0} style={{ paddingHorizontal: 14, marginTop: 12 }}>
            {lessons.length ? lessons.map((l, i) => {
              const sub = s.subject(l.sub);
              return <Row key={i} last={i === lessons.length - 1}
                left={<View style={{ width: 50 }}><T style={{ fontFamily: font.semibold, fontSize: 14 }}>{SLOTS[l.s]}</T><Muted style={{ fontSize: 11.5 }}>{SLOTE[l.s]}</Muted></View>}
                title={sub?.name || l.sub} subtitle={[teachers[l.sub], l.room].filter(Boolean).join(' · ')}
                right={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sub?.color || t.primary }} />} />;
            }) : <Muted style={{ padding: 16 }}>Pas de cours ce jour-là.</Muted>}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
