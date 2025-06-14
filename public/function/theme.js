const theme = localStorage.getItem('theme') || 'light';
const themeToggle = document.getElementById("theme-toggle");
function setTheme(newTheme) {
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
        themeToggle.classList.add("dark");
        themeToggle.classList.remove("light");
        const drksvg = themeToggle.querySelector(".dark-mode-svg");
        const lhtsvg = themeToggle.querySelector(".light-mode-svg");
        lhtsvg.classList.add("hidden");
        drksvg.classList.remove("hidden");
    }else {
        themeToggle.classList.add("light");
        themeToggle.classList.remove("dark");
        const lhtsvg = themeToggle.querySelector(".light-mode-svg");
        const drksvg = themeToggle.querySelector(".dark-mode-svg");
        drksvg.classList.add("hidden");
        lhtsvg.classList.remove("hidden");
    }
}


    setTheme(theme);
    
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
