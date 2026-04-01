// English translations
export default {
  // Home
  tagline: 'No more 20-minute "where should we eat?" debates.',
  ctaCreate: 'Start a lunch',
  ctaJoin: 'I got the code',
  publicSessionsTitle: "Today's lunches",
  publicSessionsEmpty: 'No lunches in progress. Start yours!',
  myLunches: 'My lunches',
  myLunchesEmpty: "You haven't joined any lunch yet.",
  myLunchesTitle: 'My lunches',
  rejoin: 'Rejoin',
  cancelParticipation: 'Cancel my participation',
  cancelConfirm: 'Cancel your participation in this lunch?',
  statusWaiting: 'Waiting',
  statusResults: '🎉 Results ready',
  statusDone: 'Done',
  statusPrefsNeeded: 'Preferences needed',
  youAreOrganizer: 'You are the organizer',
  loadingMyLunches: 'Loading your lunches…',

  // Session creation
  createTitle: 'Start a lunch',
  yourName: 'Your first name',
  namePlaceholder: 'E.g. Sophie',
  sessionType: 'Session type',
  sessionPublic: 'Public session',
  sessionPublicDesc: "Visible in today's lunch list — joinable without a code",
  sessionPrivate: 'Private session',
  sessionPrivateDesc: 'Accessible via shared code only',
  createBtn: "Let's go!",

  // Session join
  joinTitle: 'Join a lunch',
  sessionCode: 'Session code',
  codePlaceholder: 'E.g. A3F2',
  joinBtn: 'Join',

  // Your code
  yourCode: 'Session code',
  codeHint: 'Share this code with your colleagues',
  copyCode: 'Copy code',
  copied: 'Copied!',
  shareTeams: 'Share on Teams',
  copyLink: 'Copy link',
  showQR: 'QR Code',

  // Stepper steps
  step1Label: 'Meal type',
  step2Label: 'Cuisines',
  step3Label: 'Budget',
  step4Label: 'Allergies',

  // Meal modes
  mealOut: 'Going out',
  mealOutDesc: 'Restaurant with the group',
  mealInPlace: 'Staying in',
  mealInPlaceDesc: 'Packed lunch, desk or solo — no search needed',
  inPlaceMsg: 'Enjoy your lunch! 🥡',
  inPlaceSkipMsg: "No restaurant search for you — we'll keep you posted!",

  // Lunch duration
  lunchDurationLabel: 'Lunch break length',
  lunchDurationOptions: {
    '<30':   '⚡ < 30 min',
    '30-45': '🕐 30–45 min',
    '45-60': '🕑 45–60 min',
    '>60':   '🕒 1h+',
  },

  // Delete session
  deleteSession: 'Delete lunch',
  deleteConfirm: 'Permanently delete this lunch? All participants will be removed.',

  // Cuisines
  cuisineTitle: 'What are you in the mood for?',
  cuisineSubtitle: 'Select everything that sounds good (multiple choices)',
  noCuisineSelected: 'No particular preference',

  // Budget
  budgetTitle: "What's your budget?",
  budgetSubtitle: 'Approximate budget for the meal',

  // Allergies
  allergyTitle: 'Allergies & dietary needs',
  allergySubtitle: 'Select your dietary restrictions',
  noAllergy: 'No restrictions',

  // Navigation
  back: 'Back',
  next: 'Next',
  finish: 'Confirm my preferences',

  // Waiting room
  waitingRoomTitle: 'Waiting room',
  waitingEmpty: 'Quiet in here… share the code!',
  waitingParticipant: "{name} will pick when everyone's in",
  waitingYourPrefs: 'Waiting for the organizer to launch…',
  groupSummary: '{out} going out · {inplace} staying in',
  launchSearchOut: '🍽️ Find a restaurant',
  searching: 'Searching…',
  searchDone: 'Results ready!',
  viewResults: 'View results',

  // Results
  resultsTitle: '🎉 Recommendations',
  sectionOut: '🍽️ Going out',
  sectionTakeout: '📦 Takeout',
  topPick: 'The wise choice',
  noResults: 'No recommendations available.',
  retry: 'Retry',
  newSession: 'New lunch',
  backToWaiting: 'Back to waiting room',
  editPrefs: 'Edit my preferences',
  leaveSession: 'Leave session',
  leaveConfirm: 'Are you sure you want to leave this session?',
  budget: 'Budget',
  address: 'Address',
  why: 'Why?',

  // Share
  teamsMsg: 'Lunch together? Join the À TABLE! session — Code: {code} → {url}',
  qrTitle: 'Scan to join',

  // Errors
  nameRequired: 'Please enter your first name.',
  codeRequired: 'Please enter the session code.',
  sessionNotFound: 'Session not found. Check the code.',
  sessionClosed: 'This session is already closed.',
  apiKeyMissing: 'API key missing — add VITE_CLAUDE_API_KEY to your .env file',
  claudeError: 'Search error. Please try again.',
  mealModeRequired: 'Please choose your meal type.',

  // Budget options
  budgetOptions: {
    '<15': '< €15',
    '15-30': '€15–30',
    '30-50': '€30–50',
    '>50': '€50+',
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
