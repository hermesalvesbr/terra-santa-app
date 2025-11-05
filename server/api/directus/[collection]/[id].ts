import { readItem, readItems } from '@directus/sdk'
import { directus } from '../../utils/directus'

/**
 * Helper to normalize the Directus SDK response shape (array vs. { data }).
 */
function unwrapItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload))
    return payload
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: unknown }).data
    return Array.isArray(data) ? data : data !== undefined ? [data as T] : []
  }
  return []
}

function unwrapItem<T>(payload: unknown): T | null {
  if (!payload)
    return null
  if (Array.isArray(payload))
    return (payload[0] ?? null) as T | null
  if (typeof payload === 'object' && 'data' in payload)
    return ((payload as { data?: unknown }).data ?? null) as T | null
  return payload as T
}

type Primitive = string | number | boolean
type Complex = Record<string, unknown>
type QueryValue = Primitive | Complex | null | undefined
type QueryParam = QueryValue | QueryValue[]

function first(value: QueryParam): string | undefined {
  if (Array.isArray(value))
    return first(value[0] as QueryParam)
  if (value === null || value === undefined)
    return undefined
  if (typeof value === 'object')
    return JSON.stringify(value)
  return String(value)
}

function parseNumeric(value: QueryParam) {
  const raw = first(value)
  if (raw === undefined)
    return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseJSON<T = unknown>(value: QueryParam): T | undefined {
  const raw = first(value)
  if (raw === undefined)
    return undefined
  try {
    return JSON.parse(raw) as T
  }
  catch {
    return undefined
  }
}

function parseArray(value: QueryParam): string[] | undefined {
  if (Array.isArray(value)) {
    const list = value
      .map(entry => first(entry as QueryParam))
      .filter((entry): entry is string => typeof entry === 'string' && Boolean(entry?.length))
    return list.length ? list : undefined
  }

  const raw = first(value)
  if (raw === undefined)
    return undefined
  const json = parseJSON<string[] | string>(raw)
  if (Array.isArray(json))
    return json
  if (typeof json === 'string')
    return json.split(',').map(entry => entry.trim()).filter(Boolean)
  return raw.split(',').map(entry => entry.trim()).filter(Boolean)
}

function mergeFilters(base: Record<string, unknown> | undefined, extra: Record<string, unknown>) {
  if (!base)
    return extra
  return { ...base, ...extra }
}

export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'id')
  const collection = getRouterParam(event, 'collection')
  const method = getMethod(event)
  const query = getQuery(event) as Record<string, QueryParam>

  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parâmetro id é obrigatório',
    })
  }

  if (!collection) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parâmetro collection é obrigatório',
    })
  }

  if (method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: `Método '${method}' não suportado. Utilize GET para buscar item único.`,
      data: { allowedMethods: ['GET'] },
    })
  }

  const fields = parseArray(query.fields)
  const deep = parseJSON<Record<string, unknown>>(query.deep)
  const alias = parseJSON<Record<string, unknown>>(query.alias)
  const meta = parseArray(query.meta)
  const version = typeof query.version === 'string' ? query.version : undefined
  const aggregate = parseJSON<Record<string, unknown>>(query.aggregate)
  const groupBy = parseArray(query.groupBy)
  const sort = parseArray(query.sort)
  const limit = parseNumeric(query.limit)
  const offset = parseNumeric(query.offset)
  const page = parseNumeric(query.page)
  const search = typeof query.search === 'string' ? query.search : undefined
  const providedFilter = parseJSON<Record<string, unknown>>(query.filter)

  const by = typeof query.by === 'string' && query.by.trim() ? query.by.trim() : 'id'

  const baseOptions: Record<string, unknown> = {}

  if (fields)
    baseOptions.fields = fields
  if (deep)
    baseOptions.deep = deep
  if (alias)
    baseOptions.alias = alias
  if (meta)
    baseOptions.meta = meta
  if (version)
    baseOptions.version = version

  try {
    if (by === 'id' || by === 'primary') {
      const item = await directus.request(
        readItem(collection, identifier, baseOptions),
      )

      const normalized = unwrapItem(item)

      if (!normalized) {
        throw createError({
          statusCode: 404,
          statusMessage: `Item '${identifier}' não encontrado em '${collection}'`,
          data: { collection, identifier, by },
        })
      }

      return {
        data: normalized,
        success: true,
        collection,
        by,
      }
    }

    const filters = mergeFilters(providedFilter, {
      [by]: { _eq: identifier },
    })

    const listOptions: Record<string, unknown> = {
      ...baseOptions,
      filter: filters,
      limit: limit ?? 1,
    }

    if (sort && sort.length)
      listOptions.sort = sort
    if (offset !== undefined)
      listOptions.offset = offset
    if (page !== undefined)
      listOptions.page = page
    if (search)
      listOptions.search = search
    if (aggregate)
      listOptions.aggregate = aggregate
    if (groupBy)
      listOptions.groupBy = groupBy

    const itemsResponse = await directus.request(
      readItems(collection, listOptions),
    )

    const items = unwrapItems(itemsResponse)

    if (items.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Item não encontrado em '${collection}' utilizando campo '${by}'`,
        data: { collection, by, identifier },
      })
    }

    return {
      data: items[0],
      success: true,
      collection,
      by,
    }
  }
  catch (error: any) {
    if (error?.statusCode)
      throw error

    console.error(`Erro ao buscar item '${identifier}' da coleção '${collection}':`, error)

    const statusCode = error?.response?.status || error?.status || 500
    const statusMessage = error?.message || `Erro interno ao buscar item em '${collection}'`

    throw createError({
      statusCode,
      statusMessage,
      data: {
        collection,
        identifier,
        by,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    })
  }
})
