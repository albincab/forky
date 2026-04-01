// French translations
export default {
  // Home
  tagline: 'Fini les "on mange où ?" qui durent 20 min.',
  ctaCreate: 'Je lance le déjeuner',
  ctaJoin: "On m'a invité·e",
  publicSessionsTitle: 'Repas du jour',
  publicSessionsEmpty: 'Aucun déjeuner en cours. Lancez le vôtre !',
  myLunches: 'Mes déjeuners',
  myLunchesEmpty: "Vous n'avez encore rejoint aucun déjeuner.",
  myLunchesTitle: 'Mes déjeuners',
  rejoin: 'Rejoindre',
  cancelParticipation: 'Annuler ma participation',
  cancelConfirm: 'Annuler votre participation à ce déjeuner ?',
  statusWaiting: 'En attente',
  statusResults: '🎉 Résultats disponibles',
  statusDone: 'Terminé',
  statusPrefsNeeded: 'Préférences à compléter',
  youAreOrganizer: 'Vous êtes l\'organisateur',
  loadingMyLunches: 'Chargement de vos déjeuners…',

  // Session creation
  createTitle: 'Lancer un déjeuner',
  yourName: 'Votre prénom',
  namePlaceholder: 'Ex: Sophie',
  sessionType: 'Type de session',
  sessionPublic: 'Session publique',
  sessionPublicDesc: 'Visible dans la liste des repas du jour — rejoignable sans code',
  sessionPrivate: 'Session privée',
  sessionPrivateDesc: "Accessible uniquement via le code partagé",
  createBtn: 'Lancer !',

  // Session join
  joinTitle: "Rejoindre un déjeuner",
  sessionCode: 'Code de session',
  codePlaceholder: 'Ex: A3F2',
  joinBtn: 'Rejoindre',

  // Your code
  yourCode: 'Code de session',
  codeHint: 'Partagez ce code avec vos collègues',
  copyCode: 'Copier le code',
  copied: 'Copié !',
  shareTeams: 'Partager sur Teams',
  copyLink: 'Copier le lien',
  showQR: 'QR Code',

  // Stepper steps
  step1Label: 'Mode de repas',
  step2Label: 'Cuisines',
  step3Label: 'Budget',
  step4Label: 'Allergies',

  // Meal modes
  mealOut: 'Je sors manger',
  mealOutDesc: 'Repas au restaurant avec le groupe',
  mealInPlace: 'Je reste sur place',
  mealInPlaceDesc: 'Gamelle, bureau ou repas solo — pas besoin de chercher',
  inPlaceMsg: 'Super, bon appétit ! 🥡',
  inPlaceSkipMsg: "Pas de recherche pour vous — on vous tient au courant !",

  // Lunch duration
  lunchDurationLabel: 'Temps de pause',
  moreThanOneHour: "J'ai plus d'1h",
  backBy14h: 'Je dois être de retour avant 14h',

  // Delete session
  deleteSession: 'Supprimer le déjeuner',
  deleteConfirm: 'Supprimer définitivement ce déjeuner ? Tous les participants seront retirés.',

  // Cuisines
  cuisineTitle: 'Vos envies ?',
  cuisineSubtitle: 'Sélectionnez tout ce qui vous fait envie (plusieurs choix possibles)',
  noCuisineSelected: 'Pas de préférence particulière',

  // Budget
  budgetTitle: 'Votre budget ?',
  budgetSubtitle: 'Budget indicatif pour le repas',

  // Allergies
  allergyTitle: 'Allergies & régimes',
  allergySubtitle: 'Sélectionnez vos contraintes alimentaires',
  noAllergy: 'Aucune contrainte',

  // Navigation
  back: 'Retour',
  next: 'Suivant',
  finish: 'Confirmer mes préférences',

  // Waiting room
  waitingRoomTitle: 'Salle d\'attente',
  waitingEmpty: 'C\'est calme… partage le code !',
  waitingParticipant: '{name} décide quand tout le monde est là',
  waitingYourPrefs: 'En attente du lancement…',
  groupSummary: '{out} qui sortent · {inplace} sur place',
  launchSearchOut: '🍽️ Trouver un restaurant',
  searching: 'Recherche en cours…',
  searchDone: 'Résultats disponibles !',
  viewResults: 'Voir les résultats',

  // Results
  resultsTitle: '🎉 Les recommandations',
  sectionOut: '🍽️ On sort',
  sectionTakeout: '📦 À emporter',
  topPick: 'Le choix de la sagesse',
  noResults: 'Aucune recommandation disponible.',
  retry: 'Réessayer',
  newSession: 'Nouveau déjeuner',
  backToWaiting: 'Retour à la salle d\'attente',
  editPrefs: 'Modifier mes préférences',
  leaveSession: 'Quitter la session',
  leaveConfirm: 'Voulez-vous vraiment quitter cette session ?',
  budget: 'Budget',
  address: 'Adresse',
  why: 'Pourquoi ?',

  // Share
  teamsMsg: "On mange ensemble ? Rejoins la session À TABLE! — Code : {code} → {url}",
  qrTitle: 'Scanner pour rejoindre',

  // Errors
  nameRequired: 'Veuillez saisir votre prénom.',
  codeRequired: 'Veuillez saisir le code de session.',
  sessionNotFound: 'Session introuvable. Vérifiez le code.',
  sessionClosed: 'Cette session est déjà fermée.',
  apiKeyMissing: "Clé API manquante — ajoutez VITE_CLAUDE_API_KEY dans votre fichier .env",
  claudeError: 'Erreur lors de la recherche. Veuillez réessayer.',
  prefsError: 'Erreur lors de l\'enregistrement. Veuillez réessayer.',
  mealModeRequired: 'Veuillez choisir votre mode de repas.',

  // Budget options
  budgetOptions: {
    '<15': '< 15€',
    '15-30': '15–30€',
    '30-50': '30–50€',
    '>50': '+ de 50€',
  },

  // Cuisine list
  cuisines: [
    'Française', 'Italienne', 'Japonaise', 'Pizza', 'Burger',
    'Asiatique', 'Végétarienne', 'Brasserie', 'Libanaise', 'Mexicaine',
  ],

  // Cuisine emojis
  cuisineEmojis: {
    Française: '🥐', Italienne: '🍝', Japonaise: '🍣', Pizza: '🍕',
    Burger: '🍔', Asiatique: '🥢', Végétarienne: '🥗', Brasserie: '🍺',
    Libanaise: '🧆', Mexicaine: '🌮',
  },

  // Allergies
  allergies: [
    'Gluten', 'Lactose', 'Fruits à coque', 'Arachides',
    'Œufs', 'Crustacés', 'Soja', 'Halal', 'Végétarien', 'Végétalien',
  ],

  allergyEmojis: {
    'Gluten': '🌾', 'Lactose': '🥛', 'Fruits à coque': '🥜', 'Arachides': '🥜',
    'Œufs': '🥚', 'Crustacés': '🦞', 'Soja': '🫘', 'Halal': '☪️',
    'Végétarien': '🌱', 'Végétalien': '🌿',
  },
}
