<script setup lang="ts">
import type { Diocese } from '~/types/schema'

useHead({
  title: 'Encontre sua Diocese',
  meta: [
    { name: 'description', content: 'Encontre sua diocese e descubra as paróquias, eventos e comunidades católicas próximas a você.' },
  ],
})

// Buscar dioceses
const {
  data: diocesesResponse,
  pending: diocesesPending,
  error: diocesesError,
  refresh: refreshDioceses,
} = await useFetch<{ data: Diocese[] }>('/api/directus/diocese', {
  query: {
    limit: -1,
    sort: 'nome',
    fields: ['id', 'nome', 'slug', 'descricao', 'foto_capa.*', 'logo.*', 'site', 'instagram', 'youtube', 'whatsapp'].join(','),
    filter: JSON.stringify({
      status: { _eq: 'published' },
    }),
  },
})

const dioceses = computed(() => diocesesResponse.value?.data ?? [])

// Busca/filtro
const searchQuery = ref('')
const filteredDioceses = computed(() => {
  if (!searchQuery.value.trim())
    return dioceses.value

  const query = searchQuery.value.toLowerCase().trim()
  return dioceses.value.filter((diocese) => {
    return diocese.nome.toLowerCase().includes(query)
      || diocese.descricao?.toLowerCase().includes(query)
  })
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <v-sheet
      class="hero-section"
      elevation="0"
    >
      <v-container class="py-8">
        <div class="text-center text-white">
          <v-img
            src="/icone-terra-santa-app.png"
            width="64"
            height="64"
            class="mb-4 mx-auto"
          />
          <h1 class="text-h4 font-weight-bold mb-3">
            TerraSanta.app
          </h1>
        </div>
      </v-container>
    </v-sheet>

    <!-- Search Bar -->
    <v-container class="search-container">
      <v-card
        elevation="8"
        rounded="xl"
        class="mx-auto search-card"
      >
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar diocese..."
          variant="solo-filled"
          hide-details
          clearable
          density="comfortable"
        />
      </v-card>
    </v-container>

    <!-- Main Content -->
    <v-container class="py-4">
      <!-- Loading State -->
      <div v-if="diocesesPending" class="d-flex flex-column gap-4">
        <v-skeleton-loader
          v-for="index in 3"
          :key="`skeleton-${index}`"
          type="card"
          class="rounded-xl"
        />
      </div>

      <!-- Error State -->
      <v-card
        v-else-if="diocesesError"
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
          Não foi possível carregar as dioceses
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Verifique sua conexão e tente novamente
        </p>
        <v-btn
          color="primary"
          variant="tonal"
          size="large"
          @click="refreshDioceses"
        >
          <v-icon start icon="mdi-refresh" />
          Tentar Novamente
        </v-btn>
      </v-card>

      <!-- Empty State -->
      <v-card
        v-else-if="filteredDioceses.length === 0 && !searchQuery"
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
          Nenhuma diocese disponível
        </h3>
        <p class="text-body-2 text-medium-emphasis">
          Novas dioceses serão adicionadas em breve
        </p>
      </v-card>

      <!-- No Search Results -->
      <v-card
        v-else-if="filteredDioceses.length === 0 && searchQuery"
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
        <p class="text-body-2 text-medium-emphasis">
          Tente buscar com outros termos
        </p>
      </v-card>

      <!-- Diocese Cards Grid -->
      <div v-else class="diocese-grid">
        <DiocesesCard
          v-for="diocese in filteredDioceses"
          :key="diocese.id"
          :diocese="diocese"
          variant="grid"
        />
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.hero-section {
  background: url('/background-hero-section.png') top center / cover no-repeat;
}

.search-container {
  margin-top: -28px;
  position: relative;
  z-index: 10;
}

.search-card {
  max-width: 600px;
}

.diocese-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Responsivo para tablets */
@media (min-width: 600px) {
  .diocese-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsivo para desktop */
@media (min-width: 960px) {
  .diocese-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
