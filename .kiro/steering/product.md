# Product Overview

**braindead.site** is a modern web utilities platform that provides simple, everyday tools in one convenient location. Built as a full-stack React Router v7 application with a focus on user experience, performance, and accessibility.

## Vision
Create a comprehensive collection of web utilities with an engaging, funny homepage that makes mundane tasks enjoyable.

## Core Principles
- **Simplicity First** - Each tool does one thing exceptionally well
- **No Registration Required** - Instant access to all utilities
- **Privacy Focused** - Client-side processing when possible
- **Mobile Optimized** - Touch-friendly interfaces for all devices
- **Fast & Reliable** - Sub-second load times and offline capability

## Key Features
- **Web Utilities Collection** - Simple everyday tools for common tasks
- **Engaging Homepage** - Funny, memorable landing experience with personality
- **Intuitive Search & Navigation** - Easy discovery with smart categorization (using Command component)
- **Responsive Design** - Works perfectly on all devices and screen sizes
- **Accessibility First** - WCAG 2.1 AA compliant, inclusive design with shadcn/ui components
- **SEO Optimized** - Server-side rendering with proper meta tags and structured data
- **Consistent Styling** - Unified design system across all utilities using shadcn/ui
- **Modern Tech Stack** - React Router v7, TypeScript, shadcn/ui, TailwindCSS v4
- **Optimized Libraries** - Leveraging best-in-class external libraries for specific functionality
- **Component-Driven UI** - Built with reusable, accessible shadcn/ui components

## Target Audience
- **Developers** - Quick tools for encoding, formatting, and debugging
- **Content Creators** - Text manipulation, image processing, and generators
- **Students & Professionals** - Calculators, converters, and productivity tools
- **General Users** - Fun utilities and everyday problem solvers

## Success Metrics
- **User Engagement** - Time spent on site and tool usage frequency
- **Performance** - Core Web Vitals scores and load times
- **Accessibility** - WCAG compliance and screen reader compatibility
- **SEO Performance** - Search rankings and organic traffic growth

## Target Deployment
Deployed on **braindead.site** using Netlify with optimized SEO, CDN distribution, and automatic deployments.##
 Component Implementation Strategy

### Core UI Components
We use the complete shadcn/ui component library to ensure consistency and accessibility across the platform:

- **Navigation**: NavigationMenu, Sidebar, Breadcrumb, and Tabs for intuitive wayfinding
- **Content Display**: Card, AspectRatio, and Carousel for presenting utilities and information
- **User Input**: Form, Input, Select, and other form controls with React Hook Form integration
- **Feedback**: Alert, Toast notifications via Sonner, and Dialog for important messages
- **Data Visualization**: DataTable and Chart components for data-heavy utilities

### External Library Integration
Each utility category leverages specialized libraries:

- **Text Tools**: react-markdown, prismjs for syntax highlighting, dompurify for sanitization
- **Developer Tools**: prettier for code formatting, crypto-js for encryption utilities
- **Image Tools**: react-image-crop, browser-image-compression, qrcode.react
- **Productivity Tools**: date-fns for date manipulation, mathjs for calculations
- **Fun Tools**: faker for random data generation, canvas-confetti for visual effects

### Component Organization
- **Utility Components**: Each utility is a self-contained component with its own directory
- **Shared Components**: Common UI patterns are abstracted into shared components
- **Layout Templates**: Consistent layouts for different utility categories
- **Theme Components**: Dark/light mode with consistent styling across all components