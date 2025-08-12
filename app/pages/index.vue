<script setup lang="ts">
// SEO
useHead({
  title: 'Início',
  meta: [
    { name: 'description', content: 'Terra Santa - Catálogo diocesano navegável e confiável. Encontre horários de missas, eventos e informações das paróquias e capelas.' },
    { property: 'og:title', content: 'Terra Santa - Catálogo Diocesano Digital' },
    { property: 'og:description', content: 'Encontre horários de missas, eventos e informações das paróquias e capelas da nossa diocese' },
  ],
})

// Search functionality
const searchQuery = ref('')
const selectedCity = ref('')

// Mock data - será substituído por dados reais do Directus
const cities = [
  'Todas as cidades',
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Salvador',
]

const quickAccessCards = [
  {
    title: 'Missas Hoje',
    description: 'Horários de missas para hoje',
    icon: 'mdi-clock',
    color: 'accent',
    to: '/missas-hoje',
  },
  {
    title: 'Paróquias',
    description: 'Explore todas as paróquias',
    icon: 'mdi-church',
    color: 'primary',
    to: '/paroquias',
  },
  {
    title: 'Capelas',
    description: 'Encontre capelas próximas',
    icon: 'mdi-cross',
    color: 'secondary',
    to: '/capelas',
  },
  {
    title: 'Comunidades',
    description: 'Grupos e comunidades',
    icon: 'mdi-account-group',
    color: 'success',
    to: '/comunidades',
  },
]

// Mock events data
const todaysEvents = ref([
  {
    id: 1,
    title: 'Missa Dominical',
    time: '07:00',
    location: 'Paróquia São José',
    type: 'missa',
  },
  {
    id: 2,
    title: 'Terço dos Homens',
    time: '19:30',
    location: 'Capela Nossa Senhora',
    type: 'oração',
  },
  {
    id: 3,
    title: 'Catequese Infantil',
    time: '14:00',
    location: 'Paróquia Santa Maria',
    type: 'catequese',
  },
])

// Functions
function performSearch() {
  navigateTo({
    path: '/buscar',
    query: {
      q: searchQuery.value,
      cidade: selectedCity.value,
    },
  })
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-sheet
            :height="500"
            color="primary"
            class="d-flex align-center justify-center position-relative"
          >
            <!-- Background Pattern -->
            <div class="hero-pattern" />

            <v-container class="text-center position-relative">
              <div class="text-white">
                <h1 class="text-h2 text-lg-h1 font-weight-bold mb-4">
                  Terra Santa
                </h1>
                <p class="text-h5 text-lg-h4 mb-6 font-weight-light">
                  Catálogo Diocesano Digital
                </p>
                <p class="text-body-1 text-lg-h6 mb-8 mx-auto" style="max-width: 600px;">
                  Encontre horários de missas, eventos e informações das paróquias e capelas da nossa diocese
                </p>

                <!-- Quick Actions -->
                <div class="d-flex flex-wrap justify-center gap-3">
                  <v-btn
                    size="large"
                    color="accent"
                    variant="flat"
                    to="/missas-hoje"
                    class="text-none"
                  >
                    <v-icon start>
                      mdi-clock
                    </v-icon>
                    Missas Hoje
                  </v-btn>
                  <v-btn
                    size="large"
                    color="secondary"
                    variant="flat"
                    to="/agenda"
                    class="text-none"
                  >
                    <v-icon start>
                      mdi-calendar
                    </v-icon>
                    Ver Agenda
                  </v-btn>
                  <v-btn
                    size="large"
                    variant="outlined"
                    color="white"
                    to="/buscar"
                    class="text-none"
                  >
                    <v-icon start>
                      mdi-magnify
                    </v-icon>
                    Buscar
                  </v-btn>
                </div>
              </div>
            </v-container>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <!-- Quick Search Section -->
    <v-container class="py-12">
      <v-row>
        <v-col cols="12" md="8" offset-md="2">
          <v-card elevation="4" rounded="xl">
            <v-card-text class="pa-8">
              <h2 class="text-h4 text-center mb-6 text-primary">
                Encontre Rapidamente
              </h2>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchQuery"
                    label="Buscar paróquia, capela ou evento"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    clearable
                    @keyup.enter="performSearch"
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
                  <v-btn
                    block
                    size="large"
                    color="primary"
                    @click="performSearch"
                  >
                    Buscar
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Quick Access Cards -->
    <v-container class="py-8">
      <h2 class="text-h4 text-center mb-8 text-primary">
        Acesso Rápido
      </h2>

      <v-row>
        <v-col
          v-for="card in quickAccessCards"
          :key="card.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            :to="card.to"
            class="text-center pa-4 h-100"
            elevation="2"
            hover
          >
            <v-icon
              :icon="card.icon"
              size="48"
              :color="card.color"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              {{ card.title }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              {{ card.description }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Today's Events Section -->
    <v-container fluid class="py-12" style="background-color: rgb(var(--v-theme-surface-variant));">
      <v-container>
        <h2 class="text-h4 text-center mb-8 text-primary">
          Eventos de Hoje
        </h2>

        <v-row>
          <v-col
            v-for="event in todaysEvents"
            :key="event.id"
            cols="12"
            md="6"
            lg="4"
          >
            <EventCard :event="event" />
          </v-col>
        </v-row>

        <div class="text-center mt-8">
          <v-btn
            to="/agenda"
            variant="outlined"
            color="primary"
            size="large"
          >
            Ver Agenda Completa
            <v-icon end>
              mdi-arrow-right
            </v-icon>
          </v-btn>
        </div>
      </v-container>
    </v-container>

    <!-- Diocese Info Section -->
    <v-container class="py-12">
      <v-row align="center">
        <v-col cols="12" md="6">
          <h2 class="text-h4 mb-4 text-primary">
            Nossa Diocese
          </h2>
          <p class="text-body-1 mb-4">
            A Diocese compreende uma comunidade de fiéis unidos pela fé e pela tradição católica,
            servindo às necessidades espirituais e pastorais de nossa região.
          </p>
          <p class="text-body-1 mb-6">
            Aqui você encontra informações completas sobre todas as paróquias, capelas,
            comunidades e eventos que acontecem em nossa diocese.
          </p>
          <v-btn
            to="/diocese"
            color="primary"
            size="large"
            variant="flat"
          >
            Conheça a Diocese
            <v-icon end>
              mdi-arrow-right
            </v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            elevation="2"
            color="surface-variant"
            class="rounded-lg d-flex align-center justify-center"
            height="400"
          >
            <div class="text-center">
              <v-icon
                icon="mdi-church"
                size="120"
                color="primary"
                class="mb-4"
              />
              <h3 class="text-h5 text-primary">
                Nossa Diocese
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                Comunidade de fé e tradição
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  background-size: 100px 100px;
  opacity: 0.3;
}
</style>
