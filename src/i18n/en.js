// English translations
export default {
  // Home
  taglineBadge: "Who's eating where?",
  ctaCreate: 'Set the table',
  ctaJoin: 'I have the table number',
  publicSessionsTab: 'The buffets',
  publicSessionsSubtitle: 'Open tables started by others — join without a number',
  publicSessionsEmpty: 'No open tables yet. Start yours!',
  myLunches: 'My tables',
  myLunchesEmpty: "You haven't joined any table yet.",
  showArchived: 'Show archived tables',
  feedbackLink: 'Feedback',
  rejoin: 'View my table',
  cancelParticipation: "I'm out",
  cancelConfirm: 'Drop out of this table?',
  statusWaiting: 'Waiting',
  statusResults: "🍽️ Table's ready!",
  statusArchived: '🧹 Table cleared',
  statusPrefsNeeded: 'Preferences needed',
  youAreOrganizer: 'You are the organizer',
  loadingMyLunches: 'Loading your tables…',

  // Session creation
  createTitle: 'Open a table',
  yourName: 'Your first name',
  namePlaceholder: 'E.g. Sophie',
  sessionType: 'Table type',
  sessionPublic: 'Open to all',
  sessionPublicDesc: 'Anyone can join without a number — shows up in The buffets',
  sessionPrivate: 'Invite-only',
  sessionPrivateDesc: 'Accessible via shared table number only',
  createBtn: "Open the table",

  // Session join
  joinTitle: 'Join a table',
  sessionCode: 'Table number',
  codePlaceholder: 'E.g. 4827',
  joinBtn: 'Join',

  // Your code
  yourCode: 'Table number',
  codeHint: 'Share this number with your colleagues',
  copyCode: 'Copy number',
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
  mealOutDesc: 'Work, food, sleep, repeat — but never eating alone',
  mealInPlace: 'Staying in',
  mealInPlaceDesc: 'Packed my own lunch',
  mealOutside: 'Eating on my own',
  mealOutsideDesc: 'Sure, if you say so!',
  inPlaceMsg: 'Enjoy your lunch! 🥡',
  inPlaceSkipMsg: "No restaurant search for you — we'll keep you posted!",

  // Lunch duration
  lunchDurationLabel: 'Lunch break',
  moreThanOneHour: 'I have more than 1 hour',
  backBy14h: 'I need to be back before 2pm',

  // Delete session
  deleteSession: 'Close the table',
  deleteConfirm: 'Permanently close this table? All participants will be removed.',

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
  waitingEmpty: 'Quiet in here… share the number!',
  waitingParticipant: "{name} will pick when everyone's in",
  waitingYourPrefs: 'Waiting for the organizer to launch…',
  groupSummary: '{out} going out · {inplace} staying in',
  launchSearchOut: '🍽️ Find our table',
  searching: 'Searching…',
  searchDone: 'Results ready!',
  viewResults: 'View results',

  // Results
  resultsTitle: '🎉 Recommendations',
  sectionOut: '🍽️ Going out',
  sectionTakeout: '📦 Takeout',
  topPick: 'The wise choice',
  aiPicked: 'Picked by AI based on your budget and allergies',
  noResults: 'No recommendations available.',
  retry: 'Retry',
  newSession: 'New table',
  backToWaiting: 'Back to waiting room',
  editPrefs: 'Edit my preferences',
  leaveSession: 'Leave table',
  leaveConfirm: 'Are you sure you want to leave this table?',
  budget: 'Budget',
  address: 'Address',
  why: 'Why?',

  // Share
  teamsMsg: 'Lunch together? Join the À TABLE! table — Number: {code} → {url}',
  qrTitle: 'Scan to join',

  // Errors
  nameRequired: 'Please enter your first name.',
  codeRequired: 'Please enter the table number.',
  sessionNotFound: 'Table not found. Check the number.',
  sessionClosed: 'This table is already closed.',
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
  guideIntro: "No more 20-minute \"who's eating where\" debates. Everyone shares what they want, the app suggests 3 restaurants that work for the group.",
  guideHowTitle: 'How it works',
  guideHowOrganizer: [
    { title: 'Open a table', desc: 'open to all or invite-only, get a 4-digit number' },
    { title: 'Share the number', desc: 'via Teams, QR code, or direct link' },
    { title: 'Watch the waiting room', desc: 'see who has filled in their preferences' },
    { title: 'Launch the search', desc: 'get 3 restaurants that fit the group' },
  ],
  guideHowParticipant: [
    { title: 'Join', desc: 'with the number you received, or an open table shown in The buffets' },
    { title: 'Share your preferences', desc: 'cuisine, budget, allergies — skipped if "eating in"' },
    { title: 'Wait', desc: 'the screen updates itself, nothing to refresh' },
    { title: 'Check the results', desc: '3 restaurants, with address' },
  ],
  guideFeaturesTitle: 'Key features',
  guideFeatures: [
    { icon: '🔒', title: 'Open or invite-only', desc: 'An invite-only table is only visible with the number. An open table shows up in The buffets so anyone can join without one.' },
    { icon: '🍽️', title: 'Three meal modes', desc: 'Eating out, staying in, or eating on your own — everyone picks, only "eating out" joins the search.' },
    { icon: '⚠️', title: 'Allergies always respected', desc: 'Every suggested restaurant accounts for the allergies declared by the participants concerned.' },
    { icon: '💶', title: 'Most restrictive budget wins', desc: 'If the group has different budgets, the app keeps the lowest one so everyone is comfortable.' },
    { icon: '📋', title: 'My tables', desc: 'Your personal history of tables created or joined on this device. Tables from another day are automatically archived — a checkbox lets you show them again.' },
    { icon: '🌍', title: 'The buffets', desc: 'Open tables started by others right now — join one without a number.' },
    { icon: '🪑', title: 'One active table per day', desc: 'Once you already have a table today, the home screen shows "View my table" instead of "Set the table" / "I have the table number".' },
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
      severity: '🟡',
      title: 'AI-based budget/allergy filtering depends on a free quota',
      desc: 'When enabled, the AI (Groq, free) refines the 3 suggested restaurants based on the group\'s most restrictive budget and allergies. That free quota is limited.',
      mitigation: 'If the quota is exceeded or the service is unavailable, the app automatically falls back to its standard selection (cuisine + mode) — no visible error, just without that finer filtering that day.',
    },
    {
      severity: '🟢',
      title: 'No ratings, reviews, or photos',
      desc: 'Unlike Google Maps, a restaurant card only has name, cuisine, and address — whatever OpenStreetMap has, which varies by area.',
    },
    {
      severity: '🟢',
      title: 'No account, data tied to the device',
      desc: '"My tables" reads history stored in this browser. Switching devices loses that history — but a table number still works to join from anywhere.',
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
    { q: 'Can I change my preferences after submitting them?', a: 'Yes, as long as the organizer hasn\'t launched the search yet — via "My tables" or directly in the waiting room.' },
    { q: 'Who can see an invite-only table?', a: 'Only people who received the 4-digit number. It never shows up in "The buffets".' },
    { q: 'Are tables deleted automatically?', a: 'No — the data stays in the database indefinitely. A table from another day just disappears from view: hidden (archived) in "My tables", and removed from "The buffets" if it was open. Only "Close the table" (organizer) actually deletes one.' },
    { q: 'Can I open a second table the same day?', a: 'The home screen nudges you toward one active table per day and shows "View my table" once you have one. You can still join another with its number or from "The buffets" if needed.' },
  ],
  guideRoadmapTitle: 'Not yet planned',
  guideRoadmap: [
    'Authentication / user accounts',
    'Push notifications',
    'Table history beyond the current device',
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
