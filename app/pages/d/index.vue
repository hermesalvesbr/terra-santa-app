<script setup lang="ts">
import type { Paroquia } from '~/types/schema'

// SEO Meta Tags - Diocese Detail
definePageMeta({
  entityType: 'geral',
  pageTitle: 'Diocese',
})

useSeoMeta({
  title: 'Diocese - Terra Santa',
  description: 'Conheça a Diocese, suas paróquias, capelas e comunidades. Informações sobre o bispo diocesano, eventos e atividades pastorais.',
  ogTitle: 'Diocese - Terra Santa',
  ogDescription: 'Conheça a Diocese, suas paróquias, capelas e comunidades. Informações sobre o bispo diocesano, eventos e atividades pastorais.',
  ogType: 'website',
  ogUrl: 'https://terrasanta.app/d',
  ogSiteName: 'Terra Santa',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Diocese - Terra Santa',
  twitterDescription: 'Conheça a Diocese, suas paróquias, capelas e comunidades.',
  robots: 'index, follow',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://terrasanta.app/d' },
  ],
  htmlAttrs: {
    lang: 'pt-BR',
  },
})

// Mock data - será substituído por dados reais do Directus
const dioceseData = ref({
  nome: 'São Paulo',
  cidade: 'São Paulo',
  uf: 'SP',
  descricao: 'A Diocese de São Paulo é uma das mais antigas e importantes do Brasil, servindo à comunidade católica com dedicação e fé.',
  historia: 'Fundada em 1745, a Diocese tem uma rica história de evangelização e serviço pastoral à comunidade.',
  fotoCapa: '/api/placeholder/120/120',
  site: 'https://diocese.org.br',
  instagram: 'diocese.saopaulo',
  youtube: 'https://youtube.com/diocese',
  whatsapp: '5511999999999',
  totalParoquias: 42,
  totalCapelas: 128,
  totalComunidades: 256,
  bispo: {
    nome: 'Dom João Santos',
    funcao: 'Bispo Diocesano',
    foto: '/api/placeholder/64/64',
  },
})

const proximosEventos = ref([
  {
    id: 1,
    titulo: 'Ordenação Sacerdotal',
    data: new Date('2025-09-15'),
    local: 'Catedral Metropolitana',
  },
  {
    id: 2,
    titulo: 'Encontro de Juventude',
    data: new Date('2025-09-20'),
    local: 'Centro Pastoral',
  },
])

const paroquias = ref<Paroquia[]>([
  {
    id: 1,
    nome: 'Paróquia São José',
    cidade: 'São Paulo',
    foto_capa: null,
    descricao: null,
    uf: 'SP',
    slug: 'paroquia-sao-jose',
    status: 'published',
    sort: null,
    user_created: null,
    date_created: '',
    user_updated: null,
    date_updated: '',
    whatsapp: null,
    email: null,
    instagram: null,
    site: null,
    endereco: null,
    ano_criacao: null,
    diocese: null,
    capa: null,
    contatos: null,
    comunidades: null,
    capelas: null,
    horarios: null,
    eventos: null,
  } as unknown as Paroquia,
  {
    id: 2,
    nome: 'Paróquia Santa Maria',
    cidade: 'São Paulo',
    foto_capa: null,
    descricao: null,
    uf: 'SP',
    slug: 'paroquia-santa-maria',
    status: 'published',
    sort: null,
    user_created: null,
    date_created: '',
    user_updated: null,
    date_updated: '',
    whatsapp: null,
    email: null,
    instagram: null,
    site: null,
    endereco: null,
    ano_criacao: null,
    diocese: null,
    capa: null,
    contatos: null,
    comunidades: null,
    capelas: null,
    horarios: null,
    eventos: null,
  } as unknown as Paroquia,
  {
    id: 3,
    nome: 'Paróquia São Pedro',
    cidade: 'São Paulo',
    foto_capa: null,
    descricao: null,
    uf: 'SP',
    slug: 'paroquia-sao-pedro',
    status: 'published',
    sort: null,
    user_created: null,
    date_created: '',
    user_updated: null,
    date_updated: '',
    whatsapp: null,
    email: null,
    instagram: null,
    site: null,
    endereco: null,
    ano_criacao: null,
    diocese: null,
    capa: null,
    contatos: null,
    comunidades: null,
    capelas: null,
    horarios: null,
    eventos: null,
  } as unknown as Paroquia,
  {
    id: 4,
    nome: 'Paróquia Santa Rita',
    cidade: 'São Paulo',
    foto_capa: null,
    descricao: null,
    uf: 'SP',
    slug: 'paroquia-santa-rita',
    status: 'published',
    sort: null,
    user_created: null,
    date_created: '',
    user_updated: null,
    date_updated: '',
    whatsapp: null,
    email: null,
    instagram: null,
    site: null,
    endereco: null,
    ano_criacao: null,
    diocese: null,
    capa: null,
    contatos: null,
    comunidades: null,
    capelas: null,
    horarios: null,
    eventos: null,
  } as unknown as Paroquia,
])

// Functions
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
</script>

