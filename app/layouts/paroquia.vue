<script setup lang="ts">
// Layout específico para páginas de paróquias - mobile-first
const route = useRoute()
const activeTab = ref('inicio')

// Mock data da paróquia - será substituído por dados do Directus
const paroquia = ref({
  nome: 'Paróquia São José',
  cidade: 'São Paulo',
  uf: 'SP',
  fotoCapa: '/api/placeholder/800/300',
  parocoNome: 'Pe. João Silva',
  parocoFoto: '/api/placeholder/100/100',
  whatsapp: '5511999999999',
  instagram: '@paroquiasaojose',
  youtube: '@paroquiasaojose',
  site: 'https://paroquiasaojose.com.br',
  telefone: '(11) 3333-4444',
  endereco: 'Rua das Flores, 123 - Centro',
})

// Navegação bottom
const navigationItems = [
  { icon: 'mdi-home', text: 'Início', value: 'inicio', to: '/paroquias/1' },
  { icon: 'mdi-calendar', text: 'Agenda', value: 'agenda', to: '/paroquias/1/agenda' },
  { icon: 'mdi-church', text: 'Capelas', value: 'capelas', to: '/paroquias/1/capelas' },
  { icon: 'mdi-account-group', text: 'Comunidades', value: 'comunidades', to: '/paroquias/1/comunidades' },
  { icon: 'mdi-dots-horizontal', text: 'Mais', value: 'mais', to: '/paroquias/1/mais' },
]

// Atualiza tab ativa baseada na rota
watch(() => route.path, (newPath) => {
  const matchedItem = navigationItems.find(item => newPath.includes(item.value))
  if (matchedItem) {
    activeTab.value = matchedItem.value
  }
}, { immediate: true })

// Scroll behavior
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <v-app>
    <!-- App Bar com comportamento de scroll -->
    <v-app-bar
      :elevation="isScrolled ? 4 : 0"
      scroll-behavior="elevate"
      color="surface"
      :class="{ 'app-bar-scrolled': isScrolled }"
    >
      <template #prepend>
        <v-btn
          icon="mdi-arrow-left"
          @click="$router.back()"
        />
      </template>

      <v-app-bar-title class="text-body-1 font-weight-medium">
        {{ paroquia.nome }}
      </v-app-bar-title>

      <template #append>
        <v-btn
          icon="mdi-magnify"
          @click="() => {}"
        />
        <v-btn
          icon="mdi-bell-outline"
          @click="() => {}"
        />
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <!-- Hero Section com foto de capa -->
      <v-sheet
        :image="paroquia.fotoCapa"
        height="200"
        class="d-flex align-end position-relative"
      >
        <div class="hero-overlay" />
        <v-container class="position-relative">
          <h1 class="text-h5 text-white font-weight-bold mb-1">
            {{ paroquia.nome }}
          </h1>
          <div class="d-flex align-center text-white">
            <v-icon size="16" class="mr-1">
              mdi-map-marker
            </v-icon>
            <span class="text-body-2">{{ paroquia.cidade }}, {{ paroquia.uf }}</span>
          </div>
        </v-container>
      </v-sheet>

      <!-- Quick Actions - Ações Rápidas -->
      <v-sheet class="quick-actions-bar" elevation="2">
        <v-container class="py-3">
          <v-row dense>
            <v-col cols="3" class="text-center">
              <v-btn
                :href="`https://wa.me/${paroquia.whatsapp}`"
                target="_blank"
                icon
                variant="flat"
                color="success"
                size="large"
                class="mb-1"
              >
                <v-icon>mdi-whatsapp</v-icon>
              </v-btn>
              <div class="text-caption">
                WhatsApp
              </div>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-btn
                :href="`https://instagram.com/${paroquia.instagram}`"
                target="_blank"
                icon
                variant="flat"
                color="pink-accent-2"
                size="large"
                class="mb-1"
              >
                <v-icon>mdi-instagram</v-icon>
              </v-btn>
              <div class="text-caption">
                Instagram
              </div>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-btn
                :href="`https://youtube.com/${paroquia.youtube}`"
                target="_blank"
                icon
                variant="flat"
                color="red"
                size="large"
                class="mb-1"
              >
                <v-icon>mdi-youtube</v-icon>
              </v-btn>
              <div class="text-caption">
                YouTube
              </div>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-btn
                :href="`tel:${paroquia.telefone.replace(/\D/g, '')}`"
                icon
                variant="flat"
                color="primary"
                size="large"
                class="mb-1"
              >
                <v-icon>mdi-phone</v-icon>
              </v-btn>
              <div class="text-caption">
                Ligar
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- Tabs de Navegação -->
      <v-tabs
        v-model="activeTab"
        bg-color="surface"
        color="primary"
        fixed-tabs
        class="tabs-navigation"
      >
        <v-tab
          v-for="item in navigationItems.slice(0, 4)"
          :key="item.value"
          :value="item.value"
          :to="item.to"
        >
          <v-icon :icon="item.icon" size="20" class="mb-1" />
          <span class="text-caption">{{ item.text }}</span>
        </v-tab>
      </v-tabs>

      <!-- Page Content -->
      <v-container class="pt-4 pb-20">
        <slot />
      </v-container>
    </v-main>

    <!-- Bottom Navigation - Mobile -->
    <v-bottom-navigation
      v-model="activeTab"
      bg-color="surface"
      color="primary"
      grow
      elevation="8"
      class="d-md-none"
    >
      <v-btn
        v-for="item in navigationItems"
        :key="item.value"
        :value="item.value"
        :to="item.to"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span class="text-caption">{{ item.text }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.quick-actions-bar {
  position: sticky;
  top: 64px;
  z-index: 2;
}

.tabs-navigation {
  position: sticky;
  top: 64px;
  z-index: 2;
}

.app-bar-scrolled {
  transition: all 0.3s ease;
}

/* Garantir espaço para bottom navigation no mobile */
@media (max-width: 960px) {
  .v-main {
    padding-bottom: 56px !important;
  }
}
</style>
