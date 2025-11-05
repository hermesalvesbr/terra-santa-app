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

### Styling & CSS Guidelines
⚠️ **CRITICAL: NO CUSTOM CSS** ⚠️
- **NEVER write custom CSS/SCSS**: Use only Vuetify utility classes for all styling needs
- **Vuetify components first**: Always prefer native Vuetify components over custom HTML + CSS
- **Utility classes**: Use Vuetify's utility system (spacing: `ma-4`, `pa-2`; text: `text-h5`, `text-center`; colors: `bg-primary`, `text-secondary`; flex: `d-flex`, `justify-center`, `align-center`)
- **Component API reference**: Use MCP tool `get_component_api_by_version` to check available props, slots, and events before implementing
- **Responsive design**: Use Vuetify display helpers (`d-none d-sm-flex`, breakpoint props) instead of media queries
- **Theme colors**: Reference theme colors via utility classes (`bg-primary`, `text-accent`) - never hardcode hex/rgb values

Examples of CORRECT styling:
```vue
<!-- ✅ GOOD: Vuetify utilities only -->
<v-card class="ma-4 pa-6 rounded-lg elevation-2">
  <v-card-title class="text-h5 text-primary mb-2">Title</v-card-title>
  <v-card-text class="d-flex flex-column ga-3">Content</v-card-text>
</v-card>

<!-- ❌ BAD: Custom CSS -->
<div class="custom-card">
  <style scoped>
  .custom-card { margin: 16px; padding: 24px; }
  </style>
</div>
```

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

### Nuxt 4 Best Practices
⚠️ **Leverage Nuxt 4 Built-ins** ⚠️
- **Auto-imports**: Never manually import composables, components, or utilities (Nuxt auto-imports from `composables/`, `components/`, `utils/`)
- **File-based routing**: Use `pages/` directory structure for routes - no manual router config
- **Server routes**: Use `server/api/` for API endpoints with automatic route generation
- **SEO & Meta**: Use `useSeoMeta()`, `useHead()`, or `definePageMeta()` for metadata - never manual `<head>` tags
- **Data fetching**: Prefer `useAsyncData()` and `useFetch()` over manual async/await in setup
- **Error handling**: Use `createError()` and `showError()` for standardized error pages
- **State management**: Use `useState()` for reactive cross-component state instead of external state libs
- **Layouts**: Define layouts in `layouts/` and reference with `definePageMeta({ layout: 'name' })`
- **Middleware**: Use `middleware/` for route guards, auth checks (auto-applied or via `definePageMeta`)
- **Environment**: Always use `useRuntimeConfig()` for env vars (public or private)

Examples:
```vue
<!-- ✅ GOOD: Nuxt 4 patterns -->
<script setup lang="ts">
// Auto-imported composables
const { data } = await useAsyncData('key', () => $fetch('/api/data'))

// Built-in SEO
useSeoMeta({
  title: 'Page Title',
  description: 'Page description'
})

// Auto-imported components (no import needed)
</script>

<template>
  <ParoquiaCard :paroquia="data" />
</template>

<!-- ❌ BAD: Manual imports, custom patterns -->
<script setup lang="ts">
import { ref } from 'vue'
import ParoquiaCard from '@/components/ParoquiaCard.vue'

const data = ref(null)
// Manual fetch logic...
</script>
```

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
