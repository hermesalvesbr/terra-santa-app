<script setup lang="ts">
// Define event type for local events (extending/adapting from Agenda)
interface LocalEvent {
  id: number
  titulo: string
  data: Date
  hora: string
  local: string
  tipo: string
  descricao: string
}

// Event type for calendar click events
interface CalendarEventClick {
  event: LocalEvent
}

// SEO
useHead({
  title: 'Agenda',
  meta: [
    { name: 'description', content: 'Confira a agenda completa de eventos, missas e atividades da diocese. Horários sempre atualizados.' },
  ],
})

// Reactive data
const selectedDate = ref('proximos-7-dias')
const selectedType = ref('')
const selectedLocation = ref('')
const selectedTime = ref('')
const viewMode = ref<'list' | 'calendar'>('list')
const calendarDate = ref([new Date()])
const eventDialog = ref(false)
const selectedEvent = ref<LocalEvent | null>(null)

// Options
const dateOptions = [
  { title: 'Hoje', value: 'hoje' },
  { title: 'Amanhã', value: 'amanha' },
  { title: 'Próximos 7 dias', value: 'proximos-7-dias' },
  { title: 'Próximos 30 dias', value: 'proximos-30-dias' },
  { title: 'Esta semana', value: 'esta-semana' },
  { title: 'Próxima semana', value: 'proxima-semana' },
  { title: 'Este mês', value: 'este-mes' },
]

const eventTypes = [
  { title: 'Missa', value: 'missa' },
  { title: 'Oração', value: 'oracao' },
  { title: 'Catequese', value: 'catequese' },
  { title: 'Confissão', value: 'confissao' },
  { title: 'Adoração', value: 'adoracao' },
  { title: 'Festa', value: 'festa' },
  { title: 'Reunião', value: 'reuniao' },
]

const timeOptions = [
  { title: 'Manhã (06:00 - 12:00)', value: 'manha' },
  { title: 'Tarde (12:00 - 18:00)', value: 'tarde' },
  { title: 'Noite (18:00 - 22:00)', value: 'noite' },
]

// Mock data
const events = ref([
  {
    id: 1,
    titulo: 'Missa Dominical',
    data: new Date(),
    hora: '07:00',
    local: 'Paróquia São José',
    tipo: 'missa',
    descricao: 'Missa dominical com música litúrgica',
  },
  {
    id: 2,
    titulo: 'Terço dos Homens',
    data: new Date(Date.now() + 86400000), // Tomorrow
    hora: '19:30',
    local: 'Capela Nossa Senhora',
    tipo: 'oracao',
    descricao: 'Terço rezado pelos homens da comunidade',
  },
  {
    id: 3,
    titulo: 'Catequese Infantil',
    data: new Date(Date.now() + 86400000),
    hora: '14:00',
    local: 'Paróquia Santa Maria',
    tipo: 'catequese',
    descricao: 'Catequese para crianças de 7 a 10 anos',
  },
  {
    id: 4,
    titulo: 'Missa Vespertina',
    data: new Date(),
    hora: '18:00',
    local: 'Catedral Metropolitana',
    tipo: 'missa',
    descricao: 'Missa vespertina de sábado',
  },
])

const filteredEvents = ref([...events.value])

// Computed
const locations = computed(() => {
  const uniqueLocations = [...new Set(events.value.map(e => e.local))]
  return uniqueLocations.sort()
})

const groupedEvents = computed(() => {
  const grouped: Record<string, LocalEvent[]> = {}
  filteredEvents.value.forEach((event) => {
    const isoString = event.data.toISOString()
    const dateKey = isoString.split('T')[0]
    if (dateKey) {
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    }
  })

  // Sort events within each day by time
  Object.keys(grouped).forEach((date) => {
    grouped[date]?.sort((a: LocalEvent, b: LocalEvent) => a.hora.localeCompare(b.hora))
  })

  return grouped
})

const calendarEvents = computed(() => {
  return filteredEvents.value.map(event => ({
    name: event.titulo,
    start: event.data,
    color: getEventTypeColor(event.tipo),
    event,
  }))
})

// Functions
function filterEvents() {
  // Implementation for filtering events based on selected criteria
  // This would be replaced with actual filtering logic
  filteredEvents.value = events.value
}

function setQuickFilter(type: string) {
  switch (type) {
    case 'hoje':
      selectedDate.value = 'hoje'
      break
    case 'amanha':
      selectedDate.value = 'amanha'
      break
    case 'fim-semana':
      selectedDate.value = 'esta-semana'
      break
    case 'missas':
      selectedType.value = 'missa'
      break
  }
  filterEvents()
}

function clearFilters() {
  selectedDate.value = 'proximos-7-dias'
  selectedType.value = ''
  selectedLocation.value = ''
  selectedTime.value = ''
  filterEvents()
}

