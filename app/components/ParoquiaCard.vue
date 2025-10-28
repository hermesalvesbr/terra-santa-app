<script setup lang="ts">
interface Paroquia {
  id: number
  nome: string
  cidade: string
  fotoCapa?: string
  totalCapelas: number
}

defineProps<{
  paroquia: Paroquia
}>()
</script>

<template>
  <v-card elevation="2" hover class="h-100">
    <v-img
      :src="paroquia.fotoCapa || '/api/placeholder/300/200'"
      :alt="paroquia.nome"
      height="150"
      cover
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-icon icon="fluent-color:building-retail-24" size="48" color="grey-lighten-2" />
        </div>
      </template>
    </v-img>

    <v-card-title class="text-h6">
      {{ paroquia.nome }}
    </v-card-title>

    <v-card-subtitle>
      <v-icon icon="fluent-color:location-24" size="16" class="mr-1" />
      {{ paroquia.cidade }}
    </v-card-subtitle>

    <v-card-text>
      <div class="d-flex align-center">
        <v-icon icon="fluent-color:building-multiple-24" size="16" class="mr-2 text-medium-emphasis" />
        <span class="text-body-2 text-medium-emphasis">
          {{ paroquia.totalCapelas }} capela{{ paroquia.totalCapelas !== 1 ? 's' : '' }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :to="`/p/${paroquia.id}`"
      >
        Ver Detalhes
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
