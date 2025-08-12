import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
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

  runtimeConfig: {
    // Variáveis privadas (apenas no servidor)
    directusToken: '', // DIRECTUS_TOKEN

    // Variáveis públicas (expostas no cliente)
    public: {
      directusUrl: 'http://localhost:8055', // NUXT_PUBLIC_DIRECTUS_URL
      // Configurações de tema (podem ser sobrescritas por variáveis de ambiente)
      theme: {
        primary: '#1E3A8A', // Azul católico tradicional
        secondary: '#2563EB', // Azul Maria
        accent: '#FBBF24', // Dourado litúrgico
        background: '#FFFFFF',
        surface: '#FAFAFA',
        surfaceVariant: '#F5F5F5',
        outline: '#64748B',
        text: '#212121',
        muted: '#424242',
      },
    },
  },
})
