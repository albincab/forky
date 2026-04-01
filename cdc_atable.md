# Cahier des charges — À TABLE!

## 1. Contexte & problème

Dans les bureaux de Saint-Étienne, l'organisation du déjeuner en équipe est un problème récurrent : on ne sait jamais qui mange ce midi, les envies de chacun sont inconnues, et les contraintes alimentaires ne sont pas centralisées. Le résultat : perte de temps, décision par défaut, frustation.

---

## 2. Objectif

Fournir une application web légère, sans compte, sans friction, permettant à un groupe de collègues de se coordonner pour le déjeuner et d'obtenir une recommandation de restaurant adaptée à tous.

---

## 3. Utilisateurs cibles

- **Organisateur** : la personne qui lance le signal "on mange ensemble ?"
- **Participants** : les collègues qui rejoignent et expriment leurs préférences
- Contexte : équipe variable, déjeuners spontanés, bureau de Saint-Étienne

---

## 4. Parcours utilisateur

### Organisateur
1. Ouvre l'app → "Lancer"
2. Saisit son prénom
3. Reçoit un **code de session** à 4 caractères à partager (Teams, oral…)
4. Renseigne ses propres préférences (cuisine, budget, allergies)
5. Consulte la salle d'attente en temps réel (participants + leurs prefs)
6. Quand le groupe est complet → lance la recherche de restaurant
7. Consulte les 3 recommandations IA

### Participant
1. Ouvre l'app → "Rejoindre"
2. Saisit son prénom + le code reçu
3. Renseigne ses préférences en 3 étapes (cuisine, budget, allergies)
4. Attend que l'organisateur lance la recherche

---

## 5. Fonctionnalités

### Session
- Création de session avec code unique à 4 caractères
- Pas d'authentification, pas de compte
- Rafraîchissement automatique des participants toutes les 3 secondes
- Bouton "Copier le code" pour partage rapide

### Partage de session

Depuis la salle d'attente, l'organisateur peut partager la session via :

| Canal | Contenu |
|---|---|
| **Microsoft Teams** | Lien deep link `msteams://` avec message pré-rempli : code + URL directe vers la session |
| **Copier le lien** | URL directe vers la session avec le code pré-rempli (ex: `atable.vercel.app?code=A3F2`) |
| **QR Code** | Généré à la volée, encode l'URL directe — scannable par les collègues sur mobile |

- Le QR code est affiché dans une modale ou directement sous le code de session
- L'URL directe pré-remplit le champ code sur l'écran "Rejoindre" automatiquement
- Message Teams pré-rempli (FR/EN selon la langue) : *"On mange ensemble ? Rejoins la session À TABLE! — Code : A3F2 → [lien]"*
| Type | Accès | Découverte |
|---|---|---|
| **Public** | Ouvert à tous | Visible dans la liste "repas du jour" — on peut rejoindre sans code |
| **Privé** | Sur invitation | Invisible publiquement — accès uniquement via le code partagé |

- L'organisateur choisit le type à la création
- La liste publique affiche tous les repas ouverts du jour : organisateur, nombre de participants, cuisines souhaitées — visible et rejoignable sans code
- Un repas privé n'apparaît jamais dans cette liste
- Un repas public reste ouvert jusqu'à ce que l'organisateur ferme manuellement la session

### Mode de repas individuel (nouveau)

Chaque participant déclare son intention au moment de rejoindre :

| Mode | Description | Implique |
|---|---|---|
| **Je sors manger** | Repas au restaurant avec le groupe | Participe au choix du resto |
| **J'ai ma gamelle** | Mange sur place, repas apporté | Présent mais pas de recherche resto |
| **À emporter** | Mange sur place, pas de repas — cherche à commander | Fusionné avec les autres "à emporter" pour une recherche commune |

**Règles de fusion :**
- Les participants "Je sors manger" → recherche restaurant classique (sur place)
- Les participants "À emporter" → recherche restaurant avec option emporter/livraison
- Les participants "J'ai ma gamelle" → visibles dans la liste mais exclus des recherches
- Si le groupe contient les 3 modes, deux recherches distinctes sont proposées : une resto, une emporter
- Un participant "gamelle" peut basculer en "à emporter" ou "je sors" avant que l'organisateur lance

### Préférences individuelles (stepper 4 étapes)
- **Mode de repas** : Je sors manger / J'ai ma gamelle / À emporter
- **Cuisine** : Française, Italienne, Japonaise, Pizza, Burger, Asiatique, Végétarienne, Brasserie, Libanaise, Mexicaine (multi-sélection) — masqué si "gamelle"
- **Budget** : < 15€ / 15–30€ / 30–50€ / + de 50€ — masqué si "gamelle"
- **Allergies & régimes** : Gluten, Lactose, Fruits à coque, Arachides, Œufs, Crustacés, Soja, Halal, Végétarien, Végétalien

### Salle d'attente
- Liste des participants avec avatar, mode de repas, cuisines souhaitées, budget, allergies (tags colorés)
- Récapitulatif visuel des groupes : X qui sortent / Y à emporter / Z gamelles
- Seul l'organisateur peut déclencher la recherche
- Si mix "sortent" + "à emporter" → deux boutons indépendants : chaque groupe lance sa propre recherche
- Un participant peut modifier son mode de repas tant que l'organisateur n'a pas lancé la recherche

