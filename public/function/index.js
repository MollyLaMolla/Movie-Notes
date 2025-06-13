const actionsBtn = document.querySelectorAll('.actions-button');
const actionsMenu = document.querySelectorAll('.actions-menu');
const statusbadge = document.querySelectorAll('.status-badge');
const temporaryBadge = document.querySelectorAll('.temporary-badge');

document.querySelector(`.type-select`).addEventListener("change", function() {
    filterTypeChange.call(this);
});


filterTypeChange.call(document.querySelector(`.type-select`));

function filterTypeChange() {
    const selectedValue = this.value;
    if (selectedValue === "movie") {
        document.getElementsByClassName('movie-genre-div')[0].classList.remove('no-display');
        document.getElementsByClassName('tv-genre-div')[0].classList.add('no-display');
    } else if (selectedValue === "tv") {
        document.getElementsByClassName('movie-genre-div')[0].classList.add('no-display');
        document.getElementsByClassName('tv-genre-div')[0].classList.remove('no-display');
    } else {
        document.getElementsByClassName('movie-genre-div')[0].classList.add('no-display');
        document.getElementsByClassName('tv-genre-div')[0].classList.add('no-display');
    }
}

actionsBtn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        actionsMenu[index].classList.toggle('open-menu');
        actionsMenu[index].classList.toggle('close-menu');
        btn.classList.toggle("action-btn-open");
        // Close other menus
        actionsMenu.forEach((menu, menuIndex) => {
            if (menuIndex !== index) {
                menu.classList.remove('open-menu');
                menu.classList.add('close-menu');
                actionsBtn[menuIndex].classList.remove("action-btn-open");
            }
        });
    });
});

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

function getscreenWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

// Function to check if the screen width is less than 950px
function isScreenWidthLessThan950() {
    return getscreenWidth() < 950;
}

function isScreenWidthmoreThan450() {
    return getscreenWidth() > 450;
}

// screen width change event listener
window.addEventListener('resize', () => {
    // Re-check the screen width and adjust the grid column accordingly
    if (!isScreenWidthmoreThan450()){
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'unset';
        return;
    }
    if (isScreenWidthLessThan950() && document.getElementsByClassName('type-select')[0].value !== 'all') {
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'span 2';
    } 
    if (isScreenWidthLessThan950() && document.getElementsByClassName('type-select')[0].value === 'all') {
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'span 1';
    }
    if (!isScreenWidthLessThan950()) {
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'unset';
    } 
});

// Initial check for screen width
if (isScreenWidthLessThan950() && document.getElementsByClassName('type-select')[0].value !== 'all') {
    document.getElementsByClassName('order-div')[0].style.gridColumn = 'span 2';
}
if (isScreenWidthLessThan950() && document.getElementsByClassName('type-select')[0].value === 'all') {
    document.getElementsByClassName('order-div')[0].style.gridColumn = 'span 1';
}
if (!isScreenWidthLessThan950()) {
    document.getElementsByClassName('order-div')[0].style.gridColumn = 'unset';
}

document.getElementsByClassName('type-select')[0].addEventListener('change', () => {
    // Re-check the screen width and adjust the grid column accordingly
    if (!isScreenWidthmoreThan450()){
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'unset';
        return;
    }
    if (isScreenWidthLessThan950() && document.getElementsByClassName('type-select')[0].value !== 'all') {
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'span 2';
    } else if (isScreenWidthLessThan950() && document.getElementsByClassName('type-select')[0].value === 'all') {
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'span 1';
    } else {
        document.getElementsByClassName('order-div')[0].style.gridColumn = 'unset';
    }
});

statusbadge.forEach((badge) => {
    badge.addEventListener('click', () => {
        // on click click the .movie-link element
        const card = badge.parentElement;
        const movieLink = card.querySelector('.movie-link');
        //console.log(card);
        if (movieLink) {
            movieLink.click();
        }
    });
});

temporaryBadge.forEach((badge) => {
    badge.addEventListener('click', () => {
        // on click click the .movie-link element
        const card = badge.parentElement;
        const movieLink = card.querySelector('.movie-link');
        //console.log(card);
        if (movieLink) {
            movieLink.click();
        }
    });
});

const cards = document.querySelectorAll('.movie-card');
const newMovieCard = document.getElementsByClassName('new-movie')[0];


function adjustCardHeight(card) {
    const cardWidth = card.offsetWidth;
    card.style.height = `${cardWidth * 1.585}px`; // Adjust height based on aspect ratio
}

if (cards.length === 0) {
    if (newMovieCard) {
        adjustCardHeight(newMovieCard);
    }
}

const card = document.querySelector('.movie-card');

window.addEventListener('resize', () => {
    if (cards.length === 0) {
        if (newMovieCard) {
            adjustCardHeight(newMovieCard);
        }
    }
    cards.forEach(card => {
        adjustTitleFontSize(card);
    });
});



// aggiungi un event listener a card che ogni volta che cambia la dimensione, regola la dimensione del titolo della card
function adjustTitleFontSize(card) {
    const titleElement = card.querySelector('.movie-title');
    if (!titleElement) return;
    const cardWidth = card.offsetWidth;
    if (cardWidth < 140) {
        titleElement.style.fontSize = '12px';
        titleElement.style.lineHeight = '1.2';

        return;
    }
    if (cardWidth < 160) {
        titleElement.style.fontSize = '14px';
        titleElement.style.lineHeight = '1.3';
        return;
    }
    if (cardWidth < 180) {
        titleElement.style.fontSize = '16px';
        titleElement.style.lineHeight = '1.4';
        return;
    }
    if (cardWidth < 200) {
        titleElement.style.fontSize = '18px';
        titleElement.style.lineHeight = '1.5';
        return;
    }
    if (cardWidth < 220) {
        titleElement.style.fontSize = '20px';
        titleElement.style.lineHeight = '1.6';
        return;
    }
    else {
        titleElement.style.fontSize = '22px';
        titleElement.style.lineHeight = '1.7';
        return;
    }
}

