# Routing System Documentation

## Overview

This project now includes a comprehensive routing system with authentication guards that ensures proper access control to different parts of the application.

## Features

- **Authentication Guards**: Routes are protected based on user authentication status
- **Automatic Redirects**: Users are automatically redirected to appropriate pages
- **Loading States**: Smooth loading experiences while checking authentication
- **Error Handling**: Comprehensive error boundaries for better user experience
- **Intended Destination**: After login, users are redirected to their originally requested page

## Route Structure

### Public Routes

- `/login` - Login page (only accessible to unauthenticated users)

### Protected Routes

- `/dashboard` - Main dashboard (only accessible to authenticated users)
- `/` - Root path (redirects to dashboard)

### Catch-all

- `*` - Any unmatched route redirects to dashboard

## Components

### Core Components

#### `AuthProvider`

- Manages authentication state throughout the application
- Provides login/logout functions
- Handles token and user data storage

#### `ProtectedRoute`

- Guards routes that require authentication
- Redirects unauthenticated users to login
- Shows loading state while checking authentication

#### `PublicRoute`

- Guards routes that should only be accessible to unauthenticated users
- Redirects authenticated users to dashboard
- Useful for login page

#### `AppRouter`

- Main routing component
- Sets up all routes with appropriate guards
- Handles loading states

### Utility Components

#### `LoadingSpinner`

- Reusable loading component
- Configurable sizes and text
- Consistent loading experience

#### `ErrorBoundary`

- Catches and handles errors gracefully
- Provides user-friendly error messages
- Includes recovery options

## Hooks

### `useAuth()`

```typescript
const { isAuthenticated, user, isLoading, login, logout } = useAuth();
```

### `useAuthNavigation()`

```typescript
const { redirectToIntended, redirectToLogin, redirectToDashboard } =
  useAuthNavigation();
```

## Authentication Flow

1. **App Initialization**

   - `AuthProvider` checks localStorage for existing tokens
   - Sets authentication state accordingly
   - Shows loading state during check

2. **Unauthenticated User**

   - Can only access `/login`
   - Attempting to access protected routes redirects to login
   - Login form captures intended destination

3. **Login Process**

   - User submits credentials
   - On success, token and user data are stored
   - User is redirected to intended destination or dashboard

4. **Authenticated User**

   - Can access all protected routes
   - Attempting to access `/login` redirects to dashboard
   - Logout clears all authentication data

5. **Logout Process**
   - Clears token and user data
   - Redirects to login page
   - Resets authentication state

## Usage Examples

### Adding a New Protected Route

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Adding a New Public Route

```typescript
<Route
  path="/register"
  element={
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  }
/>
```

### Programmatic Navigation

```typescript
const { redirectToDashboard } = useAuthNavigation();

// Navigate to dashboard
redirectToDashboard();

// Navigate to login with return path
redirectToLogin("/dashboard");
```

## Security Features

- **Token Encryption**: Tokens are encrypted before storage
- **Route Protection**: All sensitive routes are automatically protected
- **Session Management**: Proper cleanup on logout
- **Error Boundaries**: Graceful error handling throughout the app

## Best Practices

1. **Always wrap protected content** with `ProtectedRoute`
2. **Use the auth context** instead of directly accessing storage
3. **Handle loading states** appropriately in your components
4. **Implement proper error handling** for authentication failures
5. **Test both authenticated and unauthenticated states**

## Troubleshooting

### Common Issues

1. **Infinite redirects**: Check that route guards are properly configured
2. **Authentication not persisting**: Verify localStorage is working in your browser
3. **Loading states not clearing**: Ensure authentication checks complete properly

### Debug Mode

Enable console logging in the auth context to debug authentication flow:

```typescript
console.log("Auth state:", { isAuthenticated, user, isLoading });
```
