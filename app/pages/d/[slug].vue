<script setup lang="ts">
import type { Diocese, Paroquia } from '~/types/schema'

definePageMeta({
  entityType: 'diocese',
  pageTitle: 'Diocese',
})

const route = useRoute()
const headerTitleOverride = useState<string>('layout-header-title', () => '')

const dioceseSlug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param[0] : param
})

// Buscar informações da diocese
const { data: dioceseResponse } = await useFetch<{ data: Diocese[] }>('/api/directus/diocese', {
  query: {
    limit: 1,
    fields: ['id', 'nome', 'slug', 'descricao', 'foto_capa.*', 'logo.*', 'site', 'instagram', 'youtube', 'whatsapp', 'bispo.nome', 'bispo.hierarquia'].join(','),
    filter: JSON.stringify({
      status: { _eq: 'published' },
      slug: { _eq: dioceseSlug.value },
    }),
  },
})

const diocese = computed(() => dioceseResponse.value?.data?.[0] || null)

watch(
  () => diocese.value?.nome,
  (nome) => {
    headerTitleOverride.value = nome ? `D. ${nome}` : ''
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  headerTitleOverride.value = ''
})

// Initialize composables
const { getImageUrl } = useDirectusAsset()

// SEO Meta Tags - Nuxt 4 Best Practices
const config = useRuntimeConfig()

const seoTitle = computed(() => {
  if (!diocese.value)
    return 'Diocese - Terra Santa'
  return `Paróquias - ${diocese.value.nome} - Terra Santa`
})

const seoDescription = computed(() => {
  if (!diocese.value?.descricao)
    return 'Explore as paróquias desta diocese católica.'
  const cleanDesc = diocese.value.descricao.replace(/<[^>]*>/g, '').trim()
  const preview = cleanDesc.length > 155 ? `${cleanDesc.slice(0, 152)}...` : cleanDesc
  return `Explore as paróquias da ${diocese.value.nome}. ${preview}`
})

const seoImage = computed(() => {
  if (!diocese.value)
    return `${config.public.directusUrl || 'https://terrasanta.app'}/assets/og-default.jpg`
  const image = diocese.value.foto_capa || diocese.value.logo
  return getImageUrl(image, { width: 1200, height: 630, fit: 'cover', quality: 85 })
})

const canonicalUrl = computed(() => {
  if (!diocese.value?.slug)
    return ''
  return `https://terrasanta.app/d/${diocese.value.slug}`
})

// Type-safe SEO meta tags with Open Graph and Twitter Card
useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogSiteName: 'Terra Santa',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
  robots: 'index, follow',
})

// Canonical URL and additional head elements
useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  htmlAttrs: {
    lang: 'pt-BR',
  },
})

const ITEMS_PER_PAGE = 12

const searchQuery = ref('')
const selectedCity = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)

// Buscar paróquias da diocese
const { data: paroquiasResponse, pending, error, refresh } = await useFetch<{ data: Paroquia[] }>(
  '/api/directus/paroquia',
  {
    query: {
      limit: -1,
      sort: 'nome',
      fields: [
        'id',
        'slug',
        'nome',
        'cidade',
        'uf',
        'descricao',
        'instagram',
        'whatsapp',
        'site',
        'capa.*',
        'logo.*',
        'diocese.id',
        'diocese.slug',
        'diocese.nome',
      ].join(','),
      filter: JSON.stringify({
        status: { _eq: 'published' },
        diocese: {
          slug: { _eq: dioceseSlug.value },
        },
      }),
    },
  },
)

const allParoquias = computed<Paroquia[]>(() => paroquiasResponse.value?.data ?? [])

// Get first paroquia's city/UF for diocese location display
const dioceseLocation = computed(() => {
  const firstParoquia = allParoquias.value[0]
  if (!firstParoquia)
    return ''
  return [firstParoquia.cidade, firstParoquia.uf].filter(Boolean).join(', ')
})

// Get bishop name for display
const bispoLabel = computed(() => {
  const bispo = diocese.value?.bispo
  if (!bispo || typeof bispo !== 'object')
    return ''
  const hierarquia = bispo.hierarquia || 'Dom'
  return `${hierarquia} ${bispo.nome}`
})

