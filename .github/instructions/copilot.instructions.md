---
applyTo: '**'
---
# Terra Santa App - AI Coding Instructions

## Project Overview
A mobile-first Nuxt 4 + Vuetify 3 catalog for Brazilian Catholic dioceses, parishes (paróquias), and communities. Backend is Directus 20 headless CMS. The app follows a hierarchical navigation: Diocese → Paróquia → Capela → Comunidade.

## Architecture Patterns

### Data Flow & Backend Integration
- **Directus SDK 20**: All data fetched via Directus REST API using `@directus/sdk`
- **Server-side client**: Singleton Directus client in `server/api/utils/directus.ts` using `staticToken()` auth
- **Generic API route**: `server/api/directus/[collection].ts` supports all Directus query params (filter, fields, sort, limit, page, deep, aggregate)
- **Type generation**: Run `bun scripts/generate-types.ts` to regenerate TypeScript types from Directus schema → `app/types/schema.ts`

### Key Routes & URL Structure
```
/d/[slug-diocese]              → Diocese detail
/p/[slug-paroquia]             → Paróquia detail  
/p/[paroquia]/[capela]         → Capela detail
/p/[paroquia]/[capela]/[com]   → Comunidade detail
```

### Composables Pattern
- **useDirectusAsset()**: Image URL generation with Directus transforms (width, height, quality, fit, format). Always use for images
- **useParoquia()**: Encapsulates all paróquia-related queries (getParoquiaById, getParoquias, getCapelas, getEventos, getHorarios, getClero)
- Query composables handle filter construction, field selection, and error handling

### Component Conventions
- **Card variants**: All entity cards support `variant="grid"|"list"` prop (see `ParoquiaCard.vue`)
- **Image handling**: Use `getImageUrl()` with responsive options. Fallback to placehold.co placeholders when null
- **Navigation**: Use `navigateTo()` for routing, construct URLs from `slug` or `id` fields

### Vuetify Theme System
- **Custom theme**: Catholic-inspired colors in `nuxt.config.ts` runtimeConfig.public.theme
- **Dynamic variants**: Theme plugin (`app/plugins/vuetify.ts`) auto-generates -darken-1/2 and -lighten-1/2 variants via `mix()` function
- **Icons**: Uses @mdi/font (Material Design Icons). Always use mdi-* prefix (e.g., `mdi-calendar`)

### API Query Patterns
When calling `/api/directus/[collection]`:
```typescript
// Filter syntax
filter: JSON.stringify({ status: { _eq: 'published' }, cidade: { _eq: 'value' }})

// Fields selection (CSV string or array)
fields: 'id,nome,capa.*,diocese.nome'

// Deep filtering for relationships
deep: JSON.stringify({ autor: { _filter: { ativo: { _eq: true }}}})
```

### Page Data Fetching
- Use `useAsyncData()` for SSR-compatible fetching in pages
- Key data by unique identifier: `paroquia-detail:${slug}`
- Implement slug OR id fallback pattern (try slug first, then id)
- Check for 404 errors explicitly and handle gracefully

### Mobile-First Layout
- **Bottom navigation**: 4 buttons (Agenda, Mapa, Notícias, Time) defined in `app/layouts/default.vue`
- **Context-aware nav**: Bottom nav adapts based on route (diocese/paroquia/capela/comunidade)
- **App bar**: Fixed top bar with "TerraSanta.app" title, search, and profile icons

## Development Workflow

### Setup & Run
```powershell
bun install              # Install dependencies
bun run dev              # Dev server on port 3003
bun run build            # Production build
bun run generate         # Static site generation
```

### Type Generation
```powershell
bun scripts/generate-types.ts   # Regenerate Directus types
```
Requires `.env` with `NUXT_PUBLIC_DIRECTUS_URL` and `DIRECTUS_TOKEN`

### Linting
Uses `@antfu/eslint-config` with Vue support. Config in `eslint.config.js`

## Critical Environment Variables
```env
NUXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your-admin-token
```

## Common Gotchas
- **Directus file IDs**: Can be string or `DirectusFile` object. Always handle both in `getImageUrl()`
- **SSR compatibility**: Use `useRuntimeConfig()` for env vars, never `process.env` in client code
- **Route params**: Cast to string, handle array case: `Array.isArray(param) ? param[0] : param`
- **Status filtering**: Most collections need `status: { _eq: 'published' }` filter for public data

## File Structure Notes
- `app/` → Nuxt app directory (pages, components, composables, layouts)
- `server/api/` → Server-side API routes and utilities
- `public/` → Static assets
- `scripts/` → Build-time scripts (type generation)