### Recommandation IA
- **Section "On sort"** (si ≥1 participant "sort") : 3 restaurants à Saint-Étienne, recherche déclenchée indépendamment par l'organisateur
- **Section "À emporter"** (si ≥1 participant "à emporter") : 3 restaurants avec option emporter/livraison, recherche déclenchée indépendamment
- Les deux recherches sont indépendantes — l'organisateur lance celle(s) qu'il veut
- Allergies traitées comme **impératives** par section — chaque section ne tient compte que des allergies des participants concernés
- Participants "gamelle" : exclus des résultats, pas de recherche les concernant

---

## 6. Contraintes techniques

| Élément | Choix |
|---|---|
| Stack | React (artifact claude.ai) |
| Persistence | localStorage (prototype) |
| IA | Claude API — `claude-sonnet-4-20250514` |
| Sync multi-utilisateurs | Polling localStorage (prototype) — à remplacer par un backend pour usage réseau réel |
| Géolocalisation | Saint-Étienne codée en dur dans le prompt |

---

## 7. Internationalisation (i18n)

- Langues supportées : **Français** (défaut) et **Anglais**
- Détection automatique via `navigator.language` au chargement
- Fallback : anglais si la langue du navigateur n'est pas reconnue
- Toute l'interface est traduite : labels, boutons, messages d'erreur, étapes du stepper
- Le prompt envoyé à l'IA s'adapte à la langue détectée (résultats en FR ou EN)
- Pas de sélecteur manuel — la langue suit le navigateur

---

## 8. Ce qui est hors scope (v1)

- Authentification / comptes utilisateurs
- Historique des sessions passées
- Vote en temps réel entre plusieurs appareils (nécessite backend)
- Modération de la liste publique (repas expirés, spam)
- Notifications push
- Intégration calendrier ou Teams
- Gestion des réservations

---

## 8. Prompt IA (v1 actuelle)

```
Restaurants réels à Saint-Étienne pour {n} personnes aujourd'hui midi.
Participants : {noms}
Envies (votes cumulés) : {cuisines}
Allergies / contraintes : {allergies}  ← impératives
Budgets exprimés : {budgets}
Propose 3 restos qui conviennent à TOUS.
JSON : [{ name, cuisine, adresse, budget, note, pourquoi }]
```

---

## 9. Design & ton éditorial

### Identité visuelle
- Ambiance **chaleureuse et gourmande** — tons terre cuite, crème, sable, blanc cassé
- Typographie ronde et accessible, pas corporate
- Illustrations ou emojis food utilisés comme éléments visuels (pas de stock photos)
- Coins arrondis généreux, ombres douces
- Mobile-first — pensé pour être utilisé sur téléphone à la pause

### Palette daltonien-safe

Palette chaude et gourmande, lisible par les 3 types de daltonisme courants. Aucune information encodée uniquement par la couleur — toujours doublée d'une icône et d'un libellé.

| Rôle | Couleur | Usage |
|---|---|---|
| Fond principal | `#FDF6EE` (crème) | Fond global |
| Accent primaire | `#3D2B1F` (brun profond) | Boutons principaux, top pick |
| Accent secondaire | `#D4820A` (miel doré) | Bordures, highlights |
| Jaune soleil | `#F5C842` | CTA secondaires, badge top pick |
| Surface sable | `#F2E6D4` | Cartes, badges neutres |
| Surface dorée | `#FFF8E8` | Badges "À emporter" |
| Texte principal | `#3D2B1F` | Corps de texte |
| Texte secondaire | `#8A7A6A` | Métadonnées, sous-titres |

### Règles d'accessibilité
- Contraste WCAG AA ≥ 4.5:1 sur tous les textes
- Jamais la couleur seule pour encoder l'information — toujours doublée d'une icône et/ou d'un libellé
- Modes de repas : couleur + icône + libellé
- Top pick : fond brun foncé + badge jaune + texte "Top pick"

### Ton éditorial (FR / EN)

| Moment | FR | EN |
|---|---|---|
| Tagline home | *Fini les "on mange où ?" qui durent 20 min.* | *No more 20-minute "where should we eat?" debates.* |
| CTA créer | *Je lance le déjeuner* | *Start a lunch* |
| CTA rejoindre | *On m'a invité·e* | *I got the code* |
| Salle d'attente vide | *C'est calme… partage le code !* | *Quiet in here… share the code!* |
| Attente non-orga | *{prénom} décide quand tout le monde est là* | *{name} will pick when everyone's in* |
| Lancer recherche | *Allez, on choisit !* | *Let's pick a spot!* |
| Résultat top pick | *Le choix de la sagesse* | *The wise choice* |
| Gamelle | *Repas maison — respect 👏* | *Homemade — respect 👏* |

- Backend léger (Hono / Supabase) pour sync réseau réelle entre appareils
- Intégration Microsoft Teams (bot qui poste le code dans un canal)
- Géolocalisation dynamique (pas limitée à Saint-Étienne)
- Historique des restaurants déjà essayés
- Système de "veto" par participant
