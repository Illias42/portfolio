# Illia Kryvoshchenkov — Portfolio

Personal portfolio built with Next.js 16, React Three Fiber and Motion, organised with
Feature-Sliced Design and a Rust-based toolchain (bun, oxlint, oxfmt).

## Stack

- **Runtime / PM**: [bun](https://bun.sh) 1.3
- **Framework**: Next.js 16 (App Router, Turbopack, React 19, React Compiler)
- **UI**: Tailwind CSS v4 (CSS-first tokens), `motion/react`
- **3D**: three.js, `@react-three/fiber`, `@react-three/drei`
- **Architecture**: [Feature-Sliced Design](https://feature-sliced.design) at the repo root — `_app`,
  `widgets`, `features`, `entities`, `shared`; `app/` holds Next.js routing only, no separate `pages`
  layer, route files (`page.tsx`) compose the FSD layers directly
- **Quality**: oxlint (type-aware), oxfmt, knip, steiger; lefthook + commitlint

## Getting started

```bash
bun install          # also installs git hooks (lefthook)
bun dev              # http://localhost:3000
```

| Script               | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `bun run build`      | production build                                  |
| `bun run check`      | format check → lint → typecheck → FSD lint → knip |
| `bun run format`     | format with oxfmt                                 |
| `bun run lint[:fix]` | oxlint                                            |
| `bun run fsd`        | steiger (Feature-Sliced Design rules)             |
| `bun run knip`       | unused files, exports and dependencies            |

Git hooks: `pre-commit` formats + lints staged files, `commit-msg` runs commitlint,
`pre-push` runs typecheck, steiger and knip. CI (`.github/workflows/ci.yml`) repeats the gate and builds.

## Project layout

```
app/                     route files (page.tsx, layout.tsx) — compose the FSD layers, no `pages` layer
_app/                    providers, fonts, global styles + design tokens
widgets/<block>/         hero, project grid, …
features/<action>/       contact form, theme toggle, …
entities/<domain>/       project, experience, skill
shared/                  ui primitives, lib (cn), config (siteConfig)
docs/content/            résumé and copy sources
.claude/                 agent rules, skills, hooks and settings for Claude Code
```

Conventions: kebab-case files, named exports in the FSD layer folders, public API via `index.ts`, WebGL
content in `*.scene.tsx`, tokens in `_app/styles/globals.css`. See `CLAUDE.md` for the full rule set.

## Environment

| Variable               | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | canonical URL for metadata / Open Graph |
