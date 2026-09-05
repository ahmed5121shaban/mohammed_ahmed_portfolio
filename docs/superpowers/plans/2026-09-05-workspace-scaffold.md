# Workspace Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Nx/Angular workspace (`kola-profile`) with clean-architecture libs, SSR, SCSS, Angular Material, and a Three.js wiring point — scaffolding only, no feature/content logic.

**Architecture:** Nx workspace, one SSR-enabled Angular app (`apps/portfolio`) as the composition root, and seven libs grouped by clean-architecture layer (`domain`, `application`, `infrastructure-data`, `infrastructure-three`, `presentation-ui`, `presentation-features`, `shared-util`) with Nx module-boundary lint rules enforcing one-directional dependencies.

**Tech Stack:** Nx (latest), Angular (latest, standalone components, `@angular/ssr`), Angular Material, SCSS, Three.js, npm, ESLint + Prettier. No unit test runner.

**Spec:** `docs/superpowers/specs/2026-09-05-workspace-scaffold-design.md`

## Global Constraints

- Workspace name / npm scope: `kola-profile` / `@kola-profile`.
- Package manager: npm (pass `--packageManager=npm` wherever a generator asks).
- App project name: `portfolio`, at `apps/portfolio`.
- Stylesheet extension: `scss` everywhere.
- SSR: enabled via `@angular/ssr`, hydration on, generator defaults (no custom SSR logic).
- State management: Angular Signals only — never add `@ngrx/*` packages.
- Test runner: **none**. Every generator call must pass `--unitTestRunner=none` (or the equivalent current flag — see Task 1 note). Do not create `.spec.ts` files.
- Every lib is generated at the exact directory given in its task (`--directory=<path> --projectNameAndRootFormat=as-provided`), not Nx's nested default.
- No feature/content/business logic, no Three.js scene content, no Material theme palette decisions, no tests — all explicitly deferred per spec.

---

### Task 1: Scaffold the Nx workspace and SSR-enabled Angular app

**Files:**
- Create: entire workspace root (`package.json`, `nx.json`, `tsconfig.base.json`, `.eslintrc.json` or `eslint.config.mjs`, `apps/portfolio/**`)

**Interfaces:**
- Produces: a working Nx workspace named `kola-profile` with npm scope `@kola-profile`, containing `apps/portfolio` (Angular, SSR, SCSS, standalone components, no test runner). Later tasks generate libs into this workspace via `npx nx g @nx/angular:library ...`.

- [ ] **Step 1: Run the Nx workspace generator**

The target folder `C:\Users\Ashaaban\Projects\kola_profile` already exists (currently empty). `create-nx-workspace` always creates a **new** folder named after its first argument, so run it one level up, in the parent directory, to avoid nesting:

```bash
cd "/c/Users/Ashaaban/Projects"
npx create-nx-workspace@latest kola-profile \
  --preset=angular-monorepo \
  --appName=portfolio \
  --style=scss \
  --ssr=true \
  --routing=true \
  --standalone=true \
  --unitTestRunner=none \
  --e2eTestRunner=none \
  --packageManager=npm \
  --nxCloud=skip
```

If the CLI rejects a flag (Nx flags shift between releases), run `npx create-nx-workspace@latest --help` first, find the current equivalent flag names, and re-run with the same selections: workspace name `kola-profile`, Angular monorepo preset, app name `portfolio`, SCSS, SSR yes, routing yes, standalone components yes, no unit test runner, no e2e runner, npm, skip Nx Cloud. If any of these can only be chosen via interactive prompts, run the command without the corresponding flag and answer the prompt with that same selection.

- [ ] **Step 2: Move the generated workspace into the target directory**

The generator created `/c/Users/Ashaaban/Projects/kola-profile/` (hyphen). The target `kola_profile` (underscore) already has its own git repo (initialized on `main` with an initial commit containing `docs/`) — do **not** copy the generated folder's `.git`, only its tracked files:

```bash
cd "/c/Users/Ashaaban/Projects/kola-profile"
rm -rf .git
cp -r . "/c/Users/Ashaaban/Projects/kola_profile/"
cd "/c/Users/Ashaaban/Projects"
rm -rf kola-profile
cd "/c/Users/Ashaaban/Projects/kola_profile"
```

- [ ] **Step 3: Verify the app builds**

```bash
cd "/c/Users/Ashaaban/Projects/kola_profile"
npx nx build portfolio
```

Expected: build succeeds and produces both a browser bundle and a server bundle (look for `dist/apps/portfolio/browser` and `dist/apps/portfolio/server`, or the equivalent paths the generator printed).

