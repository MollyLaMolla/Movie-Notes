import bodyParser from "body-parser";
import express from "express";
import db from "./db.js";
import authRoutes from "./auth.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import axios from "axios";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");
app.use("/auth", authRoutes);
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
axios.defaults.baseURL = `http://localhost:${port}`;



// Avvia la funzione appena il server parte

db.connect();

const result = await db.query("SELECT last_run FROM cron_log WHERE id = 1;");
const lastRun = result.rows[0]?.last_run;
const now = new Date();
const diffMinutes = (now - new Date(lastRun)) / (1000 * 60);

if (diffMinutes >= 15) {
    console.log("Ultimo aggiornamento:", lastRun);
    console.log("Aggiornamento della tabella temp_movies...");
    await db.query("DROP TABLE IF EXISTS temp_movies");
    await db.query(`CREATE TABLE temp_movies (
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
        movie_permanent TEXT DEFAULT 'NO'
        );`
    );
     await db.query(`
    INSERT INTO temp_movies (
        id,
        movie_id,
        movie_title,
        movie_poster,
        movie_backdrop,
        movie_type,
        movie_genre,
        movie_release_date,
        movie_original_language,
        movie_overview,
        movie_vote,
        movie_vote_count,
        movie_watching_status,
        movie_personal_vote,
        movie_personal_overview,
        movie_time_created,
        movie_time_updated,
        movie_permanent 
    )
    SELECT
        id,
        movie_id,
        movie_title,
        movie_poster,
        movie_backdrop,
        movie_type,
        movie_genre,
        movie_release_date,
        movie_original_language,
        movie_overview,
        movie_vote,
        movie_vote_count,
        movie_watching_status,
        movie_personal_vote,
        movie_personal_overview,
        movie_time_created,
        movie_time_updated,
        movie_permanent
        FROM movies`
    );
    await db.query("INSERT INTO cron_log (id, last_run) VALUES (1, NOW()) ON CONFLICT (id) DO UPDATE SET last_run = NOW()");
    console.log("Tabella temp_movies aggiornata!");
}

// aggioramo la tabella temp_movies ogni 15 minuti
cron.schedule("*/15 * * * *", async () => {
//     // aggioramo la tabella temp_movies ogni 1 ora
// cron.schedule("0 * * * *", async () => {
// aggioramo la tabella temp_movies ogni 1 giorni
// cron.schedule("0 0 * * *", async () => {
    
    await db.query("DROP TABLE IF EXISTS temp_movies");
    await db.query(`CREATE TABLE temp_movies (
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
        movie_permanent TEXT DEFAULT 'NO'
        );`
    );
     await db.query(`
    INSERT INTO temp_movies (
        id,
        movie_id,
        movie_title,
        movie_poster,
        movie_backdrop,
        movie_type,
        movie_genre,
        movie_release_date,
        movie_original_language,
        movie_overview,
        movie_vote,
        movie_vote_count,
        movie_watching_status,
        movie_personal_vote,
        movie_personal_overview,
        movie_time_created,
        movie_time_updated,
        movie_permanent 
    )
    SELECT
        id,
        movie_id,
        movie_title,
        movie_poster,
        movie_backdrop,
        movie_type,
        movie_genre,
        movie_release_date,
        movie_original_language,
        movie_overview,
        movie_vote,
        movie_vote_count,
        movie_watching_status,
        movie_personal_vote,
        movie_personal_overview,
        movie_time_created,
        movie_time_updated,
        movie_permanent
        FROM movies`
    );
    await db.query("INSERT INTO cron_log (id, last_run) VALUES (1, NOW()) ON CONFLICT (id) DO UPDATE SET last_run = NOW()");
    console.log("Tabella temp_movies aggiornata!");
});

