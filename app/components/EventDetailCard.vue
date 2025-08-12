<script setup lang="ts">
interface Event {
  id: number
  titulo: string
  data: Date
  hora: string
  local: string
  tipo: string
  descricao?: string
}

const props = defineProps<{
  event: Event
}>()

// Event type configuration
const eventTypeConfig = {
  missa: {
    icon: 'mdi-church',
    color: 'primary',
    name: 'Missa',
  },
  oracao: {
    icon: 'mdi-hands-pray',
    color: 'secondary',
    name: 'Oração',
  },
  catequese: {
    icon: 'mdi-school',
    color: 'accent',
    name: 'Catequese',
  },
  confissao: {
    icon: 'mdi-cross',
    color: 'info',
    name: 'Confissão',
  },
  adoracao: {
    icon: 'mdi-candle',
    color: 'warning',
    name: 'Adoração',
  },
  festa: {
    icon: 'mdi-party-popper',
    color: 'success',
    name: 'Festa',
  },
  reuniao: {
    icon: 'mdi-account-group',
    color: 'grey',
    name: 'Reunião',
  },
  default: {
    icon: 'mdi-calendar',
    color: 'grey',
    name: 'Evento',
  },
}

// Computed properties
const eventTypeIcon = computed(() => {
  return eventTypeConfig[props.event.tipo as keyof typeof eventTypeConfig]?.icon || eventTypeConfig.default.icon
})

const eventTypeColor = computed(() => {
  return eventTypeConfig[props.event.tipo as keyof typeof eventTypeConfig]?.color || eventTypeConfig.default.color
})

const eventTypeName = computed(() => {
  return eventTypeConfig[props.event.tipo as keyof typeof eventTypeConfig]?.name || eventTypeConfig.default.name
})

// Functions
function formatDate(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Hoje'
  }
  else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Amanhã'
  }
  else {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date)
  }
}

function shareEvent() {
  if (navigator.share) {
    navigator.share({
      title: props.event.titulo,
      text: `${props.event.titulo} - ${props.event.local}`,
      url: window.location.href,
    })
  }
}
</script>

<template>
  <v-card elevation="2" class="h-100">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon
            :icon="eventTypeIcon"
            :color="eventTypeColor"
            size="24"
            class="mr-3"
          />
          <div>
            <h3 class="text-h6 font-weight-medium">
              {{ event.titulo }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ event.local }}
            </p>
          </div>
        </div>

        <v-chip
          :color="eventTypeColor"
          size="small"
          variant="tonal"
        >
          {{ eventTypeName }}
        </v-chip>
      </div>

      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-clock" size="16" class="mr-2 text-medium-emphasis" />
        <span class="text-body-2 text-medium-emphasis">{{ event.hora }}</span>
      </div>

      <div class="d-flex align-center mb-3">
        <v-icon icon="mdi-calendar" size="16" class="mr-2 text-medium-emphasis" />
        <span class="text-body-2 text-medium-emphasis">{{ formatDate(event.data) }}</span>
      </div>

      <p v-if="event.descricao" class="text-body-2 mb-3">
        {{ event.descricao }}
      </p>
    </v-card-text>

    <v-card-actions>
      <v-btn
        variant="text"
        color="primary"
        size="small"
        @click="shareEvent"
      >
        <v-icon start size="16">
          mdi-share
        </v-icon>
        Compartilhar
      </v-btn>

      <v-spacer />

      <v-btn
        variant="text"
        color="primary"
        size="small"
        :to="`/eventos/${event.id}`"
      >
        Ver Detalhes
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
