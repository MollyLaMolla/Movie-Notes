// Prendi il numero totale di pagine dall'attributo data-totalPages del container
const totalPages = document.getElementById("data-container").getAttribute("data-totalPages") || 1;
//console.log(`Total pages dal server: ${totalPages}`);

function getMaxPages() {
    if (window.innerWidth > 1200) {
        return 5; // Desktop grande
    } else if (window.innerWidth > 768) {
        return 3; // Tablet o laptop
    } else {
        return 2; // Mobile
    }
}

function generatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = ""; // Pulisce la paginazione esistente

    const maxPages = getMaxPages(); // Determina maxPages in base allo schermo
    console.log(`Max pages: ${maxPages}, Current page: ${currentPage}, Total pages: ${totalPages}`);

    // Bottone "Previous"
    if (currentPage > 1) {
        const prevButton = document.createElement("p");
        prevButton.className = "pagination-link previous-page";
        prevButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>`;
        addClickEventToPaginationButtons(prevButton);
        paginationContainer.appendChild(prevButton);
    }

    // Bottone "1" se necessario
    if (currentPage > maxPages + 1) {
        const firstPage = document.createElement("p");
        firstPage.className = "pagination-link first-page";
        firstPage.textContent = "1";
        addClickEventToPaginationButtons(firstPage);
        paginationContainer.appendChild(firstPage);
    }

    // Generazione dei numeri di pagina dinamici
    for (let i = currentPage - maxPages; i <= currentPage + maxPages && i <= totalPages; i++) {
        if (i < 1) continue; // Salta pagine non valide
        if (i >= totalPages && i > currentPage) continue; // Salta pagine oltre il totale
        console.log(`Adding page button for page: ${i}`);
        const pageElement = document.createElement("p");
        pageElement.className = `pagination-link page ${currentPage === i ? "active" : ""} ${i === 1 ? "first-page" : ""} ${i === totalPages ? "last-page" : ""}`;
        pageElement.textContent = i;
        addClickEventToPaginationButtons(pageElement);
        paginationContainer.appendChild(pageElement);
    }

    // Bottone ultima pagina se necessario
    if (currentPage < totalPages) {
        const lastPage = document.createElement("p");
        lastPage.className = "pagination-link last-page";
        lastPage.textContent = totalPages;
        addClickEventToPaginationButtons(lastPage);
        paginationContainer.appendChild(lastPage);
    }

    // Bottone "Next"
    if (currentPage < totalPages) {
        const nextButton = document.createElement("p");
        nextButton.className = "pagination-link next-page";
        nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>`;
        addClickEventToPaginationButtons(nextButton);
        paginationContainer.appendChild(nextButton);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const currentPage = parseInt(window.location.pathname.split('/').pop()) || 1;
    generatePagination(currentPage, totalPages);
});

window.addEventListener("resize", () => {
    const currentPage = parseInt(window.location.pathname.split('/').pop()) || 1;
    generatePagination(currentPage, totalPages);
});

window.addEventListener("load", () => {
    //console.log("Page loaded, generating pagination...");
    const currentPage = parseInt(window.location.pathname.split('/').pop()) || 1;
    generatePagination(currentPage, totalPages);
});
// event listener per quando vai avanti o indietro con le pagine
window.addEventListener("popstate", () => {
    setTimeout(() => {
    //console.log("Popstate event triggered, generating pagination...");
    const currentPage = parseInt(window.location.pathname.split('/').pop()) || 1;
    generatePagination(currentPage, totalPages);
    }, 1000);
});

function addClickEventToPaginationButtons(button) {
    button.addEventListener('click', (event) => {
        // Salva l'URL attuale
        const currentUrl = new URL(window.location.href);

        // Estrai la pagina attuale dall'URL (ultimo segmento)
        let currentPage = parseInt(currentUrl.pathname.split('/').pop()) || 1;

        // Ottieni il valore del pulsante cliccato
        let pageValue = button.textContent.trim();

        if (pageValue === undefined || pageValue === '') {
            const isItPrivious = button.classList.contains('previous-page');
            if (isItPrivious) {
                pageValue = currentPage - 1;
            }
            const isItNext = button.classList.contains('next-page');
            if (isItNext) {
                pageValue = currentPage + 1;
            }
        }
        // Aggiorna il pathname per modificare direttamente l'URL
        currentUrl.pathname = `/movies/${pageValue}`;

        // Aggiorna l'URL della pagina
        window.location.href = currentUrl.toString();

        // Previene il comportamento predefinito del link
        event.preventDefault();
    });
}
