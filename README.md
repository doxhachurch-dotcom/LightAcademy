# Light Academy – Gestion scolaire et financière

Logiciel de gestion d'école privée (scolarité, finances, comptabilité SYSCOHADA, paie), pensé pour l'Afrique et l'international.

## Utilisation immédiate

Ouvrez **`index.html`** dans un navigateur (Chrome, Edge, Firefox, Safari). Aucune installation n'est nécessaire.

- Les données de démonstration (RD Congo, en dollars) sont créées au premier lancement.
- Les modifications sont enregistrées dans le navigateur (localStorage).
- Pour changer de pays : Paramètres → Pays & devises (RDC, Côte d'Ivoire, Sénégal, Cameroun, Guinée, France).
- Pour changer d'espace : boutons Admin / Enseignant / Parent en bas du menu.

## Contenu du dossier `src/`

| Fichier | Rôle |
|---|---|
| `style.css` | Styles de base (mise en page, tableaux, formulaires, modales) |
| `theme.css` | Habillage visuel (couleurs, cartes, emploi du temps, messagerie…) |
| `core.js` | Utilitaires : dates, devises, icônes, modales, graphiques |
| `data.js` | Plans comptables (SYSCOHADA, PCG), pays, barèmes et moteur de paie |
| `logic.js` | Grand livre, balances, TVA, écritures de paie, déclarations |
| `views1.js` | Navigation, rendu, ventes et achats |
| `views2.js` | Trésorerie, fournisseurs, comptabilité, TVA, états financiers |
| `views3.js` | Personnel, paie, bulletins de paie, congés, déclarations, paramètres |
| `school.js` | Pays RDC, jeu de démonstration, élèves, frais de scolarité, reçus, recouvrement |
| `edu.js` | Gestion scolaire : classes, matières, emploi du temps, présences, notes, bulletins, inscriptions, communication, documents, rapports, espaces enseignant et parent |

## Lancer le projet avec Node.js (recommandé)

```bash
npm install        # installe Vite
npm run dev        # serveur de développement sur http://localhost:5173
npm run build      # version de production dans dist/
npm run preview    # prévisualise la version de production
```

`npm run dev` et `npm run build` reconstruisent d'abord `index.html` à partir de `src/` (script `scripts/assemble.mjs`).
Pour héberger le logiciel (Hostinger, Netlify, Vercel, GitHub Pages…), déployez le dossier `dist/` ou simplement `index.html`.

### Sans Node.js

```bash
cd src
python3 build.py      # génère index.html à partir des fichiers ci-dessus
```

L'ordre des fichiers compte : chaque fichier peut redéfinir des fonctions des précédents (`school.js` et `edu.js` complètent et remplacent certaines vues).

## Limites de cette version

- Données stockées dans le navigateur uniquement : pas de comptes utilisateurs ni de base de données partagée (étape suivante : Supabase).
- Barèmes de paie et de TVA préremplis à partir de sources publiques 2025-2026 : à faire valider par un expert-comptable de chaque pays.
- Les relances WhatsApp ouvrent un message prérempli ; aucun envoi automatique, aucun paiement en ligne réel, aucune télédéclaration.

## Base de données en ligne (Supabase)

- Projet Supabase : **Light Academy** (`nxlizxdokrzxqbrghvgw`, région Paris), organisation DoxhaCHURCH.
- Tables : `schools` (établissements), `members` (accès par adresse e-mail et rôle), `school_state` (données de l'école, une ligne par rubrique).
- Sécurité (RLS) : chaque membre ne voit que son établissement ; seuls les administrateurs gèrent les accès ; les comptes parents n'ont pas encore accès aux données.
- Les comptes `@lightacademy.com` restent des comptes de démonstration locaux.
- Toute autre adresse se connecte à Supabase : « Première connexion ? Créer mon mot de passe », puis création de l'établissement ou accès à l'école qui a ajouté cette adresse.
- Les données sont aussi gardées sur l'appareil : sans connexion internet, on continue à travailler et l'envoi reprend au retour du réseau.
- Clé utilisée dans `src/cloud.js` : clé publique (publishable), sans risque côté navigateur.

## Mode hors ligne (hybride)

- `sw.js` garde l'application et ses bibliothèques sur l'appareil : Light Academy s'ouvre même sans internet (après une première ouverture en ligne).
- Les modifications faites hors ligne restent sur l'appareil, même si on ferme la page, et sont envoyées au retour du réseau.
- Si un collègue a modifié les mêmes données entre-temps, les deux versions sont fusionnées (les élèves, paiements, etc. des deux côtés sont gardés).
- `manifest.webmanifest` et les icônes permettent d'installer Light Academy comme une application sur téléphone ou ordinateur.
- Ces fichiers sont dans `public/` et copiés à la racine par `npm run assemble` : ils doivent être publiés à côté de `index.html`.
