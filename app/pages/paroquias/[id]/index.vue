<script setup lang="ts">
definePageMeta({
  layout: 'paroquia',
})

// SEO
useHead({
  title: 'Paróquia São José - Terra Santa',
  meta: [
    { name: 'description', content: 'Conheça a Paróquia São José. Horários de missas, endereço, contatos e informações.' },
  ],
})

// Mock data - será substituído por dados do Directus
const proximasMissas = ref([
  {
    id: 1,
    titulo: 'Missa Dominical',
    dia: 'Hoje',
    horario: '18:00',
    local: 'Matriz',
    tipo: 'missa',
  },
  {
    id: 2,
    titulo: 'Missa Dominical',
    dia: 'Amanhã',
    horario: '07:00',
    local: 'Matriz',
    tipo: 'missa',
  },
  {
    id: 3,
    titulo: 'Terço dos Homens',
    dia: 'Quarta-feira',
    horario: '19:30',
    local: 'Capela São Pedro',
    tipo: 'terco',
  },
])

const destaques = ref([
  {
    id: 1,
    titulo: 'Festa do Padroeiro',
    data: '19 de março',
    imagem: '/api/placeholder/400/250',
    descricao: 'Grande celebração em honra a São José',
  },
  {
    id: 2,
    titulo: 'Retiro Espiritual',
    data: '15 e 16 de novembro',
    imagem: '/api/placeholder/400/250',
    descricao: 'Momento de reflexão e oração',
  },
])

const parocoInfo = ref({
  nome: 'Pe. João Silva',
  foto: '/api/placeholder/80/80',
  funcao: 'Pároco',
  frase: 'Que a paz de Cristo esteja com todos vocês!',
})

const capelas = ref([
  { id: 1, nome: 'Matriz São José', totalEventos: 12 },
  { id: 2, nome: 'Capela São Pedro', totalEventos: 8 },
  { id: 3, nome: 'Capela Santa Maria', totalEventos: 6 },
  { id: 4, nome: 'Capela Nossa Senhora', totalEventos: 5 },
])

const comunidades = ref([
  { id: 1, nome: 'Terço dos Homens', membros: 45 },
  { id: 2, nome: 'Grupo de Jovens', membros: 32 },
  { id: 3, nome: 'Ministério de Música', membros: 28 },
  { id: 4, nome: 'Catequese Infantil', membros: 120 },
])

// Função para obter ícone por tipo de evento
function getEventIcon(tipo: string) {
  const icons: Record<string, string> = {
    missa: 'mdi-cross',
    terco: 'mdi-rosary',
    catequese: 'mdi-book-open-variant',
    confissao: 'mdi-hands-pray',
  }
  return icons[tipo] || 'mdi-calendar'
}

// Função para obter cor por tipo de evento
function getEventColor(tipo: string) {
  const colors: Record<string, string> = {
    missa: 'primary',
    terco: 'purple',
    catequese: 'blue',
    confissao: 'teal',
  }
  return colors[tipo] || 'grey'
}
</script>

