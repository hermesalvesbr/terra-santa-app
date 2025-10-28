<script setup lang="ts">
// Não usar definePageMeta quando usar NuxtLayout explicitamente com slots
const route = useRoute()
const paroquiaId = route.params.id as string

// Composables
const { getImageUrl } = useDirectusAsset()
const { getParoquiaById, getEventos } = useParoquia()

// Buscar dados da paróquia do Directus
const { data: paroquia } = await getParoquiaById(paroquiaId)

// SEO dinâmico baseado na paróquia
useHead({
  title: `${paroquia.value?.nome || 'Paróquia'} - Terra Santa`,
  meta: [
    {
      name: 'description',
      content: paroquia.value?.descricao?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Conheça nossa paróquia',
    },
  ],
})

// Buscar próximos eventos da paróquia
const { data: eventosData } = await getEventos(paroquiaId, { limit: 2, proximos: true })
const proximosEventos = computed(() => eventosData.value || [])

// Formatar data
function formatDate(dateString: string) {
  if (!dateString)
    return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <NuxtLayout name="paroquia">
    <template #hero>
      <div
        class="custom-hero-banner"
        :style="{
          backgroundImage: paroquia?.capa
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${getImageUrl(paroquia.capa, { width: 1200, height: 300 })})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <v-container class="position-relative py-6">
          <h1 class="text-h4 font-weight-bold mb-2 text-white">
            {{ paroquia?.nome }}
          </h1>
          <div class="d-flex align-center">
            <v-icon size="20" class="mr-2" color="white">
              mdi-map-marker
            </v-icon>
            <span class="text-h6 text-white">Araripina, PE</span>
          </div>
        </v-container>
      </div>
    </template>

    <!-- Botões de Ação Rápida -->
    <v-row class="mb-4" dense>
      <v-col cols="6">
        <v-card
          elevation="0"
          :to="`/p/${paroquiaId}/horarios`"
          class="action-card rounded-lg"
          color="primary"
          variant="flat"
        >
          <v-card-text class="text-center py-5">
            <v-avatar color="white" size="56" class="mb-3">
              <v-icon size="32" color="primary">
                mdi-clock-outline
              </v-icon>
            </v-avatar>
            <div class="text-white font-weight-medium">
              Horários<br>de Missa
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card
          elevation="0"
          :to="`/p/${paroquiaId}/noticias`"
          class="action-card rounded-lg"
          color="success"
          variant="flat"
        >
          <v-card-text class="text-center py-5">
            <v-avatar color="white" size="56" class="mb-3">
              <v-icon size="32" color="success">
                mdi-newspaper-variant-outline
              </v-icon>
            </v-avatar>
            <div class="text-white font-weight-medium">
              Notícias
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card
          elevation="0"
          :to="`/p/${paroquiaId}/agenda`"
          class="action-card rounded-lg"
          color="info"
          variant="flat"
        >
          <v-card-text class="text-center py-5">
            <v-avatar color="white" size="56" class="mb-3">
              <v-icon size="32" color="info">
                mdi-calendar-month-outline
              </v-icon>
            </v-avatar>
            <div class="text-white font-weight-medium">
              Agenda
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card
          elevation="0"
          :to="`/p/${paroquiaId}/contatos`"
          class="action-card rounded-lg"
          color="warning"
          variant="flat"
        >
          <v-card-text class="text-center py-5">
            <v-avatar color="white" size="56" class="mb-3">
              <v-icon size="32" color="warning">
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

    <!-- Destaques -->
    <div class="mb-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <h2 class="text-h6 font-weight-bold">
          📅 Próximos Eventos
        </h2>
        <v-btn
          v-if="proximosEventos.length > 0"
          variant="text"
          color="primary"
          size="small"
          :to="`/p/${paroquiaId}/agenda`"
        >
          Ver todos
        </v-btn>
      </div>

      <v-row v-if="proximosEventos.length > 0" dense>
        <v-col
          v-for="evento in proximosEventos"
          :key="evento.id"
          cols="12"
        >
          <v-card
            elevation="2"
            :to="`/eventos/${evento.id}`"
            class="rounded-lg overflow-hidden event-card"
          >
            <v-row no-gutters>
              <v-col cols="4">
                <v-img
                  :src="getImageUrl(evento.capa, { width: 300, height: 120 })"
                  :alt="evento.titulo"
                  height="120"
                  cover
                  class="rounded-s-lg"
                >
                  <template #error>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-icon size="32" color="grey-lighten-2">
                        mdi-image-off-outline
                      </v-icon>
                    </v-row>
                  </template>
                </v-img>
              </v-col>
              <v-col cols="8">
                <v-card-text class="pa-3">
                  <h3 class="text-body-1 font-weight-bold mb-1 line-clamp-1">
                    {{ evento.titulo }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-2 line-clamp-2">
                    {{ evento.descricao?.replace(/<[^>]*>/g, '').slice(0, 80) || 'Detalhes do evento' }}
                  </p>
                  <div class="d-flex align-center">
                    <v-chip size="x-small" color="primary" variant="flat">
                      <v-icon start size="14">
                        mdi-calendar
                      </v-icon>
                      {{ formatDate(evento.data_inicio) }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Placeholder se não houver eventos -->
      <v-card v-else elevation="0" class="rounded-lg" color="grey-lighten-4">
        <v-card-text class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-3">
            mdi-calendar-blank-outline
          </v-icon>
          <h3 class="text-h6 mb-2 text-medium-emphasis">
            Nenhum evento próximo
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Novos eventos serão publicados em breve
          </p>
        </v-card-text>
      </v-card>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.custom-hero-banner {
  margin-top: 56px;
  height: 300px;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.action-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.action-card:active {
  transform: translateY(-2px);
}

.event-card {
  transition: all 0.2s ease;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation para os cards de ação */
.action-card:nth-child(1) {
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

.action-card:nth-child(2) {
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-card:nth-child(3) {
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

.action-card:nth-child(4) {
  animation: fadeInUp 0.4s ease-out 0.4s both;
}
</style>
