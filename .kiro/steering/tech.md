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
- **Lucide React** - Consistent icon library
- **next-themes** - Dark/light theme management
- **Nunito Sans** - Primary font family for readability

## Component Architecture
- **Radix UI Primitives** - Accessible, unstyled components
- **Class Variance Authority** - Type-safe component variants
- **clsx & tailwind-merge** - Conditional class name utilities
- **Sonner** - Toast notifications

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