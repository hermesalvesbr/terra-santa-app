<script setup lang="ts">
// Bottom Navigation - varia de acordo com o tipo de entidade
const route = useRoute()
const navigationValue = ref(0)

// Detecta o tipo de entidade baseado na rota
const entityType = computed(() => {
  const path = route.path
  if (path.startsWith('/d/'))
    return 'diocese'
  if (path.startsWith('/p/'))
    return 'paroquia'
  // Capela e comunidade seguem padrão /[paroquia]/[capela] e /[paroquia]/[capela]/[comunidade]
  const segments = path.split('/').filter(Boolean)
  if (segments.length >= 3)
    return 'comunidade'
  if (segments.length === 2)
    return 'capela'
  return 'geral'
})

// Botões do bottom navigation (4 botões + logo central)
const navigationItems = computed(() => {
  const type = entityType.value

  if (type === 'diocese') {
    return [
      { icon: 'mdi-calendar', to: '/agenda', label: 'Agenda' },
      { icon: 'mdi-map-marker', to: '/mapa', label: 'Mapa' },
      { icon: 'mdi-newspaper', to: '/noticias', label: 'Notícias' },
      { icon: 'mdi-account-group', to: '/time', label: 'Time' },
    ]
  }

  if (type === 'paroquia') {
    return [
      { icon: 'mdi-calendar', to: '/agenda', label: 'Agenda' },
      { icon: 'mdi-map-marker', to: '/mapa', label: 'Mapa' },
      { icon: 'mdi-newspaper', to: '/noticias', label: 'Notícias' },
      { icon: 'mdi-account-group', to: '/time', label: 'Time' },
    ]
  }

  if (type === 'capela') {
    return [
      { icon: 'mdi-calendar', to: '/agenda', label: 'Agenda' },
      { icon: 'mdi-map-marker', to: '/mapa', label: 'Mapa' },
      { icon: 'mdi-newspaper', to: '/noticias', label: 'Notícias' },
      { icon: 'mdi-account-group', to: '/time', label: 'Time' },
    ]
  }

  if (type === 'comunidade') {
    return [
      { icon: 'mdi-calendar', to: '/agenda', label: 'Agenda' },
      { icon: 'mdi-map-marker', to: '/mapa', label: 'Mapa' },
      { icon: 'mdi-newspaper', to: '/noticias', label: 'Notícias' },
      { icon: 'mdi-account-group', to: '/time', label: 'Time' },
    ]
  }

  // Navegação geral (home, busca, etc)
  return [
    { icon: 'mdi-calendar', to: '/agenda', label: 'Agenda' },
    { icon: 'mdi-map-marker', to: '/mapa', label: 'Mapa' },
    { icon: 'mdi-newspaper', to: '/noticias', label: 'Notícias' },
    { icon: 'mdi-account-group', to: '/time', label: 'Time' },
  ]
})

// SEO
useHead({
  titleTemplate: '%s - Terra Santa',
  meta: [
    { name: 'description', content: 'Catálogo diocesano navegável e confiável com agenda sempre atualizada' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})
</script>

<template>
  <v-app>
    <v-layout class="flex-column">
      <!-- Header com nome à esquerda, buscar e visualizar à direita -->
      <v-app-bar
        app
        elevation="0"
        color="primary"
        density="comfortable"
        class="px-4"
      >
        <v-app-bar-title>
          <NuxtLink to="/" class="text-decoration-none text-white">
            TerraSanta.app
          </NuxtLink>
        </v-app-bar-title>

        <v-spacer />

        <v-btn
          icon="mdi-magnify"
          variant="text"
          color="white"
        />

        <v-btn
          icon="mdi-account-circle"
          variant="text"
          color="white"
        />
      </v-app-bar>

      <!-- Conteúdo Principal -->
      <v-main class="pb-20">
        <slot />
      </v-main>

      <!-- Bottom Navigation com 4 botões + logo central -->
      <v-bottom-navigation
        v-model="navigationValue"
        bg-color="surface"
        elevation="8"
        grow
        app
        class="border-t position-fixed bottom-0 start-0 end-0"
      >
        <!-- Primeiros 2 botões -->
        <v-btn
          v-for="(item, index) in navigationItems.slice(0, 2)"
          :key="`left-${index}`"
          :to="item.to"
          :value="index"
        >
          <v-icon>{{ item.icon }}</v-icon>
          <span class="text-caption">{{ item.label }}</span>
        </v-btn>

        <!-- Logo central (não navegável, apenas visual) -->
        <v-btn disabled class="elevation-0">
          <v-avatar
            color="primary"
            size="40"
          >
            <v-icon color="white" size="24">
              mdi-hands-pray
            </v-icon>
          </v-avatar>
        </v-btn>

        <!-- Últimos 2 botões -->
        <v-btn
          v-for="(item, index) in navigationItems.slice(2, 4)"
          :key="`right-${index}`"
          :to="item.to"
          :value="index + 2"
        >
          <v-icon>{{ item.icon }}</v-icon>
          <span class="text-caption">{{ item.label }}</span>
        </v-btn>
      </v-bottom-navigation>
    </v-layout>
  </v-app>
</template>
