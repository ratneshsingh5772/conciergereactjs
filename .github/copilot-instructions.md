# Concierge - Personal Finance App

## Project Context
- **Application**: Personal Finance Dashboard & Chat Concierge
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Runtime**: Bun
- **Styling**: Tailwind CSS v4 (using `@theme` and `@plugin` directives)
- **State**: Redux Toolkit (RTK) with `createSlice` and `createAsyncThunk`

## Architecture & Core Patterns

### 1. Authentication & Security
- **Stateless JWT Flow**: 
  - Access Token (short-lived) stores in **Redux state** (`auth.accessToken`).
  - Refresh Token (long-lived) stores in **localStorage** and/or **cookies** (check `authSlice.ts`).
- **Axios Interceptors** (`src/services/api.ts`):
  - **Request**: Automatically injects `Authorization: Bearer <token>` from Redux store.
  - **Response**: Intercepts `401 Unauthorized` responses to attempt a silent token refresh using `/api/auth/refresh`.

### 2. API Data Fetching
- **Central Client**: Always use the axios instance from `@/services/api`.
- **Service Layers**: Feature-specific API calls reside in `features/<feature>/<feature>API.ts`.
- **Response Handling**: Unwrap data in the API helper function, returning typed objects (e.g., `Promise<User>`) rather than the full Axios response.

### 3. State Management (Redux)
- **Structure**: Feature-based slices (`authSlice`, `dashboardSlice`).
- **Async Logic**: Use `createAsyncThunk` for API interactions.
- **Typing**: Use pre-typed hooks `useAppDispatch` and `useAppSelector` from `src/app/hooks.ts`.

### 4. Component Structure
- **Atomic Design Lite**:
  - `components/common`: Generic, reusable UI atoms (Buttons, Modals, Inputs).
  - `components/layout`: Structural frames (Sidebar, Navbar).
  - `features/**`: Domain-specific smart components and pages.
- **Routing**: `react-router-dom` v7.

## Development Workflow
- **Package Manager**: Use `bun` for all commands.
  - Install: `bun install`
  - Dev: `bun run dev`
  - Build: `bun run build`
  - Lint: `bun run lint` (ESLint 9)

---

## ⚠️ Critical API Refactoring Requirement

**Status**: Active Migration
**Goal**: All Analytics endpoints must be user-scoped to support multi-user data isolation and admin auditing.

### Context
Current implementation fetches global or implicitly scoped analytics (e.g., `/analytics/summary`). This needs to be changed to explicit user-based paths or query parameters to ensure we are fetching the *correct* user's data, especially for potential admin functionalities.

### Required Changes for Agents
When working on `src/features/analytics/analyticsAPI.ts`, follow this migration pattern:

**Current Implementation (Deprecated)**:
```typescript
// GET /analytics/daily-trend
export const fetchDailyTrend = async (days: number) => { ... }
```

**Target Implementation (Required)**:
```typescript
// GET /api/users/{userId}/analytics/trend?days=10
export const fetchDailyTrend = async (userId: string, days: number) => {
  const response = await api.get<DailyTrend[]>(`/users/${userId}/analytics/trend?days=${days}`);
  return response.data;
};
```

**Implementation Checklist**:
1.  **Update API Functions**: Modify functions in `analyticsAPI.ts` to accept `userId` as the first argument.
2.  **Update Config**: If the backend endpoints have changed, update the URL paths to match the accepted pattern (likely `/users/:id/...` or `/analytics?userId=:id`).
3.  **Update Components**: In `AnalyticsPage.tsx`, retrieve the current `userId` from the Redux auth state (`state.auth.user.id`) and pass it to the thunks/API calls.
4.  **Verify Backend Contract**: Ensure the backend supports these new routes/params before finalizing frontend changes.

## Common Pitfalls
- **Relative Imports**: Use relative imports (e.g., `../../services/api`) as path aliases are not currently configured in `vite.config.ts`.
- **Tailwind v4**: Note that Tailwind v4 configuration differs from v3. Do not look for `tailwind.config.js`; configuration is often in CSS or Vite config.
