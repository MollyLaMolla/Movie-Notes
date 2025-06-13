import bodyParser from "body-parser";
import express from "express";
import db from "./db.js";
import authRoutes from "./auth.js";
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

app.use((req, res, next) => {
    // Aggiungi il token ai cookie se non esiste
    if (!req.cookies.token) {
        const token = jwt.sign({ username: "user", role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    }
    // Controlla se l'utente è autenticato
    if (req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            if (!decoded || !decoded.username || !decoded.role) {
                res.clearCookie("token");
                const token = jwt.sign({ username: "user", role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
                return res.redirect("/");
            }
            res.locals.user = decoded;
        } catch (error) {
            res.clearCookie("token");
            const token = jwt.sign({ username: "user", role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
            return res.redirect("/");
        }
    }
    next();
});

process.on("uncaughtException", (err) => {
    console.error("🚨 Errore critico:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("🚨 Promessa rifiutata:", err);
});



axios.defaults.baseURL = `http://localhost:${port}`;



// Avvia la funzione appena il server parte

db.connect();

const result = await db.query("SELECT last_run FROM cron_log WHERE id = 1;");
const lastRun = result.rows[0]?.last_run;
const now = new Date();
const diffMinutes = (now - new Date(lastRun)) / (1000 * 60);

if (diffMinutes >= 15) {
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
});

// Middleware per rendere disponibile l'utente in tutte le route
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
        } catch (error) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

app.get("/", (req, res) => {
    res.redirect("/movies/1");
});


// Home page
app.get("/movies/:page", async (req, res) => {
    const search = req.query.search || "";
    // se search non è vuoto, cerca i film
    const { error, success, totalPages } = req.cookies;
    const page = req.params.page || 1;
    const { type, movieGenres, tvGenres, whatchingStatus, sort, order } = req.query;
    // modifica l'header della pagina se page non è un numero
    if (isNaN(page) || page < 0) {
        res.cookie("error", "Pagina non valida, reindirizzamento alla pagina 1", { maxAge: 5000, httpOnly: false });
        return res.redirect(`/movies/1?type=${type || "all"}&movieGenres=${movieGenres || "all"}&tvGenres=${tvGenres || "all"}&whatchingStatus=${whatchingStatus || "all"}&sort=${sort || "time_updated"}&order=${order || "asc"}`);
    }
    if (error) {
        res.clearCookie("error");
    }
    if (success) {
        res.clearCookie("success");
    }
    if (totalPages) {
        res.clearCookie("totalPages");
    }
    
    try {
        const moviesResponse = await getAllMovies();
        const moviesForSearch = moviesResponse.map((movie) => ({
            movie_id: movie.id,
            movie_title: movie.movie_title,
            movie_poster: movie.movie_backdrop || movie.movie_poster || "/images/placeholder-image.png",
        }));
        const { movieGenress, tvGenress } = await getAllGenres();
        const filteredMovies = await filterMovies(moviesResponse, type || "all", movieGenres || "all", tvGenres || "all", whatchingStatus || "all", sort || "time_updated", order || "asc", search);
        if (moviesResponse.error) {
            return res.render("index.ejs", {
                error: "Errore nel recupero dei film",
            });
        }
        const cardsPerPage = 11; // Numero di film per pagina
        // aggiungi il numero totale di pagine ai cookie
        const totalPages = Math.ceil(filteredMovies.length / cardsPerPage);
        if (page > totalPages) {
            return res.redirect(`/movies/${totalPages}?type=${type || "all"}&movieGenres=${movieGenres || "all"}&tvGenres=${tvGenres || "all"}&whatchingStatus=${whatchingStatus || "all"}&sort=${sort || "time_updated"}&order=${order || "asc"}`);
        }
        // Se la pagina è 0 e il numero totale di pagine è maggiore non è 0, reindirizza alla pagina 1
        const isPageZero = page == 0;
        if (isPageZero && totalPages > 0) {
            res.cookie("error", "Pagina non valida, reindirizzamento alla pagina 1", { maxAge: 5000, httpOnly: false });
            return res.redirect(`/movies/1?type=${type || "all"}&movieGenres=${movieGenres || "all"}&tvGenres=${tvGenres || "all"}&whatchingStatus=${whatchingStatus || "all"}&sort=${sort || "time_updated"}&order=${order || "asc"}`);
        }   
            res.render("index.ejs", {
                movies: filteredMovies.slice((page - 1) * cardsPerPage, page * cardsPerPage),
                currentPage: page,
                totalPages: totalPages,
                allMovies: moviesForSearch,
                search: search,
                filter: { type, movieGenres, tvGenres, whatchingStatus },
                sort: { sort, order },
                genres: {movieGenress, tvGenress},
                success,
                error,
            });
    } catch (error) {
        res.render("index.ejs", {
            error: "Errore nel recupero dei film",
        });
    }
});

async function filterMovies(movies, type, movieGenres, tvGenres, whatchingStatus, sort, order, Search) {
    if (type === undefined) {
        return;
    }
    let filteredMovies = movies;

    if (Search !== "") {
        filteredMovies = filteredMovies.filter((movie) => {
            return movie.movie_title.toLowerCase().includes(Search.toLowerCase()) ||
                (movie.movie_original_title && movie.movie_original_title.toLowerCase().includes(Search.toLowerCase()));
    });
    return filteredMovies;
    }
    if (type !== "all") {
        filteredMovies = filteredMovies.filter((movie) => movie.movie_type === type);
    }
    if (movieGenres !== "all" && type === "movie") {
        let thisMovieGenres = movies.map((movie) => movie.movie_genre);
        thisMovieGenres = thisMovieGenres.filter((genre) => genre !== null);
        thisMovieGenres = thisMovieGenres.map((genre) => genre.split(","));
        filteredMovies = filteredMovies.filter((movie) => movie.movie_genre.includes(movieGenres));
    }
    if (tvGenres !== "all" && type === "tv") {
        let thisMovieGenres = movies.map((movie) => movie.movie_genre);
        thisMovieGenres = thisMovieGenres.filter((genre) => genre !== null);
        thisMovieGenres = thisMovieGenres.map((genre) => genre.split(","));
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
        sortedMovies.reverse(); // Inverti l'ordine per default
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
            { id: user.id, username: user.username, role: user.role, password: user.password },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("success", "Registrazione avvenuta con successo!", { maxAge: 5000, httpOnly: false });
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/");
    } catch (error) {
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
            { id: user.id, username: user.username, role: user.role, password: user.password },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("success", "Login avvenuto con successo!", { maxAge: 5000, httpOnly: false });
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/");
    } catch (error) {
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
    return { movieGenress, tvGenress };
}

app.get("/new", async (req, res) => {
    // Controlla se l'utente è autenticato e ha il ruolo di admin
    if (!res.locals.user) {
        res.cookie("error", "Devi essere autenticato per aggiungere un film!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    res.render("new.ejs", {
        btn: "Add",
    });
});

// Aggiunta film
app.post("/new", async (req, res) => {
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
        res.cookie("error", "Film già esistente, reindirizzamento al film!", { maxAge: 5000, httpOnly: false });
        // reindirizza a /movies/1 con il movieTitle come parametro di ricerca
        return res.redirect(`/movies/1?search=${encodeURIComponent(movieTitle)}`);
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
    } catch (err) {
        res.cookie("error", "Errore durante l'inserimento del film!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
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
        res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
        res.redirect("/");
    }
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const error = req.cookies.error;
    try {
        const result = await db.query("SELECT * FROM temp_movies WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            res.cookie("error", "Film non trovato!", { maxAge: 5000, httpOnly: false });
            return res.redirect("/");
        }
        const movie = result.rows[0];
        res.render("edit.ejs", {
            error: error || null,
            movie : movie,
            btn: "Edit",
        });
    } catch (error) {
        res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
        res.redirect("/");
    }
});

app.post("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, movieVote, movieVoteCount, movieWatchingStatus, moviePersonalVote, moviePersonalOverview } = req.body;

    if (res.locals.user?.role !== "admin"){
        try {
            await db.query("UPDATE temp_movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_permanent = $13, movie_time_updated = NOW() WHERE id = $14", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), "NO", id]);
            res.cookie("success", "Film aggiornato con successo!", { maxAge: 5000, httpOnly: false });
        } catch (error) {
            res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
            return res.redirect("/");
        }
    }
   

    if (res.locals.user?.role === "admin") {
        try {
            // is the movie permanent?
            const result = await db.query("SELECT * FROM temp_movies WHERE id = $1", [id]);
            const movie = result.rows[0];
            if (movie.movie_permanent == "YES") {
                await db.query("UPDATE movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_permanent = $13, movie_time_updated = NOW() WHERE id = $14", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), "YES", id]);
                await db.query("UPDATE temp_movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_permanent = $13, movie_time_updated = NOW() WHERE id = $14", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), "YES", id]);
            }
            if (movie.movie_permanent == "NO") {
                await db.query("UPDATE temp_movies SET movie_title = $1, movie_backdrop = $2, movie_type = $3, movie_genre = $4, movie_release_date = $5, movie_original_language = $6, movie_overview = $7, movie_vote = CAST($8 AS REAL), movie_vote_count = CAST($9 AS INTEGER), movie_watching_status = $10, movie_personal_vote = CAST($11 AS REAL), movie_personal_overview = $12, movie_permanent = $13, movie_time_updated = NOW() WHERE id = $14", [movieTitle, movieBackdrop, movieType, movieGenre, movieReleaseDate, movieOriginalLanguage, movieOverview, parseFloat(movieVote), parseInt(movieVoteCount), (movieWatchingStatus || ""), parseFloat(moviePersonalVote), (moviePersonalOverview || ""), "NO", id]);
            }
            res.cookie("success", "Film aggiornato con successo!", { maxAge: 5000, httpOnly: false });
        } catch (error) {
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
            res.cookie("success", "Film eliminato con successo temporaneamente!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        } catch (error) {
            res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        }
    }

    if (res.locals.user?.role === "admin") {
        try {
            await db.query("DELETE FROM movies WHERE id = $1", [id]);
            await db.query("DELETE FROM temp_movies WHERE id = $1", [id]);
            res.cookie("success", "Film eliminato con successo permanentemente!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        } catch (error) {
            res.cookie("error", "Errore nel recupero del film!", { maxAge: 5000, httpOnly: false });
            res.redirect("/");
        }
    }
});