// Middleware per rendere disponibile l'utente in tutte le route
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
            console.log("Utente autenticato:", decoded);
        } catch (error) {
            console.warn("Token non valido:", error.message);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

// Home page
app.get("/", async (req, res) => {
    console.log(req.query);
    const { error, success } = req.cookies;
    if (error) {
        res.clearCookie("error");
    }
    if (success) {
        res.clearCookie("success");
    }
    const { type, movieGenres, tvGenres, whatchingStatus, sort, order } = req.query;
    try {
        let token = req.cookies.token;
        // Se non c'è token, genera token base
        if (!token) {
            const response = await axios.post("http://localhost:3000/auth/login", {
                username: "user",
                password: "1234",
            });
            token = response.data.token;
            // Imposta il token nei cookie
            console.log("Token generato:", token);
            res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        }
        // Usa il token per ottenere i film
        if (res.locals.user === null) {
            res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Utente autenticato:", res.locals.user);
        }
        const moviesResponse = await getAllMovies();
        const { movieGenress, tvGenress } = await getAllGenres();
        const filteredMovies = await filterMovies(moviesResponse, type, movieGenres, tvGenres, whatchingStatus, sort, order);
        console.log("Movie genres:", movieGenress);
        console.log("TV genres:", tvGenress);
        if (moviesResponse.error) {
            return res.render("index.ejs", {
                error: "Errore nel recupero dei film",
            });
        }
        if (filteredMovies === undefined) {
            res.render("index.ejs", {
            movies: moviesResponse.reverse(),
            filter: { type, movieGenres, tvGenres, whatchingStatus },
            sort: { sort, order },
            genres: {movieGenress, tvGenress},
            success,
            error,
            });
        }else {
            res.render("index.ejs", {
                movies: filteredMovies,
                filter: { type, movieGenres, tvGenres, whatchingStatus },
                sort: { sort, order },
                genres: {movieGenress, tvGenress},
                success,
                error,
            });
        }   
    } catch (error) {
        console.error("Errore:", error);
        res.render("index.ejs", {
            error: "Errore nel recupero dei film",
        });
    }
});

async function filterMovies(movies, type, movieGenres, tvGenres, whatchingStatus, sort, order) {
    if (type === undefined) {
        return;
    }
    let filteredMovies = movies;
    if (type !== "all") {
        filteredMovies = filteredMovies.filter((movie) => movie.movie_type === type);
    }
    if (movieGenres !== "all" && type === "movie") {
        let thisMovieGenres = movies.map((movie) => movie.movie_genre);
        thisMovieGenres = thisMovieGenres.filter((genre) => genre !== null);
        thisMovieGenres = thisMovieGenres.map((genre) => genre.split(","));
        console.log("movie genres:", thisMovieGenres);
        filteredMovies = filteredMovies.filter((movie) => movie.movie_genre.includes(movieGenres));
    }
    if (tvGenres !== "all" && type === "tv") {
        let thisMovieGenres = movies.map((movie) => movie.movie_genre);
        thisMovieGenres = thisMovieGenres.filter((genre) => genre !== null);
        thisMovieGenres = thisMovieGenres.map((genre) => genre.split(","));
        console.log("tv genres:", thisMovieGenres);
        filteredMovies = filteredMovies.filter((movie) => movie.movie_genre.includes(tvGenres));
    }
    if (whatchingStatus !== "all") {
        filteredMovies = filteredMovies.filter((movie) => movie.movie_watching_status === whatchingStatus);
    }
    filteredMovies = await orderMovies(filteredMovies, sort, order);
    return filteredMovies;
}

async function orderMovies(movies, sort, order) {
    let sortedMovies = movies;
    if (sort === "title") {
        sortedMovies = sortedMovies.sort((a, b) => a.movie_title.localeCompare(b.movie_title));
    }
    if (sort === "popularity") {
        sortedMovies = sortedMovies.sort((a, b) => a.movie_vote_count - b.movie_vote_count);
    }
    if (sort === "rating") {
        sortedMovies = sortedMovies.sort((a, b) => a.movie_vote - b.movie_vote);
    }
    if (sort === "time_created") {
        sortedMovies = sortedMovies.sort((a, b) => new Date(a.movie_time_created) - new Date(b.movie_time_created));
    }
    if (sort === "time_updated") {
        sortedMovies = sortedMovies.sort((a, b) => new Date(a.movie_time_updated) - new Date(b.movie_time_updated));
    }
    if (sort === "personal_vote") {
        sortedMovies = sortedMovies.sort((a, b) => a.movie_personal_vote - b.movie_personal_vote);
    }
    if (sort === "release_date") {
        sortedMovies = sortedMovies.sort((a, b) => new Date(a.movie_release_date) - new Date(b.movie_release_date));
    }
    if (order === "asc") {
        sortedMovies.reverse();
    }
    return sortedMovies;
}


app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.render("signup.ejs", {
            error: "Le password non coincidono",
        });
    }
    if (!username || !password) {
        return res.render("signup.ejs", {
            error: "Nome utente e password sono obbligatori",
        });
    }
    if (username.length < 3) {
        return res.render("signup.ejs", {
            error: "Il nome utente deve essere di almeno 3 caratteri",
        });
    }
    if (password.length < 6) {
        return res.render("signup.ejs", {
            error: "La password deve essere di almeno 6 caratteri",
        });
    }
    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length > 0) {
            return res.render("signup.ejs", {
                error: "Nome utente già esistente",
            });
        }
        const insertResult = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, password]
        );
        const user = insertResult.rows[0];
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("success", "Registrazione avvenuta con successo!", { maxAge: 5000, httpOnly: false });
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/");
    } catch (error) {
        console.error("Errore nella registrazione:", error);
        res.render("signup.ejs", {
            error: "Errore nella registrazione",
        });
    }
});

