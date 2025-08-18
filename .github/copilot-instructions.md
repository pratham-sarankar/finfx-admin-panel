# FinFX Admin Panel Development Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Overview

FinFX Admin Panel is a React + TypeScript + Vite web application built for financial administration. The application features a modern tech stack with authentication guards, user management, dashboard analytics, and responsive design.

## Working Effectively

### Initial Setup and Dependencies
- **CRITICAL**: Install Node.js 20.x or later before starting
- **Install pnpm globally**: `npm install -g pnpm`
- **Install dependencies**: `pnpm install` -- takes ~15 seconds. NEVER CANCEL.
- **Build the application**: `pnpm run build` -- takes ~15 seconds. NEVER CANCEL. Set timeout to 60+ minutes to be safe.
- **Start development server**: `pnpm run dev` -- starts in ~560ms on http://localhost:5173/
- **Preview built application**: `pnpm run preview` -- serves built app on http://localhost:4173/

### Development Workflow Commands
- `pnpm run dev` -- Start development server with hot module replacement
- `pnpm run build` -- Build for production (TypeScript compilation + Vite build)
- `pnpm run preview` -- Preview the built application locally
- `pnpm run lint` -- Run ESLint (expect some Fast Refresh warnings in UI components - these are acceptable)

### Critical Build Timing and Requirements
- **NEVER CANCEL builds or long-running commands** 
- **pnpm install**: ~15 seconds (set 120+ second timeout)
- **pnpm run build**: ~15 seconds (set 300+ second timeout)
- **pnpm run dev**: ~560ms startup time
- **All commands must complete fully** - do not interrupt them

## Application Architecture

### Tech Stack
- **Frontend**: React 19.x + TypeScript 5.x
- **Build Tool**: Vite 7.x with Fast Refresh
- **Styling**: Tailwind CSS v4 + Radix UI components  
- **Routing**: React Router v7 with authentication guards
- **State Management**: React Context (AuthProvider)
- **Icons**: Tabler Icons + Lucide React
- **Package Manager**: pnpm (NOT npm or yarn)

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI + Tailwind components
│   ├── app-router.tsx  # Main routing configuration
│   ├── login-form.tsx  # Authentication form
│   └── nav-*.tsx       # Navigation components
├── pages/              # Route-specific pages
│   ├── home/           # Dashboard with analytics
│   ├── users/          # User management
│   └── login/          # Login page
├── contexts/           # React Context providers
│   └── auth-context.tsx # Authentication state management
├── services/           # API service layer
│   └── auth.ts         # Authentication API calls
├── lib/                # Utility libraries
│   ├── storage.ts      # Encrypted localStorage wrapper
│   └── utils.ts        # Common utility functions
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── hooks/              # Custom React hooks
```

## Authentication System

### How Authentication Works
1. **Application startup**: Checks localStorage for existing JWT token
2. **Unauthenticated users**: Redirected to `/login` page
3. **Login process**: Makes API call to `http://localhost:3000/api/auth/login`
4. **Authenticated users**: Can access protected routes (`/`, `/users`)
5. **Token storage**: Encrypted in localStorage with basic encryption

### Backend Dependency
- **CRITICAL**: The application expects a backend API at `http://localhost:3000/api`
- **Login endpoint**: `POST /auth/login` with `{email, password}`
- **Without backend**: Login will fail with connection refused error (expected behavior)
- **Environment variable**: `VITE_API_BASE_URL` can override the API base URL

### Test Authentication
- **Frontend-only testing**: Use browser dev tools to manually set auth tokens in localStorage
- **With backend**: Ensure backend is running on port 3000 before testing login

## Validation and Testing

### Manual Validation Requirements
**ALWAYS run through these scenarios after making changes:**

1. **Application startup**: 
   - Navigate to `http://localhost:5173/`
   - Verify redirect to `/login` page
   - Check that login form displays correctly

2. **Authentication flow**:
   - Try login with any credentials (expect API connection error)
   - Verify error handling displays properly
   - Check browser console for expected connection errors

3. **Route protection**:
   - Test direct navigation to protected routes
   - Verify unauthenticated users are redirected to login

4. **Theme and UI**:
   - Application uses dark theme by default
   - Verify responsive design works on different screen sizes
   - Check that all UI components render correctly

### Build Validation
- **ALWAYS build and test your changes**: Run `pnpm run build` after any code modifications
- **Preview validation**: Run `pnpm run preview` to test the built application
- **Lint validation**: Run `pnpm run lint` - some Fast Refresh warnings are acceptable
- **NEVER skip builds** - build errors indicate TypeScript or bundling issues

