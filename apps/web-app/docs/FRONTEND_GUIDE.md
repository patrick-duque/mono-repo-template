# Frontend Guide

Implementation rules for the White Label Studio React + Vite app. Product context and current runtime
behavior live in the root `docs/` directory; this guide covers frontend structure, coding
conventions, naming, styling, and validation. Use `../../../docs/WEB_REFERENCE.md` for currently
implemented frontend routes and shipped behavior.

## Stack

- Vite 8
- React 19
- TanStack Router file-based routing
- TypeScript strict mode
- Tailwind CSS via `@tailwindcss/vite`
- TanStack React Query
- Zustand
- Axios
- Zod
- npm package manager

## Commands

Run commands from `apps/web-app/` or through the root workspace command shown where useful.

```bash
npm run start:dev
npm run build
npm run lint
npm run pretty
npm run preview
npm --workspace @white-label/web-app run start:dev
```

Tests are not configured for the app workspace yet.

## Architecture

- Feature modules live in `src/modules/<Feature>`.
- File-based routes live in `src/routes`.
- Shared UI lives in `src/ui`.
- Shared helpers, hooks, providers, app state stores, and types live in `src/utils`.
- Static assets live in `public` or `src/assets`.
- Use configured aliases: `src/*`, `modules/*`, `ui/*`, `utils/*`, and `assets/*`.
- Do not add backend-only patterns such as controllers, services, or repositories.
- Do not introduce a new state, styling, routing, or data-fetching library without instruction.

### Modules

- Add `src/modules/<Feature>` only when a feature needs owned route behavior, containers,
  components, DTOs, hooks, or local rules.
- Module folders may contain `containers`, `components`, `dtos`, `forms`, `hooks`,
  `index.ts`, and a local `<MODULE>.md` when non-obvious local rules exist.
- Containers coordinate data and page composition.
- Containers should stay thin: coordinate data fetching, mutations, route state, loading/error/empty
  states, and page composition. Move meaningful presentational sections into module `components`
  so containers do not accumulate large JSX blocks.
- Pages that fetch route-critical data should render a page-specific skeleton loader for the
  loading state. Match the skeleton to the rendered page structure, spacing, cards, and responsive
  behavior instead of using a generic centered spinner for full-page loading.
- When changing a rendered page or section that has a skeleton loader, update the skeleton in the
  same change so its layout, density, and responsive behavior stay aligned with the real UI.
- Components render reusable module UI and named page sections.
- DTOs own feature-specific Zod request/response contracts and derived value types.
- Forms own feature-specific `react-hook-form` + Zod form components, their inputs,
  validation message helpers, and form-only sub-components. Containers pass mutation
  state, default values, and submit handlers in as props.
- Hooks own module API queries and mutations.
- Folder-level barrels expose stable folder exports. Use `containers/index.ts` when a module has
  containers, and add barrels for `components`, `dtos`, `forms`, and `hooks` when those folders
  expose multiple stable exports.
- Module root `index.ts` should re-export from folder barrels instead of deep files so routes and
  external modules do not depend on internal file layout.
- Add module docs only for non-obvious local rules. When needed, use `Purpose`, `Route Ownership`,
  `API And State`, and `Boundaries` sections.
- Module docs should define owned routes and access rules, API endpoints used by hooks, DTO locations,
  state side effects, allowed patterns, forbidden patterns, loading/empty/error states, and deferred
  integration work.

### Routing

- Keep route declarations in `src/routes` files using TanStack Router file routes.
- Root layout lives in `src/routes/__root.tsx`.
- Use `createRootRoute` in `__root.tsx` and `createFileRoute` in route files.
- Use `src/routes/<segment>/route.tsx` for folder parent routes with nested children.
- Use `src/routes/<segment>/index.tsx` for concrete index page routes.
- Use `Outlet` only for route layout composition.
- Use `beforeLoad` for redirects, guards, and route-level validation.
- Keep route files thin and compose feature containers from `src/modules`.
- Do not fetch API data directly in route files unless it is route-only metadata.
- Do not edit `src/routeTree.gen.ts` manually; keep it in sync through the router plugin.
- Keep the public root login route unguarded until authenticated workspace routes exist. The root
  route may branch between login and the dashboard shell using the provider auth flag.
- See `../../../docs/WEB_REFERENCE.md` for the current route inventory.

### Data And State

- Use React Query for server cache.
- Use `utils/hooks/Api` for Axios-based HTTP calls and preserve its `query-string` behavior.
- Define stable query keys near the hook and export them when cache coordination is needed.
- Keep endpoint strings inside module hooks unless already centralized.
- Keep API calls out of presentational components.
- Use `utils/hooks/useStorageConfig` for browser-side Supabase Storage object uploads instead of
  rebuilding storage object URLs or public URLs in components. Pass the target bucket, such as
  `images` or an attachment bucket, and pass the selected file to `getUploadKey(file)` so the object
  key keeps the file extension.
- Use the existing Zustand provider store only for lightweight app state.
- The provider may initialize lightweight auth state from the JavaScript-managed access-token
  cookie; do not use it for profile, permission, or other server-owned data.
- Do not store server data in providers.
- Keep feature-owned API requests, response parsing, and persisted keys documented in
  `../../../docs/WEB_REFERENCE.md` when they become shipped runtime behavior.
- Do not add route guards, profile hydration, or permission hydration until the authenticated
  workspace routes are implemented.

### Shared UI And Utilities

