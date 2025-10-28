import type { DirectusFile } from '~/types/schema'

/**
 * Composable para trabalhar com assets do Directus
 */
export function useDirectusAsset() {
  const config = useRuntimeConfig()
  const directusUrl = config.public.directusUrl

  /**
   * Gera URL otimizada para imagem do Directus
   * @param file - Objeto DirectusFile ou ID do arquivo
   * @param options - Opções de transformação da imagem
   * @param options.width - Largura da imagem
   * @param options.height - Altura da imagem
   * @param options.quality - Qualidade da imagem (0-100)
   * @param options.fit - Modo de ajuste da imagem
   * @param options.format - Formato de saída da imagem
   */
  function getImageUrl(
    file: string | DirectusFile | null | undefined,
    options: {
      width?: number
      height?: number
      quality?: number
      fit?: 'cover' | 'contain' | 'inside' | 'outside'
      format?: 'jpg' | 'png' | 'webp' | 'avif' | 'tiff'
    } = {},
  ) {
    // Se for nulo ou undefined, retorna placeholder
    if (!file) {
      const width = options.width || 800
      const height = options.height || 600
      return `https://placehold.co/${width}x${height}?text=Sem+Imagem`
    }

    // Se for string, assume que é o ID
    const fileId = typeof file === 'string' ? file : file.id

    if (!fileId) {
      const width = options.width || 800
      const height = options.height || 600
      return `https://placehold.co/${width}x${height}?text=Sem+Imagem`
    }

    // Configurações padrão
    const {
      width = 800,
      height,
      quality = 80,
      fit = 'cover',
      format,
    } = options

    // Montar query string com parâmetros de transformação
    const params = new URLSearchParams()
    if (width)
      params.append('width', width.toString())
    if (height)
      params.append('height', height.toString())
    params.append('quality', quality.toString())
    params.append('fit', fit)
    if (format)
      params.append('format', format)

    // Retornar URL direta do Directus no formato /assets/<id>
    return `${directusUrl}/assets/${fileId}?${params.toString()}`
  }

  /**
   * Obtém URL de download do arquivo
   */
  function getDownloadUrl(file: string | DirectusFile | null | undefined) {
    if (!file)
      return null

    const fileId = typeof file === 'string' ? file : file.id
    if (!fileId)
      return null

    // URL de download no formato Directus
    return `${directusUrl}/assets/${fileId}?download`
  }

  /**
   * Gera srcset para imagens responsivas
   */
  function getImageSrcSet(
    file: string | DirectusFile | null | undefined,
    widths: number[] = [320, 640, 768, 1024, 1280, 1920],
    options: {
      quality?: number
      fit?: 'cover' | 'contain' | 'inside' | 'outside'
      format?: 'jpg' | 'png' | 'webp' | 'avif'
    } = {},
  ) {
    if (!file)
      return ''

    return widths
      .map((width) => {
        const url = getImageUrl(file, { ...options, width })
        return `${url} ${width}w`
      })
      .join(', ')
  }

  return {
    getImageUrl,
    getDownloadUrl,
    getImageSrcSet,
  }
}
