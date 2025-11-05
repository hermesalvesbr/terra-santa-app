<script setup lang="ts">
import type { Paroquia } from '~/types/schema'

useHead({
  title: 'Paróquias',
  meta: [
    { name: 'description', content: 'Explore todas as paróquias da diocese. Encontre informações, horários de missas e localizações.' },
  ],
})

const route = useRoute()

const ITEMS_PER_PAGE = 12

const searchQuery = ref('')
const selectedCity = ref<string | null>(null)
const selectedDiocese = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)

// Aplicar filtro de diocese da query string
onMounted(() => {
  const dioceseParam = route.query.diocese
  if (dioceseParam) {
    const dioceseId = Array.isArray(dioceseParam) ? dioceseParam[0] : dioceseParam
    selectedDiocese.value = dioceseId || null
  }
})

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

function extractDioceseName(paroquia: Paroquia) {
  if (paroquia.diocese && typeof paroquia.diocese === 'object' && 'nome' in paroquia.diocese)
    return paroquia.diocese.nome as string
  return ''
}

function extractDioceseId(paroquia: Paroquia) {
  if (paroquia.diocese && typeof paroquia.diocese === 'object' && 'id' in paroquia.diocese)
    return String(paroquia.diocese.id)
  return ''
}

function extractDioceseSlug(paroquia: Paroquia) {
  if (paroquia.diocese && typeof paroquia.diocese === 'object' && 'slug' in paroquia.diocese)
    return String(paroquia.diocese.slug)
  return ''
}

interface PreparedParoquia {
  paroquia: Paroquia
  dioceseName: string
  dioceseId: string
  dioceseSlug: string
  cityNormalized: string
  dioceseNormalized: string
  searchCache: string
}

const preparedParoquias = computed<PreparedParoquia[]>(() => {
  return allParoquias.value.map((paroquia) => {
    const dioceseName = extractDioceseName(paroquia)
    const dioceseId = extractDioceseId(paroquia)
    const dioceseSlug = extractDioceseSlug(paroquia)
    const cityNormalized = normalizeValue(paroquia.cidade)
    const dioceseNormalized = normalizeValue(dioceseName)
    const searchCache = normalizeValue([
      paroquia.nome,
      paroquia.descricao,
      paroquia.cidade,
      dioceseName,
    ]
      .filter(Boolean)
      .join(' '))

    return {
      paroquia,
      dioceseName,
      dioceseId,
      dioceseSlug,
      cityNormalized,
      dioceseNormalized,
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

const dioceses = computed(() => {
  const set = new Set<string>()
  for (const entry of preparedParoquias.value) {
    if (entry.dioceseName)
      set.add(entry.dioceseName)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const filteredParoquias = computed(() => {
  const normalizedCity = normalizeValue(selectedCity.value)
  const normalizedDiocese = normalizeValue(selectedDiocese.value)
  const normalizedSearch = normalizeValue(searchQuery.value)

  return preparedParoquias.value
    .filter((entry) => {
      if (normalizedCity && entry.cityNormalized !== normalizedCity)
        return false

      // Filtrar por diocese: aceita slug, nome ou ID
      if (normalizedDiocese) {
        const matchesSlug = entry.dioceseSlug && normalizeValue(entry.dioceseSlug) === normalizedDiocese
        const matchesName = entry.dioceseNormalized === normalizedDiocese
        const matchesId = entry.dioceseId === selectedDiocese.value

        if (!matchesSlug && !matchesName && !matchesId)
          return false
      }

      if (normalizedSearch && !entry.searchCache.includes(normalizedSearch))
        return false

      return true
    })
    .map(entry => entry.paroquia)
})

watch([searchQuery, selectedCity, selectedDiocese], () => {
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

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim() || selectedCity.value || selectedDiocese.value))

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
  return 'Ainda não temos paróquias cadastradas para exibir aqui.'
})

function clearFilters() {
  searchQuery.value = ''
  selectedCity.value = null
  selectedDiocese.value = null
  currentPage.value = 1
}
</script>

<template>
  <div>
    <v-container fluid class="pa-0">
      <v-sheet
        :height="220"
        color="primary"
        class="d-flex align-center"
      >
        <v-container>
          <h1 class="text-h4 text-white font-weight-bold mb-2">
            Paróquias
          </h1>
          <p class="text-body-1 text-white opacity-90 mb-4">
            Explore todas as paróquias da nossa diocese, descubra horários, clero e informações de contato.
          </p>
          <div class="d-flex flex-wrap align-center">
            <v-chip
              color="white"
              text-color="primary"
              variant="tonal"
              class="mr-3 mb-2"
            >
              <v-icon start color="primary">
                fluent-color:building-retail-24
              </v-icon>
              {{ totalParoquias }} cadastrada{{ totalParoquias !== 1 ? 's' : '' }}
            </v-chip>
            <v-chip
              v-if="hasActiveFilters"
              color="white"
              text-color="primary"
              variant="tonal"
              class="mb-2"
            >
              <v-icon start color="primary">
                fluent-color:filter-24
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
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Buscar paróquia"
                prepend-inner-icon="fluent-color:search-24"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedCity"
                :items="cities"
                label="Cidade"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedDiocese"
                :items="dioceses"
                label="Diocese"
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
                  fluent-color:filter-dismiss-24
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
            <v-icon>fluent-color:grid-24</v-icon>
          </v-btn>
          <v-btn value="list" size="small">
            <v-icon>fluent-color:text-bullet-list-square-24</v-icon>
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
          <v-icon icon="fluent-color:building-retail-24" size="64" class="text-disabled mb-4" />
          <h3 class="text-h5 mb-2 text-disabled">
            Nenhuma paróquia encontrada
          </h3>
          <p class="text-body-1 text-disabled mb-4">
            {{ emptyStateMessage }}
          </p>
          <v-btn
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
