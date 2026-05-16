import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const contentType = req.headers.get('content-type') || 'application/octet-stream'
  const filename = req.headers.get('x-filename') || `image-${Date.now()}`
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${Date.now()}-${safeFilename}`

  const imageData = await req.arrayBuffer()

  if (imageData.byteLength === 0) {
    return Response.json({ error: 'Empty file' }, { status: 400 })
  }

  const store = getStore('astrophotos')
  await store.set(key, imageData, { metadata: { contentType, originalFilename: filename } })

  return Response.json({ key, filename, contentType }, { status: 201 })
}

export const config = {
  path: '/api/upload'
}
