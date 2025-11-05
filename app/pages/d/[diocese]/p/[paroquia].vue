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
const { getHorarios, getClero } = useParoquia()

// Cores para os dias da semana
const diasCores: Record<string, string> = {
  Segunda: 'deep-purple',
  Terça: 'indigo',
  Quarta: 'blue',
  Quinta: 'cyan',
  Sexta: 'teal',
  Sábado: 'green',
  Domingo: 'amber',
}

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

// Buscar horários reativamente
const {
  data: horariosData,
} = await useAsyncData(
  () => `horarios-${paroquiaIdentifier.value}`,
  async () => {
    if (!paroquiaIdentifier.value)
      return []

    const response = await getHorarios(paroquiaIdentifier.value)
    return unwrapCollection(response)
  },
  {
    default: () => [],
    watch: [paroquiaIdentifier],
  },
)

// Buscar clero reativamente
const {
  data: cleroData,
} = await useAsyncData(
  () => `clero-${paroquiaIdentifier.value}`,
  async () => {
    if (!paroquiaIdentifier.value)
      return []

    const response = await getClero(paroquiaIdentifier.value)
    return unwrapCollection(response)
  },
  {
    default: () => [],
    watch: [paroquiaIdentifier],
  },
)

function unwrapCollection<T>(payload: any): T[] {
  if (!payload)
    return []
  if (Array.isArray(payload))
    return payload
  if (payload && typeof payload === 'object' && 'data' in payload)
    return Array.isArray(payload.data) ? payload.data : []
  return []
}

const horarios = computed(() => horariosData.value || [])
const clero = computed(() => cleroData.value || [])

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

// Mapeamento de dias da semana do Directus para exibição
const diasSemanaMap: Record<string, string> = {
  'segunda-feira': 'Segunda',
  'terça-feira': 'Terça',
  'quarta-feira': 'Quarta',
  'quinta-feira': 'Quinta',
  'sexta-feira': 'Sexta',
  'sábado': 'Sábado',
  'domingo': 'Domingo',
}

// Tipos de serviço e suas configurações
interface TipoServicoConfig {
  label: string
  icon: string
  cor: string
  ordem: number
}

const tiposServico: Record<string, TipoServicoConfig> = {
  missa: { label: 'Missas', icon: 'mdi-church', cor: 'primary', ordem: 1 },
  secretaria: { label: 'Secretaria', icon: 'mdi-office-building', cor: 'blue', ordem: 2 },
  confissao: { label: 'Confissões', icon: 'mdi-cross', cor: 'purple', ordem: 3 },
  adoracao: { label: 'Adoração', icon: 'mdi-candelabra-fire', cor: 'pink', ordem: 4 },
  festa_padroeiro: { label: 'Festas e Eventos', icon: 'mdi-party-popper', cor: 'amber', ordem: 5 },
}

// Agrupar horários por tipo de serviço
interface HorarioPorTipo {
  tipo: string
  config: TipoServicoConfig
  horarios: ParoquiaHorario[]
}

const horariosPorTipo = computed<HorarioPorTipo[]>(() => {
  if (!horarios.value?.length)
    return []

  const grupos: Record<string, ParoquiaHorario[]> = {}

  // Agrupar por tipo de serviço
  for (const horario of horarios.value) {
    const item = horario as ParoquiaHorario
    const tipo = item.tipo_servico?.toLowerCase() || 'outro'
    if (!grupos[tipo])
      grupos[tipo] = []
    grupos[tipo].push(item)
  }

  // Converter para array e ordenar
  return Object.entries(grupos)
    .map(([tipo, horariosLista]) => ({
      tipo,
      config: tiposServico[tipo] || { label: tipo, icon: 'mdi-clock', cor: 'grey', ordem: 99 },
      horarios: horariosLista,
    }))
    .sort((a, b) => a.config.ordem - b.config.ordem)
})

// Tab ativa (índice do primeiro tipo de serviço)
const tabAtiva = ref(0)

// Extrair membros do clero com informações completas
interface CleroMembro {
  id: string
  nome: string
  cargo: string
  hierarquia: string
  foto: any
  email?: string
  telefone?: string
  whatsapp?: string
}

const cleroMembros = computed<CleroMembro[]>(() => {
  if (!clero.value?.length)
    return []

  return clero.value
    .map((item: any) => {
      const cleroData = item.clero
      if (!cleroData || typeof cleroData !== 'object')
        return null

      return {
        id: cleroData.id || item.id,
        nome: cleroData.nome || 'Nome não informado',
        cargo: item.cargo || 'Sacerdote',
        hierarquia: cleroData.hierarquia || '',
        foto: cleroData.foto,
        email: cleroData.email,
        telefone: cleroData.telefone,
        whatsapp: cleroData.whatsapp,
      }
    })
    .filter(Boolean) as CleroMembro[]
})

