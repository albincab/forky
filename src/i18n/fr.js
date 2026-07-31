// French translations
export default {
  // Home
  tagline: 'Fini les "on mange où ?" qui durent 20 min.',
  ctaCreate: 'Je lance le déjeuner',
  ctaJoin: "On m'a invité·e",
  publicSessionsTitle: 'Midi du jour',
  publicSessionsSubtitle: 'Sessions publiques ouvertes par d’autres — rejoignez sans code',
  publicSessionsEmpty: 'Aucun déjeuner en cours. Lancez le vôtre !',
  myLunches: 'Mes déjeuners',
  myLunchesEmpty: "Vous n'avez encore rejoint aucun déjeuner.",
  myLunchesTitle: 'Mes déjeuners',
  myLunchesSubtitle: 'Vos déjeuners créés ou rejoints, sur cet appareil',
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
  sessionPublicDesc: 'Ouvert à tous — tout le monde peut rejoindre sans code',
  sessionPrivate: 'Session privée',
  sessionPrivateDesc: 'Petit comité — accès réservé aux personnes qui ont le code',
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
  mealOutDesc: 'Au restaurant avec le groupe',
  mealInPlace: 'Je reste sur place',
  mealInPlaceDesc: 'Repas perso · sans recherche',
  mealOutside: 'Je mange de mon côté',
  mealOutsideDesc: 'Pas avec le groupe · sans recherche',
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
  cuisineSubtitle: 'Plusieurs choix possibles',
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
  finish: 'Confirmer',

  // Waiting room
  waitingRoomTitle: 'Salle d\'attente',
  waitingEmpty: 'C\'est calme… partage le code !',
  waitingParticipant: '{name} lance la recherche',
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
  apiKeyMissing: "Clé API manquante — ajoutez VITE_GOOGLE_PLACES_KEY dans votre fichier .env",
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

  // Guide screen
  guideLink: 'Guide',
  guideTitle: 'Guide',
  guideIntro: 'Fini les « on mange où ? » qui durent 20 minutes. Chacun donne ses envies, l\'appli propose 3 restaurants qui conviennent au groupe.',
  guideHowTitle: 'Comment ça marche',
  guideHowOrganizer: [
    { title: 'Crée une session', desc: 'publique ou privée, reçoit un code à 4 caractères' },
    { title: 'Partage le code', desc: 'par Teams, QR code, ou lien direct' },
    { title: 'Suit la salle d\'attente', desc: 'voit qui a rempli ses préférences' },
    { title: 'Lance la recherche', desc: 'reçoit 3 restaurants adaptés au groupe' },
  ],
  guideHowParticipant: [
    { title: 'Rejoint', desc: 'avec le code reçu, ou une session publique visible sur l\'accueil' },
    { title: 'Indique ses envies', desc: 'cuisine, budget, allergies — sauté si "gamelle"' },
    { title: 'Attend', desc: 'l\'écran se met à jour tout seul, rien à rafraîchir' },
    { title: 'Consulte les résultats', desc: '3 restaurants, avec adresse' },
  ],
  guideFeaturesTitle: 'Fonctionnalités clés',
  guideFeatures: [
    { icon: '🔒', title: 'Public ou privé', desc: 'Une session privée n\'est visible qu\'avec le code. Une session publique apparaît sur l\'accueil pour que n\'importe qui la rejoigne sans code.' },
    { icon: '🍽️', title: 'Trois modes de repas', desc: 'Sortir manger, rester sur place (gamelle), ou manger de son côté — chacun choisit, seul "sortir manger" participe à la recherche.' },
    { icon: '⚠️', title: 'Allergies impératives', desc: 'Chaque restaurant proposé tient compte des allergies déclarées par les participants concernés.' },
    { icon: '💶', title: 'Budget le plus restrictif', desc: 'Si le groupe a des budgets différents, l\'appli retient le plus bas pour que tout le monde s\'y retrouve.' },
    { icon: '📋', title: 'Mes déjeuners', desc: 'Historique personnel de vos sessions créées ou rejointes sur cet appareil.' },
    { icon: '🌍', title: 'Midi du jour', desc: 'Les sessions publiques ouvertes par d\'autres en ce moment — rejoignez-en une sans code.' },
  ],
  guideLimitsTitle: 'Limites côté API',
  guideLimitsIntro: 'L\'appli est volontairement bâtie à 0€ : pas de clé API, pas de carte bancaire, pas d\'infrastructure à payer. Ce choix a des contreparties, assumées et en partie compensées.',
  guideLimits: [
    {
      severity: '🟡',
      title: 'La recherche de restaurants dépend d\'un service bénévole',
      desc: 'Les données viennent d\'OpenStreetMap (via l\'API Overpass), une base collaborative et gratuite — sans garantie de disponibilité. Sous forte charge, une recherche peut échouer occasionnellement.',
      mitigation: 'Un cache interne mémorise les résultats 7 jours par zone : après la première recherche réussie dans un secteur, les suivantes ne dépendent plus du tout d\'Overpass.',
    },
    {
      severity: '🟢',
      title: 'Pas de notes, avis ou photos',
      desc: 'Contrairement à Google Maps, la fiche restaurant contient seulement nom, cuisine, adresse — l\'information disponible dans OpenStreetMap, qui varie selon la zone.',
    },
    {
      severity: '🟢',
      title: 'Pas de compte, données liées à l\'appareil',
      desc: '"Mes déjeuners" lit l\'historique stocké dans ce navigateur. Changer d\'appareil fait perdre cet historique — mais un code de session reste valable pour rejoindre depuis n\'importe où.',
    },
    {
      severity: '🟢',
      title: 'Salle d\'attente en sondage, pas en push',
      desc: 'L\'écran se met à jour automatiquement, mais par rafraîchissement périodique — pas de notification si l\'app est fermée.',
    },
  ],
  guideFaqTitle: 'Questions fréquentes',
  guideFaq: [
    { q: 'La recherche affiche une erreur, que faire ?', a: 'Relancez simplement la recherche — le service de données est gratuit et occasionnellement surchargé. Une fois qu\'une recherche a réussi dans votre secteur, les suivantes sont quasi instantanées pendant 7 jours.' },
    { q: 'Puis-je changer mes préférences après les avoir envoyées ?', a: 'Oui, tant que l\'organisateur n\'a pas lancé la recherche — via "Mes déjeuners" ou directement dans la salle d\'attente.' },
    { q: 'Qui peut voir une session privée ?', a: 'Seules les personnes ayant reçu le code à 4 caractères. Elle n\'apparaît jamais dans "Midi du jour".' },
    { q: 'Les sessions sont-elles supprimées automatiquement ?', a: 'Les sessions publiques sont nettoyées après 24h. Les sessions privées restent jusqu\'à suppression manuelle par l\'organisateur.' },
  ],
  guideRoadmapTitle: 'Pas encore prévu',
  guideRoadmap: [
    'Authentification / comptes utilisateurs',
    'Notifications push',
    'Historique de sessions au-delà de l\'appareil courant',
    'Vote par veto sur les restaurants proposés',
    'Intégration calendrier',
  ],
}
