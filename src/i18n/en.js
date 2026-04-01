// English translations
export default {
  // Home
  tagline: 'No more 20-minute "where should we eat?" debates.',
  ctaCreate: 'Start a lunch',
  ctaJoin: 'I got the code',
  publicSessionsTitle: "Today's lunches",
  publicSessionsEmpty: 'No lunches in progress. Start yours!',

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
  mealHomemade: 'Brought my lunch',
  mealHomemadeDesc: 'Eating in, meal from home',
  mealTakeout: 'Takeout',
  mealTakeoutDesc: 'Looking to order / get delivery',
  homemadeMsg: 'Homemade — respect 👏',
  homemadeSkipMsg: "No restaurant search for you — enjoy your lunch while we pick!",

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
  groupSummary: '{out} going out · {takeout} takeout · {homemade} homemade',
  launchSearchOut: '🍽️ Find a restaurant',
  launchSearchTakeout: '📦 Find takeout',
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
