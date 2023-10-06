const body = document.querySelector("body");

const themeTab = document.querySelector("#theme-btn");

// const pokemonCards = document.querySelectorAll(".pokemon-card");
// const pokemonCardFavTab = document.querySelector(".favorite-tab");

const html = document.querySelector("html");

const toggleSiteTheme = () => {
  const documentTheme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", documentTheme === "light" ? "dark" : "light");
};

themeTab.addEventListener("click", function (e) {
  toggleSiteTheme();
});
