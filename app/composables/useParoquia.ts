import type { Paroquia, ParoquiaHorario } from '~/types/schema'

/**
 * Composable para facilitar queries relacionadas a paróquias no Directus
 */
export function useParoquia() {
  /**
   * Busca uma paróquia por ID
   */
  async function getParoquiaById(id: string) {
    return await useFetch<Paroquia>(`/api/paroquia/${id}`)
  }

  /**
   * Busca todas as paróquias
   */
  async function getParoquias(options?: {
    limit?: number
    page?: number
    cidade?: string
    diocese?: string
    search?: string
  }) {
    const query: Record<string, any> = {
      limit: options?.limit || 50,
      sort: 'nome',
      fields: ['id', 'slug', 'nome', 'cidade', 'uf', 'capa.*', 'diocese.nome'].join(','),
    }

    const filter: Record<string, any> = {
      status: { _eq: 'published' },
    }

    if (options?.cidade) {
      filter.cidade = { _eq: options.cidade }
    }

    if (options?.diocese) {
      filter.diocese = { _eq: options.diocese }
    }

    if (options?.search) {
      query.search = options.search
    }

    if (options?.page) {
      query.page = options.page
    }

    query.filter = JSON.stringify(filter)

    return await useFetch<any[]>('/api/directus/paroquia', { query })
  }

  /**
   * Busca capelas de uma paróquia
   */
  async function getCapelas(paroquiaId: string, options?: {
    limit?: number
    published?: boolean
  }) {
    const filter: Record<string, any> = {
      paroquia: { _eq: paroquiaId },
    }

    if (options?.published !== false) {
      filter.status = { _eq: 'published' }
    }

    return await useFetch<any[]>('/api/directus/capela', {
      query: {
        filter: JSON.stringify(filter),
        limit: options?.limit || 50,
        sort: 'sort,-date_created',
        fields: ['id', 'nome', 'descricao', 'endereco', 'cidade', 'capa.*'].join(','),
      },
    })
  }

  /**
   * Busca horários de missa de uma paróquia
   */
  async function getHorarios(paroquiaId: string) {
    const query = {
      filter: JSON.stringify({
        paroquia: { _eq: paroquiaId },
        status: { _eq: 'published' },
      }),
      sort: JSON.stringify(['tipo_servico', 'hora_inicio']),
      fields: [
        'id',
        'tipo_servico',
        'dia_semana',
        'hora_inicio',
        'hora_fim',
        'observacoes',
        'recorrente',
        'tipo_recorrencia',
        'dia_do_mes',
        'periodo_data_inicio',
        'periodo_data_fim',
      ].join(','),
    }

    const response = await $fetch<ParoquiaHorario[] | { data?: ParoquiaHorario[] }>(
      '/api/directus/paroquia_horarios',
      {
        method: 'GET',
        query,
      },
    )

    const items = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data!
        : []

    return items
  }

  /**
   * Busca clero (padres) de uma paróquia
   */
  async function getClero(paroquiaId: string) {
    return await useFetch<any[]>('/api/directus/paroquia_clero', {
      query: {
        filter: JSON.stringify({
          paroquia: { _eq: paroquiaId },
          status: { _eq: 'published' },
        }),
        sort: 'sort',
        fields: [
          'id',
          'cargo',
          'data_inicio',
          'data_fim',
          'clero.id',
          'clero.nome',
          'clero.hierarquia',
          'clero.foto.*',
          'clero.email',
          'clero.telefone',
          'clero.whatsapp',
        ].join(','),
      },
    })
  }

  return {
    getParoquiaById,
    getParoquias,
    getCapelas,
    getHorarios,
    getClero,
  }
}
