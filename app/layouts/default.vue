<script setup lang="ts">
import { useTheme } from 'vuetify'

// Theme management
const theme = useTheme()
const isDark = computed(() => theme.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'cidadeTema' : 'cidadeTemaEscuro'
}

// Navigation
const drawer = ref(false)

const navigationItems = [
  {
    title: 'Início',
    to: '/',
    icon: 'mdi-home',
  },
  {
    title: 'Diocese',
    to: '/diocese',
    icon: 'mdi-church',
  },
  {
    title: 'Paróquias',
    to: '/paroquias',
    icon: 'mdi-account-group',
  },
  {
    title: 'Capelas',
    to: '/capelas',
    icon: 'mdi-cross',
  },
  {
    title: 'Agenda',
    to: '/agenda',
    icon: 'mdi-calendar',
  },
  {
    title: 'Buscar',
    to: '/buscar',
    icon: 'mdi-magnify',
  },
]

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
    <!-- App Bar -->
    <v-app-bar
      :elevation="2"
      app
      color="primary"
      dark
    >
      <v-app-bar-nav-icon
        class="d-lg-none"
        @click="drawer = !drawer"
      />

      <v-toolbar-title class="text-h6 font-weight-bold">
        <NuxtLink to="/" class="text-decoration-none text-white">
          Terra Santa
        </NuxtLink>
      </v-toolbar-title>

      <v-spacer />

      <!-- Desktop Navigation -->
      <v-btn
        v-for="item in navigationItems"
        :key="item.title"
        :to="item.to"
        variant="text"
        class="d-none d-lg-flex"
      >
        <v-icon :icon="item.icon" start />
        {{ item.title }}
      </v-btn>

      <!-- Theme Toggle -->
      <v-btn
        icon
        class="ml-2"
        @click="toggleTheme"
      >
        <v-icon>
          {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
        </v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer (Mobile) -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
      class="d-lg-none"
    >
      <v-list nav dense>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <slot />
    </v-main>

    <!-- Footer -->
    <v-footer
      color="surface"
      class="text-center pa-4"
    >
      <div class="text-body-2">
        © {{ new Date().getFullYear() }} Terra Santa - Catálogo Diocesano Digital
      </div>
    </v-footer>
  </v-app>
</template>