### Common Validation Issues
- **TypeScript errors**: Usually unused imports or type mismatches
- **Build failures**: Check for syntax errors or missing dependencies
- **Login failures**: Expected when backend is not running (connection refused)
- **Lint warnings**: Fast Refresh warnings in UI components are acceptable

## Development Environment

### File System Requirements
- **Use absolute paths**: Always reference files with full paths from repository root
- **Path aliasing**: Use `@/` prefix for src directory imports (configured in tsconfig.json)
- **Component imports**: Import UI components from `@/components/ui/`

### Environment Configuration
- **API Base URL**: Set `VITE_API_BASE_URL` environment variable if backend is not on localhost:3000
- **Development port**: Default is 5173, configurable in vite.config.ts
- **Preview port**: Default is 4173 for built application preview

### Key Configuration Files
- `package.json` - Scripts and dependencies
- `vite.config.ts` - Vite build configuration with React and Tailwind plugins
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.js` - ESLint configuration for React + TypeScript
- `components.json` - Shadcn/UI component configuration
- `tailwind.config.js` - Tailwind CSS configuration (auto-generated)

## Common Development Tasks

### Adding New Features
1. **Always run dev server first**: `pnpm run dev`
2. **Use existing patterns**: Follow authentication guard patterns for new routes
3. **UI components**: Use Radix UI components from `@/components/ui/`
4. **Styling**: Use Tailwind CSS classes, follow existing component patterns
5. **Type safety**: Add TypeScript types in `src/types/` directory

### Debugging Issues
1. **Build first**: Run `pnpm run build` to catch TypeScript errors
2. **Check browser console**: Development server provides detailed error messages
3. **Authentication issues**: Check localStorage for tokens and user data
4. **API issues**: Expected connection errors when backend is not running
5. **Routing issues**: Verify routes are properly wrapped with authentication guards

### Code Quality
- **ALWAYS run linting**: `pnpm run lint` before committing changes
- **TypeScript strict mode**: Fix all TypeScript errors before building
- **Component patterns**: Follow existing component structure and naming
- **Import organization**: Use consistent import ordering and aliasing

## Important File Locations

### Core Application Files
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root component with providers
- `src/components/app-router.tsx` - Main routing configuration
- `src/contexts/auth-context.tsx` - Authentication state management

### Key Components
- `src/components/app-sidebar.tsx` - Main navigation sidebar
- `src/components/nav-user.tsx` - User profile dropdown
- `src/components/login-form.tsx` - Authentication form
- `src/components/protected-route.tsx` - Route protection wrapper

### Page Components
- `src/pages/home/` - Dashboard with analytics and charts
- `src/pages/users/` - User management with data tables
- `src/pages/login/` - Login page component

### API and Services
- `src/services/auth.ts` - Authentication API service
- `src/config/api.ts` - API configuration and endpoints
- `src/lib/storage.ts` - Encrypted localStorage management

## Troubleshooting

### Build Issues
- **TypeScript errors**: Check for unused imports, missing types, or syntax errors
- **Vite build failures**: Verify all dependencies are installed and compatible
- **Import errors**: Check path aliases and ensure files exist

### Runtime Issues  
- **Authentication loops**: Check localStorage corruption or token format issues
- **API connection errors**: Expected when backend is not running (normal for frontend-only dev)
- **Routing issues**: Verify route guards and navigation components

### Development Server Issues
- **Port conflicts**: Change port in vite.config.ts if 5173 is occupied
- **Hot reload failures**: Restart dev server if changes aren't reflecting
- **Memory issues**: Restart if build becomes slow or fails

## Important Notes

- **Package Manager**: ALWAYS use pnpm, not npm or yarn
- **Node Version**: Requires Node.js 20.x or later
- **Backend Dependency**: Application expects backend API but can run frontend-only
- **Theme**: Default dark theme, uses next-themes for theme management
- **Icons**: Combination of Tabler Icons and Lucide React icons
- **Responsive**: Designed for desktop admin use but includes mobile responsive design
- **Authentication**: JWT-based with encrypted localStorage persistence

## Expected Command Outputs

### Successful Build
```
> tsc -b && vite build
✓ built in [time]s
```

### Successful Dev Server Start
```
VITE v7.1.2  ready in [time]ms
➜  Local:   http://localhost:5173/
```

### Expected API Error (Normal)
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
http://localhost:3000/api/auth/login
```

This error is expected when backend is not running and indicates the frontend is correctly configured.