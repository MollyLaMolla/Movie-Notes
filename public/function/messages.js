const errorBox = document.getElementById('error-message');
const successBox = document.getElementById('success-message');

if (errorBox) {
    setTimeout(() => {
        errorBox.style.opacity = '0';
        errorBox.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            errorBox.parentElement.style.display = 'none';
        }, 500); // Tempo di transizione
    }, 2000);
}

if (successBox) {
    setTimeout(() => {
        successBox.style.opacity = '0';
        successBox.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            successBox.parentElement.style.display = 'none';
        }, 500); // Tempo di transizione
    }
    , 2000);
}

