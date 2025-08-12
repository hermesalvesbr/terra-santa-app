// server/api/directus/[collection].ts
import { readItems } from '@directus/sdk'
import { directus } from '../utils/directus'

/**
 * API Route para Directus SDK 20.0.0 - Suporte Completo a Parâmetros de Query
 *
 * PARÂMETROS SUPORTADOS:
 * =====================
 *
 * 🔍 FILTROS E BUSCA:
 * - filter: Filtros de dados usando operadores Directus (_eq, _in, _between, etc.)
 * - search: Busca full-text em campos textuais da collection
 *
 * 📊 PAGINAÇÃO:
 * - limit: Número máximo de itens retornados (padrão: 10, -1 para todos)
 * - offset: Número de itens para pular (para paginação manual)
 * - page: Página atual (alternativa ao offset, calculado automaticamente)
 *
 * 📋 SELEÇÃO DE DADOS:
 * - fields: Campos a serem retornados (string CSV ou array JSON)
 * - sort: Ordenação dos resultados (string ou array, use '-' para desc)
 *
 * 🔗 RELACIONAMENTOS:
 * - deep: Filtragem e limitação de dados relacionados aninhados
 * - alias: Renomeação de campos e múltiplas queries do mesmo relacionamento
 *
 * 📈 AGREGAÇÃO:
 * - aggregate: Funções de agregação (count, sum, avg, min, max)
 * - groupBy: Agrupamento para cálculos agregados
 *
 * 🔖 VERSIONAMENTO:
 * - version: Versão específica do conteúdo (draft, published, etc.)
 *
 * 🏛️ MUNICÍPIO:
 * - cidade: Filtro automático aplicado baseado em SOFTAGON_CIDADE_ID
 *
 * EXEMPLOS DE USO:
 * ===============
 *
 * Busca básica:
 * GET /api/directus/noticias?limit=5&sort=-date_created
 *
 * Filtros complexos:
 * GET /api/directus/noticias?filter={"status":{"_eq":"published"}}&search=prefeitura
 *
 * Campos específicos:
 * GET /api/directus/noticias?fields=["id","titulo","slug"]
 *
 * Paginação:
 * GET /api/directus/noticias?page=2&limit=10
 *
 * Relacionamentos profundos:
 * GET /api/directus/noticias?deep={"autor":{"_filter":{"ativo":{"_eq":true}}}}
 *
 * Agregação:
 * GET /api/directus/noticias?aggregate={"count":"*"}&groupBy=["secretaria"]
 *
 */

/**
 * Helper para processar parâmetros de query automaticamente do Directus SDK 20.0.0
 * Suporta todos os parâmetros globais: fields, filter, sort, limit, offset, page, search, deep, alias, aggregate, groupBy
 */
function processQueryParams(query: Record<string, any>, collection: string) {
  // Parâmetros numéricos
  const limit = query.limit ? Number(query.limit) : 10
  const offset = query.offset ? Number(query.offset) : undefined
  const page = query.page ? Number(query.page) : undefined

  // Padrão cidadeId do runtimeConfig
  const config = useRuntimeConfig()
  const cidadeId = config.public.cityId

  // Parâmetros especiais que devem ser extraídos separadamente
  const specialParams = ['limit', 'offset', 'page', 'sort', 'search', 'fields', 'deep', 'alias', 'aggregate', 'groupBy', 'version']
  const filters: Record<string, any> = {}

  let hasCidade = false

  for (const [key, value] of Object.entries(query)) {
    // Parâmetros especiais são processados separadamente
    if (specialParams.includes(key)) {
      if (key === 'cidade')
        hasCidade = true
      continue
    }

    // Detecta se é filtro de cidade
    if (key === 'cidade') {
      hasCidade = true
    }

    // Se é uma string, tenta fazer parse JSON
    if (typeof value === 'string') {
      try {
        filters[key] = JSON.parse(value)
      }
      catch {
        filters[key] = value
      }
    }
    else if (typeof value === 'object' && value !== null) {
      filters[key] = value
    }
    else {
      filters[key] = value
    }
  }

  // Se não veio cidade explicitamente E não é a collection cidade, aplica padrão
  if (!hasCidade && cidadeId && collection !== 'cidade') {
    filters.cidade = { _eq: cidadeId }
  }

  // Processar parâmetros especiais
  const result: Record<string, any> = {
    filters,
    limit,
  }

  // Offset e page (são mutuamente exclusivos)
  if (offset !== undefined) {
    result.offset = offset
  }
  else if (page !== undefined) {
    result.page = page
  }

  // Sort - pode ser string ou array
  if (query.sort) {
    if (typeof query.sort === 'string') {
      try {
        result.sort = JSON.parse(query.sort)
      }
      catch {
        result.sort = query.sort
      }
    }
    else {
      result.sort = query.sort
    }
  }

  // Search - busca full-text
  if (query.search) {
    result.search = String(query.search)
  }

  // Fields - seleção de campos
  if (query.fields) {
    if (typeof query.fields === 'string') {
      try {
        result.fields = JSON.parse(query.fields)
      }
      catch {
        result.fields = query.fields.split(',')
      }
    }
    else {
      result.fields = query.fields
    }
  }

  // Deep - filtragem aninhada
  if (query.deep) {
    if (typeof query.deep === 'string') {
      try {
        result.deep = JSON.parse(query.deep)
      }
      catch {
        result.deep = query.deep
      }
    }
    else {
      result.deep = query.deep
    }
  }

  // Alias - renomeação de campos
  if (query.alias) {
    if (typeof query.alias === 'string') {
      try {
        result.alias = JSON.parse(query.alias)
      }
      catch {
        result.alias = query.alias
      }
    }
    else {
      result.alias = query.alias
    }
  }

  // Aggregate - funções de agregação
  if (query.aggregate) {
    if (typeof query.aggregate === 'string') {
      try {
        result.aggregate = JSON.parse(query.aggregate)
      }
      catch {
        result.aggregate = query.aggregate
      }
    }
    else {
      result.aggregate = query.aggregate
    }
  }

  // GroupBy - agrupamento para agregação
  if (query.groupBy) {
    if (typeof query.groupBy === 'string') {
      try {
        result.groupBy = JSON.parse(query.groupBy)
      }
      catch {
        result.groupBy = query.groupBy.split(',')
      }
    }
    else {
      result.groupBy = query.groupBy
    }
  }

  // Version - versão de conteúdo
  if (query.version) {
    result.version = String(query.version)
  }

  return result
}