- [ ] **Step 4: Verify the app serves**

```bash
npx nx serve portfolio &
SERVE_PID=$!
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4200
kill $SERVE_PID
```

Expected: prints `200`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Nx workspace with SSR Angular app"
```
(`create-nx-workspace` already ran `git init` and an initial commit — this commit captures the move into the target directory. If `git status` shows nothing to commit, that's fine, skip it.)

---

### Task 2: Add Angular Material and the SCSS style scaffold

**Files:**
- Modify: `apps/portfolio/src/app/app.config.ts`
- Modify: `apps/portfolio/src/styles.scss`
- Create: `apps/portfolio/src/styles/_variables.scss`
- Create: `apps/portfolio/src/styles/_mixins.scss`
- Create: `apps/portfolio/src/styles/_theme.scss`

**Interfaces:**
- Consumes: `apps/portfolio` from Task 1.
- Produces: Angular Material wired into `app.config.ts`; a `styles/` folder that later `presentation-ui` work will import for shared variables/mixins/theme.

- [ ] **Step 1: Run the Angular Material schematic**

```bash
npx nx g @angular/material:ng-add --project=portfolio --typography=true
```

Answer prompts (or pass flags if offered): no prebuilt theme (custom theme, since palette is deferred), global typography styles yes, browser animations yes.

- [ ] **Step 2: Create the SCSS variables partial**

Create `apps/portfolio/src/styles/_variables.scss`:

```scss
// Design-token placeholders — real values chosen in a later plan.
$content-max-width: 1200px;
$spacing-unit: 8px;
```

- [ ] **Step 3: Create the SCSS mixins partial**

Create `apps/portfolio/src/styles/_mixins.scss`:

```scss
@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 4: Create the Material M3 theme partial**

Create `apps/portfolio/src/styles/_theme.scss`:

```scss
@use '@angular/material' as mat;

// Palette/typography/density are deferred to a later plan — this is the
// wiring point where the final theme config will be supplied.
html {
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}
```

- [ ] **Step 5: Wire the partials into the global stylesheet**

Edit `apps/portfolio/src/styles.scss`, adding at the top (keep whatever the Material schematic already inserted below these lines):

```scss
@use 'styles/variables';
@use 'styles/mixins';
@use 'styles/theme';
```

- [ ] **Step 6: Verify the app still builds and serves**

```bash
npx nx build portfolio
npx nx serve portfolio &
SERVE_PID=$!
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4200
kill $SERVE_PID
```

Expected: build succeeds, curl prints `200`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add Angular Material and SCSS style scaffold"
```

---

### Task 3: Generate `shared-util` and `domain` libs

**Files:**
- Create: `libs/shared/shared-util/src/index.ts`
- Create: `libs/shared/shared-util/README.md`
- Create: `libs/domain/src/index.ts`
- Create: `libs/domain/README.md`

**Interfaces:**
- Produces: `@kola-profile/shared-util` and `@kola-profile/domain` importable libs, both tagged for the boundary rules configured in Task 8.

- [ ] **Step 1: Generate `shared-util`**

```bash
npx nx g @nx/angular:library shared-util \
  --directory=libs/shared/shared-util \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/shared-util \
  --tags=type:shared \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 2: Replace the generated barrel and add a README**

Replace `libs/shared/shared-util/src/index.ts`:

```typescript
// Cross-cutting pure helpers/types with no dependency on any other layer.
// Populated in a later plan.
export {};
```

Create `libs/shared/shared-util/README.md`:

```markdown
# shared-util

Cross-cutting pure helpers and types with no dependency on any other layer
(no Angular, no domain, no infrastructure). Anything here must be usable
from every other lib without creating a cycle.
```

- [ ] **Step 3: Generate `domain`**

```bash
npx nx g @nx/angular:library domain \
  --directory=libs/domain \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/domain \
  --tags=type:domain \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 4: Replace the generated barrel and add a README**

Replace `libs/domain/src/index.ts`:

```typescript
// Entities, value objects, and repository *interfaces*. No Angular or
// Three.js imports belong here. Populated in a later plan.
export {};
```

Create `libs/domain/README.md`:

```markdown
# domain

Pure business types: entities (e.g. Profile, Project, SkillItem), value
objects, and repository interfaces that `infrastructure-*` libs implement.
No framework dependency (no Angular, no Three.js). May depend on
`shared-util` only.
```

- [ ] **Step 5: Verify both libs lint clean**

```bash
npx nx lint shared-util
npx nx lint domain
```

Expected: both pass (boundary rules aren't configured until Task 8, so this only checks basic lint/syntax for now).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold shared-util and domain libs"
```

