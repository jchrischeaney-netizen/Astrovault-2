import { getDatabase } from '@netlify/database'
import { getStore } from '@netlify/blobs'

const db = getDatabase()

export default async (req, context) => {
  const { id } = context.params
  const method = req.method

  if (method === 'GET') {
    const [row] = await db.sql`SELECT * FROM observations WHERE id = ${id}`
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(row)
  }

  if (method === 'DELETE') {
    const [row] = await db.sql`SELECT image_key FROM observations WHERE id = ${id}`
    if (row?.image_key) {
      try {
        const store = getStore('astrophotos')
        await store.delete(row.image_key)
      } catch (_) {}
    }
    await db.sql`DELETE FROM observations WHERE id = ${id}`
    return Response.json({ success: true })
  }

  if (method === 'PATCH') {
    const body = await req.json()
    const { object_name, object_category, object_type, capture_date, integration_time, telescope, camera, notes } = body
    const [row] = await db.sql`
      UPDATE observations SET
        object_name = COALESCE(${object_name}, object_name),
        object_category = COALESCE(${object_category}, object_category),
        object_type = COALESCE(${object_type}, object_type),
        capture_date = COALESCE(${capture_date}, capture_date),
        integration_time = COALESCE(${integration_time}, integration_time),
        telescope = COALESCE(${telescope}, telescope),
        camera = COALESCE(${camera}, camera),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING *
    `
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(row)
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

export const config = {
  path: '/api/observations/:id'
}
