// English translations
export default {
  // Home
  tagline: 'No more 20-minute "where should we eat?" debates.',
  ctaCreate: 'Start a lunch',
  ctaJoin: 'I got the code',
  publicSessionsTitle: "Today's lunches",
  publicSessionsSubtitle: 'Public sessions started by others — join without a code',
  publicSessionsEmpty: 'No lunches in progress. Start yours!',
  myLunches: 'My lunches',
  myLunchesEmpty: "You haven't joined any lunch yet.",
  myLunchesTitle: 'My lunches',
  myLunchesSubtitle: 'Your lunches, created or joined, on this device',
  feedbackLink: 'Feedback',
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
  mealOutside: 'Eating on my own',
  mealOutsideDesc: 'Not with the group · no search',
  inPlaceMsg: 'Enjoy your lunch! 🥡',
  inPlaceSkipMsg: "No restaurant search for you — we'll keep you posted!",

  // Lunch duration
  lunchDurationLabel: 'Lunch break',
  moreThanOneHour: 'I have more than 1 hour',
  backBy14h: 'I need to be back before 2pm',

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
  apiKeyMissing: 'API key missing — add VITE_GOOGLE_PLACES_KEY to your .env file',
  claudeError: 'Search error. Please try again.',
  prefsError: 'Failed to save preferences. Please try again.',
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

  // Guide screen
  guideLink: 'Guide',
  guideTitle: 'Guide',
  guideIntro: 'No more 20-minute "where should we eat?" debates. Everyone shares what they want, the app suggests 3 restaurants that work for the group.',
  guideHowTitle: 'How it works',
  guideHowOrganizer: [
    { title: 'Create a session', desc: 'public or private, get a 4-character code' },
    { title: 'Share the code', desc: 'via Teams, QR code, or direct link' },
    { title: 'Watch the waiting room', desc: 'see who has filled in their preferences' },
    { title: 'Launch the search', desc: 'get 3 restaurants that fit the group' },
  ],
  guideHowParticipant: [
    { title: 'Join', desc: 'with the code you received, or a public session shown on the home screen' },
    { title: 'Share your preferences', desc: 'cuisine, budget, allergies — skipped if "eating in"' },
    { title: 'Wait', desc: 'the screen updates itself, nothing to refresh' },
    { title: 'Check the results', desc: '3 restaurants, with address' },
  ],
  guideFeaturesTitle: 'Key features',
  guideFeatures: [
    { icon: '🔒', title: 'Public or private', desc: 'A private session is only visible with the code. A public session shows up on the home screen so anyone can join without one.' },
    { icon: '🍽️', title: 'Three meal modes', desc: 'Eating out, staying in, or eating on your own — everyone picks, only "eating out" joins the search.' },
    { icon: '⚠️', title: 'Allergies always respected', desc: 'Every suggested restaurant accounts for the allergies declared by the participants concerned.' },
    { icon: '💶', title: 'Most restrictive budget wins', desc: 'If the group has different budgets, the app keeps the lowest one so everyone is comfortable.' },
    { icon: '📋', title: 'My lunches', desc: 'Your personal history of sessions created or joined on this device.' },
    { icon: '🌍', title: "Today's lunches", desc: 'Public sessions started by others right now — join one without a code.' },
  ],
  guideLimitsTitle: 'API limitations',
  guideLimitsIntro: 'The app is deliberately built for €0: no API key, no credit card, no infrastructure to pay for. That choice has trade-offs, acknowledged here and partly mitigated.',
  guideLimits: [
    {
      severity: '🟡',
      title: 'Restaurant search depends on a volunteer-run service',
      desc: 'Data comes from OpenStreetMap (via the Overpass API), a free collaborative database with no uptime guarantee. Under heavy load, a search can occasionally fail.',
      mitigation: 'An internal cache stores results for 7 days per area: after the first successful search in a given area, later ones no longer depend on Overpass at all.',
    },
    {
      severity: '🟢',
      title: 'No ratings, reviews, or photos',
      desc: 'Unlike Google Maps, a restaurant card only has name, cuisine, and address — whatever OpenStreetMap has, which varies by area.',
    },
    {
      severity: '🟢',
      title: 'No account, data tied to the device',
      desc: '"My lunches" reads history stored in this browser. Switching devices loses that history — but a session code still works to join from anywhere.',
    },
    {
      severity: '🟢',
      title: 'Polling-based waiting room, no push',
      desc: 'The screen updates itself automatically, but via periodic polling — no notification if the app is closed.',
    },
  ],
  guideFaqTitle: 'FAQ',
  guideFaq: [
    { q: 'The search shows an error, what should I do?', a: 'Just relaunch the search — the data service is free and occasionally overloaded. Once a search has succeeded in your area, later ones are near-instant for 7 days.' },
    { q: 'Can I change my preferences after submitting them?', a: 'Yes, as long as the organizer hasn\'t launched the search yet — via "My lunches" or directly in the waiting room.' },
    { q: 'Who can see a private session?', a: 'Only people who received the 4-character code. It never shows up in "Today\'s lunches".' },
    { q: 'Are sessions deleted automatically?', a: 'Public sessions are cleaned up after 24h. Private sessions stay until the organizer deletes them manually.' },
  ],
  guideRoadmapTitle: 'Not yet planned',
  guideRoadmap: [
    'Authentication / user accounts',
    'Push notifications',
    'Session history beyond the current device',
    'Veto voting on suggested restaurants',
    'Calendar integration',
  ],

  // Feedback screen
  feedbackTitle: 'Feedback',
  feedbackIntro: 'Found a bug, got an idea? Say it in a line or two — it\'s read and it counts.',
  feedbackTypeBug: '🐛 Bug',
  feedbackTypeIdea: '💡 Idea',
  feedbackBugPlaceholder: 'E.g. the back button doesn\'t work on the preferences screen',
  feedbackIdeaPlaceholder: 'E.g. being able to re-run the search for a single cuisine',
  feedbackNamePlaceholder: 'Your name (optional)',
  feedbackSend: 'Send',
  feedbackSending: 'Sending…',
  feedbackThanks: '📝 Thanks, noted!',
  feedbackDuplicate: 'Already got that one, thanks 🙏',
  feedbackError: 'Error sending feedback. Try again.',
  feedbackListTitle: 'Already reported',
  feedbackEmpty: 'No feedback yet — be the first!',
  feedbackStatusIdea: '💡 Idea',
  feedbackStatusPlanned: '📋 Planned',
  feedbackStatusInProgress: '🔨 In progress',
  feedbackStatusShipped: '✅ Shipped',
  feedbackVoteAria: 'Vote for this feedback',
  feedbackVotedAria: 'Already voted',
}
