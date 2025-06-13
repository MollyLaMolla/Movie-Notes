let screenWidth = window.innerWidth;
let mouseX = window.innerWidth / 2; // Initialize mouseX to the center of the screen
let smoothMouseX = mouseX; // Smooth mouse position for animation

// update the screen width on resize
window.addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    createDivs(); // Recreate divs on resize
});

function createDivs(){
    const container = document.querySelector('.header-animation');
    const divCount = Math.floor(screenWidth / 7); // Number of divs based on screen width
    container.innerHTML = ''; // Clear existing divs

    for (let i = 0; i < divCount; i++) {
        const div = document.createElement('div');
        div.className = 'header-animation-div';
        div.classList.add(`div-${i}`); // Add a unique class for each div
        div.style.animationDelay = `-${i * 0.1}s`; // Stagger the animation delay
        container.appendChild(div);
    }
}

createDivs(); // Recreate divs

// animate the divs with mouse x position
// document.addEventListener('mousemove', function(event) {
//     mouseX = event.clientX;
// });


// function updateWave() {
//     smoothMouseX += (mouseX - smoothMouseX) * 0.1; // Smorza il movimento
//     const maxHeight = 96;
//     const minHeight = 12;
//     const center = smoothMouseX / 7;
//     const range = 18;
//     const divCount = Math.floor(screenWidth / 7);

//     for (let i = 0; i < divCount; i++) {
//         const div = document.getElementsByClassName(`div-${i}`)[0];
//         if (div) {
//             let distance = Math.abs(center - i);

//             if (distance <= range) {
//                 // 🔹 Usa `Math.pow()` per una transizione più graduale e smussata
//                 let waveHeight = (1 - Math.pow(distance / range, 2)) * (maxHeight - minHeight);
//                 let finalHeight = minHeight + Math.max(0, waveHeight); // Assicura che non scenda sotto il minHeight

//                 div.style.height = `${Math.round(finalHeight)}px`;
//             } else {
//                 div.style.height = `${minHeight}px`;
//             }
//         }
//     }
//     requestAnimationFrame(updateWave);
// }

// Start the wave animation
// updateWave(); // Start the wave animation

// event listener per qualdo il muose esce dalla finestra


// const divs = document.querySelectorAll('.header-animation-div');
// divs.forEach(div => {
//     div.addEventListener("transitionend", function() {
//         div.style.transitionDuration = "0s"; // Disable transition after the first animation
//     }
//     );
// });
    
    




