# White Label Studio - Project Overview

White Label Studio is a reusable full-stack starter for authenticated internal applications. It
keeps the monorepo structure, coding conventions, auth boundary, role/permission model, profile
workflow, and responsive web shell while leaving product-specific domains to future applications.

## What It Is

The starter provides a working vertical slice:

- A NestJS API with custom JWT auth, refresh-token rotation, users, roles, permissions, and profile
  routes.
- A React + Vite web app with login, account profile, generic dashboard, settings placeholder,
  shared UI primitives, and app chrome.
- A shared package for Zod contracts consumed by the API and web app.
- Root documentation and workspace guides that define conventions for future modules.

## Who It Serves

| Role | Primary Jobs |
|------|--------------|
| Application owner | Start a new authenticated product without rebuilding auth/access basics. |
| Backend engineer | Add product modules under the existing Nest controller/service/DTO conventions. |
| Frontend engineer | Add feature routes and modules under the existing TanStack Router and UI conventions. |
| Admin user | Manage users, roles, and permission grants through the API. |

## Goals

- Provide a neutral foundation that can be branded for a future product.
- Keep private data behind the NestJS API boundary.
- Preserve the existing auth, role, permission, DTO, response envelope, routing, and UI conventions.
- Avoid carrying forward product-specific models, modules, navigation, mock data, or docs.

## Core Concepts

- **Authenticated app** - the web surface rendered after login.
- **User** - an account with exactly one role and a status of `PENDING`, `ACTIVE`, or `INACTIVE`.
- **Role** - a named access profile assigned to users.
- **Permission resource** - a resource key such as `AUTH_USERS` or `TEAM_ROLES`.
- **Role permission grant** - the action set a role has on a permission resource.
- **Shared contract** - a Zod schema exported from `packages/shared` and used at trust boundaries.

## Current Scope

In scope:

- Login and refresh-token rotation.
- Authenticated profile read/update and password change.
- User CRUD.
- Role, permission resource, and role-permission CRUD.
- Generic dashboard and settings placeholders.
- Shared app shell, theme state, API wrapper, and form/UI primitives.
- Documentation for adding future product domains.

Out of scope in this starter:

- Product-specific tables, controllers, routes, pages, and navigation.
- Public portals or anonymous token-scoped product surfaces.
- Notifications, activity timelines, automations, dashboards, and reporting.
- Multi-org tenancy, SSO, and external integrations.

## Migration Note

The Supabase migrations were reconciled to the retained auth/access domain. Removed product-domain
tables and seed rows are no longer created.