function normalizeValue(value: string | null | undefined) {
  return (value || '')
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
}

interface PreparedParoquia {
  paroquia: Paroquia
  cityNormalized: string
  searchCache: string
}

const preparedParoquias = computed<PreparedParoquia[]>(() => {
  return allParoquias.value.map((paroquia) => {
    const cityNormalized = normalizeValue(paroquia.cidade)
    const searchCache = normalizeValue([
      paroquia.nome,
      paroquia.descricao,
      paroquia.cidade,
    ]
      .filter(Boolean)
      .join(' '))

    return {
      paroquia,
      cityNormalized,
      searchCache,
    }
  })
})

const totalParoquias = computed(() => allParoquias.value.length)

const cities = computed(() => {
  const set = new Set<string>()
  for (const entry of preparedParoquias.value) {
    if (entry.paroquia.cidade)
      set.add(entry.paroquia.cidade)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const filteredParoquias = computed(() => {
  const normalizedCity = normalizeValue(selectedCity.value)
  const normalizedSearch = normalizeValue(searchQuery.value)

  return preparedParoquias.value
    .filter((entry) => {
      if (normalizedCity && entry.cityNormalized !== normalizedCity)
        return false

      if (normalizedSearch && !entry.searchCache.includes(normalizedSearch))
        return false

      return true
    })
    .map(entry => entry.paroquia)
})

watch([searchQuery, selectedCity], () => {
  currentPage.value = 1
})

watch(
  () => filteredParoquias.value.length,
  (length) => {
    const maxPage = Math.max(1, Math.ceil(length / ITEMS_PER_PAGE))
    if (currentPage.value > maxPage)
      currentPage.value = maxPage
  },
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredParoquias.value.length / ITEMS_PER_PAGE)))

const paginatedParoquias = computed(() => {
  if (!filteredParoquias.value.length)
    return []
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredParoquias.value.slice(start, start + ITEMS_PER_PAGE)
})

const resultLabel = computed(() => {
  const totalFiltered = filteredParoquias.value.length
  if (!totalFiltered)
    return 'Nenhuma paróquia encontrada'
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(start + ITEMS_PER_PAGE - 1, totalFiltered)
  return `Mostrando ${start}-${end} de ${totalFiltered} paróquias`
})

function clearFilters() {
  searchQuery.value = ''
  selectedCity.value = null
  currentPage.value = 1
}

const heroBackgroundUrl = computed(() => {
  if (!diocese.value?.foto_capa)
    return ''
  return getImageUrl(diocese.value.foto_capa, { width: 1920, height: 600, fit: 'cover', quality: 85 })
})

const logoUrl = getImageUrl(diocese.value?.logo || null)

const logoAlt = computed(() => {
  if (!diocese.value?.nome)
    return 'Logotipo da diocese'
  return `Logotipo da ${diocese.value.nome}`
})
</script>

<template>
  <div class="bg-surface">
    <!-- Hero Section -->
    <v-sheet
      class="position-relative overflow-hidden"
      color="primary"
      elevation="0"
    >
      <!-- Background Image with Gradient Overlay -->
      <v-img
        v-if="heroBackgroundUrl"
        :src="heroBackgroundUrl"
        cover
        height="100%"
        class="position-absolute w-100 h-100"
        gradient="to bottom, rgba(0,0,0,.6), rgba(0,0,0,.8)"
      />

      <v-container class="py-6 py-sm-8 py-md-12 position-relative" style="z-index: 1;">
        <div class="text-center text-white">
          <!-- Logo da Diocese com Background Translúcido -->
          <div>
            <v-img
              :src="logoUrl"
              :alt="logoAlt"
              height="125"
              fit="contain"
            />
          </div>

          <!-- Nome da Diocese -->
          <h1 class="text-h5 text-sm-h4 text-md-h3 font-weight-bold mb-1 mb-sm-2 px-4" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            {{ diocese?.nome || 'Diocese' }}
          </h1>

          <!-- Bispo -->
          <p v-if="bispoLabel" class="text-body-2 text-sm-subtitle-1 text-md-h6 mb-0 mb-sm-1 font-weight-medium px-4" style="opacity: 0.95; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            {{ bispoLabel }}
          </p>

          <!-- Localização -->
          <div v-if="dioceseLocation" class="text-body-2 text-sm-body-1 text-md-subtitle-1 mb-3 mb-sm-4 d-flex align-center justify-center px-4" style="opacity: 0.9; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            <v-icon icon="mdi-map-marker" :size="$vuetify.display.xs ? 18 : 20" class="mr-1" />
            <span>{{ dioceseLocation }}</span>
          </div>

          <!-- Estatísticas -->
          <div class="d-flex justify-center flex-wrap ga-2 ga-sm-3 mt-4 mt-sm-6 px-4">
            <v-chip
              color="white"
              variant="flat"
              :size="$vuetify.display.xs ? 'small' : 'default'"
              class="px-3 px-sm-4 px-md-6 font-weight-medium"
            >
              <v-icon icon="mdi-church" start :size="$vuetify.display.xs ? 'x-small' : 'small'" />
              <span class="text-caption text-sm-body-2">{{ totalParoquias }} Paróquia{{ totalParoquias !== 1 ? 's' : '' }}</span>
            </v-chip>
            <v-chip
              v-if="cities.length > 1"
              color="white"
              variant="flat"
              :size="$vuetify.display.xs ? 'small' : 'default'"
              class="px-3 px-sm-4 px-md-6 font-weight-medium"
            >
              <v-icon icon="mdi-city" start :size="$vuetify.display.xs ? 'x-small' : 'small'" />
              <span class="text-caption text-sm-body-2">{{ cities.length }} Cidade{{ cities.length !== 1 ? 's' : '' }}</span>
            </v-chip>
          </div>
        </div>
      </v-container>
    </v-sheet>

    <!-- Search Bar & Filters -->
    <v-container style="margin-top: -32px; position: relative; z-index: 10;" class="px-3 px-sm-4">
      <v-card
        :elevation="$vuetify.display.xs ? 6 : 8"
        rounded="xl"
        max-width="1000"
        class="mx-auto"
      >
        <v-card-text class="pa-3 pa-sm-4">
          <v-row dense>
            <v-col cols="12" md="7">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                placeholder="Buscar paróquia..."
                variant="solo-filled"
                hide-details
                clearable
                :density="$vuetify.display.xs ? 'compact' : 'comfortable'"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedCity"
                :items="cities"
                placeholder="Todas as cidades"
                prepend-inner-icon="mdi-city"
                variant="solo-filled"
                hide-details
                clearable
                :density="$vuetify.display.xs ? 'compact' : 'comfortable'"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2" class="d-flex">
              <v-btn-toggle
                v-model="viewMode"
                mandatory
                variant="outlined"
                divided
                :density="$vuetify.display.xs ? 'compact' : 'comfortable'"
                class="flex-grow-1"
              >
                <v-btn value="grid" icon="mdi-view-grid" :size="$vuetify.display.xs ? 'small' : 'default'" />
                <v-btn value="list" icon="mdi-view-list" :size="$vuetify.display.xs ? 'small' : 'default'" />
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Main Content -->
    <v-container class="py-3 py-sm-4 px-3 px-sm-4">
      <!-- Loading State -->
      <v-row v-if="pending">
        <v-col
          v-for="index in 6"
          :key="`skeleton-${index}`"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-skeleton-loader
            type="card"
            class="rounded-xl"
          />
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-card
        v-else-if="error"
        elevation="2"
        rounded="xl"
        class="pa-6 text-center"
      >
        <v-icon
          icon="mdi-alert-circle-outline"
          size="64"
          color="error"
          class="mb-4"
        />
        <h3 class="text-h6 mb-3">
          Não foi possível carregar as paróquias
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Verifique sua conexão e tente novamente
        </p>
        <v-btn
          color="primary"
          variant="tonal"
          size="large"
          @click="refresh"
        >
          <v-icon start icon="mdi-refresh" />
          Tentar Novamente
        </v-btn>
      </v-card>

      <!-- Empty State -->
      <v-card
        v-else-if="filteredParoquias.length === 0 && !searchQuery && !selectedCity"
        elevation="2"
        rounded="xl"
        class="pa-6 text-center"
      >
        <v-icon
          icon="mdi-church-outline"
          size="64"
          color="grey"
          class="mb-4"
        />
        <h3 class="text-h6 mb-2">
          Nenhuma paróquia cadastrada
        </h3>
        <p class="text-body-2 text-medium-emphasis">
          Novas paróquias serão adicionadas em breve
        </p>
      </v-card>

      <!-- No Search Results -->
      <v-card
        v-else-if="filteredParoquias.length === 0"
        elevation="2"
        rounded="xl"
        class="pa-6 text-center"
      >
        <v-icon
          icon="mdi-magnify"
          size="64"
          color="grey"
          class="mb-4"
        />
        <h3 class="text-h6 mb-2">
          Nenhum resultado encontrado
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Tente buscar com outros termos ou selecione outra cidade
        </p>
        <v-btn
          color="primary"
          variant="outlined"
          @click="clearFilters"
        >
          Limpar filtros
        </v-btn>
      </v-card>

      <!-- Results Counter -->
      <div v-else-if="!pending" class="d-flex justify-space-between align-center mb-4">
        <p class="text-body-1 text-medium-emphasis">
          {{ resultLabel }}
        </p>
      </div>

      <!-- Paróquias Grid View -->
      <v-row v-if="!pending && filteredParoquias.length > 0 && viewMode === 'grid'">
        <v-col
          v-for="paroquia in paginatedParoquias"
          :key="paroquia.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <ParoquiaCard
            :paroquia="paroquia"
            :diocese-slug="dioceseSlug"
            variant="grid"
          />
        </v-col>
      </v-row>

      <!-- Paróquias List View -->
      <div v-if="!pending && filteredParoquias.length > 0 && viewMode === 'list'" class="d-flex flex-column ga-4">
        <ParoquiaCard
          v-for="paroquia in paginatedParoquias"
          :key="`list-${paroquia.id}`"
          :paroquia="paroquia"
          :diocese-slug="dioceseSlug"
          variant="list"
        />
      </div>

      <!-- Pagination -->
      <div v-if="!pending && filteredParoquias.length > 0 && totalPages > 1" class="d-flex justify-center mt-8">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          rounded="circle"
        />
      </div>
    </v-container>

    <!-- About Diocese Section -->
    <v-container v-if="diocese && diocese.descricao" class="py-8">
      <v-card
        elevation="2"
        rounded="xl"
        class="pa-6"
      >
        <h2 class="text-h5 font-weight-bold mb-4">
          <v-icon icon="mdi-information-outline" class="mr-2" />
          Sobre a Diocese
        </h2>
        <div class="text-body-1 mb-6" v-html="diocese.descricao" />

        <!-- Social Links -->
        <v-divider class="my-6" />
        <div class="d-flex flex-wrap gap-3">
          <v-btn
            v-if="diocese.site"
            :href="diocese.site"
            target="_blank"
            color="indigo"
            variant="tonal"
            prepend-icon="mdi-web"
          >
            Site Oficial
          </v-btn>
          <v-btn
            v-if="diocese.whatsapp"
            :href="`https://wa.me/${diocese.whatsapp.replace(/\D/g, '')}`"
            target="_blank"
            color="success"
            variant="tonal"
            prepend-icon="mdi-whatsapp"
          >
            WhatsApp
          </v-btn>
          <v-btn
            v-if="diocese.instagram"
            :href="`https://instagram.com/${diocese.instagram.replace('@', '')}`"
            target="_blank"
            color="pink"
            variant="tonal"
            prepend-icon="mdi-instagram"
          >
            Instagram
          </v-btn>
          <v-btn
            v-if="diocese.youtube"
            :href="diocese.youtube"
            target="_blank"
            color="red"
            variant="tonal"
            prepend-icon="mdi-youtube"
          >
            YouTube
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>
