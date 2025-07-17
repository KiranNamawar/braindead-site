// Application constants
export const APP_CONFIG = {
  name: 'BrainDead.site',
  description: 'Premium utility tools for effortless productivity',
  version: '2.0.0',
  author: 'BrainDead.site Team',
  url: 'https://braindead.site',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  supportedTextTypes: ['text/plain', 'application/json', 'text/csv'],
  maxToolsInRecent: 20,
  maxFavorites: 50,
  maxSearchHistory: 50,
  searchDebounceMs: 300,
  animationDuration: 200,
} as const;

export const STORAGE_KEYS = {
  calculatorHistory: 'calculator-history',
  colorHistory: 'color-history',
  passwordHistory: 'password-history',
  qrHistory: 'qr-history',
  tipCalculatorHistory: 'tip-calculator-history',
  ageCalculatorHistory: 'age-calculator-history',
  bmiCalculatorHistory: 'bmi-calculator-history',
  loanCalculatorHistory: 'loan-calculator-history',
  percentageCalculatorHistory: 'percentage-calculator-history',
  gradeCalculatorHistory: 'grade-calculator-history',
  gradientHistory: 'gradient-history',
  asciiArtHistory: 'ascii-art-history',
  faviconHistory: 'favicon-history',
  userPreferences: 'braindead-user-preferences',
  toolUsage: 'braindead-tool-usage',
  analytics: 'braindead-analytics',
  favorites: 'braindead-favorites',
  recentTools: 'braindead-recent-tools',
  searchHistory: 'braindead-search-history',
  sharedClipboard: 'braindead-shared-clipboard',
  toolConfigs: 'braindead-tool-configs',
  pomodoroSettings: 'pomodoro-settings',
  pomodoroHistory: 'pomodoro-history',
  pomodoroStats: 'pomodoro-stats',
  worldClockTimezones: 'world-clock-timezones',
  worldClockFormat: 'world-clock-format',
  worldClockShowSeconds: 'world-clock-show-seconds',
  stopwatchHistory: 'stopwatch-history',
  timerHistory: 'timer-history',
  timerSoundEnabled: 'timer-sound-enabled',
  countdownEvents: 'countdown-events',
} as const;

export const ERROR_MESSAGES = {
  fileTooBig: `File size must be less than ${APP_CONFIG.maxFileSize / 1024 / 1024}MB`,
  unsupportedFileType: 'Unsupported file type',
  invalidInput: 'Invalid input provided',
  networkError: 'Network error occurred',
  clipboardError: 'Failed to copy to clipboard',
  storageError: 'Failed to save data',
} as const;

export const SUCCESS_MESSAGES = {
  copied: 'Copied to clipboard!',
  saved: 'Data saved successfully',
  generated: 'Generated successfully',
  converted: 'Conversion completed',
  downloaded: 'File downloaded',
} as const;

export const LIMITS = {
  maxHistoryItems: 50,
  maxPasswordLength: 128,
  maxTextLength: 1000000, // 1MB of text
  maxQRTextLength: 4296,
  calculatorPrecision: 15,
} as const;