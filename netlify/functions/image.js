import { getStore } from '@netlify/blobs'

export default async (req) => {
  const url = new URL(req.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return new Response('Missing key parameter', { status: 400 })
  }

  const store = getStore('astrophotos')
  const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })

  if (!result || result.data === null) {
    return new Response('Image not found', { status: 404 })
  }

  const contentType = result.metadata?.contentType || 'image/jpeg'

  return new Response(result.data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}

export const config = {
  path: '/api/image'
}
