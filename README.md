# 🍽️ À TABLE!

> *Fini les "on mange où ?" qui durent 20 min.*

Application web de coordination des déjeuners en équipe pour les bureaux de Saint-Étienne.
Sans compte, sans friction — un code à 4 caractères suffit.

---

## Fonctionnement

1. **L'organisateur** lance une session et partage le code (Teams, lien ou QR Code)
2. **Les participants** rejoignent et renseignent leurs préférences en 4 étapes
3. L'organisateur déclenche la recherche → **Claude IA** propose 3 restaurants adaptés à tous

---

## Stack technique

| Élément | Technologie |
|---|---|
| Frontend | React 18 + Vite |
| Persistence | localStorage (prototype) |
| IA | Claude API (`claude-sonnet-4-20250514`) |
| QR Code | qrcode.react |
| Tests | Vitest |

---

## Prérequis

- Node.js ≥ 18
- Une clé API Anthropic ([console.anthropic.com](https://console.anthropic.com/))

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la clé API
cp .env.example .env
# Éditer .env et renseigner votre VITE_CLAUDE_API_KEY

# 3. Lancer en développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## Commandes disponibles

```bash
npm run dev      # Serveur de développement (hot reload)
npm run build    # Build de production dans /dist
npm run preview  # Prévisualiser le build de production
npm run test     # Lancer les tests unitaires (25 tests)
```

---

## Structure du projet

```
src/
├── i18n/                     # Traductions FR/EN (détection auto navigateur)
│   ├── fr.js
│   ├── en.js
│   └── index.js
├── services/
│   ├── sessionService.js     # Gestion des sessions (localStorage)
│   └── claudeService.js      # Appels Claude API + construction des prompts
├── screens/                  # Écrans principaux
│   ├── HomeScreen.jsx        # Accueil + liste sessions publiques
│   ├── CreateScreen.jsx      # Création de session (prénom + type)
│   ├── JoinScreen.jsx        # Rejoindre une session (prénom + code)
│   ├── PreferencesScreen.jsx # Stepper 4 étapes
│   ├── WaitingRoomScreen.jsx # Salle d'attente + partage + lancement recherche
│   └── ResultsScreen.jsx     # Recommandations restaurants
├── components/
│   ├── ParticipantCard.jsx   # Carte participant avec tags colorés
│   ├── PublicSessionsList.jsx # Liste des sessions publiques du jour
│   └── QRCodeModal.jsx       # Modale QR Code (qrcode.react)
├── styles/
│   └── globals.css           # Design system (palette daltonien-safe)
├── App.jsx                   # Machine à états de navigation
└── main.jsx                  # Point d'entrée React
```

---

## Modes de repas

| Mode | Icône | Comportement |
|---|---|---|
| **Je sors manger** | 🍽️ | Participe à la recherche restaurant (sur place) |
| **J'ai ma gamelle** | 🥡 | Visible dans la salle d'attente, exclu des recherches |
| **À emporter** | 📦 | Recherche restaurant avec option emporter/livraison |

Si le groupe contient "Je sors" **et** "À emporter", deux recherches indépendantes sont proposées.

---

## Internationalisation

La langue est détectée automatiquement via `navigator.language` :
- 🇫🇷 Français si le navigateur est en français
- 🇬🇧 Anglais dans tous les autres cas

Le prompt envoyé à Claude s'adapte également à la langue détectée.

---

## Partage de session

Depuis la salle d'attente, l'organisateur peut partager via :

- **📋 Code** — copie le code à 4 caractères dans le presse-papier
- **💬 Teams** — ouvre Microsoft Teams avec un message pré-rempli (`msteams://`)
- **🔗 Lien** — copie l'URL directe (`?code=XXXX`) qui pré-remplit automatiquement le champ code
- **⬜ QR Code** — affiche un QR code scannable encodant l'URL directe

---

## ⚠️ Note de sécurité

La clé API Anthropic est chargée côté navigateur via `VITE_CLAUDE_API_KEY`.

🟠 **Risque élevé pour un déploiement public** : la clé est visible dans le bundle JavaScript.

**Pour une mise en production réelle** :
- Créer un endpoint backend (ex: Hono, Supabase Edge Functions) qui proxifie les appels Anthropic
- Ne jamais exposer la clé API dans le code frontend

Ce projet est un **prototype** — ce comportement est documenté et attendu dans le CDC.

---

## Limites du prototype (hors scope v1)

- La synchronisation multi-appareils repose sur `localStorage` — fonctionne uniquement dans le même navigateur. Pour un usage réseau réel, un backend est nécessaire.
- Les sessions expirent automatiquement après 24 heures (nettoyage passif)
- Pas d'authentification, pas d'historique des sessions passées

---

## Déploiement (Vercel)

```bash
npm run build
# Déployer le dossier /dist
```

Ajouter la variable `VITE_CLAUDE_API_KEY` dans les paramètres de l'hébergeur.
