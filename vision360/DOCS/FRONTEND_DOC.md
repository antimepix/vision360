# Documentation Technique Front-end - Vision360

Cette documentation détaille l'architecture, les choix technologiques et les algorithmes clés du front-end de l'application Vision360.

## 1. Stack Technique
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Routing**: [React Router 7 (v7.9.6)](https://reactrouter.com/)
- **Icônes**: [Lucide-React](https://lucide.dev/)
- **Tests**: Vitest & React Testing Library

## 2. Architecture & Structure des Dossiers

L'architecture repose sur une séparation claire entre les vues (pages), les composants atomiques, la logique métier et les données brutes.

### Arborescence `src/`
- **`main.jsx`** : Point d'entrée de l'application. Initialise React et injecte l'application dans le DOM.
- **`App.jsx`** : Chef d'orchestre du routage. Définit les `Routes`, gère l'état global du rôle utilisateur et encapsule les pages dans des `ProtectedRoute`.

- **`/pages`** : Une page correspond à une route unique de l'application.
    - Chaque page possède son propre fichier `.jsx` et son fichier `.css` associé pour un encapsulage simple.
    - **`/campus`** : Contient le plan interactif et ses sous-composants spécifiques (`RoomCard.jsx`, `FloorSelector.jsx`, `RoomDetails.jsx`, `CampusLegend.jsx`). Cette structure évite d'encombrer le dossier `components` général avec des éléments propres au plan.

- **`/components`** : Composants transverses utilisés sur plusieurs pages.
    - **`Navbar.jsx`** : Barre de navigation dynamique dont les liens s'adaptent selon le rôle de l'utilisateur (via les permissions).

- **`/utils`** : Fonctions pures et services utilitaires.
    - **`permissions.js`** : Configuration centrale des droits d'accès (RBAC).
    - **`roomUtils.js`** : Moteur de logique pour le traitement des données de salles et d'événements.
    - **`storage.js`** : Abstraction pour les interactions avec le `localStorage`.

- **`/data`** : Couche de données statiques.
    - **`data.json`** : Export principal contenant les événements (cours, examens).
    - **`campus0.json`, `campus1.json`, `campus2.json`** : Définition par défaut des salles pour chaque étage (coordonnées, dimensions).
    - **`outlook_calendar.json`** : Disponibilités du personnel pédagogique.

### Flux de Données
Le flux est généralement descendant (Props). Les pages (`Campus`, `Home`) lisent les données JSON, appliquent les transformations via les `utils`, et passent les objets formatés aux composants de présentation.

## 3. Sécurité & Routage (RBAC)
Le contrôle d'accès est basé sur les rôles (`admin`, `damien`, `eleve`).
- **Permissions**: Définies dans `src/utils/permissions.js`. Chaque rôle possède une liste de chemins autorisés.
- **ProtectedRoute**: Un composant wrapper dans `App.jsx` vérifie le rôle stocké dans le `localStorage`. Si l'accès est refusé, l'utilisateur est redirigé vers sa page par défaut ou vers le login.
- **Synchronisation**: Un listener sur l'événement `storage` (`App.jsx`) permet de mettre à jour l'UI instantanément si le rôle est modifié dans un autre onglet.

## 4. Gestion des Données
Les données proviennent principalement de `src/data/data.json`.
- **roomUtils.js**: C'est le cœur du traitement des salles. Il filtre les salles supprimées, applique les "overrides" (coordonnées personnalisées, alias, rotations) et calcule l'état d'occupation (`libre`, `occupee`) en fonction des événements actuels.
- **storage.js**: Gère les clés de stockage spécifiques à chaque rôle pour les modifications du plan (overrides).

## 5. Logiques de Fonctionnalités Clés

### Plan Interactif (Campus)
- **Édition**: Un bouton "Modifier" (protégé par code `MODIF` pour les élèves) permet de déplacer, redimensionner ou pivoter les salles.
- **Drag & Drop**: Implémenté via des handlers de pointeur (`mousemove`, `mouseup`, `touchmove`) calculant les deltas en pourcentages pour garantir la réactivité (responsive design).
- **Persistence**: Chaque modification déclenche une mise à jour des "overrides" dans le `localStorage`.

### Emploi du Temps (Schedule)
- **Algorithme de Chevauchement**: La fonction `layoutOverlaps` trie les cours et calcule des colonnes dynamiques pour afficher les événements simultanés côte à côte sans superposition.
- **Filtrage Multi-critères**: Supporte la recherche textuelle, le filtrage par promotion et par professeur simultanément.
- **Mode Impression**: Des styles CSS spécifiques (`@media print`) sont optimisés pour l'impression de l'emploi du temps.

### Dashboard (Home)
- **Calculs de KPI**: Calcule en temps réel le taux d'occupation, le nombre d'élèves sur site et les évaluations de la semaine en utilisant `useMemo` pour la performance.

## 6. Styles CSS
L'application utilise du **Vanilla CSS** avec un fichier par composant/page.
- **Variables**: Les couleurs et espacements sont centralisés ou partagés via des conventions de nommage.
- **Responsive**: Les mises en page utilisent massivement `flexbox` et `grid`, avec des unités relatives (`%`, `vh`, `vw`) pour s'adapter à toutes les tailles d'écrans.

## 7. Tests & Qualité
- **Vitest**: Utilisé pour les tests unitaires et d'intégration.
- **Coverage**: Configuré avec `v8` pour suivre la couverture de code (`npm run test:coverage`).
- **Templates de tests**: Situés dans `/src` avec l'extension `.test.jsx` ou via des dossiers de coverage.

## 8. Intégration Backend
Le front communique avec un serveur (port 3001 par défaut) pour :
- **Refresh JSON**: Déclenche un export de données côté serveur via l'endpoint `/api/export/data`.
- **API Base URL**: Configurable via la variable d'environnement `VITE_API_BASE_URL`.

## 9. Analyse Structurelle des Pages

Chaque page de l'application est conçue pour être autonome avec sa propre gestion d'état et ses propres styles. Voici une analyse détaillée de leur structure interne :

### 9.1. Home (`home.jsx`)
Le tableau de bord centralise la visibilité globale.
- **Logique d'États** : Gère la date sélectionnée (`selectedDate`) et la requête de recherche (`query`).
- **Calculs (useMemo)** :
    - Dérivation des statistiques KPI (élèves sur site, taux d'occupation global).
    - Calcul des "Promotions présentes" et "Professeurs" pour la journée sélectionnée via des algorithmes de filtrage sur `data.json`.
- **Composants clés** : Une grille de "Cards" KPI suivie d'un affichage en deux colonnes (Promotions vs Professeurs).

### 9.2. Schedule (`schedule.jsx`)
L'emploi du temps est la page la plus complexe techniquement.
- **Logique d'États** : Gère le mode de vue (promo vs prof), la date d'ancrage de la semaine, les multi-sélections et l'événement sélectionné pour la pop-up.
- **Algorithme `layoutOverlaps`** : Crucial pour la lisibilité. Il regroupe les événements se chevauchant dans le temps et leur assigne une colonne (`_col`) et un nombre de colonnes total (`_cols`) pour un affichage côte à côte dynamique.
- **Composants clés** : Un système de filtres multicritères en haut, suivi d'une grille temporelle (CSS Grid) où les événements sont positionnés de manière absolue en fonction de leur pourcentage de temps dans la journée.

### 9.3. Campus (`campus.jsx`)
Le plan interactif gère la manipulation spatiale.
- **Logique d'États** : Gère l'étage sélectionné, le mode déverrouillé (`isUnlocked`), la salle sélectionnée et l'état de "dragging" en cours.
- **Gestionnaire d'Overrides** : Utilise `loadOverrides` et `saveOverrides` pour injecter dynamiquement des modifications utilisateur sur les données de base des salles provenant des JSON d'étages.
- **Interactions natives** : Utilise des événements `pointer` pour supporter à la fois la souris et le tactile pour le déplacement, le redimensionnement et la rotation des salles.

### 9.4. Presence (`presence.jsx`)
Page informative sur la présence en temps réel.
- **Logique d'États** : Gère la date sélectionnée via un sélecteur personnalisé (Jour/Mois/Année).
- **Calcul des Présences** : Croise les événements de `data.json` avec les données d'Outlook (`outlook_calendar.json`) pour déterminer qui est présent ou "occupé" (busy/away) au moment présent.
- **Composants clés** : Une liste catégorisée par Promotions, Professeurs et Personnel Pédagogique avec des badges visuels ("Occupé", "Libre", "EN DIRECT").

### 9.5. Login (`Login.jsx`)
Gestionnaire de session simple.
- **Logique d'États** : Gère la liste des utilisateurs mockés et les champs du formulaire.
- **Mécanisme de Connexion** : Enregistre le rôle de l'utilisateur dans le `localStorage` et redirige vers la page d'accueil. Ce changement de rôle déclenche instantanément la mise à jour des permissions via le listener global dans `App.jsx`.
