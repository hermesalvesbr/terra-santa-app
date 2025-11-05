<script setup lang="ts">
import type { Paroquia, ParoquiaHorario } from '~/types/schema'

const route = useRoute()

const paroquiaParam = computed(() => {
  const param = route.params.id
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
    return payload as T[]
  if (Array.isArray(payload.data))
    return payload.data as T[]
  return []
}

const horarios = computed(() => unwrapCollection<ParoquiaHorario>(horariosAsync?.data.value))
const cleroItems = computed(() => unwrapCollection<any>(cleroAsync?.data.value))
const proximosEventos = computed(() => unwrapCollection<any>(eventosAsync?.data.value))

const horariosPending = computed(() => horariosAsync?.pending.value ?? false)
const cleroPending = computed(() => cleroAsync?.pending.value ?? false)
const eventosPending = computed(() => eventosAsync?.pending.value ?? false)

const heroBackground = computed(() => {
  if (!paroquia.value?.capa)
    return 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
  return `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 100%), url(${getImageUrl(paroquia.value.capa, { width: 1400, height: 420 })})`
})

const heroStyle = computed(() => ({
  backgroundImage: heroBackground.value,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '320px',
}))

const cidadeLabel = computed(() => [paroquia.value?.cidade, paroquia.value?.uf].filter(Boolean).join(', '))

const dioceseName = computed(() => {
  const diocese = paroquia.value?.diocese
  return diocese && typeof diocese === 'object' ? diocese.nome : ''
})

const detailBaseRoute = computed(() => `/p/${paroquia.value?.slug || paroquia.value?.id || paroquiaParam}`)

function sanitizeDescription(content: string) {
  return content
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '')
}

const descricaoSanitizada = computed(() => {
  if (!paroquia.value?.descricao)
    return ''
  return sanitizeDescription(paroquia.value.descricao)
})

