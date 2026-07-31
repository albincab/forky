// French translations
export default {
  // Home
  taglineBadge: 'Qui mange où ?',
  ctaCreate: 'Je mets la table',
  ctaJoin: "J'ai le numéro de table",
  publicSessionsTab: 'Les buffets',
  publicSessionsSubtitle: 'Tables ouvertes par d’autres — rejoignez sans numéro',
  publicSessionsEmpty: 'Aucune table ouverte pour l’instant. Lancez la vôtre !',
  myLunches: 'Mes tables',
  myLunchesEmpty: "Vous n'avez encore rejoint aucune table.",
  showArchived: 'Afficher les tables archivées',
  feedbackLink: 'Feedback',
  rejoin: 'Afficher ma table',
  cancelParticipation: 'Je me désiste',
  cancelConfirm: 'Vous désister de cette table ?',
  statusWaiting: 'En attente',
  statusResults: '🍽️ À Table !',
  statusArchived: '🧹 Table débarrassée',
  statusPrefsNeeded: 'Préférences à compléter',
  youAreOrganizer: 'Vous êtes l\'organisateur',
  loadingMyLunches: 'Chargement de vos tables…',

  // Session creation
  createTitle: 'Ouvrir une table',
  yourName: 'Votre prénom',
  namePlaceholder: 'Ex: Sophie',
  sessionType: 'Type de table',
  sessionPublic: 'Ouverte à tous',
  sessionPublicDesc: 'Tout le monde peut la rejoindre sans numéro — elle apparaît dans Les buffets',
  sessionPrivate: 'Sur invitation',
  sessionPrivateDesc: 'Accès réservé aux personnes qui ont le numéro',
  createBtn: "J'ouvre la table",

  // Session join
  joinTitle: "Rejoindre une table",
  sessionCode: 'Numéro de table',
  codePlaceholder: 'Ex: 4827',
  joinBtn: 'Rejoindre',

  // Your code
  yourCode: 'Numéro de table',
  codeHint: 'Partagez ce numéro avec vos collègues',
  copyCode: 'Copier le numéro',
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
  mealOutDesc: 'Dodo, boulot, restau… mais pas solo',
  mealInPlace: 'Je reste sur place',
  mealInPlaceDesc: "J'ai ma gamelle",
  mealOutside: 'Je mange de mon côté',
  mealOutsideDesc: "C'est cela oui !",
  inPlaceMsg: 'Super, bon appétit ! 🥡',
  inPlaceSkipMsg: "Pas de recherche pour vous — on vous tient au courant !",

  // Lunch duration
  lunchDurationLabel: 'Temps de pause',
  moreThanOneHour: "J'ai plus d'1h",
  backBy14h: 'Je dois être de retour avant 14h',

  // Delete session
  deleteSession: 'Je lève la table',
  deleteConfirm: 'Lever définitivement cette table ? Tous les participants seront retirés.',

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
  waitingEmpty: 'C\'est calme… partage le numéro !',
  waitingParticipant: '{name} lance la recherche',
  waitingYourPrefs: 'En attente du lancement…',
  groupSummary: '{out} qui sortent · {inplace} sur place',
  launchSearchOut: '🍽️ Trouver notre table',
  searching: 'Recherche en cours…',
  searchDone: 'Résultats disponibles !',
  viewResults: 'Voir les résultats',

  // Results
  resultsTitle: '🎉 Les recommandations',
  sectionOut: '🍽️ On sort',
  sectionTakeout: '📦 À emporter',
  topPick: 'Le choix de la sagesse',
  aiPicked: 'Choisi par l\'IA selon votre budget et vos allergies',
  noResults: 'Aucune recommandation disponible.',
  retry: 'Réessayer',
  newSession: 'Nouvelle table',
  backToWaiting: 'Retour à la salle d\'attente',
  editPrefs: 'Modifier mes préférences',
  leaveSession: 'Quitter la table',
  leaveConfirm: 'Voulez-vous vraiment quitter cette table ?',
  budget: 'Budget',
  address: 'Adresse',
  why: 'Pourquoi ?',

  // Share
  teamsMsg: "On mange ensemble ? Rejoins la table À TABLE! — Numéro : {code} → {url}",
  qrTitle: 'Scanner pour rejoindre',

  // Errors
  nameRequired: 'Veuillez saisir votre prénom.',
  codeRequired: 'Veuillez saisir le numéro de table.',
  sessionNotFound: 'Table introuvable. Vérifiez le numéro.',
  sessionClosed: 'Cette table est déjà fermée.',
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
    'Asiatique', 'Végétarienne', 'Brasserie', 'Libanaise', 'Mexicaine', 'Orientale',
  ],

  // Cuisine emojis
  cuisineEmojis: {
    Française: '🥐', Italienne: '🍝', Japonaise: '🍣', Pizza: '🍕',
    Burger: '🍔', Asiatique: '🥢', Végétarienne: '🥗', Brasserie: '🍺',
    Libanaise: '🧆', Mexicaine: '🌮', Orientale: '🥙',
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
  guideIntro: 'Fini les « qui mange où » qui durent 20 minutes. Chacun donne ses envies, l\'appli propose 3 restaurants qui conviennent au groupe.',
  guideHowTitle: 'Comment ça marche',
  guideHowOrganizer: [
    { title: 'Ouvre une table', desc: 'ouverte à tous ou sur invitation, reçoit un numéro à 4 chiffres' },
    { title: 'Partage le numéro', desc: 'par Teams, QR code, ou lien direct' },
    { title: 'Suit la salle d\'attente', desc: 'voit qui a rempli ses préférences' },
    { title: 'Lance la recherche', desc: 'reçoit 3 restaurants adaptés au groupe' },
  ],
  guideHowParticipant: [
    { title: 'Rejoint', desc: 'avec le numéro reçu, ou une table ouverte visible dans Les buffets' },
    { title: 'Indique ses envies', desc: 'cuisine, budget, allergies — sauté si "gamelle"' },
    { title: 'Attend', desc: 'l\'écran se met à jour tout seul, rien à rafraîchir' },
    { title: 'Consulte les résultats', desc: '3 restaurants, avec adresse' },
  ],
  guideFeaturesTitle: 'Fonctionnalités clés',
  guideFeatures: [
    { icon: '🔒', title: 'Ouverte ou sur invitation', desc: 'Une table sur invitation n\'est visible qu\'avec le numéro. Une table ouverte à tous apparaît dans Les buffets pour que n\'importe qui la rejoigne sans numéro.' },
    { icon: '🍽️', title: 'Trois modes de repas', desc: 'Sortir manger, rester sur place (gamelle), ou manger de son côté — chacun choisit, seul "sortir manger" participe à la recherche.' },
    { icon: '⚠️', title: 'Allergies impératives', desc: 'Chaque restaurant proposé tient compte des allergies déclarées par les participants concernés.' },
    { icon: '💶', title: 'Budget le plus restrictif', desc: 'Si le groupe a des budgets différents, l\'appli retient le plus bas pour que tout le monde s\'y retrouve.' },
    { icon: '📋', title: 'Mes tables', desc: 'Historique personnel de vos tables créées ou rejointes sur cet appareil. Les tables d\'un autre jour sont automatiquement archivées — une case à cocher permet de les réafficher.' },
    { icon: '🌍', title: 'Les buffets', desc: 'Les tables ouvertes par d\'autres en ce moment — rejoignez-en une sans numéro.' },
    { icon: '🪑', title: 'Une table active par jour', desc: 'Tant que tu as déjà une table aujourd\'hui, l\'accueil propose "Afficher ma table" à la place de "Je mets la table" / "J\'ai le numéro de table".' },
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
      severity: '🟡',
      title: 'Le filtrage IA du budget et des allergies dépend d\'un quota gratuit',
      desc: 'Quand elle est activée, l\'IA (Gemini, gratuite) affine les 3 restaurants proposés selon le budget le plus restrictif et les allergies du groupe. Ce quota gratuit est limité.',
      mitigation: 'En cas de quota dépassé ou d\'indisponibilité, l\'appli repasse automatiquement sur sa sélection standard (cuisine + mode) — sans erreur visible, mais sans ce filtrage fin ce jour-là.',
    },
    {
      severity: '🟢',
      title: 'Pas de notes, avis ou photos',
      desc: 'Contrairement à Google Maps, la fiche restaurant contient seulement nom, cuisine, adresse — l\'information disponible dans OpenStreetMap, qui varie selon la zone.',
    },
    {
      severity: '🟢',
      title: 'Pas de compte, données liées à l\'appareil',
      desc: '"Mes tables" lit l\'historique stocké dans ce navigateur. Changer d\'appareil fait perdre cet historique — mais un numéro de table reste valable pour rejoindre depuis n\'importe où.',
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
    { q: 'Puis-je changer mes préférences après les avoir envoyées ?', a: 'Oui, tant que l\'organisateur n\'a pas lancé la recherche — via "Mes tables" ou directement dans la salle d\'attente.' },
    { q: 'Qui peut voir une table sur invitation ?', a: 'Seules les personnes ayant reçu le numéro à 4 chiffres. Elle n\'apparaît jamais dans "Les buffets".' },
    { q: 'Les tables sont-elles supprimées automatiquement ?', a: 'Non — les données restent en base indéfiniment. Une table d\'un autre jour disparaît juste de l\'affichage : masquée (archivée) dans "Mes tables", et retirée du "Buffet" si elle était ouverte. Seul "Je lève la table" (organisateur) l\'efface réellement.' },
    { q: 'Puis-je ouvrir une deuxième table le même jour ?', a: 'L\'accueil encourage une seule table active par jour et affiche "Afficher ma table" une fois que tu en as une. Tu peux toujours en rejoindre une autre avec son numéro ou depuis "Le buffet" si besoin.' },
  ],
  guideRoadmapTitle: 'Pas encore prévu',
  guideRoadmap: [
    'Authentification / comptes utilisateurs',
    'Notifications push',
    'Historique de tables au-delà de l\'appareil courant',
    'Vote par veto sur les restaurants proposés',
    'Intégration calendrier',
  ],

  // Feedback screen
  feedbackTitle: 'Feedback',
  feedbackIntro: 'Un bug, une idée ? Dites-le en 2 lignes — c\'est lu et ça compte.',
  feedbackTypeBug: '🐛 Bug',
  feedbackTypeIdea: '💡 Idée',
  feedbackBugPlaceholder: 'Ex: le bouton retour ne marche pas sur l\'écran des préférences',
  feedbackIdeaPlaceholder: 'Ex: pouvoir relancer la recherche pour une seule cuisine',
  feedbackNamePlaceholder: 'Votre prénom (optionnel)',
  feedbackSend: 'Envoyer',
  feedbackSending: 'Envoi…',
  feedbackThanks: '📝 Merci, c\'est noté !',
  feedbackDuplicate: 'Déjà reçu celui-là, merci 🙏',
  feedbackError: 'Erreur lors de l\'envoi. Réessayez.',
  feedbackListTitle: 'Ce qui a déjà été signalé',
  feedbackEmpty: 'Aucun retour pour l\'instant — soyez le premier !',
  feedbackStatusIdea: '💡 Idée',
  feedbackStatusPlanned: '📋 Planifié',
  feedbackStatusInProgress: '🔨 En cours',
  feedbackStatusShipped: '✅ Livré',
  feedbackVoteAria: 'Voter pour ce retour',
  feedbackVotedAria: 'Déjà voté',
}
