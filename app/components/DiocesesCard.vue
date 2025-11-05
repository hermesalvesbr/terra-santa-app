<script setup lang="ts">
import type { Diocese } from '~/types/schema'

const props = withDefaults(defineProps<{
  diocese: Diocese
  variant?: 'grid' | 'list'
}>(), {
  variant: 'grid',
})

const { getImageUrl } = useDirectusAsset()

const isListVariant = computed(() => props.variant === 'list')

const imageOptions = computed(() => {
  return isListVariant.value
    ? { width: 480, height: 240, fit: 'cover' as const, quality: 80 }
    : { width: 800, height: 400, fit: 'cover' as const, quality: 80 }
})

const imageHeight = computed(() => (isListVariant.value ? 160 : 180))

const imageSrc = computed(() => {
  const image = props.diocese.foto_capa || props.diocese.logo
  return getImageUrl(image, imageOptions.value)
})

const descriptionExcerpt = computed(() => {
  if (!props.diocese.descricao)
    return 'Explore as paróquias e comunidades desta diocese.'

  const clean = props.diocese.descricao.replace(/<[^>]*>/g, '').trim()
  if (!clean)
    return 'Explore as paróquias e comunidades desta diocese.'

  const limit = isListVariant.value ? 180 : 100
  return clean.length > limit ? `${clean.slice(0, limit - 3)}...` : clean
})

const descriptionHtml = computed(() => {
  if (!props.diocese.descricao)
    return '<p>Explore as paróquias e comunidades desta diocese.</p>'

  const limit = isListVariant.value ? 250 : 150
  const text = props.diocese.descricao.trim()

  if (text.length > limit) {
    // Truncar mantendo tags HTML válidas
    const truncated = text.slice(0, limit)
    const lastTag = truncated.lastIndexOf('<')
    const lastClose = truncated.lastIndexOf('>')

    if (lastTag > lastClose) {
      return `${truncated.slice(0, lastTag)}...`
    }
    return `${truncated}...`
  }

  return text
})

const detailRoute = computed(() => {
  return `/d/${props.diocese.slug}`
})

const goToDetail = () => navigateTo(detailRoute.value)
</script>

<template>
  <v-card
    elevation="3"
    rounded="xl"
    :hover="!isListVariant || undefined"
    class="diocese-card d-flex flex-column h-100"
    tabindex="0"
    role="button"
    @click="goToDetail"
    @keyup.enter="goToDetail"
    @keyup.space.prevent="goToDetail"
  >
    <template v-if="isListVariant">
      <v-row no-gutters>
        <v-col cols="12" md="4">
          <v-img
            :src="imageSrc"
            :alt="diocese.nome"
            :height="imageHeight"
            cover
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon icon="mdi-church" size="48" color="grey-lighten-2" />
              </div>
            </template>
            <template #error>
              <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                <v-icon icon="mdi-church" size="48" color="grey-lighten-1" />
              </div>
            </template>
          </v-img>
        </v-col>
        <v-col cols="12" md="8">
          <v-card-text class="pa-6">
            <h3 class="text-h5 font-weight-bold text-primary mb-3">
              {{ diocese.nome }}
            </h3>
            <div
              class="text-body-2 text-medium-emphasis mb-4 "
              v-html="descriptionHtml"
            />
            <div class="d-flex flex-wrap align-center" style="gap: 8px;">
              <v-chip v-if="diocese.whatsapp" size="small" color="success" variant="flat">
                <v-icon start size="16">
                  mdi-whatsapp
                </v-icon>
                WhatsApp
              </v-chip>
              <v-chip v-if="diocese.instagram" size="small" color="pink" variant="tonal">
                <v-icon start size="16">
                  mdi-instagram
                </v-icon>
                Instagram
              </v-chip>
              <v-chip v-if="diocese.youtube" size="small" color="red" variant="tonal">
                <v-icon start size="16">
                  mdi-youtube
                </v-icon>
                YouTube
              </v-chip>
              <v-chip v-if="diocese.site" size="small" color="indigo" variant="tonal">
                <v-icon start size="16">
                  mdi-web
                </v-icon>
                Site oficial
              </v-chip>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="justify-end pa-4">
            <v-btn
              color="primary"
              variant="tonal"
              size="large"
              append-icon="mdi-chevron-right"
              @click.stop="goToDetail"
            >
              Ver Paróquias
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <!-- Card Image -->
      <v-img
        :src="imageSrc"
        :alt="diocese.nome"
        :height="imageHeight"
        cover
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-icon icon="mdi-church" size="64" color="grey-lighten-2" />
          </div>
        </template>
        <template #error>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
            <v-icon icon="mdi-church" size="64" color="grey-lighten-1" />
          </div>
        </template>
        <div class="d-flex flex-column justify-end fill-height pa-4">
          <h2 class="text-h5 font-weight-bold text-white text-shadow">
            {{ diocese.nome }}
          </h2>
        </div>
      </v-img>

      <!-- Card Content -->
      <v-card-text class="pa-4 flex-grow-1">
        <div
          class="text-body-2 text-medium-emphasis diocese-description"
          v-html="descriptionExcerpt"
        />
      </v-card-text>

      <!-- Card Actions -->
      <v-card-actions class="px-4 pb-4 mt-auto">
        <v-btn
          color="primary"
          variant="tonal"
          block
          size="large"
          append-icon="mdi-chevron-right"
          @click.stop="goToDetail"
        >
          Ver Paróquias
        </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>

<style scoped>
.diocese-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.diocese-card:active {
  transform: scale(0.98);
}

.text-shadow {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.diocese-description :deep(p) {
  margin-bottom: 0.5em;
}

.diocese-description :deep(p:last-child) {
  margin-bottom: 0;
}

.diocese-description :deep(strong) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.diocese-description :deep(em) {
  font-style: italic;
}

.diocese-description :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}
</style>