function formatDateHeader(dateString: string) {
  const date = new Date(dateString)
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getEventTypeIcon(type: string) {
  const icons: Record<string, string> = {
    missa: 'mdi-church',
    oracao: 'mdi-hands-pray',
    catequese: 'mdi-school',
    confissao: 'mdi-cross',
    adoracao: 'mdi-candle',
    festa: 'mdi-party-popper',
    reuniao: 'mdi-account-group',
  }
  return icons[type] || 'mdi-calendar'
}

function getEventTypeName(type: string) {
  const names: Record<string, string> = {
    missa: 'Missa',
    oracao: 'Oração',
    catequese: 'Catequese',
    confissao: 'Confissão',
    adoracao: 'Adoração',
    festa: 'Festa',
    reuniao: 'Reunião',
  }
  return names[type] || 'Evento'
}

function getEventTypeColor(type: string) {
  const colors: Record<string, string> = {
    missa: 'primary',
    oracao: 'secondary',
    catequese: 'accent',
    confissao: 'info',
    adoracao: 'warning',
    festa: 'success',
    reuniao: 'grey',
  }
  return colors[type] || 'grey'
}

function showEventDetails(event: CalendarEventClick) {
  selectedEvent.value = event.event
  eventDialog.value = true
}

function selectDate(_date: Date) {
  // Handle date selection in calendar view
  // Implementation would filter events for this date
}

function shareEvent() {
  if (selectedEvent.value && navigator.share) {
    navigator.share({
      title: selectedEvent.value.titulo,
      text: `${selectedEvent.value.titulo} - ${selectedEvent.value.local}`,
      url: window.location.href,
    })
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <v-container fluid class="pa-0">
      <v-sheet
        :height="200"
        color="primary"
        class="d-flex align-center"
      >
        <v-container>
          <h1 class="text-h3 text-white font-weight-bold mb-2">
            Agenda de Eventos
          </h1>
          <p class="text-h6 text-white mb-0">
            Horários de missas, eventos e atividades da diocese
          </p>
        </v-container>
      </v-sheet>
    </v-container>

    <!-- Filters -->
    <v-container class="py-6">
      <v-card elevation="2" class="mb-6">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedDate"
                :items="dateOptions"
                label="Período"
                variant="outlined"
                @update:model-value="filterEvents"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedType"
                :items="eventTypes"
                label="Tipo de Evento"
                variant="outlined"
                clearable
                @update:model-value="filterEvents"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedLocation"
                :items="locations"
                label="Local"
                variant="outlined"
                clearable
                @update:model-value="filterEvents"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedTime"
                :items="timeOptions"
                label="Horário"
                variant="outlined"
                clearable
                @update:model-value="filterEvents"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Quick Access Buttons -->
      <div class="d-flex flex-wrap gap-2 mb-6">
        <v-btn
          variant="elevated"
          color="accent"
          @click="setQuickFilter('hoje')"
        >
          <v-icon start>
            mdi-calendar-today
          </v-icon>
          Hoje
        </v-btn>
        <v-btn
          variant="elevated"
          color="secondary"
          @click="setQuickFilter('amanha')"
        >
          <v-icon start>
            mdi-calendar-plus
          </v-icon>
          Amanhã
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          @click="setQuickFilter('fim-semana')"
        >
          <v-icon start>
            mdi-calendar-weekend
          </v-icon>
          Fim de Semana
        </v-btn>
        <v-btn
          variant="elevated"
          color="success"
          @click="setQuickFilter('missas')"
        >
          <v-icon start>
            mdi-church
          </v-icon>
          Só Missas
        </v-btn>
      </div>

      <!-- Calendar View Toggle -->
      <div class="d-flex justify-space-between align-center mb-4">
        <p class="text-body-1 text-medium-emphasis">
          {{ filteredEvents.length }} evento{{ filteredEvents.length !== 1 ? 's' : '' }} encontrado{{ filteredEvents.length !== 1 ? 's' : '' }}
        </p>

        <v-btn-toggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          divided
        >
          <v-btn value="list" size="small">
            <v-icon>mdi-view-list</v-icon>
          </v-btn>
          <v-btn value="calendar" size="small">
            <v-icon>mdi-calendar</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <!-- Group by date -->
        <div
          v-for="(dayEvents, date) in groupedEvents"
          :key="date"
          class="mb-6"
        >
          <h3 class="text-h5 text-primary mb-4">
            {{ formatDateHeader(date) }}
          </h3>

          <v-row>
            <v-col
              v-for="event in dayEvents"
              :key="event.id"
              cols="12"
              md="6"
              lg="4"
            >
              <EventDetailCard :event="event" />
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else>
        <v-card elevation="2">
          <v-calendar
            v-model="calendarDate"
            :events="calendarEvents"
            color="primary"
            type="month"
            @click:event="showEventDetails"
            @click:date="selectDate"
          />
        </v-card>
      </div>

      <!-- No Results -->
      <v-row v-if="filteredEvents.length === 0">
        <v-col cols="12" class="text-center py-12">
          <v-icon icon="mdi-calendar-blank" size="64" class="text-disabled mb-4" />
          <h3 class="text-h5 mb-2 text-disabled">
            Nenhum evento encontrado
          </h3>
          <p class="text-body-1 text-disabled mb-4">
            Tente ajustar os filtros ou selecionar outro período
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            @click="clearFilters"
          >
            Limpar Filtros
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Event Details Dialog -->
    <v-dialog
      v-model="eventDialog"
      max-width="600"
    >
      <v-card v-if="selectedEvent">
        <v-card-title class="text-h5 text-primary">
          {{ selectedEvent.titulo }}
        </v-card-title>

        <v-card-text>
          <div class="mb-4">
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-calendar" class="mr-3" />
              <span>{{ formatEventDate(selectedEvent.data) }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-clock" class="mr-3" />
              <span>{{ selectedEvent.hora }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-map-marker" class="mr-3" />
              <span>{{ selectedEvent.local }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon :icon="getEventTypeIcon(selectedEvent.tipo)" class="mr-3" />
              <span>{{ getEventTypeName(selectedEvent.tipo) }}</span>
            </div>
          </div>

          <p v-if="selectedEvent.descricao" class="text-body-1">
            {{ selectedEvent.descricao }}
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="eventDialog = false"
          >
            Fechar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="shareEvent"
          >
            <v-icon start>
              mdi-share
            </v-icon>
            Compartilhar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