if (cards.length > 0) {
    cards.forEach(card => {
        adjustTitleFontSize(card);
    });
}

// prendi tutti i valory attuali del corrente url e li salva in un oggetto
function getCurrentUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    return {
        type: params.get("type") || "all",
        movieGenres: params.get("movieGenres") || "all",
        tvGenres: params.get("tvGenres") || "all",
        whatchingStatus: params.get("whatchingStatus") || "all",
        sort: params.get("sort") || "time_updated",
        order: params.get("order") || "asc"
    };
}

// Utility: aggiorna i section del form dei filtri in base ai valori correnti dell'URL
function updateFilterFormSections() {
    const currentFilters = getCurrentUrlFilters();
    //console.log("Current Filters:", currentFilters);
    const typeSelect = document.querySelectorAll('.type-select')[0];
    const whatchingStatusSelect = document.querySelectorAll('.whatching-status-select')[0];
    const movieGenreSelect = document.querySelectorAll('.movie-genre-select')[0];
    const tvGenreSelect = document.querySelectorAll('.tv-genre-select')[0];
    const sortSelect = document.querySelectorAll('.sort-select')[0];
    const orderSelect = document.querySelectorAll('.order-select')[0];

    // Imposta il valore del select type
    typeSelect.value = currentFilters.type || "all";
    // imposta il valore del select whatchingStatus
    whatchingStatusSelect.value = currentFilters.whatchingStatus || "all";
    // imposta il valore del select movieGenres
    movieGenreSelect.value = currentFilters.movieGenres || "all";
    // imposta il valore del select tvGenres
    tvGenreSelect.value = currentFilters.tvGenres || "all";
    // imposta il valore del select sort
    sortSelect.value = currentFilters.sort || "time_updated";
    // imposta il valore del select order
    orderSelect.value = currentFilters.order || "asc";
    ////console.logga i valori impostati
    //console.log("Type Select Value:", typeSelect.value);
    //console.log("Whatching Status Select Value:", whatchingStatusSelect.value);
    //console.log("Movie Genre Select Value:", movieGenreSelect.value);
    //console.log("TV Genre Select Value:", tvGenreSelect.value);
    //console.log("Sort Select Value:", sortSelect.value);
    //console.log("Order Select Value:", orderSelect.value);
    // Cambia la visibilità dei div in base al tipo selezionato
    filterTypeChange.call(typeSelect);
    // Cambia la visibilità dei div in base allo stato di visione selezionato
}

// Aggiorna i select dei filtri in base all'URL attuale

document.addEventListener("DOMContentLoaded", () => {
    let tm;
tm = setTimeout(() => {
    updateFilterFormSections();
}, 200);
});

const filterButton = document.querySelector('.filter-button');
const searchButton = document.querySelector('.search-button');

filterButton.addEventListener('click', () => {
    // reset the search input value
    const searchInput = document.querySelector('.movie-filter-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
});

searchButton.addEventListener('click', () => {
    // reset the filter form values
    const filterForm = document.querySelector('.filter-form');
    const searchValue = document.querySelector('.movie-filter-search-input').value;
    if (filterForm) {
        // Reset the filter form values
        filterForm.querySelector('.type-select').value = "all";
        filterForm.querySelector('.movie-genre-select').value = "all";
        filterForm.querySelector('.tv-genre-select').value = "all";
        filterForm.querySelector('.whatching-status-select').value = "all";
        filterForm.querySelector('.sort-select').value = "time_updated";
        filterForm.querySelector('.order-select').value = "asc";
        // togli dal query string i filtri
        const params = new URLSearchParams(window.location.search);
        params.delete('type');
        params.delete('movieGenres');
        params.delete('tvGenres');
        params.delete('whatchingStatus');
        params.delete('sort');
        params.delete('order');
        // Reset the search input value
        const searchInput = document.querySelector('.movie-filter-search-input');
        if (searchInput) {
            searchInput.value = searchValue; // Keep the search input value
        }
        // Update the URL with the reset filters
        history.pushState({}, '', '?' + params.toString());

        updateFilterFormSections(); // Update the sections based on the reset values
    }
});



const timeReset = document.getElementById('time-reset-span');

function updateTimeReset() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    // il reset avviene ogni 15 minuti
    let minutesLeft = 15 - currentMinute % 15 - 1; // Sottrai 1 per considerare il minuto corrente
    let secondsLeft = 60 - currentSecond;
    if (secondsLeft === 60) {
        // Se i secondi sono 60, significa che il minuto è completo, quindi decrementa i minuti
        minutesLeft += 1;
        secondsLeft = 0; // I secondi sono ora 0
    }
    // Aggiorna il contenuto del timeReset
    timeReset.textContent = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
}
updateTimeReset(); // Inizializza il timeReset al caricamento della pagina

// ogni volta che cambia il tempo, aggiorna il timeReset
setInterval(() => {
    updateTimeReset();
}, 1000); // Aggiorna ogni secondo

const statusBadge = document.getElementById('status-info');

statusBadge.addEventListener('click', () => {
    const statusInfo = document.querySelector('.status-info');
    if (statusInfo) {
        statusInfo.classList.toggle('show');
    }
});

document.addEventListener('click', (event) => {
    const statusInfo = document.querySelector('.status-info');
    if (statusInfo && !event.target.closest('.status-info') && !event.target.closest('#status-info')) {
        statusInfo.classList.remove('show');
    }
});










