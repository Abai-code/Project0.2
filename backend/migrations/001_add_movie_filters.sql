ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS genre VARCHAR(50),
  ADD COLUMN IF NOT EXISTS is_series BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE movies SET year = 2010, country = 'USA', genre = 'Sci-Fi', is_series = FALSE WHERE title = 'Inception' AND year IS NULL;
UPDATE movies SET year = 2014, country = 'USA', genre = 'Sci-Fi', is_series = FALSE WHERE title = 'Interstellar' AND year IS NULL;
UPDATE movies SET year = 1999, country = 'USA', genre = 'Action', is_series = FALSE WHERE title = 'The Matrix' AND year IS NULL;
