import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,

  // CSS
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
  ],

  // Build configuration
  build: {
    transpile: ['vuetify'],
  },

  // Vite configuration
  vite: {
    plugins: [
      vuetify({ autoImport: true }),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  // Server configuration
  devServer: {
    port: 3003,
  },
  runtimeConfig: {
    // Variáveis privadas (apenas no servidor)
    // Automaticamente lê de DIRECTUS_TOKEN do .env
    directusToken: '',

    // Variáveis públicas (expostas no cliente)
    public: {
      // Automaticamente lê de NUXT_PUBLIC_DIRECTUS_URL do .env
      directusUrl: 'http://localhost:8055',

    },
  },
})
