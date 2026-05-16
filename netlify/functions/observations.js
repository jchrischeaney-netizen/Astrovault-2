import { getDatabase } from '@netlify/database'

const db = getDatabase()

export default async (req) => {
  const method = req.method

  if (method === 'GET') {
    const rows = await db.sql`
      SELECT * FROM observations ORDER BY capture_date DESC, created_at DESC
    `
    return Response.json(rows)
  }

  if (method === 'POST') {
    const body = await req.json()
    const { object_name, object_category, object_type, capture_date, integration_time, telescope, camera, notes, image_key, image_filename, image_content_type } = body

    if (!object_name || !capture_date) {
      return Response.json({ error: 'object_name and capture_date are required' }, { status: 400 })
    }

    const [row] = await db.sql`
      INSERT INTO observations
        (object_name, object_category, object_type, capture_date, integration_time, telescope, camera, notes, image_key, image_filename, image_content_type)
      VALUES
        (${object_name}, ${object_category}, ${object_type}, ${capture_date}, ${integration_time}, ${telescope}, ${camera}, ${notes}, ${image_key}, ${image_filename}, ${image_content_type})
      RETURNING *
    `
    return Response.json(row, { status: 201 })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

export const config = {
  path: '/api/observations'
}
