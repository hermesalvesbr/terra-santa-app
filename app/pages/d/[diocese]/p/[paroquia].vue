<script setup lang="ts">
import type { Paroquia, ParoquiaHorario } from '~/types/schema'

definePageMeta({
  entityType: 'paroquia',
  pageTitle: 'Paróquia',
})

const route = useRoute()
const headerTitleOverride = useState<string>('layout-header-title', () => '')

const dioceseParam = computed(() => {
  const param = route.params.diocese
  if (Array.isArray(param))
    return param[0] || ''
  return typeof param === 'string' ? param : ''
})

const paroquiaParam = computed(() => {
  const param = route.params.paroquia
  if (Array.isArray(param))
    return param[0] || ''
  return typeof param === 'string' ? param : ''
})

const { getImageUrl } = useDirectusAsset()
const { getEventos, getHorarios, getClero } = useParoquia()

const {
  data: paroquia,
  pending: paroquiaPending,
  error: paroquiaError,
  refresh: refreshParoquia,
} = await useAsyncData<Paroquia | null>(
  () => (paroquiaParam.value ? `paroquia-detail:${paroquiaParam.value}` : 'paroquia-detail:unset'),
  async () => {
    const identifier = paroquiaParam.value
    if (!identifier)
      return null

    const fieldsParam = [
      'id',
      'slug',
      'nome',
      'cidade',
      'uf',
      'capa.*',
      'descricao',
      'whatsapp',
      'email',
      'instagram',
      'site',
      'endereco',
      'ano_criacao',
      'diocese.id',
      'diocese.slug',
      'diocese.nome',
    ].join(',')

    const isNotFoundError = (error: any) => {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status
      return status === 404
    }

    const fetchParoquiaBy = async (by: 'slug' | 'id') => {
      try {
        const response = await $fetch<{ data: Paroquia | null }>(
          `/api/directus/paroquia/${encodeURIComponent(identifier)}`,
          {
            params: {
              by,
              fields: fieldsParam,
            },
          },
        )

        return response?.data ?? null
      }
      catch (error) {
        if (isNotFoundError(error))
          return null
        throw error
      }
    }

    const fromSlug = await fetchParoquiaBy('slug')
    if (fromSlug)
      return fromSlug

    return await fetchParoquiaBy('id')
  },
  {
    default: () => null,
    watch: [paroquiaParam],
  },
)

const paroquiaIdentifier = computed(() => paroquia.value?.id || '')

const horariosAsync = paroquiaIdentifier.value
  ? await getHorarios(paroquiaIdentifier.value)
  : null

const cleroAsync = paroquiaIdentifier.value
  ? await getClero(paroquiaIdentifier.value)
  : null

const eventosAsync = paroquiaIdentifier.value
  ? await getEventos(paroquiaIdentifier.value, { limit: 4, proximos: true })
  : null

function unwrapCollection<T>(payload: any): T[] {
  if (!payload)
    return []
  if (Array.isArray(payload))
    return payload
  if (payload && typeof payload === 'object' && 'data' in payload)
    return Array.isArray(payload.data) ? payload.data : []
  return []
}

const horarios = ref<ParoquiaHorario[]>(unwrapCollection(horariosAsync))
const _clero = ref(unwrapCollection(cleroAsync))
const _eventos = ref(unwrapCollection(eventosAsync))

const headerImageSrc = computed(() => {
  if (!paroquia.value?.capa)
    return ''
  return getImageUrl(paroquia.value.capa, { width: 1920, height: 500, fit: 'cover', quality: 85 })
})

const cityLabel = computed(() => {
  if (!paroquia.value)
    return ''
  return [paroquia.value.cidade, paroquia.value.uf].filter(Boolean).join(', ')
})

const dioceseName = computed(() => {
  if (!paroquia.value?.diocese)
    return ''
  if (typeof paroquia.value.diocese === 'object' && 'nome' in paroquia.value.diocese)
    return paroquia.value.diocese.nome as string
  return ''
})

