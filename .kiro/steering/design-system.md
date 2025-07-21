# Design System Guidelines

## Visual Identity
- **Brand Personality**: Professional yet approachable, with subtle humor and personality
- **Color Scheme**: Neutral base (from shadcn/ui) with accent colors for utility categories
- **Typography**: Nunito Sans font family for consistency and excellent readability
- **Spacing**: Consistent spacing scale using Tailwind's 4px-based system
- **Tone**: Friendly, helpful, and occasionally witty without being unprofessional

## Color System
- **Base Colors**: Neutral palette from shadcn/ui (neutral base color)
- **Accent Colors**: Category-specific colors for visual organization
  - Text Tools: Blue variants
  - Developer Tools: Green variants  
  - Image Tools: Purple variants
  - Productivity: Orange variants
  - Fun Tools: Pink variants
- **Semantic Colors**: Success, warning, error, and info states
- **Theme Support**: Full dark/light mode compatibility with CSS variables

## Typography Scale
- **Font Family**: Nunito Sans (primary), system fallbacks
- **Heading Scale**: h1 (2.5rem) → h6 (1rem) with consistent line heights
- **Body Text**: 1rem base with 1.5 line height for optimal readability
- **Code Text**: Monospace font for technical content
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Component Standards
- **Foundation**: shadcn/ui components (New York style) as base layer
- **Consistency**: Uniform component APIs across all utilities
- **Composition**: Atomic design principles (atoms → molecules → organisms)
- **Theming**: All components support dark/light themes via CSS variables
- **Variants**: Use Class Variance Authority for type-safe component variants

## shadcn/ui Components

### Layout & Structure
- **Accordion**: Collapsible content sections for FAQs and instructions
- **AspectRatio**: Maintain consistent image ratios across the site
- **Card**: Container for utility tools and feature highlights
- **Collapsible**: Toggle visibility of content sections
- **Dialog**: Modal windows for important interactions
- **Drawer**: Side panels for additional options or information
- **Popover**: Contextual information and quick actions
- **ScrollArea**: Custom scrollbars for contained content areas
- **Separator**: Visual dividers between content sections
- **Sheet**: Slide-in panels for mobile navigation and settings
- **Sidebar**: Navigation structure for desktop layouts
- **Tabs**: Organize related content in the same view

### Navigation & Wayfinding
- **Breadcrumb**: Show navigation hierarchy for utility pages
- **Menubar**: Top-level navigation for desktop layouts
- **NavigationMenu**: Dropdown navigation for main categories
- **Pagination**: Navigate through multi-page results
- **Dropdown Menu**: Contextual actions and navigation options

### Input & Form Controls
- **Button**: Primary interaction element with consistent styling
- **Checkbox**: Selection controls for multiple options
- **Combobox**: Searchable dropdown selection
- **Command**: Command palette for power users
- **Form**: Structured data collection with validation
- **HoverCard**: Rich previews on hover
- **Input**: Text entry fields with consistent styling
- **InputOTP**: One-time password input for verification
- **Label**: Accessible form labels
- **RadioGroup**: Single-selection controls
- **Select**: Dropdown selection menus
- **Slider**: Range selection for numeric values
- **Switch**: Toggle controls for binary options
- **Textarea**: Multi-line text input
- **Toggle**: Binary state controls
- **ToggleGroup**: Related toggle buttons

### Feedback & Status
- **Alert**: Important messages and notifications
- **Alert Dialog**: Confirmation dialogs for critical actions
- **Badge**: Status indicators and labels
- **Progress**: Visual feedback for operations
- **Skeleton**: Loading state placeholders
- **Sonner**: Toast notifications for transient feedback
- **Tooltip**: Contextual help and information

### Data Display
- **Avatar**: User and entity representations
- **Calendar**: Date selection and display
- **Carousel**: Rotating content showcase
- **Chart**: Data visualization (using react-chartjs-2)
- **DataTable**: Sortable, filterable data grids
- **DatePicker**: Calendar-based date selection
- **Resizable**: User-adjustable panels
- **Table**: Structured data presentation

## Layout Patterns

### Homepage Layout
- **Hero Section**: Engaging headline with personality and clear value proposition
- **Search Bar**: Prominent, accessible search with real-time suggestions
- **Utility Grid**: Organized by categories with visual hierarchy
- **Footer**: Links, credits, and additional navigation

### Utility Page Layout
- **Header**: Consistent navigation with breadcrumbs and theme toggle
- **Tool Interface**: Clean, focused design with clear input/output areas
- **Instructions**: Helpful guidance without cluttering the interface
- **Footer**: Consistent across all pages

### Responsive Breakpoints
- **Mobile First**: Design for mobile, enhance for larger screens
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Targets**: Minimum 44px for mobile accessibility
- **Content Flow**: Logical reflow at each breakpoint

## Interaction Patterns
- **Real-time Processing**: Immediate feedback where possible
- **Loading States**: Clear indicators for processing operations
- **Error Handling**: Helpful, actionable error messages
- **Success States**: Positive feedback for completed actions
- **Hover Effects**: Subtle animations for better user experience

## Accessibility Requirements
- **WCAG 2.1 AA Compliance**: Minimum standard for all components
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Readers**: Proper ARIA labels, roles, and descriptions
- **Color Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus rings for all focusable elements
- **Motion Preferences**: Respect prefers-reduced-motion settings

## Content Guidelines
- **Microcopy**: Clear, helpful, and occasionally humorous
- **Instructions**: Concise but complete guidance for each tool
- **Error Messages**: Specific, actionable, and friendly
- **Placeholder Text**: Helpful examples that guide usage
- **Button Labels**: Action-oriented and descriptive

## Performance Standards
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Optimized web fonts with display: swap
- **CSS**: Minimal custom CSS, leverage Tailwind utilities
- **JavaScript**: Code splitting and lazy loading for utilities

## SEO Standards
- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **Meta Tags**: Unique titles and descriptions for each page
- **Open Graph**: Social sharing optimization
- **Structured Data**: JSON-LD markup for rich snippets
- **URL Structure**: Clean, descriptive URLs for all utilities
- **Internal Linking**: Logical navigation and related tool suggestions