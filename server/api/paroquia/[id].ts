import type { Paroquia } from '~/types/schema'
import { readItem, readItems } from '@directus/sdk'
import { directus } from '../utils/directus'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID ou slug da paróquia é obrigatório',
    })
  }

  try {
    // Verificar se é UUID ou slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let paroquia: Paroquia

    if (isUUID) {
      // Buscar por ID
      paroquia = await directus.request<Paroquia>(
        readItem('paroquia', id, {
          fields: [
            '*',
            { diocese: ['id', 'nome', 'slug'] },
            { capa: ['id', 'title', 'filename_disk', 'width', 'height'] },
          ],
        }),
      )
    }
    else {
      // Buscar por slug
      const result = await directus.request<Paroquia[]>(
        readItems('paroquia', {
          filter: {
            slug: { _eq: id },
            status: { _eq: 'published' },
          },
          limit: 1,
          fields: [
            '*',
            { diocese: ['id', 'nome', 'slug'] },
            { capa: ['id', 'title', 'filename_disk', 'width', 'height'] },
          ],
        }),
      )

      if (!result || result.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Paróquia não encontrada',
        })
      }

      paroquia = result[0]
    }

    return paroquia
  }
  catch (error: any) {
    if (error.statusCode === 404) {
      throw error
    }

    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Erro ao buscar paróquia',
    })
  }
})
