# À TABLE! — Instructions projet pour Claude Code

## Contexte
Application web de coordination des déjeuners en équipe pour les bureaux de Saint-Étienne.
Prototype React + localStorage + Claude API. Pas de backend, pas d'authentification.

## Stack
- **React 18 + Vite** — SPA, pas de router (navigation par état React)
- **localStorage** — seule source de vérité pour les sessions
- **Claude API** — modèle `claude-sonnet-4-20250514`, appel direct depuis le navigateur
- **qrcode.react** — génération QR code côté client
- **Vitest + jsdom** — tests unitaires

## Architecture de navigation
`App.jsx` contient une machine à états simple (`screen` state) :
`home → create → preferences → waiting → results`
`home → join → preferences → waiting → results`

Pas de React Router. L'URL `?code=XXXX` pré-remplit le champ code sur l'écran Join.

## Modèle de données (localStorage)

### Session (`atable_sessions[code]`)
```js
{
  code: string,           // "A3F2" — 4 chars, uppercase
  type: 'public'|'private',
  organizerName: string,
  organizerId: string,    // UUID
  createdAt: number,      // Date.now()
  status: 'waiting'|'done',
  searchingOut: boolean,
  searchingTakeout: boolean,
  searchedOut: boolean,
  searchedTakeout: boolean,
  participants: Participant[],
  results: { out: Restaurant[]|null, takeout: Restaurant[]|null }
}
```

### Participant
```js
{
  id: string,             // UUID
  name: string,
  isOrganizer: boolean,
  mealMode: 'out'|'inplace'|'outside'|null,  // stored in Supabase as 'out'|'homemade'|'outside', remapped by sessionService.js
  cuisines: string[],     // vide si homemade
  budget: '<15'|'15-30'|'30-50'|'>50'|null,
  allergies: string[],
  prefsComplete: boolean,
  joinedAt: number
}
```

### Identité courante (sessionStorage)
```
atable_code      → code de session actif
atable_uid       → UUID du participant courant
atable_organizer → 'true'|'false'
```

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/services/sessionService.js` | Toutes les lectures/écritures localStorage |
| `src/services/claudeService.js` | Recherche restaurants OSM/Overpass, avec cache Supabase (`restaurants_cache`, ~5km, 7 jours) pour ne dépendre d'Overpass qu'au premier appel par zone |
| `api/overpass.js` | Fonction serverless Vercel — relaie les requêtes Overpass côté serveur (évite les erreurs CORS des miroirs publics) |
| `src/screens/PreferencesScreen.jsx` | Stepper 4 étapes (skip étapes 2-3 si "gamelle") |
| `src/screens/WaitingRoomScreen.jsx` | Polling 3s + déclenchement recherche IA |
| `src/i18n/fr.js` et `en.js` | Toutes les chaînes traduites |
| `src/styles/globals.css` | Design system complet (tokens CSS) |
| `src/services/feedbackService.js` | Retours utilisateurs (bugs/idées) — table Supabase `feedback`, anti-doublon et anti-double-vote via localStorage |
| `src/screens/FeedbackScreen.jsx` | Formulaire de feedback + liste triée par statut/votes, accessible via `?feedback=1` |

## Règles métier importantes
- **Gamelle (inplace) et "de mon côté" (outside)** : étapes cuisines et budget sont sautées dans le stepper ; ces deux modes sont exclus des recherches de restaurant (même traitement, libellé différent pour le décompte de l'organisateur)
- **Deux recherches indépendantes** : si le groupe mélange "out" + "takeout", l'organisateur déclenche les deux séparément
- **Allergies impératives** : chaque section de résultats n'inclut que les allergies des participants concernés
- **Budget le plus restrictif** : le prompt IA prend le budget minimum parmi tous les participants du groupe
- **Sessions publiques** : visibles et rejoignables sans code depuis l'écran d'accueil ; nettoyage automatique après 24h

## Palette de couleurs (daltonien-safe)
```css
--cream:   #FDF6EE  /* fond global */
--brown:   #3D2B1F  /* accent primaire, boutons, texte */
--honey:   #D4820A  /* accent secondaire, bordures */
--yellow:  #F5C842  /* badge top pick, CTA secondaires */
--sand:    #F2E6D4  /* cartes, chips */
--golden:  #FFF8E8  /* badges à emporter, session waiting */
```
Chaque information est toujours encodée avec couleur + icône + libellé (jamais la couleur seule).

## Variable d'environnement requise
```
VITE_CLAUDE_API_KEY=sk-ant-...
```
⚠️ Exposée dans le bundle (prototype). Pour production : proxy backend.

## Variable d'environnement optionnelle — filtrage IA budget/allergies
```
VITE_GEMINI_API_KEY=AIzaSy...
```
Gratuite (Google AI Studio, sans carte bancaire). Utilisée dans `claudeService.js` (`getGeminiPicks`) pour faire choisir à Gemini Flash 3 restaurants parmi le pool OSM en tenant compte du budget le plus restrictif et des allergies du groupe — chose que la sélection algorithmique seule ne fait pas (elle ne filtre que sur cuisine + mode). Sans clé, ou si le quota gratuit est dépassé (HTTP 429) ou l'appel échoue/timeout, repli automatique et silencieux sur la sélection algorithmique existante — jamais d'erreur visible pour l'utilisateur.

## Commandes
```bash
npm run dev      # Développement
npm run build    # Build production
npm run test     # 25 tests unitaires (sessionService)
```

## Tests
Fichier : `src/tests/sessionService.test.js`
Couvre : génération de code, CRUD session, joinSession, updatePrefs, setResults, getPublicSessions.
Ne pas écrire de tests qui appellent la vraie Claude API — tester `buildPrompt()` séparément.

## Ce qui est hors scope (v1)
- Authentification / comptes
- Backend temps réel (Supabase, WebSocket)
- Notifications push
- Historique des sessions
- Vote par veto
- Intégration calendrier
