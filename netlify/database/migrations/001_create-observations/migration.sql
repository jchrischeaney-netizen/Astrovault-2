CREATE TABLE IF NOT EXISTS observations (
  id SERIAL PRIMARY KEY,
  object_name TEXT NOT NULL,
  object_category TEXT NOT NULL,
  object_type TEXT,
  capture_date DATE NOT NULL,
  integration_time TEXT,
  telescope TEXT,
  camera TEXT,
  notes TEXT,
  image_key TEXT,
  image_filename TEXT,
  image_content_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