app.post("/logout", (req, res) => {
    res.cookie("success", "Logout avvenuto con successo!", { maxAge: 5000, httpOnly: false });
    res.clearCookie("token");
    res.redirect("/");
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) return res.render("login.ejs", { error: "Utente non trovato" });
        const user = result.rows[0];
        if (password !== user.password) return res.render("login.ejs", { error: "Password errata" });
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("success", "Login avvenuto con successo!", { maxAge: 5000, httpOnly: false });
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/");
    } catch (error) {
        console.error("Errore nel login:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// Route per ottenere i film (con controllo ruolo)
async function getMoviesByRole(role) {
    if (role === "admin") {
        const movies = await db.query("SELECT * FROM movies");
        return movies.rows;
    } else {
        const tempMovies = await db.query("SELECT * FROM temp_movies");
        return tempMovies.rows;
    }
}

async function getAllMovies() {
    const movies = await db.query("SELECT * FROM temp_movies");
    return movies.rows;
}

async function getAllGenres() {
    const movieGenresRes = await db.query("SELECT movie_genre FROM temp_movies WHERE movie_type = 'movie'");
    const tvGenresRes = await db.query("SELECT movie_genre FROM temp_movies WHERE movie_type = 'tv'");

    // Funzione di utilità per splittare e raccogliere generi unici
    function extractUniqueGenres(rows) {
        const genresSet = new Set();
        rows.forEach(row => {
            if (row.movie_genre) {
                row.movie_genre.split(",").forEach(genre => {
                    const trimmed = genre.trim();
                    if (trimmed) genresSet.add(trimmed);
                });
            }
        });
        return Array.from(genresSet);
    }

    const movieGenress = extractUniqueGenres(movieGenresRes.rows);
    const tvGenress = extractUniqueGenres(tvGenresRes.rows);

    console.log("Movie genres:", movieGenress);
    console.log("TV genres:", tvGenress);
    return { movieGenress, tvGenress };
}

app.get("/new", async (req, res) => {
    res.render("new.ejs", {
        btn: "Add",
    });
});

// Aggiunta film
app.post("/new", async (req, res) => {
    console.log(req.body);
    let query;
    let values;
    const { movieId, movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, movieVote, movieVoteCount, movieWatchingStatus, moviePersonalVote, moviePersonalOverview } = req.body;

    // Usa direttamente il ruolo dell'utente dal middleware
    const userRole = res.locals.user?.role || "user";

    // Recupera i film per evitare duplicati
    let token = req.cookies.token;
    if (!token) {
        const response = await axios.post("http://localhost:3000/auth/login", {
            username: "user",
            password: "1234",
        });
        token = response.data.token;
    }
    
    const moviesResponse = await getMoviesByRole(userRole || "user");
    if (moviesResponse.error) {
        return res.status(500).json({ error: "Errore nel recupero dei film" });
    }
    const movies = moviesResponse; // Corretto: getMoviesByRole restituisce un array
    if (movies.some((movie) => movie.movie_id === movieId)) {
        return res.render("new.ejs", {
            error: "Film già esistente",
            btn: "Add",
        });
    }

    if (userRole === "admin") {
        values = [movieId, movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, movieVote, movieVoteCount, movieWatchingStatus, moviePersonalVote, moviePersonalOverview, "YES"];
        query = `INSERT INTO temp_movies (movie_id, movie_title, movie_backdrop, movie_type, movie_genre, movie_release_date, movie_original_language, movie_overview, movie_vote, movie_vote_count, movie_watching_status, movie_personal_vote, movie_personal_overview, movie_permanent) VALUES($1, $2, $3, $4, $5, $6, $7, $8, CAST($9 AS REAL), CAST($10 AS INTEGER), $11, CAST($12 AS REAL), $13, $14);`;
        await db.query("INSERT INTO movies (movie_id, movie_title, movie_backdrop, movie_type, movie_genre, movie_release_date, movie_original_language, movie_overview, movie_vote, movie_vote_count, movie_watching_status, movie_personal_vote, movie_personal_overview, movie_permanent) VALUES($1, $2, $3, $4, $5, $6, $7, $8, CAST($9 AS REAL), CAST($10 AS INTEGER), $11, CAST($12 AS REAL), $13, $14);", values);
        res.cookie("success", "Film aggiunto permanentemente con successo!", { maxAge: 5000, httpOnly: false });
    } else {
        values = [movieId, movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, movieVote, movieVoteCount, movieWatchingStatus, moviePersonalVote, moviePersonalOverview, "NO"];
        query = `INSERT INTO temp_movies (movie_id, movie_title, movie_backdrop, movie_type, movie_genre, movie_release_date, movie_original_language, movie_overview, movie_vote, movie_vote_count, movie_watching_status, movie_personal_vote, movie_personal_overview, movie_permanent) VALUES($1, $2, $3, $4, $5, $6, $7, $8, CAST($9 AS REAL), CAST($10 AS INTEGER), $11, CAST($12 AS REAL), $13, $14);`;
        res.cookie("success", "Film aggiunto temporaneamente con successo!", { maxAge: 5000, httpOnly: false });
    }

    try {
        await db.query(query, values);
        console.log("Movie added to database");
    } catch (err) {
        console.error("Error adding movie to database", err);
    }
    res.redirect("/");
});

app.get("/movie/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM temp_movies WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            res.cookie("error", "Film non trovato!", { maxAge: 5000, httpOnly: false });
            return res.redirect("/");
        }
        const movie = result.rows[0];
        res.render("movie.ejs", {
            movie,
        });
    } catch (error) {
        console.error("Errore:", error);
        res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
        res.redirect("/");
    }
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM temp_movies WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            res.cookie("error", "Film non trovato!", { maxAge: 5000, httpOnly: false });
            return res.redirect("/");
        }
        const movie = result.rows[0];
        res.render("edit.ejs", {
            movie,
            btn: "Edit",
        });
    } catch (error) {
        console.error("Errore:", error);
        res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
        res.redirect("/");
    }
});