- Keep reusable UI primitives in `src/ui/components`.
- Keep generic non-form components in `src/ui/components/common`.
- Use `ui/components/common/DetailItem` for label/value metadata blocks inside details panels,
  cards, and stacked mobile rows instead of creating feature-local duplicates.
- Use `ui/components/common/PageHeader` for new page title/header sections, including optional
  right-side page actions, before creating a feature-specific header component.
- Use `ui/components/common/Skeleton` for skeleton placeholder blocks before creating feature-local
  skeleton primitives. Keep the page-specific skeleton layout inside the owning feature module.
- Keep reusable form wrappers and inputs in `src/ui/components/form`.
- Keep reusable page and section layout wrappers in `src/ui/layouts`.
- Wrap non-table authenticated pages, such as dashboard, account, and settings views, with
  `ui/layouts/Container` so content does not stretch too wide on large screens. Dense table or other
  intentionally wide future surfaces may use wider or full-width wrappers when the data needs the
  space.
- Keep larger reusable page partials and app chrome in `src/ui/partials`.
- App chrome composition: `ui/layouts/AppWrapper` renders `ui/partials/Navbar` as a sticky
  full-height left sidebar (logo, primary nav items, Account/Settings items, bottom theme toggle)
  alongside
  `ui/partials/Header` as a slim top bar with a placeholder global action.
- Keep new authenticated chrome inside `AppWrapper` rather than branching `Navbar` per layout.
- Keep feature-specific components and DTOs inside `src/modules/<Feature>`.
- Do not fetch data in shared UI components, layouts, or partials.
- Do not import from `src/modules` into shared UI.
- Keep reusable helpers, hooks, providers, constants, app state, and shared types in `src/utils`.
- Keep helpers deterministic and free of HTTP, storage, route, and UI side effects.
- Add a shared `src/utils/types` folder only when a type is reused across modules.

## Coding

- Use TypeScript strict mode.
- Prefer explicit types for public APIs.
- Avoid adding new `any` types unless matching an existing API wrapper constraint.
- Use discriminated unions for complex UI states.
- Use Zod for API requests, API responses, shared models, filters, and persisted/shared data
  contracts.
- Name Zod schemas with PascalCase and a `Schema` suffix, then export TypeScript types with
  `z.infer<typeof SchemaName>`.
- Keep feature-owned request, response, and form-value Zod contracts in module `dtos/` files.
- Keep UI-only props, React context, helper option types, and generated route types as plain
  TypeScript.
- Use function components.
- Use React hooks only at the top level.
- Use `react-hook-form` for shared form state and `zodResolver` for schema validation.
- Keep validation DTOs owned by the feature or form caller.
- Keep imports ordered according to ESLint.
- Keep semicolons and lines at or below 100 characters.

## Naming

- Use PascalCase for React components, container files, types, interfaces, classes, and enums.
- Use camelCase for hooks, helpers, constants, variables, functions, and type helper files.
- Name hooks with a `use` prefix.
- Name API hooks with action-oriented names such as `useGetUsers`.
- Use uppercase names for shared constants.
- Use PascalCase plus `Schema` for Zod schemas.
- Name module DTO files with a `.dto.ts` suffix.
- Use `index.ts` for barrel exports.
- Use PascalCase module folders and match module documentation names to module folders, for example
  `src/modules/Users/USERS.md`.
- Keep CSS files under `src/assets/styles`.
- Keep source images in `src/assets/images` with descriptive, stable filenames.
- Use `public` for assets referenced by absolute browser paths.

## Styling And Accessibility

- Follow `../../../docs/DESIGN_OVERVIEW.md` for White Label Studio visual direction, responsive behavior, and
  accessibility.
- Use Tailwind CSS utilities and existing global styles in `src/assets/styles`.
- Tailwind includes a project `xs` breakpoint at `375px`; use it when mobile behavior needs finer
  control.
- Prefer accessible native elements before custom controls.
- Use semantic HTML.
- Ensure interactive elements have visible focus states.
- Always consider mobile responsive behavior for visible UI changes.
- Reuse `ui/components/common`, `ui/components/form`, `ui/layouts`, and `ui/partials`.
- Use `utils/helpers/className` for class composition.
- Use `class-variance-authority` for component variants when needed.
- Prefer adding variants over duplicating shared component behavior.
- Keep form labels, required indicators, helper text, and validation state accessible.
- Use buttons for actions and links for navigation.
- Apply `cursor-pointer` to every interactive element with a hover affordance (raw `<button>`,
  clickable `div`/`span`, role-based controls). The shared `ui/components/common/Button` already
  bakes this in via its `cva` base classes, so reuse it when possible instead of restyling raw
  buttons.
- Provide alt text for meaningful images.
- Do not rely on color alone to communicate state.
- Preserve keyboard access for modals, menus, filters, and forms.

## Commit And PR Notes

- Use Conventional Commit-style messages such as `feat: add user filters` or
  `docs: consolidate frontend guide`.
- Keep commits scoped to one concern.
- Do not claim tests or validation that were not run.
- Pull requests should include a concise summary, linked issue when available, validation commands,
  skipped validation with reasons, and screenshots or recordings for visible UI changes.

## Rule Priority

1. Module-level documentation beside the owning module
2. This guide
3. Root `docs/`
4. Root `AGENTS.md`
5. Existing source code patterns

## Validation

- Run `npm run build` for build and typecheck validation when feasible.
- Run `npm run lint` before finalizing code changes when feasible.
- Do not claim tests were run for the app workspace until a test script is configured.