export default defineEventHandler(async (event) => {
  // Pegar o parâmetro de rota e método HTTP
  const collection = getRouterParam(event, 'collection')
  const method = getMethod(event)
  const query = getQuery(event)

  // Validação básica
  if (!collection || typeof collection !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parâmetro collection é obrigatório e deve ser uma string válida',
    })
  }

  // Método POST - Criar novo item
  if (method === 'POST') {
    try {
      const { createItem } = await import('@directus/sdk')

      // Pegar dados do body
      const body = await readBody(event)

      if (!body || typeof body !== 'object') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Body da requisição é obrigatório para operação POST',
        })
      }

      console.warn('=== DEBUG POST REQUEST ===')
      console.warn('Collection:', collection)
      console.warn('Body:', JSON.stringify(body, null, 2))

      // Criar item usando Directus SDK 20.0.0
      const newItem = await directus.request(
        createItem(collection, body),
      )

      console.warn('Created item:', newItem)

      return {
        data: newItem,
        success: true,
        collection,
        method: 'POST',
      }
    }
    catch (error) {
      console.error(`Erro ao criar item na collection '${collection}':`, error)

      // Erro de validação ou dados inválidos
      if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        throw createError({
          statusCode: 400,
          statusMessage: `Dados inválidos para criar item em '${collection}'`,
          data: { collection, error: error instanceof Error ? error.message : 'Erro de validação' },
        })
      }

      // Outros erros retornam 500
      throw createError({
        statusCode: 500,
        statusMessage: `Erro interno do servidor ao criar item em '${collection}'`,
        data: { collection, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      })
    }
  }

  // Método GET - Buscar itens (comportamento existente)
  if (method === 'GET') {
    // Processar parâmetros automaticamente com suporte completo ao SDK 20.0.0
    const processedParams = processQueryParams(query, collection)

    try {
    // Separar filtros dos parâmetros especiais
      const { filters, sort, search, fields, deep, alias, aggregate, groupBy, version, limit, offset, page } = processedParams

      // Se há aggregate ou groupBy, usa função de agregação
      if (aggregate || groupBy) {
        const { aggregate: aggregateFunc } = await import('@directus/sdk')

        const aggregateOptions: any = {}

        if (aggregate)
          aggregateOptions.aggregate = aggregate
        if (groupBy)
          aggregateOptions.groupBy = groupBy

        if (filters && Object.keys(filters).length > 0)
          aggregateOptions.filter = filters
        if (sort)
          aggregateOptions.sort = sort
        if (search)
          aggregateOptions.search = search
        if (limit)
          aggregateOptions.limit = limit
        if (offset !== undefined)
          aggregateOptions.offset = offset
        if (page !== undefined)
          aggregateOptions.page = page

        const result = await directus.request(
          aggregateFunc(collection, aggregateOptions),
        )

        return {
          data: result,
          success: true,
          collection,
          type: 'aggregate',
        }
      }

      // Configurar opções da query padrão
      const queryOptions: any = {
        limit,
      }

      // Adicionar filtros se existirem
      if (filters && Object.keys(filters).length > 0) {
        queryOptions.filter = filters
      }

      // Adicionar sort se existir
      if (sort) {
        queryOptions.sort = sort
      }

      // Adicionar search se existir
      if (search) {
        queryOptions.search = search
      }

      // Adicionar fields se existir
      if (fields) {
        queryOptions.fields = fields
      }

      // Adicionar deep filtering se existir
      if (deep) {
        queryOptions.deep = deep
      }

      // Adicionar alias se existir
      if (alias) {
        queryOptions.alias = alias
      }

      // Adicionar offset ou page (mutuamente exclusivos)
      if (offset !== undefined) {
        queryOptions.offset = offset
      }
      else if (page !== undefined) {
        queryOptions.page = page
      }

      // Adicionar version se existir
      if (version) {
        queryOptions.version = version
      }

      // Query usando Directus SDK 20.0.0
      const items = await directus.request(
        readItems(collection, queryOptions),
      )

      return {
        data: items,
        success: true,
        collection,
        count: items?.length || 0,
      }
    }
    catch (error) {
      console.error(`Erro ao buscar dados da collection '${collection}':`, error)

      throw createError({
        statusCode: 500,
        statusMessage: `Erro interno do servidor ao buscar dados de '${collection}'`,
        data: { collection, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      })
    }
  }

  // Método não suportado
  throw createError({
    statusCode: 405,
    statusMessage: `Método '${method}' não suportado. Use GET para buscar ou POST para criar.`,
    data: { allowedMethods: ['GET', 'POST'] },
  })
})
