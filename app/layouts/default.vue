<script setup lang="ts">
// Bottom Navigation - varia de acordo com o tipo de entidade
const route = useRoute()
const navigationValue = ref(0)

type EntityType = 'diocese' | 'paroquia' | 'capela' | 'comunidade' | 'geral'

function asEntityType(value: unknown): EntityType {
  const allowed: EntityType[] = ['diocese', 'paroquia', 'capela', 'comunidade', 'geral']
  return allowed.includes(value as EntityType) ? value as EntityType : 'geral'
}

const headerTitleOverride = useState<string>('layout-header-title', () => '')

watch(() => route.fullPath, () => {
  headerTitleOverride.value = ''
})

// Detecta o tipo de entidade baseado na rota
const entityType = computed<EntityType>(() => {
  const matchedRecords = [...route.matched].reverse()
  const record = matchedRecords.find(entry => typeof entry.meta?.entityType === 'string')
  return asEntityType(record?.meta?.entityType)
})

// Breadcrumb inteligente baseado na rota
const breadcrumb = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  const crumbs: Array<{ label: string, fullLabel: string, to: string }> = []

  // Home sempre disponível
  if (path !== '/') {
    crumbs.push({ label: 'Início', fullLabel: 'Início', to: '/' })
  }

  // Diocese
  if (segments[0] === 'd' && segments[1]) {
    crumbs.push({
      label: 'Diocese',
      fullLabel: 'Diocese',
      to: `/d/${segments[1]}`,
    })
  }

  // Paróquia
  if (segments[0] === 'p' && segments[1]) {
    crumbs.push({
      label: 'Paróquia',
      fullLabel: 'Paróquia',
      to: `/p/${segments[1]}`,
    })

    // Capela (se houver)
    if (segments[2]) {
      crumbs.push({
        label: 'Capela',
        fullLabel: 'Capela',
        to: `/p/${segments[1]}/${segments[2]}`,
      })

      // Comunidade (se houver)
      if (segments[3]) {
        crumbs.push({
          label: 'Comunidade',
          fullLabel: 'Comunidade',
          to: `/p/${segments[1]}/${segments[2]}/${segments[3]}`,
        })
      }
    }
  }

  return crumbs
})

// Botão voltar inteligente
const canGoBack = computed(() => breadcrumb.value.length > 1)
const backRoute = computed(() => {
  const crumbs = breadcrumb.value
  if (crumbs.length > 1) {
    return crumbs[crumbs.length - 2]?.to || '/'
  }
  return '/'
})

// Título da página atual
const pageTitle = computed(() => {
  if (headerTitleOverride.value)
    return headerTitleOverride.value

  const matchedRecords = [...route.matched].reverse()
  const record = matchedRecords.find(entry => entry.meta?.pageTitle)
  const metaTitle = record?.meta?.pageTitle

  if (typeof metaTitle === 'function')
    return metaTitle(route)

  if (typeof metaTitle === 'string')
    return metaTitle

  // Fallbacks para rotas sem metadados específicos
  if (route.path === '/')
    return 'Dioceses do Brasil'

  const defaultTitles: Record<string, string> = {
    agenda: 'Agenda',
    mapa: 'Mapa',
    noticias: 'Notícias',
    time: 'Time',
  }

  const firstSegment = route.path.split('/').filter(Boolean)[0]
  if (firstSegment && defaultTitles[firstSegment])
    return defaultTitles[firstSegment]

  const type = entityType.value
  const typeLabels: Record<EntityType, string> = {
    diocese: 'Diocese',
    paroquia: 'Paróquia',
    capela: 'Capela',
    comunidade: 'Comunidade',
    geral: 'TerraSanta.app',
  }

  return typeLabels[type] || typeLabels.geral
})

// Cor do header baseado no nível hierárquico
const headerColor = computed(() => {
  const type = entityType.value
  const colors: Record<EntityType, string> = {
    diocese: 'primary',
    paroquia: 'secondary',
    capela: 'primary-darken-1',
    comunidade: 'secondary-darken-1',
    geral: 'primary',
  }
  return colors[type] || colors.geral
})

function handleBack() {
  if (canGoBack.value) {
    navigateTo(backRoute.value)
  }
}

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
      <!-- Header contextual inteligente -->
      <v-app-bar
        app
        elevation="4"
        :color="headerColor"
      >
        <!-- Botão voltar (quando aplicável) -->
        <v-btn
          v-if="canGoBack"
          icon
          variant="text"
          color="white"
          @click="handleBack"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <!-- Título da página (sem avatar) -->
        <v-app-bar-title class="text-pre-wrap text-break text-body-2 font-weight-medium">
          {{ pageTitle }}
        </v-app-bar-title>

        <v-spacer />

        <!-- Botões de ação -->
        <v-btn
          icon
          variant="text"
          color="white"
        >
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </v-app-bar>

      <!-- Breadcrumb aprimorado (quando houver navegação) -->
      <v-sheet
        v-if="breadcrumb.length > 1"
        color="surface"
        elevation="2"
      >
        <div class="d-flex align-center flex-nowrap overflow-auto px-4 py-2">
          <template
            v-for="(crumb, index) in breadcrumb"
            :key="crumb.to"
          >
            <!-- Link do breadcrumb -->
            <v-btn
              :to="crumb.to"
              size="small"
              density="comfortable"
              :variant="index === breadcrumb.length - 1 ? 'tonal' : 'text'"
              :color="index === breadcrumb.length - 1 ? 'primary' : undefined"
              class="text-none text-body-2 rounded-pill px-4 text-no-wrap me-1"
              :class="index === breadcrumb.length - 1 ? 'font-weight-bold' : 'font-weight-medium text-medium-emphasis'"
            >
              {{ crumb.label }}
            </v-btn>

            <!-- Separador -->
            <v-icon
              v-if="index < breadcrumb.length - 1"
              size="18"
              color="primary"
              class="mx-1 text-medium-emphasis"
            >
              mdi-chevron-right
            </v-icon>
          </template>
        </div>
      </v-sheet>

      <!-- Conteúdo Principal -->
      <v-main class="pb-20 pt-6">
        <slot />
      </v-main>

      <!-- Bottom Navigation com 4 botões + logo central -->
      <v-bottom-navigation
        v-model="navigationValue"
        bg-color="surface"
        elevation="8"
        grow
        app
        border="t"
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
