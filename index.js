const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");

const pokemonFavs = "pokemonFavorites";
const pokemonCardTab = ".pokemon-card-tab";
const pokemonCardName = ".pokemon-card-name";
const pokemonDeck = document.querySelectorAll(".pokedex-grid-item");
const pokemonHeartIcons = document.querySelectorAll(".pokemon-card-tab i");

const pokemonType = ".type";
const pokemonTypes = document.querySelectorAll(pokemonType);

const toggleSiteTheme = () => {
  const documentTheme = html.getAttribute("data-theme");
  const theme = documentTheme === "light" ? "dark" : "light";
  html.setAttribute("data-theme", theme);

  waveBgImg.setAttribute("src", `./assets/images/wave-bg-${theme}.svg`);
};

const togglePokemonFavorites = (target) => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  const status = toggleIcon(target);
  const pokemonName =
    target.parentElement.parentElement.querySelector(pokemonCardName).innerHTML;

  if (status === "favored") {
    pokemonFavsData.push(pokemonName);
  } else {
    pokemonFavsData.splice(pokemonFavsData.indexOf(pokemonName), 1);
  }
  localStorage.setItem(pokemonFavs, JSON.stringify(pokemonFavsData));
};

const toggleIcon = (icon) => {
  const regular = icon.classList.contains("fa-regular");
  icon.classList.remove(`${regular === true ? "fa-regular" : "fa-solid"}`);
  icon.classList.add(`${regular === true ? "fa-solid" : "fa-regular"}`);

  if (icon.classList.contains("fa-heart")) {
    return `${regular === true ? "favored" : "unfavored"}`;
  }
};

const updateHeartIcons = () => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  const pokemonName = document.querySelector(pokemonCardName);
  for (let pokemon of pokemonFavsData) {
    for (let pokemonCard of pokemonDeck) {
      const icon = pokemonCard.querySelector(`${pokemonCardTab} i`);
      if (pokemonName.innerHTML === pokemon) {
        toggleIcon(icon);
      }
    }
  }
};

const bounceAnimation = (target) => {
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

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

pokemonHeartIcons.forEach((heart) => {
  heart.addEventListener("click", (e) => {
    bounceAnimation(e.target);
    togglePokemonFavorites(e.target);
    console.log(e.target);
  });
});

pokemonTypes.forEach((type) => {
  const typeClass = type.className;
  const pokemonType = typeClass.slice(10, typeClass.length);
  type.style.backgroundColor = `var(--${pokemonType})`;
});
