let currentOffset = 0;
let moviesPerLoad = 4;// Numero di film da caricare per volta
// Numero di film da caricare inizialmente
// Se vuoi cambiare il numero di film da caricare inizialmente, cambia il valore di firstLoadCount
let firstLoadCount = 7; // Numero di film da caricare inizialmente
// cambia il valore di firstLoadCount in base a numero di columne della griglia 
let currentFilters = {}; // Salva i filtri correnti
const renderedMovieIds = new Set();

// Utility: aggiorna i valori del form dai parametri
function setFiltersToForm(filters) {
    const form = document.querySelector('.filter-form');
    if (!form) return;
    form.querySelector('.type-select').value = filters.type || "all";
    form.querySelector('.movie-genre-select').value = filters.movieGenres || "all";
    form.querySelector('.tv-genre-select').value = filters.tvGenres || "all";
    form.querySelector('.whatching-status-select').value = filters.whatchingStatus || "all";
    form.querySelector('.sort-select').value = filters.sort || "time_created";
    form.querySelector('.order-select').value = filters.order || "asc";
}

// Utility: ottieni i filtri dalla query string
function getFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        type: params.get("type") || "all",
        movieGenres: params.get("movieGenres") || "all",
        tvGenres: params.get("tvGenres") || "all",
        whatchingStatus: params.get("whatchingStatus") || "all",
        sort: params.get("sort") || "time_created",
        order: params.get("order") || "asc"
    };
}

// Utility: aggiorna la query string nell'URL
function updateURLWithFilters(filters) {
    const params = new URLSearchParams(filters);
    history.pushState(filters, '', '?' + params.toString());
}

// Submit del form dei filtri

// Carica i film in base ai filtri dell'URL al caricamento della pagina
window.addEventListener("DOMContentLoaded", () => {
    currentFilters = getFiltersFromURL();
    setFiltersToForm(currentFilters);
    renderedMovieIds.clear();
    currentOffset = 0;
    document.querySelector('.movies-container').innerHTML = '<a href="/new" class="new-movie"></a>';
    loadMoreMovies(firstLoadCount);
});

// Gestisci avanti/indietro del browser
window.addEventListener('popstate', function(event) {
    // Aggiorna i select dei filtri in base all'URL attuale
    setFiltersToForm(getFiltersFromURL());
    // NON forzare reload: lascia che la UI si aggiorni solo con i nuovi valori dei select
    // Se vuoi anche ricaricare i film, puoi richiamare la logica di caricamento qui:
    // Esempio:
    currentFilters = getFiltersFromURL();
    renderedMovieIds.clear();
    currentOffset = 0;
    document.querySelector('.movies-container').innerHTML = '<a href="/new" class="new-movie"></a>';
    loadMoreMovies(firstLoadCount);
});

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreMovies();
    }
});

function getCurrentFiltersFromPage() {
    const form = document.querySelector('.filter-form');
    return {
        type: form.querySelector('.type-select').value,
        movieGenres: form.querySelector('.movie-genre-select').value,
        tvGenres: form.querySelector('.tv-genre-select').value,
        whatchingStatus: form.querySelector('.whatching-status-select').value,
        sort: form.querySelector('.sort-select').value,
        order: form.querySelector('.order-select').value
    };
}

async function loadMoreMovies(count = moviesPerLoad) {
    // Costruisci la query string con i filtri
    const params = new URLSearchParams({
        offset: currentOffset,
        limit: count,
        ...currentFilters
    });
    const response = await fetch(`/api/movies?${params.toString()}`, {
        method: "GET"
    });
    if (response.ok) {
        const movies = await response.json();
        if (movies.length > 0) {
            const movieContainer = document.querySelector('.movies-container');
            movies.forEach(movie => {
                const { id } = movie;
                if (renderedMovieIds.has(id)) return; // Salta i doppioni
                renderedMovieIds.add(id);
                const {
                    movie_title,
                    movie_poster,
                    movie_backdrop,
                    movie_watching_status,
                    movie_permanent
                } = movie;
                let image = movie_poster || movie_backdrop || "";
                const title = movie_title || "Unknown Title";

                // Badge HTML
                let badgeHTML = "";
                if (movie_permanent === "NO") {
                    badgeHTML += `<div class="temporary-badge"><p>⏳</p></div>`;
                }
                if (movie_watching_status === "Whatching") {
                    badgeHTML += `<div class="whatching-badge status-badge"><p>Watching</p></div>`;
                } else if (movie_watching_status === "Completed") {
                    badgeHTML += `<div class="completed-badge status-badge"><p>Completed</p></div>`;
                } else if (movie_watching_status === "Plan to Watch") {
                    badgeHTML += `<div class="plan-to-watch-badge status-badge"><p>Plan to Watch</p></div>`;
                } else if (movie_watching_status === "On Hold") {
                    badgeHTML += `<div class="on-hold-badge status-badge"><p>On Hold</p></div>`;
                } else if (movie_watching_status === "Dropped") {
                    badgeHTML += `<div class="dropped-badge status-badge"><p>Dropped</p></div>`;
                }

                // Card HTML
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.innerHTML = `
                    <button class="actions-button">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                    </button>
                    <div class="actions-menu close-menu">
                        <button class="edit-movie-btn action-btn">
                            <a href="/edit/${id}" class="edit-link">Edit</a>
                        </button>
                        <form action="/movie/${id}/delete" method="POST">
                            <button type="submit" class="delete-movie-btn action-btn">Delete</button>
                        </form>
                    </div>
                    <a href="/movie/${id}" class="movie-link">
                        <div class="movie-image-container">
                        ${badgeHTML}
                        <img class="movie-image" src="${image}" alt="${title}">
                        </div>
                        <h2 class="movie-title">${title}</h2>
                    </a>
                `;
                if (image === "https://image.tmdb.org/t/p/w500null") {
                    movieCard.querySelector('.movie-image').remove();
                    movieCard.querySelector('.movie-image-container').innerHTML = `
                        ${badgeHTML}
                        <div class="placeholder-image"></div>
                    `;
                }
                movieContainer.appendChild(movieCard);
            });
            attachActionsButtonListeners();
            currentOffset += movies.length;
        } else {
            window.removeEventListener("scroll", loadMoreMovies);
        }
    } else {
        console.error("Failed to load movies:", response.statusText);
    }
}

function attachActionsButtonListeners() {
    const actionsBtn = document.querySelectorAll('.actions-button');
    const actionsMenu = document.querySelectorAll('.actions-menu');
    actionsBtn.forEach((btn, index) => {
        btn.onclick = function(e) {
            e.stopPropagation();
            actionsMenu[index].classList.toggle('open-menu');
            actionsMenu[index].classList.toggle('close-menu');
            btn.classList.toggle("action-btn-open");
            // Chiudi gli altri menu
            actionsMenu.forEach((menu, menuIndex) => {
                if (menuIndex !== index) {
                    menu.classList.remove('open-menu');
                    menu.classList.add('close-menu');
                    actionsBtn[menuIndex].classList.remove("action-btn-open");
                }
            });
        };
    });
    // Chiudi menu cliccando fuori
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.actions-button') && !event.target.closest('.actions-menu')) {
            actionsMenu.forEach((menu) => {
                menu.classList.remove('open-menu');
                menu.classList.add('close-menu');
            });
            actionsBtn.forEach((btn) => {
                btn.classList.remove("action-btn-open");
            });
        }
    });
}

attachActionsButtonListeners();