# Concierge - Personal Finance App

## Architecture Overview
This is a "Personal Finance Concierge" application built with React 19, Vite, and TypeScript. It uses Redux Toolkit for state management and Tailwind CSS for styling. The app interacts with a backend API for authentication and chat features (SSE).

## Tech Stack
- **Runtime/Package Manager**: Bun
- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Redux Toolkit (RTK)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (with interceptors for JWT)
- **Routing**: React Router v7

## Backend API
- **Base URL**: `http://localhost:8081`
- **Authentication**: Stateless JWT.
  - **Access Token**: Expires in 24h. Header: `Authorization: Bearer <token>`
  - **Refresh Token**: Expires in 7 days. Used to get new access tokens.
- **Endpoints**:
  - `POST /api/auth/register`: { email, password, firstName, lastName, phoneNumber }
  - `POST /api/auth/login`: { usernameOrEmail, password }
  - `POST /api/auth/refresh`: { refreshToken }
  - `GET /api/auth/me`: Get Profile
  - `POST /api/chat/message`: Send Message (SSE - text/event-stream)
  - `GET /api/chat/history/{userId}`: Get History

## Project Structure
```
src/
├── app/
│   ├── store.ts          # Redux store configuration
│   └── hooks.ts          # Typed useSelector/useDispatch
├── assets/
├── components/
│   ├── common/           # Reusable UI components (Button, Input, Card)
│   ├── layout/           # Layout components (Navbar, Sidebar, ProtectedRoute)
│   └── chat/             # Chat specific components (MessageBubble, ChatInput)
├── features/
│   ├── auth/
│   │   ├── authSlice.ts  # Redux slice for auth (user, token, status)
│   │   ├── authAPI.ts    # API calls for auth
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── chat/
│       ├── chatSlice.ts  # Redux slice for chat history
│       └── ChatPage.tsx
├── services/
│   ├── api.ts            # Axios instance with interceptors
│   └── sse.ts            # Helper for Server-Sent Events
├── utils/
│   └── validation.ts
├── App.tsx
└── main.tsx
```

## Key Implementation Details
1.  **API Client (`src/services/api.ts`)**:
    -   Axios instance.
    -   Request interceptor: Attaches `Authorization` header from Redux store/localStorage.
    -   Response interceptor: Handles 401s by calling `/api/auth/refresh` and retrying. Logs out on failure.

2.  **Authentication (`src/features/auth/authSlice.ts`)**:
    -   State: `user`, `accessToken`, `isAuthenticated`, `loading`, `error`.
    -   Actions: `login`, `register`, `logout`, `refreshToken`.
    -   Persistence: `refreshToken` in localStorage.

3.  **Chat Interface**:
    -   Uses `fetch` or `@microsoft/fetch-event-source` for SSE to support custom headers (Auth).
    -   Streams responses character-by-character or chunk-by-chunk.

## Development Workflow
- **Start dev server**: `bun run dev`
- **Build**: `bun run build`
- **Lint**: `bun run lint`

## UI/UX Guidelines
-   Use Tailwind CSS for a clean, modern "fintech" look (blues, whites, grays).
-   Ensure responsive design.
