# Workspace Scaffold Design — Creative Profile App

Date: 2026-09-05
Status: Approved (scaffolding only — no feature implementation)

## Purpose

Stand up an Nx/Angular workspace for a creative personal profile ("portfolio")
web app, structured around clean architecture with Angular Material, SCSS,
SSR, and Three.js. This spec covers **scaffolding only**: workspace, apps,
libs, tooling, and empty wiring points. No feature/business logic, content,
or visual design is implemented here — that is explicitly deferred to later
plans.

## Decisions

| Area | Decision |
|---|---|
| Monorepo tool | Nx workspace |
| Package manager | npm |
| Workspace name / npm scope | `kola-profile` / `@kola-profile` |
| App name | `apps/portfolio` |
| Rendering | Angular SSR (`@angular/ssr`), hydration enabled, generator defaults |
| Styling | SCSS everywhere |
| Component library | Angular Material (core + typography wired; no theme palette finalized) |
| 3D | Three.js, wrapped behind an `infrastructure-three` lib |
| State management | Angular Signals only (no NgRx) |
| Test runner | None (`--unitTestRunner=none` on all generators) |
| Linting/formatting | ESLint + Prettier (Nx defaults) |
| Layering | Domain / Application / Infrastructure / Presentation clean architecture, enforced via Nx module-boundary lint tags |

## Libs layout

```
libs/
  domain/                      # entities, value objects, repository interfaces. No Angular/Three deps.
  application/                 # use-cases/services orchestrating domain via injected interfaces. Signal-based state.
  infrastructure/
    infrastructure-data/       # concrete repositories (static JSON/HTTP) implementing domain interfaces
    infrastructure-three/      # Three.js engine wrapper (scene/renderer/loop) behind an interface
  presentation/
    presentation-ui/           # dumb reusable UI components, SCSS + Angular Material theming lives here + app shell
    presentation-features/     # smart feature components (Hero, About, Projects, Contact...) composed from ui + application
  shared/
    shared-util/                # cross-cutting pure helpers/types, no layer dependency
```

Dependency direction (enforced by Nx `enforce-module-boundaries` tags):

- `domain` → depends on nothing internal.
- `application` → may depend on `domain`, `shared-util`.
- `infrastructure-*` → may depend on `domain`, `shared-util` (implements domain interfaces).
- `presentation-*` → may depend on `application`, `domain`, `shared-util`; reaches infrastructure only through DI tokens/interfaces defined in `domain`/`application`, never by importing `infrastructure-*` directly in feature/business logic.
- `apps/portfolio` → composition root; wires concrete `infrastructure-*` providers to `domain`/`application` interfaces via DI, imports `presentation-*` for routes.

Each lib is generated with a placeholder `index.ts` barrel and a short
`README.md` stating its single responsibility. No implementation code beyond
the specific placeholders below.

## App-level scaffolding (`apps/portfolio`)

- **SSR**: `@angular/ssr` + Express engine via Nx's Angular SSR generator; `server.ts` and `app.config.server.ts` left at generator defaults.
- **Styles**: SCSS as the default stylesheet extension; `styles/_variables.scss`, `styles/_mixins.scss`, and an empty Angular Material M3 theme partial (no palette chosen yet).
- **Angular Material**: added via the Material Nx/CLI schematic; core + typography wired into `app.config.ts`; no components selected/used beyond the schematic defaults.
- **Three.js**: added as a workspace dependency; `infrastructure-three` gets a `three-scene.engine.ts` placeholder class with a constructor and no-op `init()`/`dispose()` methods — the wiring point exists, no canvas/component built.
- **Routing**: one minimal route in `app.routes.ts` pointing to an empty shell component in `presentation-features`, since some route must exist to render anything.
- **Path aliases**: `tsconfig.base.json` maps `@kola-profile/domain`, `@kola-profile/application`, `@kola-profile/infrastructure-data`, `@kola-profile/infrastructure-three`, `@kola-profile/presentation-ui`, `@kola-profile/presentation-features`, `@kola-profile/shared-util`.

## Explicitly out of scope (deferred to later plans)

- Any real content, copy, or visual design for the profile/portfolio.
- Actual Three.js scene content (models, animation, interaction).
- Angular Material theme palette / dark-mode decisions.
- Domain entities' real shape, use-case logic, data source (CMS vs static JSON).
- Deployment/hosting configuration.
- Tests of any kind (explicitly excluded per requirements).

## Testing/verification for this scaffolding step

Since no tests are configured, "done" is verified by:

1. `nx build portfolio` succeeds (SSR build produces both browser and server bundles).
2. `nx serve portfolio` boots and the placeholder route renders without console errors.
3. `nx lint` passes across all libs/app, including module-boundary rules.
4. Nx dependency graph (`nx graph`) shows the expected one-directional layering with no boundary violations.
