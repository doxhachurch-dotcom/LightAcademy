import { Redirect } from 'expo-router';
/** Onglet central : le bouton ouvre l'encaissement (ou l'appel) ; cet écran n'est jamais affiché. */
export default function Action() { return <Redirect href="/accueil" />; }