app.post("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, movieVote, movieVoteCount, movieWatchingStatus, moviePersonalVote, moviePersonalOverview } = req.body;

    try {
        await db.query("UPDATE temp_movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_permanent = $13, movie_time_updated = NOW() WHERE id = $14", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), "NO", id]);
        console.log("Movie updated in temp_movies");
    } catch (error) {
        console.error("Errore:", error);
        res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }

    if (res.locals.user?.role === "admin") {
        try {
            // is the movie permanent?
            const result = await db.query("SELECT * FROM temp_movies WHERE id = $1", [id]);
            const movie = result.rows[0];
            if (movie.movie_permanent === "YES") {
                await db.query("UPDATE movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12 movie_time_updated = NOW() WHERE id = $13", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), id]);
                await db.query("UPDATE temp_movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_time_updated = NOW() WHERE id = $13", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), id]);
            }
            if (movie.movie_permanent === "NO") {
                await db.query("UPDATE temp_movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_time_updated = NOW() WHERE id = $13", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), id]);
            }
            console.log("Movie updated in movies");
        } catch (error) {
            console.error("Errore:", error);
            res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
            return res.redirect("/");
        }
    }
    res.redirect(`/`);
});


app.post("/movie/:id/delete", async (req, res) => {
    const { id } = req.params;
    if (res.locals.user?.role === "user") {
        try {
            await db.query("DELETE FROM temp_movies WHERE id = $1", [id]);
            console.log("Movie deleted from temp_movies");
            res.cookie("success", "Film eliminato con successo temporaneamente!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        } catch (error) {
            console.error("Errore:", error);
            res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        }
    }

    if (res.locals.user?.role === "admin") {
        try {
            await db.query("DELETE FROM movies WHERE id = $1", [id]);
            await db.query("DELETE FROM temp_movies WHERE id = $1", [id]);
            console.log("Movie deleted from movies");
            res.cookie("success", "Film eliminato con successo permanentemente!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        } catch (error) {
            console.error("Errore:", error);
            res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