const dioceseSlug = computed(() => {
  if (!paroquia.value?.diocese)
    return dioceseParam.value
  if (typeof paroquia.value.diocese === 'object' && 'slug' in paroquia.value.diocese)
    return paroquia.value.diocese.slug as string
  return dioceseParam.value
})

// SEO
useHead({
  title: computed(() => paroquia.value?.nome ?? 'Paróquia'),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        if (!paroquia.value)
          return 'Informações sobre a paróquia'
        const description = paroquia.value.descricao?.replace(/<[^>]*>/g, '').slice(0, 160) || ''
        return description || `Conheça a ${paroquia.value.nome} em ${cityLabel.value}`
      }),
    },
  ],
})

watch(
  () => paroquia.value?.nome,
  (nome) => {
    headerTitleOverride.value = nome ? `P. ${nome}` : ''
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  headerTitleOverride.value = ''
})

// Agrupar horários por dia da semana
interface HorarioAgrupado {
  dia: string
  horarios: ParoquiaHorario[]
}

const horariosAgrupados = computed<HorarioAgrupado[]>(() => {
  if (!horarios.value?.length)
    return []

  const grupos: Record<string, ParoquiaHorario[]> = {}
  const ordensDia = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

  for (const horario of horarios.value) {
    const dia = String(horario.dia_semana || 'Outros')
    if (!grupos[dia])
      grupos[dia] = []
    grupos[dia].push(horario)
  }

  return ordensDia
    .filter(dia => grupos[dia])
    .map(dia => ({ dia, horarios: grupos[dia]! }))
})

