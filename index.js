const html = document.querySelector("html");
const themeTab = document.querySelector("#theme-btn");

const pokemonDeck = document.querySelectorAll(".pokemon-card");
const pokemonFavs = "pokemonFavorites";
const pokemonHeartIcons = document.querySelectorAll(".favorite-tab i");

const toggleSiteTheme = () => {
  const documentTheme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", documentTheme === "light" ? "dark" : "light");
};

const togglePokemonFavorites = (target) => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  const status = toggleIcon(target);
  const pokemonName = target.parentElement.parentElement.querySelector(
    ".card-content .pokemon-name"
  ).innerHTML;

  if (status === "favored") {
    pokemonFavsData.push(pokemonName);
  } else {
    pokemonFavsData.splice(pokemonFavsData.indexOf(pokemonName), 1);
  }
  localStorage.setItem(pokemonFavs, JSON.stringify(pokemonFavsData));
};

const toggleIcon = (target) => {
  // remove old class
  const notFavorite = target.classList.contains("fa-regular");
  target.classList.remove(
    `${notFavorite === true ? "fa-regular" : "fa-solid"}`
  );
  // add new class
  target.classList.add(`${notFavorite === true ? "fa-solid" : "fa-regular"}`);
  return `${notFavorite === true ? "favored" : "unfavored"}`;
};

const updateHeartIcons = () => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  for (let pokemon of pokemonFavsData) {
    for (let pokemonCard of pokemonDeck) {
      const icon = pokemonCard.querySelector(".favorite-tab i");
      if (pokemonCard.querySelector(".pokemon-name").innerHTML === pokemon) {
        toggleIcon(icon);
      }
    }
  }
};

const heartAnimation = (target) => {
  target.style.animation = "heartBounce 500ms ease";
  setTimeout(() => {
    target.style.removeProperty("animation");
  }, 550);
};

const setPokemonFavs = () => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  if (!localStorage.getItem(pokemonFavs)) {
    localStorage.setItem(pokemonFavs, JSON.stringify([]));
  } else {
    updateHeartIcons();
  }
};

setPokemonFavs();

themeTab.addEventListener("click", function (e) {
  toggleSiteTheme();
});

pokemonHeartIcons.forEach((heart) => {
  heart.addEventListener("click", (e) => {
    heartAnimation(e.target);
    togglePokemonFavorites(e.target);
  });
});
