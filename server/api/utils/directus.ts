// server/utils/directus.ts
import process from 'node:process'
import { createDirectus, rest, staticToken } from '@directus/sdk'

// Leitura das variáveis de ambiente
const url = process.env.NUXT_PUBLIC_DIRECTUS_URL || ''
const token = process.env.DIRECTUS_TOKEN || ''

if (!token) {
  console.error('ERRO: Token do Directus não configurado. Verifique a variável DIRECTUS_TOKEN')
}

/**
 * Cliente singleton do Directus SDK 20.0.0
 * Configuração atualizada para a nova API do SDK
 */
export const directus = createDirectus(url)
  .with(rest())
  .with(staticToken(token))
