const navbar = document.querySelector('.navbar');
const navbarNav = document.getElementById('navbarNav');
const navbarToggle = document.querySelector('.navbar-toggler');

if (!navbar.classList.contains('navbar-expanded')) {
    navbarNav.style.display = 'none'; // Nascondi il menu inizialmente
}

navbarToggle.addEventListener('click', () => {
    let tm;
    // Se il menu è nascosto, mostralo, altrimenti nascondilo
    if (tm) {
        clearTimeout(tm); // Pulisci il timeout se esiste
    }
    navbarNav.classList.toggle('show');
    navbar.classList.toggle('navbar-expanded');
    if (!navbar.classList.contains('show')) {
        navbarNav.style.display = 'flex';
    }
    else {
    tm = setTimeout(() => {
        navbarNav.style.display = 'none';
    }, 300); // Attendi la transizione prima di mostrare/nascondere il menu
    }
});

document.addEventListener('click', (event) => {
    if (!navbar.contains(event.target) && !navbarToggle.contains(event.target)) {
        navbarNav.classList.remove('show');
        navbar.classList.remove('navbar-expanded');
        setTimeout(() => {
        navbarNav.style.display = 'none';
        }, 300); // Attendi la transizione prima di nascondere il menu
    }
});