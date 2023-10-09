const body = document.querySelector("body");

const themeTab = document.querySelector("#theme-btn");

const pokemonHeartIcons = document.querySelectorAll(".favorite-tab i");

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

pokemonHeartIcons.forEach((heart) => {
  heart.addEventListener("click", (e) => {
    e.target.style.animation = "heartBounce 500ms ease";
    setTimeout(() => {
      e.target.style.removeProperty("animation");
    }, 550);
    // console.log(e.target);
  });
});
