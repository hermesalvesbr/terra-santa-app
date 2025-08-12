<script setup lang="ts">
// SEO
useHead({
  title: 'Paróquias',
  meta: [
    { name: 'description', content: 'Explore todas as paróquias da diocese. Encontre informações, horários de missas e localizações.' },
  ],
})

// Reactive data
const searchQuery = ref('')
const selectedCity = ref('')
const selectedRegion = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const itemsPerPage = 12

// Mock data - será substituído por dados reais do Directus
const paroquias = ref([
  {
    id: 1,
    nome: 'Paróquia São José',
    cidade: 'São Paulo',
    uf: 'SP',
    regiao: 'Centro',
    fotoCapa: '/api/placeholder/300/200',
    totalCapelas: 5,
    proximaMissa: 'Hoje, 18:00',
  },
  {
    id: 2,
    nome: 'Paróquia Santa Maria',
    cidade: 'São Paulo',
    uf: 'SP',
    regiao: 'Zona Norte',
    fotoCapa: '/api/placeholder/300/200',
    totalCapelas: 3,
    proximaMissa: 'Amanhã, 07:00',
  },
  {
    id: 3,
    nome: 'Paróquia São Pedro',
    cidade: 'Guarulhos',
    uf: 'SP',
    regiao: 'Grande São Paulo',
    fotoCapa: '/api/placeholder/300/200',
    totalCapelas: 7,
    proximaMissa: 'Hoje, 19:30',
  },
  {
    id: 4,
    nome: 'Paróquia Santa Rita',
    cidade: 'São Paulo',
    uf: 'SP',
    regiao: 'Zona Sul',
    fotoCapa: '/api/placeholder/300/200',
    totalCapelas: 4,
    proximaMissa: 'Domingo, 08:00',
  },
  {
    id: 5,
    nome: 'Paróquia São João',
    cidade: 'Osasco',
    uf: 'SP',
    regiao: 'Grande São Paulo',
    fotoCapa: '/api/placeholder/300/200',
    totalCapelas: 6,
    proximaMissa: 'Hoje, 17:00',
  },
  {
    id: 6,
    nome: 'Paróquia Nossa Senhora',
    cidade: 'São Paulo',
    uf: 'SP',
    regiao: 'Zona Leste',
    fotoCapa: '/api/placeholder/300/200',
    totalCapelas: 8,
    proximaMissa: 'Amanhã, 06:30',
  },
])

const filteredParoquias = ref([...paroquias.value])

// Computed
const cities = computed(() => {
  const uniqueCities = [...new Set(paroquias.value.map(p => p.cidade))]
  return uniqueCities.sort()
})

const regions = computed(() => {
  const uniqueRegions = [...new Set(paroquias.value.map(p => p.regiao))]
  return uniqueRegions.sort()
})

const totalPages = computed(() => {
  return Math.ceil(filteredParoquias.value.length / itemsPerPage)
})

const paginatedParoquias = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredParoquias.value.slice(start, end)
})

// Functions
function filterParoquias() {
  filteredParoquias.value = paroquias.value.filter((paroquia) => {
    const matchesSearch = !searchQuery.value
      || paroquia.nome.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCity = !selectedCity.value
      || paroquia.cidade === selectedCity.value

    const matchesRegion = !selectedRegion.value
      || paroquia.regiao === selectedRegion.value

    return matchesSearch && matchesCity && matchesRegion
  })

  currentPage.value = 1 // Reset to first page
}

function clearFilters() {
  searchQuery.value = ''
  selectedCity.value = ''
  selectedRegion.value = ''
  filterParoquias()
}

// Watch for page changes to scroll to top
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <v-container fluid class="pa-0">
      <v-sheet
        :height="200"
        color="primary"
        class="d-flex align-center"
      >
        <v-container>
          <h1 class="text-h3 text-white font-weight-bold mb-2">
            Paróquias
          </h1>
          <p class="text-h6 text-white mb-0">
            Explore todas as paróquias da nossa diocese
          </p>
        </v-container>
      </v-sheet>
    </v-container>

    <!-- Filters and Search -->
    <v-container class="py-6">
      <v-card elevation="2" class="mb-6">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Buscar paróquia"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
                @input="filterParoquias"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedCity"
                :items="cities"
                label="Cidade"
                variant="outlined"
                clearable
                @update:model-value="filterParoquias"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedRegion"
                :items="regions"
                label="Região"
                variant="outlined"
                clearable
                @update:model-value="filterParoquias"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-btn
                block
                color="primary"
                variant="flat"
                @click="clearFilters"
              >
                <v-icon start>
                  mdi-filter-off
                </v-icon>
                Limpar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Results Info -->
      <div class="d-flex justify-space-between align-center mb-4">
        <p class="text-body-1 text-medium-emphasis">
          {{ filteredParoquias.length }} paróquia{{ filteredParoquias.length !== 1 ? 's' : '' }} encontrada{{ filteredParoquias.length !== 1 ? 's' : '' }}
        </p>

        <v-btn-toggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          divided
        >
          <v-btn value="grid" size="small">
            <v-icon>mdi-view-grid</v-icon>
          </v-btn>
          <v-btn value="list" size="small">
            <v-icon>mdi-view-list</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Grid View -->
      <v-row v-if="viewMode === 'grid'">
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

      <!-- List View -->
      <div v-else>
        <v-card
          v-for="paroquia in paginatedParoquias"
          :key="paroquia.id"
          elevation="1"
          class="mb-3"
        >
          <v-row no-gutters>
            <v-col cols="3" md="2">
              <v-img
                :src="paroquia.fotoCapa || '/api/placeholder/200/150'"
                :alt="paroquia.nome"
                height="120"
                cover
              />
            </v-col>
            <v-col cols="9" md="10">
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12" md="8">
                    <h3 class="text-h6 mb-2">
                      {{ paroquia.nome }}
                    </h3>
                    <div class="d-flex align-center mb-2">
                      <v-icon icon="mdi-map-marker" size="16" class="mr-2 text-medium-emphasis" />
                      <span class="text-body-2 text-medium-emphasis">{{ paroquia.cidade }}, {{ paroquia.uf }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon icon="mdi-cross" size="16" class="mr-2 text-medium-emphasis" />
                      <span class="text-body-2 text-medium-emphasis">
                        {{ paroquia.totalCapelas }} capela{{ paroquia.totalCapelas !== 1 ? 's' : '' }}
                      </span>
                    </div>
                    <div v-if="paroquia.proximaMissa" class="d-flex align-center">
                      <v-icon icon="mdi-clock" size="16" class="mr-2 text-medium-emphasis" />
                      <span class="text-body-2 text-medium-emphasis">
                        Próxima missa: {{ paroquia.proximaMissa }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" class="text-right">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      :to="`/paroquias/${paroquia.id}`"
                    >
                      Ver Detalhes
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </div>

      <!-- No Results -->
      <v-row v-if="filteredParoquias.length === 0">
        <v-col cols="12" class="text-center py-12">
          <v-icon icon="mdi-church" size="64" class="text-disabled mb-4" />
          <h3 class="text-h5 mb-2 text-disabled">
            Nenhuma paróquia encontrada
          </h3>
          <p class="text-body-1 text-disabled mb-4">
            Tente ajustar os filtros ou buscar por outro termo
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            @click="clearFilters"
          >
            Limpar Filtros
          </v-btn>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-8">
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