// Formatar hora
function formatHora(hora: string | null | undefined): string {
  if (!hora)
    return ''
  try {
    const date = new Date(hora)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  catch {
    return hora
  }
}

// Links sociais
const socialLinks = computed(() => {
  if (!paroquia.value)
    return []

  const links = []

  if (paroquia.value.site) {
    links.push({
      icon: 'mdi-web',
      label: 'Site',
      href: paroquia.value.site,
      color: 'indigo',
    })
  }

  if (paroquia.value.instagram) {
    const username = paroquia.value.instagram.replace('@', '')
    links.push({
      icon: 'mdi-instagram',
      label: 'Instagram',
      href: `https://instagram.com/${username}`,
      color: 'pink',
    })
  }

  if (paroquia.value.whatsapp) {
    const number = paroquia.value.whatsapp.replace(/\D/g, '')
    links.push({
      icon: 'mdi-whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/${number}`,
      color: 'success',
    })
  }

  if (paroquia.value.email) {
    links.push({
      icon: 'mdi-email',
      label: 'E-mail',
      href: `mailto:${paroquia.value.email}`,
      color: 'blue',
    })
  }

  return links
})
</script>

<template>
  <div v-if="paroquiaPending" class="loading-state pa-8">
    <v-container>
      <v-skeleton-loader type="article, article" class="mb-4" />
      <v-skeleton-loader type="article" />
    </v-container>
  </div>

  <div v-else-if="paroquiaError || !paroquia" class="error-state">
    <v-container class="py-12">
      <v-alert
        type="error"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <v-alert-title>Paróquia não encontrada</v-alert-title>
        <p>Não foi possível carregar as informações desta paróquia.</p>
      </v-alert>
      <div class="d-flex gap-2">
        <v-btn color="primary" :to="`/d/${dioceseSlug}`">
          Voltar para paróquias
        </v-btn>
        <v-btn variant="outlined" @click="refreshParoquia">
          Tentar novamente
        </v-btn>
      </div>
    </v-container>
  </div>

  <div v-else>
    <!-- Header com imagem -->
    <v-sheet class="position-relative overflow-hidden" height="300">
      <v-img
        v-if="headerImageSrc"
        :src="headerImageSrc"
        cover
        class="fill-height"
        gradient="to bottom, rgba(0,0,0,.3), rgba(0,0,0,.6)"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
            <v-icon icon="mdi-church" size="64" color="grey-lighten-1" />
          </div>
        </template>
      </v-img>
      <div v-else class="fill-height bg-primary d-flex align-center justify-center">
        <v-icon icon="mdi-church" size="64" color="white" class="opacity-50" />
      </div>

      <v-container class="position-absolute bottom-0 left-0 right-0 pb-6">
        <v-breadcrumbs
          class="text-white pa-0 mb-2"
          :items="[
            { title: 'Início', to: '/', disabled: false },
            { title: dioceseName, to: `/d/${dioceseSlug}`, disabled: false },
            { title: paroquia.nome, disabled: true },
          ]"
        >
          <template #divider>
            <v-icon icon="mdi-chevron-right" size="small" />
          </template>
        </v-breadcrumbs>
        <h1 class="text-h3 text-white font-weight-bold mb-2">
          {{ paroquia.nome }}
        </h1>
        <div class="d-flex align-center gap-4 text-white">
          <div class="d-flex align-center">
            <v-icon icon="mdi-map-marker" size="20" class="mr-2" />
            <span>{{ cityLabel }}</span>
          </div>
          <div v-if="dioceseName" class="d-flex align-center">
            <v-icon icon="mdi-church" size="20" class="mr-2" />
            <span>{{ dioceseName }}</span>
          </div>
        </div>
      </v-container>
    </v-sheet>

    <v-container class="py-8">
      <v-row>
        <!-- Coluna principal -->
        <v-col cols="12" md="8">
          <!-- Descrição -->
          <v-card elevation="2" class="mb-6">
            <v-card-title class="text-h5 font-weight-bold">
              Sobre a Paróquia
            </v-card-title>
            <v-card-text>
              <div v-if="paroquia.descricao" v-html="paroquia.descricao" />
              <p v-else class="text-medium-emphasis">
                Informações sobre a paróquia em breve.
              </p>
            </v-card-text>
          </v-card>

          <!-- Horários de Missas -->
          <v-card v-if="horariosAgrupados.length" elevation="2" class="mb-6">
            <v-card-title class="d-flex align-center text-h5 font-weight-bold">
              <v-icon icon="mdi-clock-outline" class="mr-2" />
              Horários de Missas e Celebrações
            </v-card-title>
            <v-card-text>
              <v-list>
                <div
                  v-for="grupo in horariosAgrupados"
                  :key="grupo.dia"
                >
                  <v-list-subheader class="text-primary font-weight-bold">
                    {{ grupo.dia }}
                  </v-list-subheader>
                  <v-list-item
                    v-for="horario in grupo.horarios"
                    :key="`${grupo.dia}-${horario.id}`"
                  >
                    <v-list-item-title>
                      {{ horario.tipo_servico }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatHora(horario.hora_inicio) }}
                      <span v-if="horario.observacoes"> - {{ horario.observacoes }}</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2" />
                </div>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Coluna lateral -->
        <v-col cols="12" md="4">
          <!-- Contato e Redes Sociais -->
          <v-card elevation="2" class="mb-6">
            <v-card-title class="text-h6 font-weight-bold">
              Contato
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="link in socialLinks"
                  :key="link.label"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <template #prepend>
                    <v-icon :icon="link.icon" :color="link.color" />
                  </template>
                  <v-list-item-title>{{ link.label }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-divider v-if="paroquia.endereco" class="my-4" />

              <div v-if="paroquia.endereco">
                <div class="d-flex align-start mb-2">
                  <v-icon icon="mdi-map-marker" size="20" class="mr-2 mt-1" />
                  <div>
                    <div class="font-weight-medium">
                      Endereço
                    </div>
                    <div class="text-body-2">
                      {{ paroquia.endereco }}
                    </div>
                    <div class="text-body-2">
                      {{ cityLabel }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Info adicional -->
          <v-card v-if="paroquia.ano_criacao" elevation="2">
            <v-card-title class="text-h6 font-weight-bold">
              Informações
            </v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-calendar" class="mr-2" />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Fundação
                  </div>
                  <div class="font-weight-medium">
                    {{ paroquia.ano_criacao }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
