# White Label Studio - Web Reference

This document describes the currently implemented React + Vite web app. Implementation rules live in
`apps/web-app/docs/FRONTEND_GUIDE.md`.

## Stack

| Area | Current implementation |
|------|------------------------|
| App runtime | React 19 with Vite 8 |
| Routing | TanStack Router file-based routing |
| Server cache | TanStack React Query |
| Local app state | Zustand |
| HTTP client | Axios through `utils/hooks/Api` |
| Runtime contracts | Zod schemas with derived TypeScript types |
| Forms | React Hook Form with Zod validation |
| Styling | Tailwind CSS through `@tailwindcss/vite` |

## Commands

```bash
npm --workspace @white-label/web-app run start:dev
npm --workspace @white-label/web-app run build
npm --workspace @white-label/web-app run lint
npm --workspace @white-label/web-app run preview
npm --workspace @white-label/web-app run pretty
```

## Routes

Routes are owned by `apps/web-app/src/routes` and composed from feature modules under
`apps/web-app/src/modules`.

| Path | Route file | Module | Access | Current behavior |
|------|------------|--------|--------|------------------|
| `/` | `src/routes/index.tsx` | `Login` / `Dashboard` | Public / Authenticated | Renders Login when `isAuthenticated` is `false`; renders Dashboard inside `AppWrapper` when `true`. |
| `/accounts` | `src/routes/accounts/index.tsx` | `Account` | Authenticated shell | Renders Login when unauthenticated; otherwise renders Account profile inside `AppWrapper` and fetches `GET /api/v1/auth/profile`. |
| `/settings` | `src/routes/settings/index.tsx` | `Settings` | Authenticated shell | Renders Login when unauthenticated; otherwise renders a generic Settings placeholder inside `AppWrapper`. |

### Root Layout

`src/routes/__root.tsx` defines the root route with a router context containing a React Query
`QueryClient`. The layout renders `ScrollToTop` and the active child route through `Outlet`.

### Authenticated Shell

`ui/layouts/AppWrapper` composes the post-login chrome:

- `ui/partials/Navbar` - full-height sidebar with Dashboard, Account, Settings, and theme toggle.
- `ui/partials/Header` - slim top bar with a placeholder global action.
- `main` - renders the active route's content.

The shell does not yet hydrate profile data globally or apply route guards beyond each route's
current provider-auth branch.

## Login Flow

| Concern | Current behavior |
|---------|------------------|
| Route | `/` |
| Container | `src/modules/Login/containers/Login.tsx` |
| Form | `src/modules/Login/forms/LoginForm.tsx` |
| Hook | `src/modules/Login/hooks/useLogin.ts` |
| Request DTO | `src/modules/Login/dtos/login.dto.ts` |
| Response DTO | `src/modules/Login/dtos/loginResponse.dto.ts` |
| API endpoint | `POST /api/public/auth/login` |
| Refresh endpoint | `POST /api/v1/auth/refresh-token` |

Successful login expects `data.access_token`; remembered logins also expect `data.refresh_token`.
Tokens are stored in JavaScript-managed cookies through `utils/helpers/authCookies`.

## Account Profile

| Concern | Current behavior |
|---------|------------------|
| Route | `/accounts` |
| Container | `src/modules/Account/containers/Account.tsx` |
| Hooks | `useGetProfile`, `useUpdateProfile`, `useChangePassword` |
| API endpoints | `GET /api/v1/auth/profile`, `PATCH /api/v1/auth/profile`, `PATCH /api/v1/auth/profile/change-password` |

The page displays profile details, supports editable profile fields, avatar upload through the
storage helper, password change, dirty-state handling, and a page-specific skeleton loader.

## API Wrapper

Frontend HTTP calls should use `src/utils/hooks/Api.tsx`. The wrapper reads
`import.meta.env.VITE_APP_END_POINT`, applies JSON headers, serializes query strings with
`query-string`, normalizes errors, and returns response data by default.

## App State

`src/utils/providers/Provider.tsx` exposes a lightweight Zustand store for:

| State | Notes |
|-------|-------|
| `isAuthenticated` | Initializes from the access-token cookie. |
| `theme` | Persisted UI theme; applied to `document.documentElement.dataset.theme`. |

Server-owned data belongs in React Query, not provider state.

## Responsive QA

For visible frontend changes, check mobile, tablet, and desktop widths. At minimum verify
`375x812`, `390x844`, `768x1024`, and `1280x800` when the change affects layout.
