# White Label Studio - Content & Features

This document owns retained starter behavior. Schema details live in `SYSTEM_ARCHITECTURE.md`;
implemented route behavior lives in `API_REFERENCE.md` and `WEB_REFERENCE.md`.

## Current Implementation Status

The repo implements a neutral auth/access foundation: custom JWT auth, refresh-token rotation,
users, roles, permission resources, role-permission grants, authenticated profile read/update,
password change, a generic dashboard, a settings placeholder, and shared UI utilities.

Removed source-project domains include clients, boards, tickets, portals, notifications, settings
catalogs, automations, and workflow dashboards.

## Authentication & Users

- Users authenticate through the web app login entry point backed by the API.
- Successful login returns a bearer token and optionally a refresh token for remembered sessions.
- Refresh tokens are stored only as hashes in `user_tokens` and rotate on use.
- Admin-created users can start in `PENDING`; only `ACTIVE` users can log in.
- Inactive users cannot log in, but retained history can still reference them.
- User management is permission-gated through `AUTH_USERS`.
- The current API profile read, editable profile update, and password change routes are implemented.

## Roles & Permissions

- Each user has one role.
- A role grants actions on permission resources defined in `docs/PERMISSION.md`.
- The backend enforces permissions on protected routes with `@Permission()` metadata.
- The frontend can read the authenticated role's permission grants from the profile permission route
  when future product controls need conditional rendering.

## Web App Surfaces

- `/` renders Login when unauthenticated and Dashboard inside `AppWrapper` when authenticated.
- `/accounts` renders the authenticated Account profile surface.
- `/settings` renders a generic authenticated Settings placeholder.
- The app shell provides sidebar navigation, header, theme toggle, mobile sidebar behavior, and
  shared layout primitives.

## Extension Points

Future product domains should add:

- Shared Zod contracts only when more than one workspace consumes the contract.
- API modules under `apps/api-service/src/modules/<domain>/`.
- Web feature modules under `apps/web-app/src/modules/<Feature>`.
- Route documentation in `API_REFERENCE.md` and `WEB_REFERENCE.md` as routes ship.
- Database migrations as new timestamped files under `supabase/migrations/`.