---

### Task 4: Generate `application` lib

**Files:**
- Create: `libs/application/src/index.ts`
- Create: `libs/application/README.md`

**Interfaces:**
- Consumes: `@kola-profile/domain`, `@kola-profile/shared-util` (Task 3) — no imports written yet, just permitted by tags.
- Produces: `@kola-profile/application` importable lib.

- [ ] **Step 1: Generate `application`**

```bash
npx nx g @nx/angular:library application \
  --directory=libs/application \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/application \
  --tags=type:application \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 2: Replace the generated barrel and add a README**

Replace `libs/application/src/index.ts`:

```typescript
// Use-cases/services orchestrating domain via injected interfaces.
// Signal-based state lives here. Populated in a later plan.
export {};
```

Create `libs/application/README.md`:

```markdown
# application

Use-cases and Signal-based application state that orchestrate `domain`
through injected interfaces (never a concrete `infrastructure-*` class
directly). May depend on `domain` and `shared-util`.
```

- [ ] **Step 3: Verify it lints clean**

```bash
npx nx lint application
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold application lib"
```

---

### Task 5: Generate `infrastructure-data` and `infrastructure-three` libs

**Files:**
- Create: `libs/infrastructure/infrastructure-data/src/index.ts`
- Create: `libs/infrastructure/infrastructure-data/README.md`
- Create: `libs/infrastructure/infrastructure-three/src/index.ts`
- Create: `libs/infrastructure/infrastructure-three/src/lib/three-scene.engine.ts`
- Create: `libs/infrastructure/infrastructure-three/README.md`
- Modify: `package.json` (adds `three` dependency)

**Interfaces:**
- Produces: `@kola-profile/infrastructure-data`, `@kola-profile/infrastructure-three` (exporting `ThreeSceneEngine`) — the concrete `init(canvas)`/`dispose()` wiring point that a later plan fills in.

- [ ] **Step 1: Generate `infrastructure-data`**

```bash
npx nx g @nx/angular:library infrastructure-data \
  --directory=libs/infrastructure/infrastructure-data \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/infrastructure-data \
  --tags=type:infrastructure \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 2: Replace the generated barrel and add a README**

Replace `libs/infrastructure/infrastructure-data/src/index.ts`:

```typescript
// Concrete repositories (static JSON / HTTP client) implementing the
// interfaces declared in `domain`. Populated in a later plan.
export {};
```

Create `libs/infrastructure/infrastructure-data/README.md`:

```markdown
# infrastructure-data

Concrete implementations of the repository interfaces declared in
`domain` (e.g. a static-JSON or HTTP-backed profile/project repository).
May depend on `domain` and `shared-util`. Only the app composition root
imports this lib directly to provide it via DI.
```

- [ ] **Step 3: Install Three.js**

```bash
npm install three
npm install -D @types/three
```

- [ ] **Step 4: Generate `infrastructure-three`**

```bash
npx nx g @nx/angular:library infrastructure-three \
  --directory=libs/infrastructure/infrastructure-three \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/infrastructure-three \
  --tags=type:infrastructure \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 5: Write the placeholder Three.js engine class**

Create `libs/infrastructure/infrastructure-three/src/lib/three-scene.engine.ts`:

```typescript
import * as THREE from 'three';

/**
 * Wraps the Three.js scene/renderer/animation-loop lifecycle behind a
 * small interface so `presentation-*` never imports Three.js directly.
 * Scene content, camera setup, and the render loop are implemented in a
 * later plan — this class only establishes the wiring point.
 */
export class ThreeSceneEngine {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;

  init(_canvas: HTMLCanvasElement): void {
    // Intentionally empty: real scene/camera/renderer setup and the
    // animation loop are implemented in a later plan.
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.renderer?.dispose();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }
}
```

- [ ] **Step 6: Export it from the lib's barrel**

Replace `libs/infrastructure/infrastructure-three/src/index.ts`:

```typescript
export * from './lib/three-scene.engine';
```

- [ ] **Step 7: Add a README**

Create `libs/infrastructure/infrastructure-three/README.md`:

```markdown
# infrastructure-three

