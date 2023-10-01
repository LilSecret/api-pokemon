const themeTab = document.getElementById("theme-tab");
const themeTabIcon = themeTab.querySelector("i");

// const pokemonCards = document.querySelectorAll(".pokemon-card");
// const pokemonCardFavTab = document.querySelector(".favorite-tab");

const html = document.querySelector("html");
// const documentTheme = html.getAttribute("data-theme");

const toggleTheme = () => {
  const documentTheme = html.getAttribute("data-theme");
  const newTheme = documentTheme === "light" ? "dark" : "light";
  const oldTheme = newTheme === "dark" ? "light" : "dark";

  // change Theme on document
  html.setAttribute("data-theme", newTheme);

  // update themeTab position
  themeTab.classList.toggle(`theme-${oldTheme}`);
  themeTab.classList.toggle(`theme-${newTheme}`);

  // update themeTab icon
  themeTabIcon.className = `fa-solid fa-${
    newTheme === "light" ? "sun" : "moon"
  }`;
};

themeTab.addEventListener("click", toggleTheme);

// pokemonCards.forEach((card) => {
//   card.addEventListener("mouseover", () => {
//     pokemonCardFavTab.classList.add("active");
//   });
// });

// pokemonCards.addEventListener("mouseover", () => {
//   pokemonCardFavTab.classList.add
// });
