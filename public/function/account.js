const updateNameBtn = document.getElementById('update-name-btn');
const updatePasswordBtn = document.getElementById('update-password-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const updateNameContainer = document.getElementsByClassName('update-name-container-centerer')[0];
const updatePasswordContainer = document.getElementsByClassName('update-password-container-centerer')[0];
const deleteAccountContainer = document.getElementsByClassName('delete-account-container-centerer')[0];
const blurBackground = document.getElementsByClassName('background-blur')[0];
const closeIcon = document.querySelectorAll('.close-icon');


updateNameBtn.addEventListener('click', () => {
    updateNameContainer.classList.remove('no-display');
    blurBackground.classList.remove('no-display');
});

updatePasswordBtn.addEventListener('click', () => {
    updatePasswordContainer.classList.remove('no-display');
    blurBackground.classList.remove('no-display');
});

deleteAccountBtn.addEventListener('click', () => {
    deleteAccountContainer.classList.remove('no-display');
    blurBackground.classList.remove('no-display');
});

closeIcon.forEach(icon => {
    icon.addEventListener('click', () => {
        updateNameContainer.classList.add('no-display');
        updatePasswordContainer.classList.add('no-display');
        deleteAccountContainer.classList.add('no-display');
        blurBackground.classList.add('no-display');
    });
});

