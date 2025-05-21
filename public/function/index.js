document.querySelector(`.type-select`).addEventListener("change", function() {
    filterTypeChange.call(this);
});

filterTypeChange.call(document.querySelector(`.type-select`));

function filterTypeChange() {
    const selectedValue = this.value;
    if (selectedValue === "movie") {
        document.getElementsByClassName('movie-genre-select')[0].classList.remove('no-display');
        document.getElementsByClassName('tv-genre-select')[0].classList.add('no-display');
    } else if (selectedValue === "tv") {
        document.getElementsByClassName('movie-genre-select')[0].classList.add('no-display');
        document.getElementsByClassName('tv-genre-select')[0].classList.remove('no-display');
    } else {
        document.getElementsByClassName('movie-genre-select')[0].classList.add('no-display');
        document.getElementsByClassName('tv-genre-select')[0].classList.add('no-display');
    }
}




