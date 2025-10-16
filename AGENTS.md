# Repository Guidelines

Concise guidance for contributing to this Next.js + TypeScript + Supabase project.

## Project Structure
- `src/app/` pages and server components
- `src/components/` UI and feature modules (colocate under `features/<area>`)
- `src/lib/` clients and utilities (e.g., `lib/supabaseClient.ts`)
- `src/types/` shared interfaces (`Store`, `Menu`, `Queue`)
- `public/` static assets
Use absolute imports via `@/`.

## Code Style
- TypeScript, 2-space indent, ES modules
- Components: PascalCase files; folders kebab-case; utilities camelCase
- Shared types in `src/types`; export named types
- Prefer functional/server components and hooks
- Run `npm run lint` before pushing; use `@/` imports

## Testing
- Place tests in `src/**/__tests__/*.test.ts[x]`
- Keep tests deterministic; stub Supabase and network
- Cover core logic (utils, data transforms)

## Commits & PRs
- Use conventional style (e.g., `feat: queue realtime updates`)
- PRs include purpose, change summary, UI screenshots, migration/config notes
- Keep PRs focused; ensure `npm run lint && npm run build` pass

## Security & Config
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` via env (see `src/lib/env`); never commit secrets
- Enforce RLS with least privilege on `stores`, `menus`, `queues`

## UI Principles
- Theme: use `bg-[var(--color-background)]`, text via `text-[var(--color-foreground)]`/`text-muted-foreground`, brand from `brand-50`–`brand-600`, borders via `border-border-soft`
- Typography: `--font-sans` (Pretendard Variable), headings `font-display`; sizes: headlines `text-3xl/4xl`, body `text-sm/base`, meta `text-xs`
- Layout: mobile-first, max width `max-w-5xl`, gutters `px-[var(--spacing-gutter)]`, vertical rhythm `space-y-6/12`; respect `var(--safe-top/bottom)`
- Components: prefer simple blocks (dl + `border-b`, `ul>li` lists); for image carousels use flat/edge-to-edge visuals and ghost icon buttons
- Accessibility: keep `focus-visible` styles, label interactive controls, target 4.5:1 contrast
