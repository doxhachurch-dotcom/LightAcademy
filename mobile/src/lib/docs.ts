/* Reçus et bulletins : PDF générés sur le téléphone, envoi WhatsApp. */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import { amountWords, fa, fd, money, ucf, type School, type Student, type Tx } from './school';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Numéro au format international pour WhatsApp (0812… → 243812… en RDC). */
export function waNumber(phone?: string, country = 'CD') {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0') && country === 'CD') d = '243' + d.slice(1);
  return d;
}
export async function openWhatsApp(phone: string | undefined, text: string, country?: string) {
  const n = waNumber(phone, country);
  const url = (n ? `https://wa.me/${n}` : 'https://wa.me/') + '?text=' + encodeURIComponent(text);
  await Linking.openURL(url);
}
export const call = (phone?: string) => Linking.openURL('tel:' + String(phone || '').replace(/[^\d+]/g, ''));

const CSS = `body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#111a2e;padding:28px;font-size:13px}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1f52e5;padding-bottom:14px}
.co{font-size:18px;font-weight:700}.muted{color:#64748b;font-size:11px}.title{font-size:22px;font-weight:800;color:#1f52e5;text-align:right}
.amt{margin:22px 0;padding:16px;border-radius:12px;background:#eef2fe;text-align:center}.amt .big{font-size:30px;font-weight:800}
dl{display:grid;grid-template-columns:200px 1fr;gap:8px 12px}dt{color:#64748b}dd{margin:0;font-weight:600}
.sign{display:flex;justify-content:space-between;margin-top:46px}.legal{margin-top:30px;font-size:10px;color:#94a3b8}
table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px;border-bottom:1px solid #e9edf3;text-align:left}th{font-size:11px;color:#64748b;font-weight:600}td.n,th.n{text-align:right}`;

function header(s: School, title: string, sub: string) {
  const co = s.s.company || {};
  return `<div class="head"><div><div class="co">${esc(co.name)}</div>${co.motto ? `<div class="muted">${esc(co.motto)}</div>` : ''}<div class="muted">${esc(co.address)}${co.city ? ', ' + esc(co.city) : ''}${co.phone ? ' · ' + esc(co.phone) : ''}</div></div><div><div class="title">${title}</div><div class="muted" style="text-align:right">${sub}</div></div></div>`;
}

export function receiptHTML(s: School, t: Tx) {
  const i = t.match ? s.invoice(t.match.id) : undefined;
  const st = i ? s.student(i.clientId) : undefined;
  if (!i || !st) return '';
  const c = s.cur;
  const before = (s.s.txs || []).filter((x) => x.match?.id === i.id && (x.date < t.date || (x.date === t.date && String(x.ref) <= String(t.ref))));
  const after = Math.max(0, s.invTtc(i) - before.reduce((a, x) => a + x.amount, 0));
  return `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${header(s, 'REÇU', `${esc(t.ref)}<br>${fd(t.date)}`)}
  <div class="amt"><div class="muted">Montant reçu</div><div class="big">${money(t.amount, c)}</div><div>${esc(amountWords(t.amount, c))}</div></div>
  <dl><dt>Reçu de</dt><dd>${esc(t.payer || st.parent?.name)}</dd><dt>Pour l'élève</dt><dd>${esc(st.name)} – ${esc(st.classe)}${st.matricule ? ' (' + esc(st.matricule) + ')' : ''}</dd>
  <dt>Objet</dt><dd>${esc(ucf(i.label || 'Facture ' + i.num))}</dd><dt>Mode de paiement</dt><dd>${s.modeLabel(t.tid)}${t.txref ? ' · réf. ' + esc(t.txref) : ''}</dd>
  <dt>Reste sur cette échéance</dt><dd>${money(after, c)}</dd><dt>Solde total du dossier</dt><dd>${money(s.stuBal(st).rest, c)}</dd></dl>
  <div class="sign"><div>Le parent</div><div>Pour l'économat<br><b>${esc(s.s.company?.name)}</b></div></div>
  <div class="legal">Reçu édité par le service de l'économat. Les frais de scolarité versés ne sont pas remboursables, sauf dispositions du règlement intérieur.</div></body></html>`;
}

export function bulletinHTML(s: School, st: Student, teachers?: Record<string, string>) {
  const subs = s.subjOf(st.level);
  const g = s.genAvg(st);
  const rows = subs.map((x) => {
    const a = s.subjAvg(st, x.id);
    const t = teachers ? teachers[x.id] : s.teacherName(s.s.assign?.[st.level]?.[x.id]);
    return `<tr><td>${esc(x.name)}</td><td class="muted">${esc(t || '')}</td><td class="n">${x.coef}</td><td class="n"><b>${fa(a)}</b></td></tr>`;
  }).join('');
  const abs = s.attOf(st.id).filter((a) => a.status === 'absent').length;
  return `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${header(s, 'BULLETIN', `1er trimestre · ${esc(s.s.schoolYear)}`)}
  <dl style="margin-top:18px"><dt>Élève</dt><dd>${esc(st.name)}</dd><dt>Classe</dt><dd>${esc(st.classe)}</dd>${st.matricule ? `<dt>Matricule</dt><dd>${esc(st.matricule)}</dd>` : ''}</dl>
  <table><thead><tr><th>Matière</th><th>Enseignant</th><th class="n">Coef.</th><th class="n">Moyenne /20</th></tr></thead><tbody>${rows}</tbody></table>
  <dl style="margin-top:18px"><dt>Moyenne générale</dt><dd>${fa(g)} / 20</dd><dt>Absences</dt><dd>${abs}</dd></dl>
  <div class="sign"><div>Le parent</div><div>Le chef d'établissement<br><b>${esc(s.s.company?.director || '')}</b></div></div></body></html>`;
}

export async function sharePdf(html: string, name: string) {
  if (Platform.OS === 'web') { await Print.printAsync({ html }); return; }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: name, UTI: 'com.adobe.pdf' });
  else await Print.printAsync({ uri });
}