<template>
  <div>
    <!-- Diocese Header -->
    <v-container fluid class="pa-0">
      <v-sheet
        :height="300"
        color="primary"
        class="d-flex align-center position-relative"
      >
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="8">
              <div class="text-white">
                <h1 class="text-h3 font-weight-bold mb-2">
                  Diocese de {{ dioceseData.nome }}
                </h1>
                <p class="text-h6 mb-4">
                  {{ dioceseData.cidade }}, {{ dioceseData.uf }}
                </p>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip color="accent" size="small">
                    {{ dioceseData.totalParoquias }} Paróquias
                  </v-chip>
                  <v-chip color="secondary" size="small">
                    {{ dioceseData.totalCapelas }} Capelas
                  </v-chip>
                  <v-chip color="success" size="small">
                    {{ dioceseData.totalComunidades }} Comunidades
                  </v-chip>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="4" class="text-center">
              <v-avatar size="120" class="mb-4">
                <v-img
                  :src="dioceseData.fotoCapa || '/api/placeholder/120/120'"
                  :alt="`Diocese de ${dioceseData.nome}`"
                />
              </v-avatar>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-container>

    <!-- Diocese Info -->
    <v-container class="py-8">
      <v-row>
        <v-col cols="12" md="8">
          <v-card elevation="2" class="mb-6">
            <v-card-title class="text-h5 text-primary">
              Sobre a Diocese
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 mb-4">
                {{ dioceseData.descricao }}
              </p>
              <p v-if="dioceseData.historia" class="text-body-1">
                {{ dioceseData.historia }}
              </p>
            </v-card-text>
          </v-card>

          <!-- Bispo -->
          <v-card v-if="dioceseData.bispo" elevation="2">
            <v-card-title class="text-h5 text-primary">
              Bispo Diocesano
            </v-card-title>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar size="64" class="mr-4">
                  <v-img
                    :src="dioceseData.bispo.foto || '/api/placeholder/64/64'"
                    :alt="dioceseData.bispo.nome"
                  />
                </v-avatar>
                <div>
                  <h3 class="text-h6">
                    {{ dioceseData.bispo.nome }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    {{ dioceseData.bispo.funcao }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Contatos -->
          <v-card elevation="2" class="mb-6">
            <v-card-title class="text-h6 text-primary">
              Contatos
            </v-card-title>
            <v-card-text>
              <div class="d-flex flex-column gap-3">
                <div v-if="dioceseData.site" class="d-flex align-center">
                  <v-icon icon="mdi-web" class="mr-3" />
                  <a :href="dioceseData.site" target="_blank" class="text-decoration-none">
                    Site Oficial
                  </a>
                </div>
                <div v-if="dioceseData.instagram" class="d-flex align-center">
                  <v-icon icon="mdi-instagram" class="mr-3" />
                  <a :href="`https://instagram.com/${dioceseData.instagram}`" target="_blank" class="text-decoration-none">
                    @{{ dioceseData.instagram }}
                  </a>
                </div>
                <div v-if="dioceseData.youtube" class="d-flex align-center">
                  <v-icon icon="mdi-youtube" class="mr-3" />
                  <a :href="dioceseData.youtube" target="_blank" class="text-decoration-none">
                    YouTube
                  </a>
                </div>
                <div v-if="dioceseData.whatsapp" class="d-flex align-center">
                  <v-icon icon="mdi-whatsapp" class="mr-3" />
                  <a :href="`https://wa.me/${dioceseData.whatsapp}`" target="_blank" class="text-decoration-none">
                    WhatsApp
                  </a>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Próximos Eventos -->
          <v-card elevation="2">
            <v-card-title class="text-h6 text-primary">
              Próximos Eventos Diocesanos
            </v-card-title>
            <v-card-text>
              <div v-if="proximosEventos.length > 0">
                <div
                  v-for="evento in proximosEventos"
                  :key="evento.id"
                  class="mb-3 pb-3 border-b-thin"
                >
                  <h4 class="text-subtitle-1 font-weight-medium">
                    {{ evento.titulo }}
                  </h4>
                  <p class="text-body-2 text-medium-emphasis mb-1">
                    <v-icon icon="mdi-calendar" size="16" class="mr-1" />
                    {{ formatDate(evento.data) }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis">
                    <v-icon icon="mdi-map-marker" size="16" class="mr-1" />
                    {{ evento.local }}
                  </p>
                </div>
              </div>
              <p v-else class="text-body-2 text-medium-emphasis">
                Nenhum evento agendado no momento.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Mapa de Paróquias -->
    <v-container fluid style="background-color: rgb(var(--v-theme-surface-variant));">
      <v-container class="py-8">
        <h2 class="text-h4 text-center mb-8 text-primary">
          Paróquias da Diocese
        </h2>

        <v-row>
          <v-col
            v-for="paroquia in paroquias"
            :key="paroquia.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <ParoquiaCard :paroquia="paroquia" />
          </v-col>
        </v-row>

        <div class="text-center mt-8">
          <v-btn
            to="/paroquias"
            variant="outlined"
            color="primary"
            size="large"
          >
            Ver Todas as Paróquias
            <v-icon end>
              mdi-arrow-right
            </v-icon>
          </v-btn>
        </div>
      </v-container>
    </v-container>
  </div>
</template>
