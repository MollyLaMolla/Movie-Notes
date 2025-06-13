const allMovies = document.getElementById("all-movies").getAttribute("data-movies") || "[]";
const moviesArray = JSON.parse(allMovies);
//console.log("Movies array:", moviesArray);

function searchMovies(query) {
    const searchResults = moviesArray.filter(movie => {
        return movie.movie_title.toLowerCase().includes(query.toLowerCase()) ||
               (movie.original_title && movie.original_title.toLowerCase().includes(query.toLowerCase()));
    });

    const orderedResultsByPopularity = searchResults.sort((a, b) => b.movie_vote_count - a.movie_vote_count);

    displaySearchResults(orderedResultsByPopularity);
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = ""; // Pulisce i risultati precedenti

    if (results.length === 0) {
        resultsContainer.innerHTML = "<p class='no-results'>Nessun risultato trovato</p>";
        resultsContainer.classList.add("active");
        return;
    }

    results.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.className = "movie-search-result-item";
        if (movie.movie_poster === "https://image.tmdb.org/t/p/w500null") {
            movieElement.innerHTML = `
            <a href="/movie/${movie.movie_id}">
                <img src="/images/placeholder-image.png" alt="${movie.movie_title}">
                <h3>${movie.movie_title}</h3>
            </a>`;
        }
        else{
        movieElement.innerHTML = `
        <a href="/movie/${movie.movie_id}">
            <img src="${movie.movie_poster}" alt="${movie.movie_title}">
            <h3>${movie.movie_title}</h3>
        </a>`;
        }
        resultsContainer.appendChild(movieElement);
    });
    resultsContainer.classList.add("active");
}

function handleSearchInput(event) {
    const query = event.target.value.trim();
    if (query.length > 1) {
        searchMovies(query);
    } else {
        document.getElementById("search-results").classList.remove("active");
        document.getElementById("search-results").innerHTML = ""; // Pulisce i risultati se la query è troppo corta
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementsByClassName("movie-filter-search-input")[0];
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("focus", handleSearchInput);
    searchInput.addEventListener("blur", () => {
        //console.log("Search input blurred, hiding results.");
        const searchResults = document.getElementById("search-results");
        searchResults.classList.remove("active");
    });
});