<template>
  <div>
    <!-- Saudação com Pároco -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="pa-4">
        <div class="d-flex align-center">
          <v-avatar size="64" class="mr-4">
            <v-img :src="parocoInfo.foto" :alt="parocoInfo.nome" />
          </v-avatar>
          <div>
            <div class="text-caption text-medium-emphasis">
              Mensagem do Pároco
            </div>
            <h3 class="text-body-1 font-weight-bold mb-1">
              {{ parocoInfo.nome }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              "{{ parocoInfo.frase }}"
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Próximas Missas e Eventos -->
    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <h2 class="text-h6 font-weight-bold">
          Próximas Missas
        </h2>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          to="/paroquias/1/agenda"
        >
          Ver todas
        </v-btn>
      </div>

      <v-card
        v-for="evento in proximasMissas"
        :key="evento.id"
        class="mb-3"
        elevation="2"
      >
        <v-card-text class="pa-4">
          <div class="d-flex">
            <v-avatar
              :color="getEventColor(evento.tipo)"
              size="48"
              class="mr-3"
            >
              <v-icon :icon="getEventIcon(evento.tipo)" color="white" />
            </v-avatar>
            <div class="flex-grow-1">
              <h3 class="text-body-1 font-weight-bold mb-1">
                {{ evento.titulo }}
              </h3>
              <div class="d-flex align-center mb-1">
                <v-icon size="16" class="mr-1 text-medium-emphasis">
                  mdi-calendar
                </v-icon>
                <span class="text-body-2 text-medium-emphasis">
                  {{ evento.dia }} às {{ evento.horario }}
                </span>
              </div>
              <div class="d-flex align-center">
                <v-icon size="16" class="mr-1 text-medium-emphasis">
                  mdi-map-marker
                </v-icon>
                <span class="text-body-2 text-medium-emphasis">
                  {{ evento.local }}
                </span>
              </div>
            </div>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="() => {}"
            >
              <v-icon>mdi-bell-plus-outline</v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Destaques do Mês -->
    <div class="mb-4">
      <h2 class="text-h6 font-weight-bold mb-3">
        Destaques do Mês
      </h2>

      <v-row dense>
        <v-col
          v-for="destaque in destaques"
          :key="destaque.id"
          cols="12"
        >
          <v-card elevation="2">
            <v-img
              :src="destaque.imagem"
              :alt="destaque.titulo"
              height="180"
              cover
            >
              <div class="destaque-overlay" />
              <v-card-title class="text-white position-relative">
                {{ destaque.titulo }}
              </v-card-title>
            </v-img>
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-icon size="16" class="mr-1 text-medium-emphasis">
                  mdi-calendar-clock
                </v-icon>
                <span class="text-body-2 text-medium-emphasis">
                  {{ destaque.data }}
                </span>
              </div>
              <p class="text-body-2 mb-0">
                {{ destaque.descricao }}
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                variant="text"
                color="primary"
                @click="() => {}"
              >
                Saiba mais
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Nossas Capelas -->
    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <h2 class="text-h6 font-weight-bold">
          Nossas Capelas
        </h2>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          to="/paroquias/1/capelas"
        >
          Ver todas
        </v-btn>
      </div>

      <v-card elevation="2">
        <v-list>
          <v-list-item
            v-for="(capela, index) in capelas"
            :key="capela.id"
            :to="`/capelas/${capela.id}`"
          >
            <template #prepend>
              <v-avatar color="primary" size="40">
                <v-icon color="white">
                  mdi-church
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ capela.nome }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ capela.totalEventos }} eventos agendados
            </v-list-item-subtitle>

            <template #append>
              <v-icon>mdi-chevron-right</v-icon>
            </template>

            <v-divider v-if="index < capelas.length - 1" />
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Comunidades Ativas -->
    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <h2 class="text-h6 font-weight-bold">
          Comunidades
        </h2>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          to="/paroquias/1/comunidades"
        >
          Ver todas
        </v-btn>
      </div>

      <v-row dense>
        <v-col
          v-for="comunidade in comunidades"
          :key="comunidade.id"
          cols="6"
        >
          <v-card
            elevation="2"
            :to="`/comunidades/${comunidade.id}`"
            class="text-center pa-4"
          >
            <v-avatar color="primary" size="48" class="mb-2">
              <v-icon color="white" size="24">
                mdi-account-group
              </v-icon>
            </v-avatar>
            <div class="text-body-2 font-weight-medium mb-1">
              {{ comunidade.nome }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ comunidade.membros }} membros
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Localização -->
    <div class="mb-4">
      <h2 class="text-h6 font-weight-bold mb-3">
        Como Chegar
      </h2>

      <v-card elevation="2">
        <v-card-text class="pa-0">
          <v-sheet height="200" color="grey-lighten-2" class="d-flex align-center justify-center">
            <div class="text-center">
              <v-icon size="48" class="text-medium-emphasis mb-2">
                mdi-map
              </v-icon>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Mapa será carregado aqui
              </p>
            </div>
          </v-sheet>
        </v-card-text>
        <v-card-text>
          <div class="d-flex align-center mb-3">
            <v-icon class="mr-2" color="primary">
              mdi-map-marker
            </v-icon>
            <div>
              <div class="text-body-2 font-weight-medium">
                Rua das Flores, 123 - Centro
              </div>
              <div class="text-caption text-medium-emphasis">
                São Paulo, SP - CEP 01234-567
              </div>
            </div>
          </div>
          <v-btn
            block
            color="primary"
            variant="flat"
            prepend-icon="mdi-directions"
          >
            Ver Rotas
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Informações de Contato -->
    <div class="mb-4">
      <h2 class="text-h6 font-weight-bold mb-3">
        Informações
      </h2>

      <v-card elevation="2">
        <v-list>
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">
                mdi-clock-outline
              </v-icon>
            </template>
            <v-list-item-title>Horários de Atendimento</v-list-item-title>
            <v-list-item-subtitle>Seg-Sex: 9h às 17h</v-list-item-subtitle>
          </v-list-item>

          <v-divider />

          <v-list-item>
            <template #prepend>
              <v-icon color="primary">
                mdi-email-outline
              </v-icon>
            </template>
            <v-list-item-title>E-mail</v-list-item-title>
            <v-list-item-subtitle>contato@paroquiasaojose.com.br</v-list-item-subtitle>
          </v-list-item>

          <v-divider />

          <v-list-item>
            <template #prepend>
              <v-icon color="primary">
                mdi-web
              </v-icon>
            </template>
            <v-list-item-title>Site</v-list-item-title>
            <v-list-item-subtitle>www.paroquiasaojose.com.br</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.destaque-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
}
</style>