const descricaoResumo = computed(() => {
  if (!paroquia.value?.descricao)
    return 'Conheça a história e as atividades desta paróquia.'
  const clean = paroquia.value.descricao.replace(/<[^>]*>/g, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
})

function resolveDiaSemana(dia: ParoquiaHorario['dia_semana']) {
  if (!dia)
    return 'Horários'
  if (typeof dia === 'string')
    return dia
  const label = (dia as Record<string, any>).label || (dia as Record<string, any>).nome || (dia as Record<string, any>).name
  return typeof label === 'string' ? label : 'Horários'
}

function formatTime(value: string) {
  if (!value)
    return ''
  const date = new Date(value)
  if (!Number.isNaN(date.getTime()))
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return value
}

const weekdayOrder = ['domingo', 'segunda', 'terça', 'terca', 'quarta', 'quinta', 'sexta', 'sábado', 'sabado']

function getWeekdayIndex(label: string) {
  const normalized = label
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
  const index = weekdayOrder.findIndex(day => normalized.startsWith(day))
  return index === -1 ? weekdayOrder.length : index
}

const horariosAgrupados = computed(() => {
  const map = new Map<string, ParoquiaHorario[]>()
  horarios.value.forEach((horario) => {
    const dia = resolveDiaSemana(horario.dia_semana)
    if (!map.has(dia))
      map.set(dia, [])
    map.get(dia)!.push(horario)
  })

  return Array.from(map.entries())
    .sort((a, b) => getWeekdayIndex(a[0]) - getWeekdayIndex(b[0]))
    .map(([dia, lista]) => ({
      dia,
      lista: lista
        .slice()
        .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
    }))
})

const cleroCards = computed(() => cleroItems.value
  .map((item) => {
    const membro = item?.clero ?? {}
    return {
      id: item.id,
      nome: membro?.nome,
      cargo: item.cargo,
      hierarquia: membro?.hierarquia,
      foto: membro?.foto,
      whatsapp: membro?.whatsapp,
      email: membro?.email,
    }
  })
  .filter(card => Boolean(card.nome)))

const contatoLinks = computed(() => {
  const current = paroquia.value
  if (!current)
    return []

  const links: Array<{ icon: string, label: string, href: string }> = []

  if (current.whatsapp) {
    const phone = current.whatsapp.replace(/\D/g, '')
    links.push({ icon: 'mdi-whatsapp', label: 'WhatsApp', href: `https://wa.me/${phone}` })
  }

  if (current.email)
    links.push({ icon: 'mdi-email-outline', label: 'E-mail', href: `mailto:${current.email}` })

  if (current.instagram) {
    const username = current.instagram.replace('@', '')
    links.push({ icon: 'mdi-instagram', label: 'Instagram', href: `https://instagram.com/${username}` })
  }

  if (current.site)
    links.push({ icon: 'mdi-web', label: 'Site oficial', href: current.site })

  return links
})

const infoCards = computed(() => {
  const current = paroquia.value
  if (!current)
    return []

  return [
    {
      icon: 'mdi-map-marker-radius',
      label: 'Endereço',
      value: current.endereco ? `${current.endereco}${current.cidade ? `, ${current.cidade}` : ''}${current.uf ? ` - ${current.uf}` : ''}` : 'Endereço não informado',
    },
    {
      icon: 'mdi-domain',
      label: 'Diocese',
      value: dioceseName.value || 'Não informado',
    },
    {
      icon: 'mdi-calendar-range',
      label: 'Fundação',
      value: current.ano_criacao || 'Ano não informado',
    },
    {
      icon: 'mdi-email',
      label: 'E-mail',
      value: current.email || 'E-mail não informado',
    },
  ]
})

function formatEventDateRange(start?: string, end?: string) {
  if (!start)
    return 'Data a confirmar'
  const inicio = new Date(start)
  const fim = end ? new Date(end) : null
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
  if (fim)
    return `${formatter.format(inicio)} – ${formatter.format(fim)}`
  return formatter.format(inicio)
}

function scrollToSection(sectionId: string) {
  if (typeof window === 'undefined')
    return
  const element = document.getElementById(sectionId)
  if (element)
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const hasHorarios = computed(() => horarios.value.length > 0)
const hasEventos = computed(() => proximosEventos.value.length > 0)
const hasClero = computed(() => cleroCards.value.length > 0)
const hasContatos = computed(() => contatoLinks.value.length > 0)

const pageDescription = computed(() => descricaoResumo.value)

useHead(() => ({
  title: paroquia.value?.nome ? `${paroquia.value.nome} - Terra Santa` : 'Paróquia - Terra Santa',
  meta: [
    {
      name: 'description',
      content: pageDescription.value,
    },
  ],
}))
</script>

<template>
  <NuxtLayout :name="('paroquia' as any)">
    <template #hero>
      <div class="d-flex align-end position-relative w-100" :style="heroStyle">
        <v-container class="py-8">
          <v-chip
            v-if="dioceseName"
            color="white"
            text-color="primary"
            size="small"
            variant="tonal"
            class="mb-4"
          >
            {{ dioceseName }}
          </v-chip>
          <h1 class="text-h4 font-weight-bold mb-2 text-white">
            {{ paroquia?.nome || 'Paróquia' }}
          </h1>
          <div v-if="cidadeLabel" class="d-flex align-center text-white">
            <v-icon size="20" class="mr-2" color="white">
              fluent-color:location-24
            </v-icon>
            <span class="text-body-1">
              {{ cidadeLabel }}
            </span>
          </div>
        </v-container>
      </div>
    </template>

    <template v-if="paroquiaPending">
      <v-row dense class="mb-6">
        <v-col cols="12" sm="6">
          <v-skeleton-loader type="image, heading, chips" class="rounded-lg" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-skeleton-loader type="heading, paragraph, paragraph" class="rounded-lg" />
        </v-col>
      </v-row>
      <v-skeleton-loader type="card, card, card" class="rounded-lg" />
    </template>

    <template v-else-if="paroquiaError">
      <v-alert type="error" variant="tonal" class="mb-6">
        Não foi possível carregar os dados da paróquia.
        <v-btn
          variant="text"
          color="error"
          size="small"
          class="ml-2"
          @click="refreshParoquia"
        >
          Tentar novamente
        </v-btn>
      </v-alert>
    </template>

    <template v-else-if="!paroquia">
      <v-card elevation="0" class="rounded-lg text-center py-12">
        <v-card-text>
          <v-icon size="64" color="grey-lighten-2" class="mb-4">
            mdi-domain-off
          </v-icon>
          <h2 class="text-h6 mb-2">
            Paróquia não encontrada
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Verifique o endereço e tente novamente.
          </p>
          <v-btn color="primary" variant="flat" to="/p">
            Voltar para a lista de paróquias
          </v-btn>
        </v-card-text>
      </v-card>
    </template>

    <template v-else>
      <section class="mb-6">
        <v-row dense>
          <v-col cols="6" sm="3">
            <v-card
              elevation="0"
              color="primary"
              variant="flat"
              class="rounded-lg text-center py-4"
              @click="scrollToSection('horarios')"
            >
              <v-card-text>
                <v-avatar color="white" size="48" class="mb-3">
                  <v-icon size="28" color="primary">
                    mdi-clock-outline
                  </v-icon>
                </v-avatar>
                <div class="text-white font-weight-medium">
                  Horários
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3">
            <v-card
              elevation="0"
              color="info"
              variant="flat"
              class="rounded-lg text-center py-4"
              @click="scrollToSection('eventos')"
            >
              <v-card-text>
                <v-avatar color="white" size="48" class="mb-3">
                  <v-icon size="28" color="info">
                    mdi-calendar-month-outline
                  </v-icon>
                </v-avatar>
                <div class="text-white font-weight-medium">
                  Agenda
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3">
            <v-card
              elevation="0"
              color="success"
              variant="flat"
              class="rounded-lg text-center py-4"
              @click="scrollToSection('clero')"
            >
              <v-card-text>
                <v-avatar color="white" size="48" class="mb-3">
                  <v-icon size="28" color="success">
                    mdi-account-group-outline
                  </v-icon>
                </v-avatar>
                <div class="text-white font-weight-medium">
                  Clero
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3">
            <v-card
              elevation="0"
              color="warning"
              variant="flat"
              class="rounded-lg text-center py-4"
              @click="scrollToSection('contatos')"
            >
              <v-card-text>
                <v-avatar color="white" size="48" class="mb-3">
                  <v-icon size="28" color="warning">
                    mdi-phone-outline
                  </v-icon>
                </v-avatar>
                <div class="text-white font-weight-medium">
                  Contatos
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section id="sobre" class="mb-6">
        <v-card elevation="2" class="rounded-lg">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-h6 font-weight-bold mb-0">
                Sobre a paróquia
              </h2>
              <v-chip v-if="dioceseName" size="small" color="primary" variant="tonal">
                {{ dioceseName }}
              </v-chip>
            </div>
            <p v-if="!descricaoSanitizada" class="text-body-2 text-medium-emphasis mb-0">
              {{ descricaoResumo }}
            </p>
            <div
              v-else
              class="prose"
              v-html="descricaoSanitizada"
            />
          </v-card-text>
        </v-card>
      </section>

      <section id="horarios" class="mb-6">
        <div class="d-flex align-center justify-space-between mb-3">
          <h2 class="text-h6 font-weight-bold mb-0">
            Horários de celebrações
          </h2>
          <v-progress-circular
            v-if="horariosPending"
            indeterminate
            size="24"
            color="primary"
          />
        </div>

        <v-row v-if="hasHorarios" dense>
          <v-col
            v-for="grupo in horariosAgrupados"
            :key="grupo.dia"
            cols="12"
            md="6"
          >
            <v-card elevation="1" class="rounded-lg mb-3">
              <v-card-title class="text-subtitle-1 font-weight-bold">
                {{ grupo.dia }}
              </v-card-title>
              <v-divider />
              <v-list>
                <v-list-item
                  v-for="horario in grupo.lista"
                  :key="`${grupo.dia}-${horario.id}`"
                >
                  <v-row>
                    <v-col cols="6" class="py-0">
                      <span class="text-body-2 font-weight-medium">
                        {{ formatTime(horario.hora_inicio) }}
                        <template v-if="horario.hora_fim">
                          — {{ formatTime(horario.hora_fim) }}
                        </template>
                      </span>
                    </v-col>
                    <v-col cols="6" class="py-0 text-right">
                      <span class="text-body-2 text-medium-emphasis">
                        {{ horario.tipo_servico || 'Celebração' }}
                      </span>
                    </v-col>
                  </v-row>
                  <v-list-item-subtitle v-if="horario.observacoes" class="text-body-2">
                    {{ horario.observacoes }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-else-if="!horariosPending" elevation="0" class="rounded-lg" color="grey-lighten-4">
          <v-card-text class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">
              mdi-clock-outline
            </v-icon>
            <h3 class="text-h6 mb-2 text-medium-emphasis">
              Horários não informados
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Esta paróquia ainda não publicou sua agenda de celebrações.
            </p>
          </v-card-text>
        </v-card>
      </section>

      <section id="eventos" class="mb-6">
        <div class="d-flex align-center justify-space-between mb-3">
          <h2 class="text-h6 font-weight-bold mb-0">
            Próximos eventos
          </h2>
          <v-progress-circular
            v-if="eventosPending"
            indeterminate
            size="24"
            color="primary"
          />
        </div>

        <v-row v-if="hasEventos" dense>
          <v-col
            v-for="evento in proximosEventos"
            :key="evento.id"
            cols="12"
            sm="6"
          >
            <v-card elevation="2" class="rounded-lg overflow-hidden h-100">
              <v-img
                :src="getImageUrl(evento.capa, { width: 560, height: 240 })"
                :alt="evento.titulo"
                height="180"
                cover
              >
                <template #error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon size="36" color="grey-lighten-2">
                      mdi-image-off-outline
                    </v-icon>
                  </div>
                </template>
              </v-img>
              <v-card-text class="pa-4 d-flex flex-column">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">
                  {{ evento.titulo }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ evento.descricao?.replace(/<[^>]*>/g, '').slice(0, 120) || 'Acompanhe os detalhes deste evento especial.' }}
                </p>
                <div class="mt-auto d-flex align-center justify-space-between">
                  <v-chip color="primary" variant="tonal" size="small">
                    <v-icon start size="16">
                      mdi-calendar
                    </v-icon>
                    {{ formatEventDateRange(evento.data_inicio, evento.data_fim) }}
                  </v-chip>
                  <v-btn
                    color="primary"
                    variant="text"
                    :to="`${detailBaseRoute}#eventos`"
                  >
                    Ver detalhes
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-else-if="!eventosPending" elevation="0" class="rounded-lg" color="grey-lighten-4">
          <v-card-text class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">
              mdi-calendar-blank-outline
            </v-icon>
            <h3 class="text-h6 mb-2 text-medium-emphasis">
              Nenhum evento próximo
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Acompanhe, os próximos eventos serão divulgados em breve.
            </p>
          </v-card-text>
        </v-card>
      </section>

      <section id="clero" class="mb-6">
        <div class="d-flex align-center justify-space-between mb-3">
          <h2 class="text-h6 font-weight-bold mb-0">
            Clero e responsáveis
          </h2>
          <v-progress-circular
            v-if="cleroPending"
            indeterminate
            size="24"
            color="primary"
          />
        </div>

        <v-slide-group v-if="hasClero" show-arrows>
          <v-slide-group-item
            v-for="membro in cleroCards"
            :key="membro.id"
          >
            <v-card elevation="2" class="mr-4" width="240">
              <v-img
                :src="getImageUrl(membro.foto, { width: 240, height: 200 })"
                :alt="membro.nome"
                height="200"
                cover
              >
                <template #error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon size="36" color="grey-lighten-2">
                      mdi-account
                    </v-icon>
                  </div>
                </template>
              </v-img>
              <v-card-text class="pa-4">
                <h3 class="text-subtitle-2 font-weight-bold mb-1">
                  {{ membro.nome }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-2">
                  {{ membro.cargo || membro.hierarquia || 'Responsável' }}
                </p>
                <div v-if="membro.email" class="d-flex align-center">
                  <v-icon size="16" class="mr-1">
                    mdi-email-outline
                  </v-icon>
                  <span class="text-body-2 text-medium-emphasis">
                    {{ membro.email }}
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-slide-group-item>
        </v-slide-group>

        <v-card v-else-if="!cleroPending" elevation="0" class="rounded-lg" color="grey-lighten-4">
          <v-card-text class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">
              mdi-account-group-outline
            </v-icon>
            <h3 class="text-h6 mb-2 text-medium-emphasis">
              Clero não informado
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Em breve publicaremos informações sobre os responsáveis desta paróquia.
            </p>
          </v-card-text>
        </v-card>
      </section>

      <section id="contatos" class="mb-6">
        <v-card elevation="2" class="rounded-lg">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-h6 font-weight-bold mb-0">
                Contatos e canais oficiais
              </h2>
              <v-chip v-if="paroquia?.whatsapp" size="small" color="success" variant="flat">
                <v-icon start size="16">
                  mdi-whatsapp
                </v-icon>
                Atendimento disponível
              </v-chip>
            </div>
            <div v-if="hasContatos" class="d-flex flex-wrap" style="gap: 12px;">
              <v-btn
                v-for="link in contatoLinks"
                :key="link.href"
                :href="link.href"
                target="_blank"
                rel="noopener"
                color="primary"
                variant="tonal"
              >
                <v-icon start size="18">
                  {{ link.icon }}
                </v-icon>
                {{ link.label }}
              </v-btn>
            </div>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">
              Nenhum canal oficial informado até o momento.
            </p>
          </v-card-text>
        </v-card>
      </section>

      <section class="mb-6">
        <v-row dense>
          <v-col
            v-for="info in infoCards"
            :key="info.label"
            cols="12"
            sm="6"
          >
            <v-card elevation="1" class="rounded-lg h-100">
              <v-card-text class="pa-5">
                <div class="d-flex align-center mb-3">
                  <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
                    <v-icon size="22" color="primary">
                      {{ info.icon }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-1">
                      {{ info.label }}
                    </p>
                    <p class="text-body-2 mb-0">
                      {{ info.value }}
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section class="mb-6">
        <v-card elevation="0" class="rounded-lg" color="grey-lighten-4">
          <v-card-text class="py-6 text-center">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Precisa atualizar informações desta paróquia?
            </p>
            <v-btn
              color="primary"
              variant="flat"
              :to="`${detailBaseRoute}?editar=true`"
            >
              Solicitar atualização
            </v-btn>
          </v-card-text>
        </v-card>
      </section>
    </template>
  </NuxtLayout>
</template>
