# Mobile Guide

Implementation rules for the White Label Studio Expo app. Product context lives in the root `docs/`
directory; this guide covers mobile structure, auth, data fetching, conventions, and validation.
Use `../../../docs/API_REFERENCE.md` for the API routes the app calls.

## Stack

- Expo SDK 58 (React Native 0.88, React 19)
- Expo Router file-based routing (routes in `src/app/`)
- TypeScript strict mode
- TanStack React Query
- React Hook Form + Zod
- `expo-secure-store` for auth tokens
- `fetch` for HTTP (no Axios)
- `@white-label/shared` for API contracts
- npm workspaces (install from the repository root)

Expo ships breaking changes every SDK release. Before touching an Expo or React Native API, read the
`expo` major version in `package.json` and check the matching docs at
`https://docs.expo.dev/versions/v<major>.0.0/`. Do not rely on memory.

## Setup

```bash
# from the repository root, on Node 26 (see .nvmrc)
nvm use
npm install
cp apps/mobile-app/.env.example apps/mobile-app/.env
npm run dev:api-service
npm run dev:mobile-app
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

`EXPO_PUBLIC_API_URL` must be reachable from the device:

| Target | Value |
|--------|-------|
| iOS simulator | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device | `http://<your-LAN-IP>:3000` |

Restart Metro after changing `.env`. `EXPO_PUBLIC_*` values are bundled into the app, so never put
secrets in them.

## Commands

Run from `apps/mobile-app/`, or use the root shortcuts.

```bash
npm run start        # Metro dev server (root: npm run dev:mobile-app)
npm run ios
npm run android
npm run lint         # expo lint
npm run typecheck    # tsc --noEmit
npx expo install <package>   # always use this to add deps; it picks SDK-compatible versions
npx expo-doctor              # diagnose dependency and config issues
```

Root `npm run lint` runs mobile lint and typecheck. Tests are not configured for this workspace yet.

## Architecture

```txt
src/app/                Expo Router routes only (thin files)
src/app/_layout.tsx     Root providers: React Query, SessionProvider, Stack
src/app/(auth)/         Signed-out routes; redirects to / when signed in
src/app/(app)/          Signed-in routes; redirects to /login when signed out
src/modules/<Feature>/  containers, components, dtos, hooks, index.ts
src/utils/constants.ts  Env-derived constants and storage keys
src/utils/helpers/      Pure helpers and SecureStore token storage
src/utils/hooks/        Api client and queryClient
src/utils/providers/    SessionProvider / useSession
assets/                 App icons and splash images
```

- Mirror the web-app module shape: route files only import and render a module container.
- Use the `modules/*` and `utils/*` path aliases from `tsconfig.json`.
- Never create or edit `ios/` or `android/` by hand. They are generated (Continuous Native
  Generation). Configure native behavior in `app.json` and config plugins.
- Keep non-route code out of `src/app/`; every file there becomes a screen.

## Auth And Session

1. `Login` posts to `POST /api/public/auth/login` with `remember_me: true`, so the API always
   returns a refresh token.
2. `SessionProvider.signIn` stores both tokens in SecureStore and flips `isSignedIn`.
3. `Api` attaches `Authorization: Bearer <access_token>` to every request.
4. On a `401` from a non-public route, `Api` calls `POST /api/v1/auth/refresh-token` once, saves
   the rotated tokens, and retries. If refresh fails, it clears tokens and throws `ApiError(401)`.
5. Screens that receive `ApiError` with status `401` call `signOut()` (see `Dashboard`).

Never store tokens in AsyncStorage or plain state that persists to disk.

## Data Fetching

- Keep API calls in React Query hooks inside the owning module (`modules/<Feature>/hooks`).
- Parse every response with a Zod schema before returning it.
- Reuse `@white-label/shared` schemas (for example `UserSchema`) instead of redefining API shapes.
- Only call the NestJS API. Do not query Supabase directly from the app.

## Coding

- Match the web-app style: single quotes, trailing commas, arrow-function components, default
  export for containers, named exports from module `index.ts`.
- Style with `StyleSheet.create` at the bottom of the file.
- Give every pressable an `accessibilityRole` and every input an `accessibilityLabel`.
- Prefer Expo modules over third-party libraries. A library with native code needs a development
  build (`npx expo run:ios|android` or `eas build --profile development`); it will not run in Expo Go.

## Builds And Releases

Use EAS for cloud builds, store submission, and OTA updates:

```bash
npx eas-cli@latest build --profile development
npx eas-cli@latest submit
npx eas-cli@latest update
```

EAS project setup (`eas.json`, project ID) is not configured yet.

## Rule Priority

1. Module-level documentation beside the owning module.
2. This guide.
3. Root `docs/`.
4. Root `AGENTS.md`.
5. Existing source code patterns.

## Validation

Before declaring work done, run:

```bash
npm run lint
npm run typecheck
```

For changes to routing, providers, or dependencies, also confirm the bundle builds:

```bash
npx expo export --platform ios --output-dir /tmp/mobile-export
```
