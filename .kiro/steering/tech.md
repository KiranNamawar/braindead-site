# Technology Stack

## Core Framework
- **React Router v7** - Full-stack React framework with SSR enabled
- **React 19** - Latest UI library with concurrent features
- **TypeScript** - Type-safe JavaScript with strict mode
- **Vite 6** - Lightning-fast build tool and development server
- **Bun** - Fast JavaScript runtime and package manager

## Styling & UI
- **TailwindCSS v4** - Utility-first CSS framework with CSS variables
- **shadcn/ui** - Component library (New York style, neutral base color)
  - Full suite of components: Accordion, Alert, Button, Card, Dialog, Form, etc.
  - Consistent theming across all components
  - Accessible by default with proper ARIA attributes
- **Lucide React** - Consistent icon library
- **next-themes** - Dark/light theme management
- **Nunito Sans** - Primary font family for readability
- **Tailwind Variants** - Type-safe variant utilities for components

## Component Architecture
- **Radix UI Primitives** - Accessible, unstyled components
- **Class Variance Authority** - Type-safe component variants
- **clsx & tailwind-merge** - Conditional class name utilities
- **Sonner** - Toast notifications
- **React Hook Form** - Form validation and handling
- **Zod** - Schema validation for forms and data
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animation library for smooth transitions

## Build System & Configuration
- **ESM modules** (type: "module") for modern JavaScript
- **TypeScript** strict compilation with path mapping
- **Vite** with React Router plugin and TailwindCSS integration
- **Server-side rendering** enabled by default

## Development Commands

### Development
```bash
bun run dev          # Start development server (http://localhost:5173)
bun run typecheck    # Run TypeScript type checking with route generation
```

### Production
```bash
bun run build        # Build for production with SSR
bun run start        # Start production server
```

## Key Configuration Files
- `react-router.config.ts` - React Router configuration (SSR: true)
- `vite.config.ts` - Vite build configuration with plugins
- `tsconfig.json` - TypeScript configuration with path aliases
- `components.json` - shadcn/ui setup (New York style, neutral theme)
- `package.json` - Dependencies and scripts configuration

## Path Aliases (from components.json)
```typescript
"~/components" → app/components
"~/lib" → app/lib  
"~/components/ui" → app/components/ui
"~/hooks" → app/hooks
```

## Performance Optimizations
- **Server-side rendering** for optimal SEO and initial load
- **Code splitting** with React Router's built-in lazy loading
- **Tree shaking** with Vite's optimized bundling
- **CSS optimization** with TailwindCSS purging
- **Image optimization** for web formats

## SEO & Meta Management
- **React Router meta functions** for dynamic meta tags
- **Structured data** with JSON-LD
- **Sitemap generation** for search engines
- **Open Graph** and Twitter Card support
- **Core Web Vitals** optimization

## Accessibility Standards
- **WCAG 2.1 AA compliance** minimum requirement
- **Semantic HTML** structure throughout
- **Keyboard navigation** for all interactive elements
- **Screen reader compatibility** with proper ARIA labels
- **Focus management** with visible indicators
- **Color contrast** meeting accessibility standards

## Development Best Practices
- **Type safety** with strict TypeScript configuration
- **Component composition** over inheritance
- **Consistent naming** conventions across the codebase
- **Error boundaries** for graceful error handling
- **Performance monitoring** with Core Web Vitals
## Exte
rnal Libraries

### Data Processing
- **date-fns** - Modern JavaScript date utility library
- **lodash-es** - Utility library delivered as ES modules
- **nanoid** - Tiny, secure, URL-friendly unique string ID generator

### Form & Validation
- **React Hook Form** - Performant, flexible form validation
- **Zod** - TypeScript-first schema validation with static type inference

### Data Fetching & State
- **TanStack Query** (React Query) - Data fetching, caching, and state management
- **Zustand** - Small, fast state management solution

### Visualization & Media
- **Chart.js** with **react-chartjs-2** - Responsive chart components
- **react-dropzone** - HTML5 drag-and-drop zone for file uploads
- **react-pdf** - Display PDFs in React applications
- **sharp** (server-side) - High-performance image processing

### Utility Libraries
- **js-cookie** - Simple cookie handling
- **crypto-js** - JavaScript library of crypto standards
- **qrcode.react** - QR code generator for React
- **react-markdown** - Markdown component for React
- **prismjs** - Lightweight syntax highlighter
- **dompurify** - XSS sanitizer for HTML, MathML and SVG

### Search & Discovery
- **fuse.js** - Lightweight fuzzy-search library with zero dependencies
- **cmdk** - Command menu primitive used by shadcn/ui Command component
- **match-sorter** - Simple, expected, and deterministic best-match sorting
- **lunr** - Lightweight full-text search library for browser-based applications

### Animation & Interaction
- **Framer Motion** - Production-ready animation library
- **react-spring** - Spring-physics based animation library
- **use-gesture** - Drag, pinch, and other gesture interactions

### Testing Libraries
- **Vitest** - Vite-native test framework
- **Testing Library** - Simple and complete testing utilities
- **MSW** - API mocking library for browser and Node.js

### Accessibility
- **@axe-core/react** - Accessibility testing for React applications
- **focus-trap-react** - Trap focus for modal dialogs and other UI features## Compo
nent Implementation Patterns

### shadcn/ui Component Usage
- **Component Installation**: Use the shadcn CLI to add components as needed
  ```bash
  npx shadcn-ui@latest add button
  ```
- **Component Customization**: Modify components in `~/components/ui` directory
- **Composition Pattern**: Combine primitive components to build complex interfaces
- **Consistent Props**: Follow shadcn/ui prop patterns for all custom components

### Common Component Patterns
- **Layout Components**: Use composition with Card, Sheet, and AspectRatio
- **Form Patterns**: Combine Form, Input, Select with React Hook Form and Zod
- **Data Display**: Use DataTable with TanStack Table for complex data presentation
- **Navigation**: Implement Sidebar, NavigationMenu, and Breadcrumb for wayfinding
- **Feedback**: Implement Sonner toasts and Alert components for user notifications
- **Dialogs**: Use Dialog for confirmations and Sheet for mobile interactions

### Component Organization
- **UI Components**: Base shadcn components in `~/components/ui`
- **Composite Components**: Higher-level components in `~/components/[feature]`
- **Layout Components**: Page layouts in `~/components/layouts`
- **Feature Components**: Feature-specific components in `~/components/features`
- **Utility Components**: Reusable utility components in `~/components/utils`

### State Management with Components
- **Local State**: React useState for component-specific state
- **Form State**: React Hook Form for form state management
- **Global State**: Zustand for simple global state
- **Server State**: TanStack Query for remote data management