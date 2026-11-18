# Doxha École – Gestion scolaire et financière

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
| `theme.css` | Habillage DOXHA (couleurs, cartes, emploi du temps, messagerie…) |
| `core.js` | Utilitaires : dates, devises, icônes, modales, graphiques |
| `data.js` | Plans comptables (SYSCOHADA, PCG), pays, barèmes et moteur de paie |
| `logic.js` | Grand livre, balances, TVA, écritures de paie, déclarations |
| `views1.js` | Navigation, rendu, ventes et achats |
| `views2.js` | Trésorerie, fournisseurs, comptabilité, TVA, états financiers |
| `views3.js` | Personnel, paie, bulletins de paie, congés, déclarations, paramètres |
| `school.js` | Pays RDC, jeu de démonstration, élèves, frais de scolarité, reçus, recouvrement |
| `edu.js` | Gestion scolaire : classes, matières, emploi du temps, présences, notes, bulletins, inscriptions, communication, documents, rapports, espaces enseignant et parent |

## Reconstruire `index.html` après une modification

```bash
cd src
python3 build.py      # génère index.html à partir des fichiers ci-dessus
```

L'ordre des fichiers compte : chaque fichier peut redéfinir des fonctions des précédents (`school.js` et `edu.js` complètent et remplacent certaines vues).

## Limites de cette version

- Données stockées dans le navigateur uniquement : pas de comptes utilisateurs ni de base de données partagée (étape suivante : Supabase).
- Barèmes de paie et de TVA préremplis à partir de sources publiques 2025-2026 : à faire valider par un expert-comptable de chaque pays.
- Les relances WhatsApp ouvrent un message prérempli ; aucun envoi automatique, aucun paiement en ligne réel, aucune télédéclaration.
