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
    fields: ['id', 'nome', 'slug', 'descricao', 'foto_capa.*', 'logo.*', 'site', 'instagram', 'youtube', 'whatsapp'].join(','),
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
</script>

<template>
  <div class="bg-surface">
    <!-- Hero Section -->
    <v-sheet
      class="position-relative overflow-hidden"
      :style="heroBackgroundUrl ? `background-image: url('${heroBackgroundUrl}'); background-size: cover; background-position: center;` : undefined"
      color="primary"
      elevation="0"
    >
      <!-- Overlay -->
      <v-sheet
        class="position-absolute w-100 h-100"
        style="background: linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.7)); z-index: 0;"
        color="transparent"
      />
      <v-container class="py-12 position-relative" style="z-index: 1;">
        <div class="text-center text-white">
          <!-- Logo da Diocese -->
          <div v-if="diocese?.logo" class="d-flex justify-center mb-6">
            <v-img
              :src="getImageUrl(diocese.logo, { width: 400, height: 200, fit: 'contain', quality: 90 })"
              :alt="diocese.nome"
              max-width="200"
              max-height="120"
              class="elevation-4 bg-white rounded-lg pa-3"
            />
          </div>
          <div v-else class="d-flex justify-center mb-6">
            <v-sheet
              class="elevation-4 rounded-lg pa-6 d-flex align-center justify-center"
              color="white"
              width="160"
              height="120"
            >
              <v-icon icon="mdi-church" size="64" color="primary" />
            </v-sheet>
          </div>

          <!-- Nome da Diocese -->
          <h1 class="text-h3 font-weight-bold mb-2">
            {{ diocese?.nome || 'Diocese' }}
          </h1>

          <!-- Localização -->
          <div v-if="dioceseLocation" class="text-h6 mb-6 d-flex align-center justify-center" style="opacity: 0.9;">
            <v-icon icon="mdi-map-marker" size="24" class="mr-2" />
            <span>{{ dioceseLocation }}</span>
          </div>

          <!-- Estatísticas -->
          <div class="d-flex justify-center flex-wrap ga-3">
            <v-chip
              color="white"
              variant="flat"
              size="large"
              class="px-6"
            >
              <v-icon icon="mdi-church" start />
              {{ totalParoquias }} Paróquia{{ totalParoquias !== 1 ? 's' : '' }}
            </v-chip>
            <v-chip
              v-if="cities.length > 1"
              color="white"
              variant="flat"
              size="large"
              class="px-6"
            >
              <v-icon icon="mdi-city" start />
              {{ cities.length }} Cidade{{ cities.length !== 1 ? 's' : '' }}
            </v-chip>
          </div>
        </div>
      </v-container>
    </v-sheet>

    <!-- Search Bar & Filters -->
    <v-container style="margin-top: -40px; position: relative; z-index: 10;">
      <v-card
        elevation="8"
        rounded="xl"
        max-width="1000"
        class="mx-auto"
      >
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="7">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                placeholder="Buscar paróquia..."
                variant="solo-filled"
                hide-details
                clearable
                density="comfortable"
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
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2" class="d-flex">
              <v-btn-toggle
                v-model="viewMode"
                mandatory
                variant="outlined"
                divided
                density="comfortable"
                class="flex-grow-1"
              >
                <v-btn value="grid" icon="mdi-view-grid" />
                <v-btn value="list" icon="mdi-view-list" />
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Main Content -->
    <v-container class="py-4">
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
