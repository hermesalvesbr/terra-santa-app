// server/api/directus.ts

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()

  // Retornar apenas as informações necessárias para o cliente
  return {
    url: config.public.directusUrl,
    token: config.directusToken,
  }
})