app.get("/admin", async (req, res) => {
    const { error, success } = req.cookies;
    if (error) {
        res.clearCookie("error");
    }
    if (success) {
        res.clearCookie("success");
    }
    // Controllo se l'utente è un admin
    if (res.locals.user?.role !== "admin") {
        res.cookie("error", "Accesso non autorizzato alla pagina admin!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    const users = await db.query("SELECT * FROM users");
    res.render("admin.ejs", {
        error,
        success,
        user: res.locals.user,
        currentUser: res.locals.user,
        users: users.rows,
    });
});

app.post("/updateTemp", async (req, res) => {
    if (res.locals.user?.role !== "admin") {
        res.cookie("error", "Accesso non autorizzato alla pagina admin!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    // aggiorna la tabella temp_movies
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
    // Log dell'aggiornamento
    res.cookie("success", "Tabella temp_movies aggiornata con successo!", { maxAge: 5000, httpOnly: false });
    res.redirect("/admin");
});

app.post("/makeAdmin", async (req, res) => {
    if (res.locals.user?.role !== "admin") {
        res.cookie("error", "Accesso non autorizzato alla pagina admin!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    const { userId } = req.body;
    try {
        await db.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
        res.cookie("success", "Utente promosso ad admin con successo!", { maxAge: 5000, httpOnly: false });
    } catch (error) {
        res.cookie("error", "Errore nella promozione dell'utente!", { maxAge: 5000, httpOnly: false });
    }
    res.redirect("/admin");
});

app.post("/removeAdmin", async (req, res) => {
    if (res.locals.user?.role !== "admin") {
        res.cookie("error", "Accesso non autorizzato alla pagina admin!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    const { userId } = req.body;
    try {
        await db.query("UPDATE users SET role = 'user' WHERE id = $1", [userId]);
        res.cookie("success", "Utente declassato da admin a user con successo!", { maxAge: 5000, httpOnly: false });
    } catch (error) {
        res.cookie("error", "Errore nella declassificazione dell'utente!", { maxAge: 5000, httpOnly: false });
    }
    res.redirect("/admin");
});

app.get("/account", async (req, res) => {
    const { error, success } = req.cookies;
    const user = res.locals.user;
    if (user.username === "user"){
        res.cookie("error", "Accesso non autorizzato alla pagina account!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    if (error) {
        res.clearCookie("error");
    }
    if (success) {
        res.clearCookie("success");
    }
    // Controllo se l'utente è autenticato
    if (!res.locals.user) {
        res.cookie("error", "Accesso non autorizzato alla pagina account!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    res.render("account.ejs", {
        user,
        error,
        success,
    });
});

app.post("/update-name", async (req, res) => {
    const { username, newUsername, confirmNewUsername, currentPassword } = req.body;
    // Controllo se l'utente è autenticato
    if (!res.locals.user) {
        res.cookie("error", "Accesso non autorizzato alla pagina account!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }

    const user = res.locals.user;

    // Controllo se l'username dell'utente autenticato corrisponde a quello passato
    if (user.username !== username) {
        res.cookie("error", "Nome utente non corrisponde a quello dell'utente autenticato!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se il nuovo nome utente e la conferma sono uguali
    if (newUsername !== confirmNewUsername) {
        res.cookie("error", "Il nuovo nome utente e la conferma non coincidono!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }
    // Controllo se la password corrente corrisponde a quella dell'utente autenticato
    if (currentPassword !== user.password) {
        res.cookie("error", "Password corrente non corretta!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se il nuovo nome utente è valido
    if (newUsername.length < 3) {
        res.cookie("error", "Il nuovo nome utente deve essere di almeno 3 caratteri!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se il nuovo nome utente è lo stesso di quello attuale
    if (newUsername === username) {
        res.cookie("error", "Il nuovo nome utente non può essere lo stesso di quello attuale!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    try {
        // Controllo se il nuovo nome utente esiste già
        const result = await db.query("SELECT * FROM users WHERE username = $1", [newUsername]);
        if (result.rows.length > 0) {
            res.cookie("error", "Nome utente già esistente!", { maxAge: 5000, httpOnly: false });
            return res.redirect("/account");
        }

        // Aggiorno il nome utente
        await db.query("UPDATE users SET username = $1 WHERE id = $2", [newUsername, user.id]);
        res.cookie("success", "Nome utente aggiornato con successo!", { maxAge: 5000, httpOnly: false });
    } 
    catch (error) {
        res.cookie("error", "Errore nell'aggiornamento del nome utente!", { maxAge: 5000, httpOnly: false });
    }
    // aggiorna locals user
    res.locals.user.username = newUsername; // Aggiorno il nome utente nell'oggetto user
    // aggiorna il token
    const token = jwt.sign(
        { id: user.id, username: newUsername, role: user.role, password: user.password },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Rimuovo il vecchio token e ne aggiungo uno nuovo
    // aggiorna il cookie
    res.cookie("success", "Nome utente aggiornato con successo!", { maxAge: 5000, httpOnly: false });
    // reindirizzo alla pagina account
    res.redirect("/account");
});

app.post("/update-password", async (req, res) => {
    const { username, currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Controllo se l'utente è autenticato
    if (!res.locals.user) {
        res.cookie("error", "Accesso non autorizzato alla pagina account!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }
    const user = res.locals.user;

    // Controllo se l'username dell'utente autenticato corrisponde a quello passato
    if (user.username !== username) {
        res.cookie("error", "Nome utente non corrisponde a quello dell'utente autenticato!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se la password corrente corrisponde a quella dell'utente autenticato
    if (currentPassword !== user.password) {
        res.cookie("error", "Password corrente non corretta!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se la nuova password è valida
    if (newPassword.length < 6) {
        res.cookie("error", "La nuova password deve essere di almeno 6 caratteri!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }


    // Controllo se la nuova password e la conferma sono uguali
    if (newPassword !== confirmNewPassword) {
        res.cookie("error", "Le nuove password non coincidono!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se la nuova password è uguale a quella corrente
    if (newPassword === currentPassword) {
        res.cookie("error", "La nuova password non può essere uguale a quella corrente!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    try {
        // Aggiorno la password
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [newPassword, user.id]);
        res.cookie("success", "Password aggiornata con successo!", { maxAge: 5000, httpOnly: false });
    }
    catch (error) {
        res.cookie("error", "Errore nell'aggiornamento della password!", { maxAge: 5000, httpOnly: false });
    }
    // aggiorna locals user
    res.locals.user.password = newPassword; // Aggiorno la password nell'oggetto user
    // aggiorna il token
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, password: newPassword },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Rimuovo il vecchio token e ne aggiungo uno nuovo
    // aggiorna il cookie
    res.cookie("success", "Password aggiornata con successo!", { maxAge: 5000, httpOnly: false });
    // reindirizzo alla pagina account
    res.redirect("/account");
});

app.post("/delete-account", async (req, res) => {
    const { username, password, acept } = req.body;
    // Controllo se l'utente ha accettato di eliminare l'account
    if (acept !== "ACEPT") {
        res.cookie("error", "Devi accettare di eliminare l'account!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    // Controllo se l'utente è autenticato
    if (!res.locals.user) {
        res.cookie("error", "Accesso non autorizzato alla pagina account!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/");
    }

    const user = res.locals.user;

    if (user.username === "molly" || username === "molly") {
        res.cookie("error", "Non puoi eliminare l'account admin 'molly'!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    if (user.username !== username) {
        res.cookie("error", "Nome utente non corrisponde a quello dell'utente autenticato!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    if (password !== user.password) {
        res.cookie("error", "Password non corretta!", { maxAge: 5000, httpOnly: false });
        return res.redirect("/account");
    }

    try {
        // Elimino l'account
        await db.query("DELETE FROM users WHERE id = $1", [user.id]);
        res.cookie("success", "Account eliminato con successo!", { maxAge: 5000, httpOnly: false });
        res.clearCookie("token"); // Rimuovo il token di autenticazione
    } 
    catch (error) {
        res.cookie("error", "Errore nell'eliminazione dell'account!", { maxAge: 5000, httpOnly: false });
    }
    // aggiorna locals user
    res.locals.user = null;
    // aggiorna il cookie
    res.cookie("success", "Account eliminato con successo!", { maxAge: 5000, httpOnly: false });
    // reindirizzo alla home
    res.redirect("/");
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