Wraps Three.js (scene, renderer, animation loop) behind `ThreeSceneEngine`
so `presentation-*` libs never import Three.js directly. Real scene
content is implemented in a later plan. May depend on `domain` and
`shared-util`. Only the app composition root imports this lib directly.
```

- [ ] **Step 8: Verify both libs build and lint clean**

```bash
npx nx build infrastructure-data
npx nx build infrastructure-three
npx nx lint infrastructure-data
npx nx lint infrastructure-three
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold infrastructure-data and infrastructure-three libs"
```

---

### Task 6: Generate `presentation-ui` lib

**Files:**
- Create: `libs/presentation/presentation-ui/src/index.ts`
- Create: `libs/presentation/presentation-ui/README.md`

**Interfaces:**
- Produces: `@kola-profile/presentation-ui` — the home for reusable dumb UI components in a later plan.

- [ ] **Step 1: Generate `presentation-ui`**

```bash
npx nx g @nx/angular:library presentation-ui \
  --directory=libs/presentation/presentation-ui \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/presentation-ui \
  --tags=type:presentation \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 2: Replace the generated barrel and add a README**

Replace `libs/presentation/presentation-ui/src/index.ts`:

```typescript
// Dumb, reusable UI components (buttons, cards, section wrappers) styled
// with SCSS + the Angular Material theme from apps/portfolio/src/styles.
// Populated in a later plan.
export {};
```

Create `libs/presentation/presentation-ui/README.md`:

```markdown
# presentation-ui

Reusable, presentation-only UI components (no business logic). Styled
with SCSS and the shared Angular Material theme. May depend on
`application`, `domain`, and `shared-util`.
```

- [ ] **Step 3: Verify it lints clean**

```bash
npx nx lint presentation-ui
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold presentation-ui lib"
```

---

### Task 7: Generate `presentation-features` lib, placeholder shell component, and wire the app route

**Files:**
- Create: `libs/presentation/presentation-features/src/index.ts`
- Create: `libs/presentation/presentation-features/src/lib/profile-shell/profile-shell.component.ts`
- Create: `libs/presentation/presentation-features/README.md`
- Modify: `apps/portfolio/src/app/app.routes.ts`

**Interfaces:**
- Consumes: nothing from other libs yet (kept intentionally empty).
- Produces: `ProfileShellComponent` (standalone, selector `app-profile-shell`), exported from `@kola-profile/presentation-features` and routed at `apps/portfolio`'s `''` path — this is what Task 1's serve check will render on `/`.

- [ ] **Step 1: Generate `presentation-features`**

```bash
npx nx g @nx/angular:library presentation-features \
  --directory=libs/presentation/presentation-features \
  --projectNameAndRootFormat=as-provided \
  --importPath=@kola-profile/presentation-features \
  --tags=type:presentation \
  --unitTestRunner=none \
  --standalone=true \
  --skipModule=true
```

- [ ] **Step 2: Write the placeholder shell component**

Create `libs/presentation/presentation-features/src/lib/profile-shell/profile-shell.component.ts`:

```typescript
import { Component } from '@angular/core';

/**
 * Placeholder root feature so the app has something to route to.
 * Replaced with the real Hero/About/Projects/Contact composition in a
 * later plan.
 */
@Component({
  selector: 'app-profile-shell',
  standalone: true,
  template: `<p>Profile shell placeholder — content implemented in a later plan.</p>`,
})
export class ProfileShellComponent {}
```

- [ ] **Step 3: Export it and add a README**

Replace `libs/presentation/presentation-features/src/index.ts`:

```typescript
export * from './lib/profile-shell/profile-shell.component';
```

Create `libs/presentation/presentation-features/README.md`:

```markdown
# presentation-features

Smart feature components (Hero, About, Projects, Contact, ...) composed
from `presentation-ui` + `application`. Currently contains only
`ProfileShellComponent`, a placeholder root route target. May depend on
`application`, `domain`, and `shared-util`.
```

- [ ] **Step 4: Wire the route in the app**

Edit `apps/portfolio/src/app/app.routes.ts` to:

```typescript
import { Routes } from '@angular/router';
import { ProfileShellComponent } from '@kola-profile/presentation-features';

export const routes: Routes = [
  { path: '', component: ProfileShellComponent },
];
```

- [ ] **Step 5: Verify the app builds, serves, and renders the placeholder**

```bash
npx nx build portfolio
npx nx serve portfolio &
SERVE_PID=$!
sleep 8
curl -s http://localhost:4200 | grep -o "Profile shell placeholder"
kill $SERVE_PID
```

