# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Build production site to ./dist/
pnpm preview    # Preview production build locally
pnpm astro add  # Add integrations (e.g., React, Tailwind)
```

## Architecture

This is an Astro 5.x project using the basics starter template with TypeScript (strict mode).

**Project Structure:**
- `src/pages/` - File-based routing (`.astro` files become routes)
- `src/layouts/` - Page wrapper components (Layout.astro provides HTML shell)
- `src/components/` - Reusable Astro components
- `src/assets/` - Images processed by Astro's image optimization
- `public/` - Static assets served as-is (favicon, etc.)

**Key Patterns:**
- Components use Astro's frontmatter syntax: code between `---` fences runs at build time
- The `<slot />` element in layouts renders child content
- Remote images require domain allowlisting in `astro.config.mjs` (see `image.domains`)

**React Integration:**
- React 19 is configured via `@astrojs/react` integration
- TSConfig uses `jsx: "react-jsx"` with `jsxImportSource: "react"`
- React components (`.tsx`) can be used as islands with client directives:
  - `client:load` - Hydrate immediately on page load
  - `client:idle` - Hydrate when main thread is free
  - `client:visible` - Hydrate when component enters viewport
  - `client:media` - Hydrate when CSS media query matches
  - `client:only="react"` - Skip SSR, render only on client
