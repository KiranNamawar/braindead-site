# Web Utilities Guidelines

## Utility Categories

### Text Tools
- **Text Manipulation**: Case conversion, text cleaning, word/character counting (using `lodash-es`)
- **Formatting**: Markdown conversion (using `react-markdown`), text alignment, line operations
- **Encoding/Decoding**: Base64, URL encoding, HTML entities, Unicode (using `js-base64`, `he`)
- **Text Generation**: Lorem ipsum (using `lorem-ipsum`), random text, placeholder content
- **Syntax Highlighting**: Code formatting with themes (using `prismjs`, `highlight.js`)

### Developer Tools
- **JSON**: Formatting, validation, minification, conversion (using `json5`, `jsonlint`)
- **URL Tools**: Encoding/decoding, parsing (using `query-string`)
- **Regex Tools**: Pattern matching, replacement, validation (using `xregexp`)
- **Color Tools**: Color conversion, color palettes, gradients (using `colord`, `chroma-js`)
- **JWT Tools**: Token generation, verification, decoding (using `jose`, `jwt-decode`)
- **Hash Generation**: MD5, SHA-1, SHA-256, bcrypt (using `crypto-js`, `bcryptjs`)
- **Code Formatting**: HTML, CSS, JavaScript beautification (using `prettier`)
- **API Testing**: Request builders, response formatters (using `axios`, `msw` for mocking)

### Image Tools
- **Format Conversion**: JPEG, PNG, WebP, SVG conversion (using `sharp` server-side, `browser-image-compression` client-side)
- **Basic Processing**: Resize, crop, rotate, flip (using `react-image-crop`)
- **Optimization**: Compression, quality adjustment (using `imagemin` plugins)
- **Metadata**: EXIF data viewing and removal (using `exif-js`)
- **Generation**: Placeholder images, QR codes (using `qrcode.react`, `placeholder.js`)

### Productivity Tools
- **Calculators**: Basic, scientific, unit conversion, percentage (using `mathjs`)
- **Converters**: Currency (using `currency.js`), units (using `convert-units`), time zones (using `date-fns-tz`), number bases
- **Generators**: Passwords (using `generate-password`), UUIDs (using `nanoid`, `uuid`), color palettes (using `colord`)
- **Time Tools**: Timestamp conversion, date formatting, duration calculation (using `date-fns`, `dayjs`)

### Fun Tools
- **Random Generators**: Names, quotes, jokes, decisions (using `chance.js`, `faker`)
- **Games**: Simple puzzles, word games, brain teasers (using `react-confetti`, `canvas-confetti`)
- **Entertainment**: Meme generators (using `react-meme-generator`), ASCII art (using `figlet`), text effects (using `animate.css`)
- **Novelty**: Fake data generators (using `@faker-js/faker`), random facts (using public APIs)

## Utility Development Standards

### Core Principles
- **Single Purpose**: Each utility focuses on one specific task
- **Self-Contained**: No dependencies between utilities
- **Consistent Interface**: Uniform input/output patterns
- **Real-Time Processing**: Immediate feedback without submit buttons
- **Error Resilience**: Graceful handling of invalid inputs
- **Leverage Libraries**: Use established libraries for complex functionality

### Technical Requirements
- **Client-Side Processing**: Preferred for privacy and performance
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Responsive Design**: Touch-friendly on all devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Sub-100ms response times for most operations

### User Experience Standards
- **Clear Instructions**: Brief, helpful guidance for each tool
- **Example Usage**: Sample inputs to demonstrate functionality
- **Copy/Share Features**: Easy result copying and sharing
- **Undo/Reset**: Quick way to clear inputs and start over
- **Related Tools**: Suggestions for complementary utilities

## Search & Discovery Features

### Search Functionality
- **Command Component**: Using shadcn/ui Command component for a modern command palette interface
- **Fuzzy Search**: Typo-tolerant utility name matching (using `fuse.js` for fuzzy search)
- **Keyboard Navigation**: Accessible search with keyboard shortcuts (Ctrl+K / Cmd+K)
- **Keyword Search**: Search by functionality and use cases
- **Category Filtering**: Browse by utility type
- **Tag System**: Multiple tags per utility for better discovery
- **Search History**: Recent searches saved for quick access

### User Personalization
- **Recently Used**: Quick access to frequently used tools
- **Favorites**: Bookmark preferred utilities
- **Usage History**: Track tool usage patterns
- **Custom Collections**: User-created utility groups

### Recommendation Engine
- **Related Tools**: Suggest complementary utilities
- **Popular Tools**: Highlight trending utilities
- **Contextual Suggestions**: Based on current tool usage
- **New Tool Notifications**: Alert users to recently added utilities

## Performance & Technical Requirements

### Loading & Rendering
- **Lazy Loading**: Load utility components on demand
- **Code Splitting**: Separate bundles for each utility category
- **Minimal Bundle Size**: < 50KB per utility including dependencies
- **Fast Initial Load**: Homepage loads in < 1 second

### Processing Requirements
- **Client-Side First**: Process data locally when possible
- **Web Workers**: Use for heavy computations to avoid UI blocking
- **Streaming**: Handle large files with streaming processing
- **Memory Management**: Efficient handling of large inputs

### Caching & Offline
- **Service Worker**: Cache utilities for offline use
- **Local Storage**: Remember user preferences and recent inputs
- **CDN Optimization**: Fast asset delivery globally
- **Browser Caching**: Appropriate cache headers for static assets

## Quality Assurance Standards

### Testing Requirements
- **Unit Tests**: Core functionality for each utility
- **Integration Tests**: User interaction flows
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Performance Tests**: Load time and processing speed benchmarks

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Feature Detection**: Use feature detection over browser detection

### Security Considerations
- **Client-Side Processing**: Avoid sending sensitive data to servers
- **Input Sanitization**: Prevent XSS and injection attacks
- **Content Security Policy**: Strict CSP headers
- **Privacy First**: No tracking or data collection without consent