Expected: prints `Profile shell placeholder` (confirms SSR rendered the routed component).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold presentation-features lib and wire placeholder route"
```

---

### Task 8: Configure and verify Nx module-boundary rules

**Files:**
- Modify: `eslint.config.mjs` (or `.eslintrc.json`, whichever Task 1 generated)
- Modify: `apps/portfolio/project.json` (add `type:app` tag)

**Interfaces:**
- Consumes: the `tags` already assigned to every lib in Tasks 3–7 (`type:shared`, `type:domain`, `type:application`, `type:infrastructure`, `type:presentation`).
- Produces: an enforced dependency-constraints ruleset — this is the last piece the spec's "Dependency direction" table requires.

- [ ] **Step 1: Tag the app project**

Open `apps/portfolio/project.json` and add (or extend) a top-level `"tags"` array:

```json
"tags": ["type:app"]
```

- [ ] **Step 2: Add depConstraints to the lint config**

Open the workspace's ESLint config (`eslint.config.mjs` if Nx generated flat config, else `.eslintrc.json`) and find the `@nx/enforce-module-boundaries` rule block that `create-nx-workspace` already added. Set its `depConstraints` to:

```javascript
depConstraints: [
  { sourceTag: 'type:shared', onlyDependOnLibsWithTags: ['type:shared'] },
  { sourceTag: 'type:domain', onlyDependOnLibsWithTags: ['type:domain', 'type:shared'] },
  { sourceTag: 'type:application', onlyDependOnLibsWithTags: ['type:domain', 'type:shared'] },
  { sourceTag: 'type:infrastructure', onlyDependOnLibsWithTags: ['type:domain', 'type:shared'] },
  { sourceTag: 'type:presentation', onlyDependOnLibsWithTags: ['type:application', 'type:domain', 'type:shared'] },
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:domain', 'type:application', 'type:infrastructure', 'type:presentation', 'type:shared'] },
]
```

(If the file uses the flat-config array form, this goes inside the matching rule's `options[0].depConstraints`; if it's the legacy `.eslintrc.json`, it goes inside `rules["@nx/enforce-module-boundaries"][1].depConstraints`. Keep whichever `linter.config` Task 1's generator produced — don't switch formats.)

- [ ] **Step 3: Prove the constraint blocks a forbidden import**

Temporarily add this line to `libs/presentation/presentation-features/src/index.ts`:

```typescript
import '@kola-profile/infrastructure-three';
```

Run:

```bash
npx nx lint presentation-features
```

Expected: FAIL, reporting a `@nx/enforce-module-boundaries` violation (presentation → infrastructure not allowed).

- [ ] **Step 4: Revert the forbidden import**

Remove the line added in Step 3 so `libs/presentation/presentation-features/src/index.ts` matches Task 7 Step 3 exactly again.

- [ ] **Step 5: Verify full lint passes clean**

```bash
npx nx run-many -t lint
```

Expected: every project passes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: enforce clean-architecture module boundaries"
```

---

### Task 9: Full-workspace verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1–8.
- Produces: confirmation the scaffold matches every acceptance criterion in the spec's "Testing/verification for this scaffolding step" section.

- [ ] **Step 1: Full SSR build**

```bash
npx nx build portfolio
```

Expected: succeeds, producing both browser and server output.

- [ ] **Step 2: Serve smoke check**

```bash
npx nx serve portfolio &
SERVE_PID=$!
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4200
curl -s http://localhost:4200 | grep -o "Profile shell placeholder"
kill $SERVE_PID
```

Expected: `200`, and the placeholder text is present in the SSR'd HTML.

- [ ] **Step 3: Lint everything**

```bash
npx nx run-many -t lint
```

Expected: all projects pass, including boundary rules.

- [ ] **Step 4: Inspect the dependency graph**

```bash
npx nx graph --file=/tmp/nx-graph.json
```

Open `/tmp/nx-graph.json` (or the printed graph URL) and confirm: `domain` and `shared-util` have no outgoing edges to other libs; `application` only points to `domain`/`shared-util`; `infrastructure-data`/`infrastructure-three` only point to `domain`/`shared-util`; `presentation-ui`/`presentation-features` only point to `application`/`domain`/`shared-util`; only `portfolio` points at the infrastructure libs.

- [ ] **Step 5: Confirm path aliases are wired**

```bash
grep -A1 "@kola-profile/domain\|@kola-profile/application\|@kola-profile/infrastructure-data\|@kola-profile/infrastructure-three\|@kola-profile/presentation-ui\|@kola-profile/presentation-features\|@kola-profile/shared-util" tsconfig.base.json
```

Expected: all seven import paths appear (each generator in Tasks 3–7 added its own entry automatically via `--importPath`).

- [ ] **Step 6: Confirm no test runner artifacts exist**

```bash
find . -name "*.spec.ts" -not -path "*/node_modules/*"
```

Expected: no output (no spec files anywhere).

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: verify workspace scaffold against spec" --allow-empty
```
