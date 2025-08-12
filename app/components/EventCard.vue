<script setup lang="ts">
interface Event {
  id: number
  title: string
  time: string
  location: string
  type: string
}

const props = defineProps<{
  event: Event
}>()

// Event type styling
const eventTypeConfig = {
  missa: {
    icon: 'mdi-church',
    color: 'primary',
  },
  oração: {
    icon: 'mdi-hands-pray',
    color: 'secondary',
  },
  catequese: {
    icon: 'mdi-school',
    color: 'accent',
  },
  confissão: {
    icon: 'mdi-cross',
    color: 'info',
  },
  adoração: {
    icon: 'mdi-candle',
    color: 'warning',
  },
  festa: {
    icon: 'mdi-party-popper',
    color: 'success',
  },
  default: {
    icon: 'mdi-calendar',
    color: 'grey',
  },
}

const eventTypeIcon = computed(() => {
  return eventTypeConfig[props.event.type as keyof typeof eventTypeConfig]?.icon || eventTypeConfig.default.icon
})

const eventTypeColor = computed(() => {
  return eventTypeConfig[props.event.type as keyof typeof eventTypeConfig]?.color || eventTypeConfig.default.color
})
</script>

<template>
  <v-card elevation="2" class="h-100">
    <v-card-text class="pa-4">
      <div class="d-flex align-center mb-3">
        <v-icon
          :icon="eventTypeIcon"
          :color="eventTypeColor"
          size="24"
          class="mr-3"
        />
        <div>
          <div class="text-h6 font-weight-medium">
            {{ event.title }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ event.location }}
          </div>
        </div>
      </div>

      <div class="d-flex align-center">
        <v-icon icon="mdi-clock" size="16" class="mr-2 text-medium-emphasis" />
        <span class="text-body-2 text-medium-emphasis">{{ event.time }}</span>
      </div>
    </v-card-text>

    <v-card-actions>
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
