# Light Academy : application mobile (React Native / Expo)

Application Android et iPhone du CRM Light Academy. Elle se branche **directement sur la même base Supabase** que le CRM web (projet « Light Academy »). Elle utilise les mêmes comptes, les mêmes données et les mêmes règles de calcul : soldes, tranches 60/20/20, numéros de reçu, moyennes et présences.

## Lot 1 (cette version)

**Équipe de l'école** (comptes admin, compta, prof, RH, avec les mêmes droits que sur le web)
- **Connexion** avec les comptes du CRM, et lien « Mot de passe oublié ».
- **Accueil administrateur et comptabilité** :
  - montant encaissé ce mois, montant échu impayé, présence du jour, trésorerie ;
  - raccourcis vers l'encaissement, l'appel, les relances et la trésorerie ;
  - derniers encaissements.
- **Accueil professeur** : le programme du jour et les appels à faire. **Accueil RH** : les effectifs, la présence et l'agenda.
- **Élèves** : recherche par nom, classe, parent ou matricule, filtres « En retard » et par cycle, et pastille d'état des paiements. Un professeur ne voit que les élèves de ses classes, sans les montants.
- **Fiche élève** :
  - scolarité de l'année et tranches ;
  - appel ou WhatsApp au parent en un geste ;
  - moyenne, rang et présence ;
  - échéances, paiements et bulletin en PDF.
- **Encaissement** :
  - choix de l'élève et de l'échéance, avec le montant restant pré-rempli ;
  - mode de paiement (espèces, Mobile Money ou banque) ;
  - paiement en francs congolais, converti au taux du CRM ;
  - reçu numéroté à la suite de ceux du web.
- **Reçu** : envoi au parent sur WhatsApp, avec le même message que le CRM, et partage du reçu en PDF.
- **Appel** :
  - présent, absent ou retard en un toucher ;
  - ensuite, prévenir par WhatsApp les parents des absents.
- **Finances** :
  - recouvrement de l'année ;
  - solde des comptes (caisse, banque, Mobile Money) ;
  - liste des encaissements, avec recherche et filtre par mode.
- **Relances** : élèves en retard, du plus gros montant au plus petit, avec un message WhatsApp de rappel déjà rédigé.

**Parents** (comptes « Parent » créés dans Administration › Utilisateurs, avec les enfants rattachés)
- **Accueil** : reste à payer, prochaine échéance, moyenne, présence, absences non justifiées, bulletin, annonces et agenda.
- **Scolarité** : notes par matière avec la moyenne de la classe, absences, emploi du temps, et bulletin PDF une fois publié par l'école.
- **Paiements** : échéances, reçus en PDF et façon de payer (numéro Mobile Money de l'école et référence de l'élève).
- **L'école** : contacter l'école sur WhatsApp ou par appel, voir les annonces et l'agenda, gérer son compte.

## Hors connexion
- Les données de l'école restent sur le téléphone : l'app s'ouvre et s'affiche sans réseau.
- Les encaissements et les appels faits sans réseau sont gardés en attente, puis envoyés automatiquement dès que la connexion revient. La pastille en haut de l'accueil indique l'état : « Enregistré en ligne », « en attente » ou « Hors ligne ».
- Avant chaque envoi, l'app relit les rubriques concernées : les opérations (`txs` et `seq`) pour un encaissement, les présences (`attendance` et `appelDone`) pour un appel. Elle n'écrit que ces rubriques. Une saisie faite en même temps sur le CRM web n'est donc jamais écrasée.
- Si un autre poste a utilisé le même numéro de reçu entre-temps, le reçu fait hors ligne prend automatiquement le numéro suivant.

## Sécurité de l'espace parent
- Les parents **n'ont aucun accès** à la table `school_state` : la règle RLS `is_staff` l'interdit déjà.
- Leurs données passent par la fonction Supabase **`parent_view()`**, déjà installée. Elle ne renvoie que :
  - les enfants rattachés au compte ;
  - leurs factures, reçus, absences et notes ;
  - la moyenne de la classe, sans les notes des autres élèves ;
  - les annonces destinées aux parents ou à la classe.

## Tester dans Expo Go
1. Installez **Node.js 20 ou plus récent**.
2. Dans le dossier du projet, lancez :
   ```
   npm install
   npx expo start
   ```
3. Sur le téléphone, installez **Expo Go**, à jour, puis scannez le QR code : avec l'appareil photo sur iPhone, depuis Expo Go sur Android.
4. Connectez-vous avec un compte de l'école, par exemple admin@, prof@ ou compta@lightacademyinternationalschool.com.

Si le téléphone n'est pas sur le même Wi-Fi que l'ordinateur, lancez `npx expo start --tunnel`. La version utilise le **SDK Expo 58**, comme l'app DOXHA Church.

## Publier sur Google Play et l'App Store
1. `npx eas-cli@latest login` (compte Expo).
2. `npx eas-cli@latest build --platform android` : la compilation se fait dans le cloud. Ajoutez `--platform ios` pour l'iPhone.
3. `npx eas-cli@latest submit` : il faut un compte Google Play Console (25 $ une fois) et un compte Apple Developer (99 $ par an).

Les identifiants de l'application sont `com.doxha.lightacademy`, dans `app.json`.

## À faire côté école
- **Supabase › Authentication › URL Configuration** : renseigner la Site URL, sinon le lien « Mot de passe oublié » ne mène nulle part.
- **CRM web › Utilisateurs** : créer les comptes parents (rôle Parent) et cocher leurs enfants. Le CRM web affiche encore « L'espace parent en ligne n'est pas encore ouvert » pour ces comptes. C'est normal : l'espace parent est dans l'application mobile.
- **Paramètres de l'école** : renseigner le numéro Mobile Money et le WhatsApp de l'école. Ils sont affichés aux parents.

## Organisation du code
- `src/app/` : les écrans (Expo Router).
  - `(staff)/` : l'équipe, avec ses onglets dans `(tabs)/` ;
  - `(parent)/` : l'espace parent.
- `src/lib/school.ts` : les règles de gestion reprises du CRM web (soldes, statuts, reçus, moyennes, présences).
- `src/lib/store.tsx` : lecture, cache hors ligne et file d'attente d'envoi pour l'équipe.
- `src/lib/parent.tsx` : données de l'espace parent, via `parent_view()`.
- `src/lib/docs.ts` : reçus et bulletins en PDF, liens WhatsApp.
- `src/components/` : boutons, cartes et listes, aux couleurs du CRM (Inter, bleu #1f52e5).

Commandes utiles : `npm run typecheck` pour vérifier le code, `npx expo start --web` pour un aperçu dans le navigateur.
