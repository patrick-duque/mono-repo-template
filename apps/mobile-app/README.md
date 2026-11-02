# White Label Studio Mobile App

Expo + Expo Router mobile workspace for the white-label starter.

Current status: signed-out users see the `Login` screen; signed-in users see a `Dashboard` that
loads their profile from `GET /api/v1/auth/profile` and can sign out. Tokens live in SecureStore and
refresh automatically.

## Commands

Run from the repository root:

```bash
npm run dev:mobile-app
npm run lint:mobile-app
npm --workspace @white-label/mobile-app run ios
npm --workspace @white-label/mobile-app run android
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` first. Tests are not configured for
this workspace yet.

## Documentation

- Mobile implementation guide: `docs/MOBILE_GUIDE.md`
- Implemented API routes: `../../docs/API_REFERENCE.md`
- Agent compatibility entry point: `AGENTS.md`

## Local Shape

```txt
src/app/            Expo Router routes
src/modules/        Feature modules (Login, Dashboard)
src/utils/          Constants, helpers, Api client, providers
assets/             App icons and splash images
```
