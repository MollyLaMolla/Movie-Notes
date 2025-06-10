-- INSERT INTO movies (movie_id, movie_title, movie_poster, movie_backdrop, movie_type, movie_genre, movie_release_date, movie_original_language, movie_overview, movie_vote, movie_vote_count, movie_watching_status, movie_personal_vote, movie_personal_overview) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
-- postgres db

DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    movie_id TEXT,
    movie_title TEXT,
    movie_poster TEXT,
    movie_backdrop TEXT,
    movie_type TEXT,
    movie_genre TEXT,
    movie_release_date TEXT,
    movie_original_language TEXT,
    movie_overview TEXT,
    movie_vote REAL,
    movie_vote_count INTEGER,
    movie_watching_status TEXT DEFAULT 'WATCHING',
    movie_personal_vote REAL DEFAULT 0,
    movie_personal_overview TEXT DEFAULT '',
    movie_time_created TIMESTAMP DEFAULT NOW(),
    movie_time_updated TIMESTAMP DEFAULT NOW(),
    movie_permanent TEXT DEFAULT 'YES'
);

-- INSERT THE 4 DEFAULT MOVIES

INSERT INTO movies (movie_id, movie_title, movie_poster, movie_backdrop, movie_type, movie_genre, movie_release_date, movie_original_language, movie_overview, movie_vote, movie_vote_count, movie_watching_status, movie_personal_vote, movie_personal_overview)
VALUES 
('1', 'Movie Title 1', 'poster_url_1', 'backdrop_url_1', 'movie_type_1', 'movie_genre_1', '2023-01-01', 'en', 'Overview of movie 1', '8.5', '100', 'WATCHING', '4', ''),
('2', 'Movie Title 2', 'poster_url_2', 'backdrop_url_2', 'movie_type_2', 'movie_genre_2', '2023-02-01', 'en', 'Overview of movie 2', '7.5', '200', 'WATCHING', '7.5', ''),
('3', 'Movie Title 3', 'poster_url_3', 'backdrop_url_3', 'movie_type_3', 'movie_genre_3', '2023-03-01', 'en', 'Overview of movie 3', '9.0', '300', 'WATCHING', '8.9', ''),
('4', 'Movie Title 4', 'poster_url_4', 'backdrop_url_4', 'movie_type_4', 'movie_genre_4', '2023-04-01', 'en', 'Overview of movie 4', '6.5', '400', 'WATCHING', '9.3', '');


-- INSERT INTO movies (movie_id, movie_title, movie_poster, movie_backdrop, movie_type, movie_genre, movie_release_date, movie_original_language, movie_overview, movie_vote, movie_vote_count, movie_watching_status, movie_personal_vote, movie_personal_overview) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, CAST($10 AS REAL), CAST($11 AS INTEGER), $12, CAST($13 AS REAL), $14)