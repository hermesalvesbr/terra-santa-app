<script setup lang="ts">
import type { Paroquia } from '~/types/schema'

// Layout específico para páginas de paróquias - mobile-first
const route = useRoute()
const router = useRouter()
const activeTab = ref('inicio')

// Composable para assets do Directus
const { getImageUrl } = useDirectusAsset()

// Buscar dados da paróquia
const paroquiaId = computed(() => route.params.id as string)

const { data: paroquia } = await useFetch<Paroquia>(`/api/paroquia/${paroquiaId.value}`)

// Navegação bottom
const navigationItems = computed(() => [
  { icon: 'mdi-home', text: 'Início', value: 'inicio', to: `/p/${paroquiaId.value}` },
  { icon: 'mdi-calendar', text: 'Agenda', value: 'agenda', to: `/p/${paroquiaId.value}/agenda` },
  { icon: 'mdi-church', text: 'Capelas', value: 'capelas', to: `/p/${paroquiaId.value}/capelas` },
  { icon: 'mdi-account-group', text: 'Comunidades', value: 'comunidades', to: `/p/${paroquiaId.value}/comunidades` },
  { icon: 'mdi-dots-horizontal', text: 'Mais', value: 'mais', to: `/p/${paroquiaId.value}/mais` },
])

// Atualiza tab ativa baseada na rota
watch(() => route.path, (newPath) => {
  const matchedItem = navigationItems.value.find(item => newPath.includes(item.value))
  if (matchedItem) {
    activeTab.value = matchedItem.value
  }
}, { immediate: true })
</script>

<template>
  <v-app>
    <!-- App Bar minimalista -->
    <v-app-bar
      flat
      color="primary"
      height="56"
      class="app-bar-paroquia"
    >
      <template #prepend>
        <v-btn
          icon
          variant="text"
          color="white"
          @click="router.back()"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </template>

      <v-app-bar-title class="text-white text-body-1 font-weight-medium">
        {{ paroquia?.nome || 'Paróquia' }}
      </v-app-bar-title>

      <template #append>
        <v-btn
          icon
          variant="text"
          color="white"
          @click="() => {}"
        >
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <!-- Hero Section com foto de capa - Pode ser customizado via slot -->
      <slot name="hero">
        <v-sheet
          :image="paroquia ? getImageUrl(paroquia.capa, { width: 1200, height: 300 }) : undefined"
          :color="!paroquia?.capa ? 'primary' : undefined"
          height="200"
          class="d-flex align-end position-relative hero-section"
        >
          <div v-if="paroquia?.capa" class="hero-overlay" />
          <v-container class="position-relative py-4">
            <h1 class="text-h5 text-white font-weight-bold mb-1">
              {{ paroquia?.nome }}
            </h1>
            <div class="d-flex align-center text-white">
              <v-icon size="16" class="mr-1">
                mdi-map-marker
              </v-icon>
              <span class="text-body-2">{{ paroquia?.cidade }}, {{ paroquia?.uf }}</span>
            </div>
          </v-container>
        </v-sheet>
      </slot>

      <!-- Quick Actions - Ações Rápidas Fixas -->
      <v-sheet
        class="quick-actions-bar elevation-4"
        color="surface"
      >
        <v-container class="py-3">
          <v-row dense justify="center">
            <v-col v-if="paroquia?.whatsapp" cols="3" class="text-center">
              <v-btn
                :href="`https://wa.me/${paroquia.whatsapp.replace(/\D/g, '')}`"
                target="_blank"
                icon
                variant="flat"
                size="small"
                color="success"
                class="mb-1"
              >
                <v-icon size="20">
                  mdi-whatsapp
                </v-icon>
              </v-btn>
              <div class="text-caption text-truncate">
                WhatsApp
              </div>
            </v-col>
            <v-col v-if="paroquia?.instagram" cols="3" class="text-center">
              <v-btn
                :href="paroquia.instagram.startsWith('http') ? paroquia.instagram : `https://instagram.com/${paroquia.instagram.replace('@', '')}`"
                target="_blank"
                icon
                variant="flat"
                size="small"
                class="mb-1"
                style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white;"
              >
                <v-icon size="20">
                  mdi-instagram
                </v-icon>
              </v-btn>
              <div class="text-caption text-truncate">
                Instagram
              </div>
            </v-col>
            <v-col v-if="paroquia?.youtube" cols="3" class="text-center">
              <v-btn
                :href="paroquia.youtube.startsWith('http') ? paroquia.youtube : `https://youtube.com/${paroquia.youtube.replace('@', '')}`"
                target="_blank"
                icon
                variant="flat"
                size="small"
                color="red"
                class="mb-1"
              >
                <v-icon size="20">
                  mdi-youtube
                </v-icon>
              </v-btn>
              <div class="text-caption text-truncate">
                YouTube
              </div>
            </v-col>
            <v-col v-if="paroquia?.site" cols="3" class="text-center">
              <v-btn
                :href="paroquia.site"
                target="_blank"
                icon
                variant="flat"
                size="small"
                color="primary"
                class="mb-1"
              >
                <v-icon size="20">
                  mdi-web
                </v-icon>
              </v-btn>
              <div class="text-caption text-truncate">
                Site
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- Page Content com padding para bottom nav -->
      <v-container class="content-container pt-4 pb-24">
        <slot />
      </v-container>
    </v-main>

    <!-- Bottom Navigation - Fixo e sempre visível -->
    <v-bottom-navigation
      v-model="activeTab"
      bg-color="surface"
      color="primary"
      grow
      :elevation="8"
      height="70"
      class="bottom-nav-fixed"
      mandatory
    >
      <v-btn
        v-for="item in navigationItems"
        :key="item.value"
        :value="item.value"
        :to="item.to"
        height="100%"
      >
        <v-icon size="24">
          {{ item.icon }}
        </v-icon>
        <span class="text-caption mt-1">{{ item.text }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.app-bar-paroquia {
  position: fixed !important;
  top: 0;
  z-index: 1000;
}

.hero-section {
  margin-top: 56px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.quick-actions-bar {
  position: sticky;
  top: 56px;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.content-container {
  min-height: calc(100vh - 56px - 200px - 70px);
}

.bottom-nav-fixed {
  position: fixed !important;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Safe area para dispositivos com notch */
@supports (padding: env(safe-area-inset-bottom)) {
  .bottom-nav-fixed {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(70px + env(safe-area-inset-bottom)) !important;
  }

  .content-container {
    padding-bottom: calc(70px + env(safe-area-inset-bottom) + 1rem) !important;
  }
}

/* Animação suave nos botões */
.v-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Desktop adjustments */
@media (min-width: 960px) {
  .bottom-nav-fixed {
    display: none;
  }

  .content-container {
    padding-bottom: 2rem !important;
  }
}
</style>
