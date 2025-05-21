const stars = document.getElementById("stars");
const fullStars = document.getElementById("full-stars");
const halfStars = document.getElementById("half-stars");
const emptyStars = document.getElementById("empty-stars");

function createStars(vote) {
    let fullStarCount = Math.round(vote*2) / 2; // Arrotonda a 0.5
    let emptyStarCount;
    let halfStarCount = 0;
    if (fullStarCount % 1 !== 0) {
        halfStarCount = 1;
        fullStarCount = Math.floor(fullStarCount);
        emptyStarCount = 10 - fullStarCount - halfStarCount;
    }
    else {
        emptyStarCount = 10 - fullStarCount;
    }
    fullStars.innerHTML = "";
    halfStars.innerHTML = "";
    emptyStars.innerHTML = "";
    for (let i = 0; i < fullStarCount; i++) {
        fullStars.innerHTML += `<svg height="189px" width="189px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-5.39 -5.39 64.65 64.65" xml:space="preserve" fill="#000000" stroke="#000000" stroke-width="0.00053867"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.107734"></g><g id="SVGRepo_iconCarrier"> <polygon style="fill:#EFCE4A;" points="26.934,1.318 35.256,18.182 53.867,20.887 40.4,34.013 43.579,52.549 26.934,43.798 10.288,52.549 13.467,34.013 0,20.887 18.611,18.182 "></polygon> </g></svg>`;
    }                        
    for (let i = 0; i < halfStarCount; i++) {
        halfStars.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="m606-286-33-144 111-96-146-13-58-136v312l126 77ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" fill="gold"/></svg>`;
    }
    for (let i = 0; i < emptyStarCount; i++) {
        emptyStars.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/></svg>`;
    }
}

createStars(document.getElementById('vote-avg-num').textContent);