// Função auxiliar para pegar cor do dia
function getCorDia(dia: string): string {
  const diaFormatado = diasSemanaMap[dia] || dia
  return diasCores[diaFormatado] || 'grey'
}

// Formatar hora simples (HH:MM:SS para HH:MM)
function formatHora(hora: string | null | undefined): string {
  if (!hora)
    return ''

  // Se já está no formato HH:MM:SS
  if (hora.includes(':')) {
    const partes = hora.split(':')
    return `${partes[0]}:${partes[1]}`
  }

  // Tentar parsear como datetime
  try {
    const date = new Date(hora)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  catch {
    return hora
  }
}

// Formatar data
function formatData(data: string | null): string {
  if (!data)
    return ''
  try {
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  catch {
    return data
  }
}

// Formatar recorrência
function formatarRecorrencia(horario: ParoquiaHorario): string {
  if (!horario.recorrente)
    return ''

  if (horario.tipo_recorrencia === 'mensal' && horario.dia_do_mes)
    return `Todo dia ${horario.dia_do_mes} do mês`

  if (horario.tipo_recorrencia === 'anual' && horario.periodo_data_inicio && horario.periodo_data_fim)
    return `Anualmente de ${formatData(horario.periodo_data_inicio)} a ${formatData(horario.periodo_data_fim)}`

  if (horario.tipo_recorrencia === 'semanal')
    return 'Semanalmente'

  return 'Recorrente'
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
      <div class="d-flex ga-2">
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
    <!-- Header com imagem de capa -->
    <v-sheet class="position-relative overflow-hidden" height="320">
      <v-img
        v-if="headerImageSrc"
        :src="headerImageSrc"
        cover
        class="fill-height"
        gradient="to bottom, rgba(0,0,0,.2), rgba(0,0,0,.7)"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height bg-gradient-primary">
            <v-icon icon="mdi-church" size="80" color="white" class="opacity-30" />
          </div>
        </template>
      </v-img>
      <div v-else class="fill-height bg-gradient-primary d-flex align-center justify-center">
        <v-icon icon="mdi-church" size="80" color="white" class="opacity-40" />
      </div>

      <v-container class="position-absolute bottom-0 left-0 right-0 pb-8">
        <v-breadcrumbs
          density="compact"
          class="text-white pa-0 mb-3"
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

        <h1 class="text-h3 text-md-h2 text-white font-weight-bold mb-3">
          {{ paroquia.nome }}
        </h1>

        <div class="d-flex flex-wrap ga-4 text-white">
          <v-chip color="white" variant="elevated" prepend-icon="mdi-map-marker">
            {{ cityLabel }}
          </v-chip>
          <v-chip v-if="dioceseName" color="white" variant="elevated" prepend-icon="mdi-church">
            {{ dioceseName }}
          </v-chip>
          <v-chip v-if="paroquia.ano_criacao" color="white" variant="elevated" prepend-icon="mdi-calendar">
            Fundada em {{ paroquia.ano_criacao }}
          </v-chip>
        </div>
      </v-container>
    </v-sheet>

    <v-container class="py-8">
      <v-row>
        <!-- Coluna principal -->
        <v-col cols="12" lg="8">
          <!-- Sobre a Paróquia -->
          <v-card elevation="3" class="mb-6 rounded-xl" color="surface">
            <v-card-title class="text-h5 font-weight-bold pa-6 bg-primary-lighten-2">
              <v-icon icon="mdi-information-outline" class="mr-3" size="28" />
              Sobre a Paróquia
            </v-card-title>
            <v-card-text class="pa-6 text-body-1">
              <div v-if="paroquia.descricao" v-html="paroquia.descricao" />
              <p v-else class="text-medium-emphasis">
                Informações sobre a paróquia em breve.
              </p>
            </v-card-text>
          </v-card>

          <!-- Equipe Sacerdotal -->
          <v-card v-if="cleroMembros.length" elevation="3" class="mb-6 rounded-xl" color="surface">
            <v-card-title class="text-h5 font-weight-bold pa-6 bg-secondary-lighten-2">
              <v-icon icon="mdi-account-group" class="mr-3" size="28" />
              Equipe Sacerdotal
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col
                  v-for="membro in cleroMembros"
                  :key="membro.id"
                  cols="12"
                  md="6"
                >
                  <v-card elevation="2" class="rounded-lg overflow-hidden" hover>
                    <div class="d-flex">
                      <!-- Foto do membro -->
                      <v-avatar
                        size="140"
                        class="ma-4 elevation-4"
                        rounded="lg"
                      >
                        <v-img
                          v-if="membro.foto"
                          :src="getImageUrl(membro.foto, { width: 280, height: 280, fit: 'cover' })"
                          cover
                        >
                          <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                              <v-icon icon="mdi-account" size="64" color="grey" />
                            </div>
                          </template>
                        </v-img>
                        <v-icon v-else icon="mdi-account" size="64" />
                      </v-avatar>

                      <!-- Informações do membro -->
                      <div class="flex-grow-1 pa-4">
                        <v-chip
                          v-if="membro.hierarquia"
                          size="small"
                          color="accent"
                          class="mb-2"
                        >
                          {{ membro.hierarquia }}
                        </v-chip>
                        <h3 class="text-h6 font-weight-bold mb-1">
                          {{ membro.nome }}
                        </h3>
                        <p class="text-body-2 text-medium-emphasis mb-3">
                          {{ membro.cargo }}
                        </p>

                        <!-- Contatos do membro -->
                        <div class="d-flex flex-wrap ga-2">
                          <v-btn
                            v-if="membro.email"
                            :href="`mailto:${membro.email}`"
                            icon="mdi-email"
                            size="small"
                            color="blue"
                            variant="tonal"
                          />
                          <v-btn
                            v-if="membro.whatsapp"
                            :href="`https://wa.me/${membro.whatsapp.replace(/\D/g, '')}`"
                            icon="mdi-whatsapp"
                            size="small"
                            color="success"
                            variant="tonal"
                            target="_blank"
                          />
                          <v-btn
                            v-if="membro.telefone"
                            :href="`tel:${membro.telefone}`"
                            icon="mdi-phone"
                            size="small"
                            color="teal"
                            variant="tonal"
                          />
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Horários de Missas e Celebrações -->
          <v-card v-if="horariosPorTipo.length" elevation="3" class="mb-6 rounded-xl overflow-hidden" color="surface">
            <v-card-title class="text-h5 font-weight-bold pa-6 bg-accent-lighten-2 d-flex align-center">
              <v-icon icon="mdi-clock-time-four" class="mr-3" size="28" />
              <span>Horários e Serviços</span>
              <v-chip size="small" color="success" class="ml-auto">
                {{ horariosPorTipo.reduce((acc, g) => acc + g.horarios.length, 0) }} horários
              </v-chip>
            </v-card-title>

            <!-- Abas por tipo de serviço -->
            <v-tabs
              v-model="tabAtiva"
              :color="horariosPorTipo[tabAtiva]?.config.cor || 'primary'"
              grow
              show-arrows
            >
              <v-tab
                v-for="(grupo, index) in horariosPorTipo"
                :key="grupo.tipo"
                :value="index"
              >
                <v-icon :icon="grupo.config.icon" size="20" class="mr-2" />
                {{ grupo.config.label }}
                <v-chip
                  size="x-small"
                  :color="grupo.config.cor"
                  class="ml-2"
                >
                  {{ grupo.horarios.length }}
                </v-chip>
              </v-tab>
            </v-tabs>

            <v-divider />

            <!-- Conteúdo das abas -->
            <v-window v-model="tabAtiva">
              <v-window-item
                v-for="(grupo, index) in horariosPorTipo"
                :key="grupo.tipo"
                :value="index"
              >
                <v-card-text class="pa-6">
                  <!-- Timeline para horários -->
                  <v-timeline
                    side="end"
                    align="start"
                    truncate-line="both"
                    density="compact"
                  >
                    <v-timeline-item
                      v-for="horario in grupo.horarios"
                      :key="horario.id"
                      :dot-color="grupo.config.cor"
                      size="small"
                    >
                      <template #icon>
                        <v-icon :icon="grupo.config.icon" size="16" color="white" />
                      </template>

                      <v-card
                        elevation="2"
                        class="rounded-lg"
                        :color="`${grupo.config.cor}-lighten-5`"
                      >
                        <v-card-text class="pa-4">
                          <!-- Horário principal -->
                          <div class="d-flex align-center justify-space-between mb-3">
                            <div>
                              <v-chip
                                :color="grupo.config.cor"
                                variant="elevated"
                                size="small"
                                class="font-weight-bold"
                              >
                                <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
                                {{ formatHora(horario.hora_inicio) }}
                                <span v-if="horario.hora_fim">
                                  - {{ formatHora(horario.hora_fim) }}
                                </span>
                              </v-chip>
                            </div>
                            <v-chip
                              v-if="horario.recorrente"
                              size="x-small"
                              color="success"
                              variant="tonal"
                            >
                              <v-icon icon="mdi-refresh" size="12" class="mr-1" />
                              {{ horario.tipo_recorrencia }}
                            </v-chip>
                          </div>

                          <!-- Dias da semana -->
                          <div v-if="horario.dia_semana && horario.dia_semana.length" class="mb-3">
                            <div class="text-caption text-medium-emphasis mb-1">
                              Dias da semana:
                            </div>
                            <div class="d-flex flex-wrap ga-1">
                              <v-chip
                                v-for="dia in horario.dia_semana"
                                :key="dia"
                                size="small"
                                :color="getCorDia(dia)"
                                variant="flat"
                              >
                                {{ diasSemanaMap[dia] || dia }}
                              </v-chip>
                            </div>
                          </div>

                          <!-- Recorrência mensal -->
                          <div v-if="horario.tipo_recorrencia === 'mensal' && horario.dia_do_mes" class="mb-2">
                            <v-alert
                              density="compact"
                              type="info"
                              variant="tonal"
                              class="text-body-2"
                            >
                              <v-icon icon="mdi-calendar-month" size="16" class="mr-2" />
                              {{ formatarRecorrencia(horario) }}
                            </v-alert>
                          </div>

                          <!-- Período (eventos anuais) -->
                          <div v-if="horario.periodo_data_inicio && horario.periodo_data_fim" class="mb-2">
                            <v-alert
                              density="compact"
                              type="warning"
                              variant="tonal"
                              class="text-body-2"
                            >
                              <v-icon icon="mdi-calendar-star" size="16" class="mr-2" />
                              {{ formatData(horario.periodo_data_inicio) }} até {{ formatData(horario.periodo_data_fim) }}
                            </v-alert>
                          </div>

                          <!-- Observações -->
                          <div v-if="horario.observacoes" class="mt-2">
                            <v-divider class="mb-2" />
                            <div class="text-body-2">
                              <v-icon icon="mdi-information-outline" size="16" class="mr-1" />
                              {{ horario.observacoes }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>

        <!-- Coluna lateral -->
        <v-col cols="12" lg="4">
          <!-- Contato e Redes Sociais -->
          <v-card elevation="3" class="mb-6 rounded-xl sticky-top" color="surface">
            <v-card-title class="text-h6 font-weight-bold pa-6 bg-success-lighten-2">
              <v-icon icon="mdi-email-outline" class="mr-3" />
              Contato e Redes
            </v-card-title>
            <v-card-text class="pa-6">
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="link in socialLinks"
                  :key="link.label"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mb-2 rounded-lg"
                  elevation="1"
                >
                  <template #prepend>
                    <v-avatar :color="`${link.color}-lighten-4`" size="48">
                      <v-icon :icon="link.icon" :color="link.color" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-medium">
                    {{ link.label }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>

              <v-divider v-if="paroquia.endereco" class="my-6" />

              <!-- Endereço -->
              <div v-if="paroquia.endereco" class="pa-4 bg-grey-lighten-4 rounded-lg">
                <div class="d-flex align-start ga-3">
                  <v-avatar color="primary-lighten-4" size="48">
                    <v-icon icon="mdi-map-marker" color="primary" />
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="font-weight-bold text-body-1 mb-1">
                      Endereço
                    </div>
                    <div class="text-body-2">
                      {{ paroquia.endereco }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ cityLabel }}
                    </div>
                    <div v-if="paroquia.cep" class="text-caption text-medium-emphasis mt-1">
                      CEP: {{ paroquia.cep }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Informações Adicionais -->
          <v-card elevation="3" class="rounded-xl" color="surface">
            <v-card-title class="text-h6 font-weight-bold pa-6 bg-info-lighten-2">
              <v-icon icon="mdi-information-variant" class="mr-3" />
              Informações
            </v-card-title>
            <v-card-text class="pa-6">
              <v-list class="bg-transparent">
                <v-list-item v-if="paroquia.ano_criacao" class="px-0">
                  <template #prepend>
                    <v-avatar color="amber-lighten-4" size="48">
                      <v-icon icon="mdi-calendar-star" color="amber-darken-2" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">
                    Ano de Fundação
                  </v-list-item-title>
                  <v-list-item-subtitle class="font-weight-bold text-h6 text-high-emphasis">
                    {{ paroquia.ano_criacao }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="dioceseName" class="px-0">
                  <template #prepend>
                    <v-avatar color="purple-lighten-4" size="48">
                      <v-icon icon="mdi-church" color="purple-darken-2" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">
                    Diocese
                  </v-list-item-title>
                  <v-list-item-subtitle class="font-weight-medium text-body-1 text-high-emphasis">
                    {{ dioceseName }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-avatar color="blue-lighten-4" size="48">
                      <v-icon icon="mdi-account-supervisor" color="blue-darken-2" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">
                    Equipe Sacerdotal
                  </v-list-item-title>
                  <v-list-item-subtitle class="font-weight-bold text-h6 text-high-emphasis">
                    {{ cleroMembros.length }} {{ cleroMembros.length === 1 ? 'membro' : 'membros' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.sticky-top {
  position: sticky;
  top: 80px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-primary-darken-2) 100%);
}
</style>
