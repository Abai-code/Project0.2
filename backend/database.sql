CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  movie_url TEXT,
  year INTEGER,
  country VARCHAR(100),
  genre VARCHAR(50),
  is_series BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS review_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, review_id)
);

INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, rating)
SELECT
  'Inception',
  'A thief who steals corporate secrets through the use of dream-sharing technology...',
  'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
  'https://example.com/watch/inception',
  2010,
  'USA',
  'Sci-Fi',
  FALSE,
  0
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Inception');

INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, rating)
SELECT
  'Interstellar',
  'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival...',
  'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  'https://example.com/watch/interstellar',
  2014,
  'USA',
  'Sci-Fi',
  FALSE,
  0
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Interstellar');

INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, rating)
SELECT
  'The Matrix',
  'A computer hacker learns from mysterious rebels about the true nature of his reality...',
  'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
  'https://example.com/watch/the-matrix',
  1999,
  'USA',
  'Action',
  FALSE,
  0
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'The Matrix');
