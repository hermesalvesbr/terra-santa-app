<script setup lang="ts">
import type { Diocese, Paroquia } from '~/types/schema'

definePageMeta({
  entityType: 'diocese',
  pageTitle: 'Diocese',
})

const route = useRoute()

const dioceseSlug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param[0] : param
})

// Buscar informações da diocese
const { data: dioceseResponse } = await useFetch<{ data: Diocese[] }>('/api/directus/diocese', {
  query: {
    limit: 1,
    fields: ['id', 'nome', 'slug', 'descricao', 'foto_capa.*', 'logo.*'].join(','),
    filter: JSON.stringify({
      status: { _eq: 'published' },
      slug: { _eq: dioceseSlug.value },
    }),
  },
})

const diocese = computed(() => dioceseResponse.value?.data?.[0] || null)

const headerTitleOverride = useState<string>('layout-header-title', () => '')

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

// Atualizar meta tags
useHead({
  title: computed(() => diocese.value ? `Paróquias - ${diocese.value.nome}` : 'Paróquias'),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        diocese.value?.descricao
          ? `Explore as paróquias da ${diocese.value.nome}. ${diocese.value.descricao.replace(/<[^>]*>/g, '').slice(0, 150)}...`
          : 'Explore as paróquias da diocese.',
      ),
    },
  ],
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

const isGridView = computed(() => viewMode.value === 'grid')

const skeletonCount = computed(() => (isGridView.value ? 6 : 4))

const skeletonType = computed(() => (isGridView.value ? 'card' : 'list-item-three-line'))

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim() || selectedCity.value))

const resultLabel = computed(() => {
  const totalFiltered = filteredParoquias.value.length
  if (!totalFiltered)
    return 'Nenhuma paróquia encontrada'
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(start + ITEMS_PER_PAGE - 1, totalFiltered)
  return `Mostrando ${start}-${end} de ${totalFiltered} paróquias`
})

const emptyStateMessage = computed(() => {
  if (hasActiveFilters.value)
    return 'Ajuste os filtros ou pesquise novamente para encontrar outras paróquias.'
  return 'Ainda não temos paróquias cadastradas nesta diocese.'
})

function clearFilters() {
  searchQuery.value = ''
  selectedCity.value = null
  currentPage.value = 1
}

const { getImageUrl } = useDirectusAsset()

const headerImageSrc = computed(() => {
  if (!diocese.value)
    return ''
  const image = diocese.value.foto_capa || diocese.value.logo
  return getImageUrl(image, { width: 1920, height: 400, fit: 'cover', quality: 80 })
})
</script>

<template>
  <div>
    <v-container fluid class="pa-0">
      <v-sheet
        :height="220"
        color="primary"
        class="d-flex align-center position-relative overflow-hidden"
      >
        <v-img
          v-if="headerImageSrc"
          :src="headerImageSrc"
          cover
          class="position-absolute w-100 h-100"
          gradient="to bottom, rgba(0,0,0,.4), rgba(0,0,0,.7)"
        />
        <v-container class="position-relative">
          <v-breadcrumbs
            class="text-white pa-0 mb-2"
            :items="[
              { title: 'Início', to: '/', disabled: false },
              { title: 'Dioceses', to: '/', disabled: false },
              { title: diocese?.nome || 'Paróquias', disabled: true },
            ]"
          >
            <template #divider>
              <v-icon icon="mdi-chevron-right" />
            </template>
          </v-breadcrumbs>
          <h1 class="text-h4 text-white font-weight-bold mb-2">
            {{ diocese?.nome || 'Paróquias' }}
          </h1>
          <p v-if="diocese?.descricao" class="text-body-1 text-white opacity-90 mb-4" style="max-width: 800px;">
            {{ diocese.descricao.replace(/<[^>]*>/g, '').slice(0, 200) }}{{ diocese.descricao.length > 200 ? '...' : '' }}
          </p>
          <div class="d-flex flex-wrap align-center">
            <v-chip
              color="white"
              text-color="primary"
              variant="tonal"
              class="mr-3 mb-2"
            >
              <v-icon start color="primary">
                mdi-church
              </v-icon>
              {{ totalParoquias }} paróquia{{ totalParoquias !== 1 ? 's' : '' }}
            </v-chip>
            <v-chip
              v-if="hasActiveFilters"
              color="white"
              text-color="primary"
              variant="tonal"
              class="mb-2"
            >
              <v-icon start color="primary">
                mdi-filter
              </v-icon>
              Filtros ativos
            </v-chip>
          </div>
        </v-container>
      </v-sheet>
    </v-container>

    <v-container class="py-6">
      <v-card elevation="2" class="mb-6">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                label="Buscar paróquia"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedCity"
                :items="cities"
                label="Cidade"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="2" class="d-flex align-end">
              <v-btn
                block
                color="primary"
                variant="flat"
                :disabled="!hasActiveFilters"
                @click="clearFilters"
              >
                <v-icon start>
                  mdi-filter-remove
                </v-icon>
                Limpar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-6"
      >
        Não foi possível carregar as paróquias. <v-btn variant="text" color="error" size="small" @click="refresh">
          Tentar novamente
        </v-btn>
      </v-alert>

      <div class="d-flex justify-space-between align-center flex-wrap mb-4">
        <p class="text-body-1 text-medium-emphasis mb-2">
          {{ resultLabel }}
        </p>

        <v-btn-toggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          divided
          class="mb-2"
        >
          <v-btn value="grid" size="small">
            <v-icon>mdi-view-grid</v-icon>
          </v-btn>
          <v-btn value="list" size="small">
            <v-icon>mdi-view-list</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-row v-if="pending" class="mb-6" :dense="isGridView">
        <v-col
          v-for="index in skeletonCount"
          :key="`skeleton-${index}`"
          cols="12"
          :sm="isGridView ? 6 : 12"
          :md="isGridView ? 4 : 12"
          :lg="isGridView ? 3 : 12"
        >
          <v-skeleton-loader
            class="rounded-lg"
            :type="skeletonType"
            :height="isGridView ? 280 : 180"
          />
        </v-col>
      </v-row>

      <v-row v-if="!pending && viewMode === 'grid'">
        <v-col
          v-for="paroquia in paginatedParoquias"
          :key="paroquia.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <ParoquiaCard :paroquia="paroquia" />
        </v-col>
      </v-row>

      <div v-else-if="!pending">
        <ParoquiaCard
          v-for="paroquia in paginatedParoquias"
          :key="`list-${paroquia.id}`"
          :paroquia="paroquia"
          variant="list"
          class="mb-4"
        />
      </div>

      <v-row v-if="!pending && filteredParoquias.length === 0">
        <v-col cols="12" class="text-center py-12">
          <v-icon icon="mdi-church" size="64" class="text-disabled mb-4" />
          <h3 class="text-h5 mb-2 text-disabled">
            Nenhuma paróquia encontrada
          </h3>
          <p class="text-body-1 text-disabled mb-4">
            {{ emptyStateMessage }}
          </p>
          <v-btn
            v-if="hasActiveFilters"
            color="primary"
            variant="outlined"
            @click="clearFilters"
          >
            Limpar filtros
          </v-btn>
        </v-col>
      </v-row>

      <div v-if="!pending && filteredParoquias.length > 0 && totalPages > 1" class="d-flex justify-center mt-8">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          variant="elevated"
        />
      </div>
    </v-container>
  </div>
</template>
