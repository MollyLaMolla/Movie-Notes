const allowed = document.getElementById("personal-overview").hasAttribute("not-allowed");

document.addEventListener("DOMContentLoaded", function () {
    if (allowed) {
        const popup = document.createElement("div");
        const personalOverview = document.getElementById("personal-overview");
        popup.className = "not-allowed-popup not-visible";
        popup.innerHTML = `<p>Sorry, only the admins can change the personal overview.</p>`;
        document.body.appendChild(popup);
        
        personalOverview.addEventListener("mouseenter", function (){
            popup.classList.remove("not-visible");
            personalOverview.classList.add("hovered");
            window.addEventListener("mousemove", function (event) {
                if (popup && !popup.classList.contains("not-visible")) {
                    popup.style.left = (event.pageX) + "px";
                    popup.style.top = (event.pageY - 30) + "px";
                }
            });
        });
    
        personalOverview.addEventListener("mouseout", function (){
            popup.classList.add("not-visible");
            personalOverview.classList.remove("hovered");
        }); 
    }
});

