<script setup lang="ts">
import type { Paroquia } from '~/types/schema'

const props = withDefaults(defineProps<{
  paroquia: Paroquia
  variant?: 'grid' | 'list'
  dioceseSlug?: string
}>(), {
  variant: 'grid',
  dioceseSlug: undefined,
})

const { getImageUrl } = useDirectusAsset()

const isListVariant = computed(() => props.variant === 'list')

const imageOptions = computed(() => {
  return isListVariant.value
    ? { width: 480, height: 240 }
    : { width: 540, height: 320 }
})

const imageHeight = computed(() => (isListVariant.value ? 180 : 160))

const imageSrc = computed(() => {
  const image = props.paroquia.capa || props.paroquia.logo
  return getImageUrl(image, imageOptions.value)
})

const cityLabel = computed(() => {
  return [props.paroquia.cidade, props.paroquia.uf].filter(Boolean).join(', ')
})

const dioceseLabel = computed(() => {
  const diocese = props.paroquia.diocese
  if (diocese && typeof diocese === 'object')
    return diocese.nome
  return ''
})

const extractedDioceseSlug = computed(() => {
  const diocese = props.paroquia.diocese
  if (diocese && typeof diocese === 'object' && 'slug' in diocese)
    return diocese.slug as string
  return ''
})

const descriptionExcerpt = computed(() => {
  if (!props.paroquia.descricao)
    return 'Conheça mais detalhes desta paróquia em nossa diocese.'

  const clean = props.paroquia.descricao.replace(/<[^>]*>/g, '')
  const limit = isListVariant.value ? 180 : 120
  return clean.length > limit ? `${clean.slice(0, limit - 3)}...` : clean
})

const detailRoute = computed(() => {
  const dioceseSlug = props.dioceseSlug || extractedDioceseSlug.value
  if (!dioceseSlug) {
    // Fallback se não tiver slug da diocese
    return `/p/${props.paroquia.slug}`
  }
  return `/d/${dioceseSlug}/p/${props.paroquia.slug}`
})

const goToDetail = () => navigateTo(detailRoute.value)
</script>

<template>
  <v-card
    elevation="2"
    :hover="!isListVariant || undefined"
    class="d-flex flex-column h-100"
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
            :alt="paroquia.nome"
            :height="imageHeight"
            cover
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon icon="fluent-color:building-retail-24" size="32" color="grey-lighten-2" />
              </div>
            </template>
            <template #error>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon size="32" color="grey-lighten-2">
                  fluent-color:building-retail-24
                </v-icon>
              </div>
            </template>
          </v-img>
        </v-col>
        <v-col cols="12" md="8">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap mb-3">
              <h3 class="text-h6 font-weight-bold mb-0">
                {{ paroquia.nome }}
              </h3>
              <v-chip
                v-if="dioceseLabel"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ dioceseLabel }}
              </v-chip>
            </div>
            <div class="d-flex align-center mb-3 text-medium-emphasis">
              <v-icon icon="fluent-color:location-24" size="18" class="mr-2" />
              <span>{{ cityLabel || 'Cidade não informada' }}</span>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ descriptionExcerpt }}
            </p>
            <div class="d-flex flex-wrap align-center" style="gap: 8px;">
              <v-chip v-if="paroquia.whatsapp" size="small" color="success" variant="flat">
                <v-icon start size="16">
                  mdi-whatsapp
                </v-icon>
                WhatsApp
              </v-chip>
              <v-chip v-if="paroquia.instagram" size="small" color="pink" variant="tonal">
                <v-icon start size="16">
                  mdi-instagram
                </v-icon>
                Instagram
              </v-chip>
              <v-chip v-if="paroquia.site" size="small" color="indigo" variant="tonal">
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
              variant="outlined"
              @click.stop="goToDetail"
            >
              Ver detalhes
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-img
        :src="imageSrc"
        :alt="paroquia.nome"
        :height="imageHeight"
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

      <v-card-subtitle class="d-flex align-center flex-wrap">
        <v-icon icon="fluent-color:location-24" size="16" class="mr-1" />
        <span class="text-body-2 text-medium-emphasis">
          {{ cityLabel || 'Cidade não informada' }}
        </span>
      </v-card-subtitle>

      <v-card-text class="pt-2 pb-0 text-body-2 text-medium-emphasis">
        <div v-if="dioceseLabel" class="d-flex align-center mb-2">
          <v-icon icon="fluent-color:library-24" size="16" class="mr-2 text-medium-emphasis" />
          {{ dioceseLabel }}
        </div>
        <div>
          {{ descriptionExcerpt }}
        </div>
      </v-card-text>

      <v-card-actions class="mt-auto">
        <v-btn
          variant="text"
          color="primary"
          @click.stop="goToDetail"
        >
          Ver Detalhes
        </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>
