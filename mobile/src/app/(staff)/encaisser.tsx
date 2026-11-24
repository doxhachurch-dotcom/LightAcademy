import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Field, Footer, Ini, Label, Muted, Row, SearchBar, Seg, T, tap } from '../../components/ui';
import { normalize } from '../../lib/format';
import { MODES, money, parseNum, rnd, ucf, uid, type Tx } from '../../lib/school';
import { useSchool } from '../../lib/store';
import { font, useTheme } from '../../lib/theme';

export default function Encaisser() {
  const { t } = useTheme();
  const ins = useSafeAreaInsets();
  const p = useLocalSearchParams<{ student?: string }>();
  const { school: s, pay } = useSchool();
  const [stuId, setStuId] = useState<string | null>(p.student ? String(p.student) : null);
  const [q, setQ] = useState('');
  const [invId, setInvId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [tid, setTid] = useState<'c1' | 'm1' | 'b1'>('c1');
  const [cur, setCur] = useState<'USD' | 'CDF'>('USD');
  const [txref, setTxref] = useState('');
  const [payer, setPayer] = useState<string | null>(null);
  const [wa, setWa] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const st = stuId && s ? s.student(stuId) : undefined;
  const open = st && s ? s.openInv(st.id) : [];
  const inv = open.find((i) => i.id === invId) || open[0];
  const rest = inv && s ? s.invRest(inv) : 0;
  const fx = s ? Math.round(1 / ((s.s.fx as Record<string, number> | undefined)?.CDF || 1 / 2800)) : 2800;
  const shown = amount ?? (cur === 'CDF' ? String(Math.round(rest * fx)) : rest.toFixed(2).replace('.', ','));
  const usd = cur === 'CDF' ? rnd(parseNum(shown) / fx) : rnd(parseNum(shown));

  const results = useMemo(() => {
    if (!s || st) return [];
    const nq = normalize(q.trim());
    const base = nq ? s.students.filter((x) => normalize(`${x.name} ${x.classe} ${x.matricule || ''} ${x.parent?.name || ''}`).includes(nq)) : s.lateStudents;
    return base.slice(0, 30);
  }, [s, st, q]);

  const save = async () => {
    if (!s || !st || !inv) return;
    if (!(usd > 0)) return setErr('Indiquez un montant.');
    if (usd > rest + 0.01) return setErr(`Le montant dépasse le reste de cette échéance (${money(rest, s.cur)}). Encaissez l'échéance suivante séparément.`);
    setBusy(true); setErr(null);
    const date = s.today;
    const { ref } = s.nextReceiptRef(date);
    const mode = MODES.find((m) => m.tid === tid)!.label;
    const tx: Tx = {
      id: uid('tx'), tid, date, amount: usd, acc: null, match: { t: 'inv', id: inv.id }, ref,
      label: `${mode} – ${st.name} (${st.classe}) – ${inv.label || inv.num}`,
      payer: (payer ?? st.parent?.name ?? '').trim(),
      txref: [txref.trim(), cur === 'CDF' ? `payé ${parseNum(shown).toLocaleString('fr-FR')} FC (taux ${fx})` : ''].filter(Boolean).join(' · '),
    };
    await pay(tx);
    router.replace({ pathname: '/recu/[id]', params: { id: tx.id, wa: wa ? '1' : '' } });
  };

  if (!s) return null;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
          <Text style={{ color: t.primary, fontFamily: font.medium, fontSize: 15 }}>‹ Annuler</Text>
        </Pressable>
        <T style={{ fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6, marginTop: 4, marginBottom: 14 }}>Encaissement</T>

        {!st ? (
          <>
            <SearchBar value={q} onChange={setQ} placeholder="Rechercher un élève" />
            <Muted style={{ marginTop: 14, marginBottom: 8, marginLeft: 4 }}>{q ? 'Résultats' : 'Élèves en retard de paiement'}</Muted>
            <Card pad={0} style={{ paddingHorizontal: 14 }}>
              {results.map((x, i) => (
                <Row key={x.id} last={i === results.length - 1} left={<Ini name={x.name} />} title={x.name} subtitle={`${x.classe} · reste ${money(s.stuBal(x).rest, s.cur, true)}`}
                  onPress={() => { setStuId(x.id); setInvId(null); setAmount(null); setPayer(null); }} />
              ))}
              {!results.length ? <Muted style={{ padding: 16 }}>Aucun élève trouvé.</Muted> : null}
            </Card>
          </>
        ) : (
          <>
            <Card pad={0} style={{ paddingHorizontal: 14, marginBottom: 6 }}>
              <Row last left={<Ini name={st.name} />} title={st.name} subtitle={`${st.classe} · reste ${money(s.stuBal(st).rest, s.cur, true)}`}
                right={<Pressable onPress={() => { setStuId(null); setQ(''); }} hitSlop={8}><Text style={{ color: t.primary, fontFamily: font.medium, fontSize: 13.5 }}>Changer</Text></Pressable>} />
            </Card>
            {!inv ? (
              <Card style={{ marginTop: 14, backgroundColor: t.successSoft, borderColor: t.successSoft }}>
                <T style={{ color: t.success, fontFamily: font.semibold }}>Toutes les échéances de cet élève sont soldées.</T>
              </Card>
            ) : (
              <>
                <TextInput value={shown} onChangeText={(v) => setAmount(v)} keyboardType="decimal-pad" selectTextOnFocus
                  style={{ fontFamily: font.bold, fontSize: 40, letterSpacing: -1, textAlign: 'center', color: t.text, paddingTop: 18, paddingBottom: 2 }} />
                <Muted style={{ textAlign: 'center', marginBottom: 6 }}>{cur === 'USD' ? '$ US' : `FC · soit ${money(usd, s.cur)} (taux ${fx} FC)`}</Muted>
                <Muted style={{ textAlign: 'center', marginBottom: 18 }}>{ucf(inv.label || '')} · reste {money(rest, s.cur)}</Muted>

                {open.length > 1 ? (
                  <View style={{ marginBottom: 16 }}>
                    <Label>Échéance</Label>
                    <Seg items={open.slice(0, 3).map((i) => ({ key: i.id, label: (i.label || '').replace(/ \d{4}-\d{4}$/, '') }))} value={inv.id} onChange={(k) => { setInvId(k); setAmount(null); }} />
                  </View>
                ) : null}
                <View style={{ marginBottom: 16 }}>
                  <Label>Mode de paiement</Label>
                  <Seg items={MODES.map((m) => ({ key: m.tid, label: m.label }))} value={tid} onChange={(k) => setTid(k as 'c1' | 'm1' | 'b1')} />
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Label>Devise reçue</Label>
                  <Seg items={[{ key: 'USD', label: 'Dollars (USD)' }, { key: 'CDF', label: 'Francs (CDF)' }]} value={cur} onChange={(k) => { setCur(k as 'USD' | 'CDF'); setAmount(null); }} />
                </View>
                {tid !== 'c1' ? <Field label="Référence de transaction" value={txref} onChangeText={setTxref} placeholder="N° Mobile Money, bordereau…" /> : null}
                <Field label="Versé par" value={payer ?? st.parent?.name ?? ''} onChangeText={setPayer} />
                <Pressable onPress={() => { tap(); setWa(!wa); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: wa ? t.primary : t.card, borderWidth: wa ? 0 : 1.5, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
                    {wa ? <Check size={15} color="#fff" strokeWidth={3} /> : null}
                  </View>
                  <T style={{ fontSize: 14.5 }}>Envoyer le reçu au parent sur WhatsApp</T>
                </Pressable>
                {err ? <Text style={{ color: t.danger, fontFamily: font.medium, marginTop: 14 }}>{err}</Text> : null}
              </>
            )}
          </>
        )}
      </ScrollView>
      {st && inv ? <Footer><Button label="Valider et générer le reçu" onPress={save} loading={busy} /></Footer> : null}
    </View>
  );
}
