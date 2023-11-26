// Change the Theme for Site
const siteTheme = "pokeTheme";

const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonCard = ".pokemon-card";
const pokemonFavs = "pokemonFavorites";
const pokedexFilter = "data-filter";

const defaultPokemonImg = "./assets/images/default-pokemon.png";
const pokedexNav = document.querySelectorAll(".pokedex-navigation .type");
const pokedexGrid = document.querySelector(".pokedex-grid");
const favoritesGrid = document.querySelector(".favorites-grid");
const navigationSearch = document.querySelector(".navigation-search-wrapper");

const loadAction = "load-more";
const loadMoreBtn = document.querySelector("[data-load]");
const loaderIcon = document.querySelector(".pokedex-loader-wrapper");

const gridLoadLimit = 30;
let siteLoading = false;
let offset = 0;
let currentData;

const setSiteTheme = () => {
  const theme = localStorage.getItem("pokeTheme");
  if (!theme) {
    localStorage.setItem(siteTheme, "light");
  } else {
    changeThemedElements(theme);
  }
};

const toggleSiteTheme = () => {
  const newTheme =
    html.getAttribute("data-theme") === "light" ? "dark" : "light";

  localStorage.setItem(siteTheme, newTheme);
  changeThemedElements(newTheme);
};

const changeThemedElements = (theme) => {
  html.setAttribute("data-theme", theme);
  heroChatBox.setAttribute("src", `./assets/images/hero/chatbox-${theme}.svg`);
  waveBgImg.setAttribute("src", `./assets/images/wave-bg-${theme}.svg`);
};

const setFavsInLS = () => {
  if (!localStorage.getItem(pokemonFavs)) {
    localStorage.setItem(pokemonFavs, JSON.stringify([]));
  }
};

const removeFaves = () => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  pokemonFavsData.forEach((pokemon) => {
    removePokemonCard(pokemon);
  });
};

const removePokemonCard = (name) => {
  const card = document.querySelector(`[data-pokemon=${name}]`);
  if (!card) return;
  card.style.transform = "scale(0)";
  setTimeout(() => {
    pokedexGrid.removeChild(card);
  }, 500);
};

const togglePokemonFavorites = (target) => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));
  const status = toggleIcon(target);
  const pokemonName = target.parentElement.parentElement.dataset.pokemon;

  if (status === "favored") {
    pokemonFavsData.push(pokemonName);
  } else {
    pokemonFavsData.splice(pokemonFavsData.indexOf(pokemonName), 1);
  }
  localStorage.setItem(pokemonFavs, JSON.stringify(pokemonFavsData));
};

const placePokemonCard = async (url, destination) => {
  try {
    let res = await fetch(url);
    res = await res.json();

    const pokemonImg = getPokemonImg(
      res.sprites.other.dream_world.front_default,
      res.sprites.other["official-artwork"].front_default
    );
    const pokemonName = res.name;
    const baseHp = res.stats[0].base_stat;
    const baseAtt = res.stats[1].base_stat;
    const baseDef = res.stats[2].base_stat;
    let type1 = res.types[0].type.name;
    let type2 = res.types.length === 2 ? res.types[1].type.name : null;

    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.setAttribute("data-pokemon", pokemonName);

    const content = `
      <div class="pokemon-card">
        <div class="left">
          <div class="pokemon-img-wrapper">
            <img
              src="${pokemonImg}"
              alt="pokemon"
            />
          </div>
          <h3 class="pokemon-card-name">${titleCase(pokemonName)}</h3>
        </div>
        <div class="right stats-grid">
          <div class="icon-wrapper">
            <img src="./assets/images/stat-icons/heart.png" alt="heart" />
          </div>
          <div class="stat">${baseHp}</div>
          <div class="icon-wrapper">
            <img src="/assets/images/stat-icons/sword.png" alt="sword" />
          </div>
          <div class="stat">${baseAtt}</div>
          <div class="icon-wrapper">
            <img src="./assets/images/stat-icons/shield.png" alt="shield" />
          </div>
          <div class="stat">${baseDef}</div>
        </div>
        <div class="base">
          <div class="type type-tag" data-type="${type1}">${type1}</div>
          ${
            type2 !== null
              ? `<div class="type type-tag" data-type="${type2}">${type2}</div>`
              : ""
          }
        </div>
      </div>
      <div class="pokemon-card-tab">
        <i class="fa-regular fa-heart"></i>
      </div>`;

    gridItem.innerHTML = content;
    destination.appendChild(gridItem);
  } catch (err) {
    const errorMessage =
      "It looks like the Pokemon you have entered does not exist. Please Try again.";
    pokedexError(errorMessage);
    disableLoadMore();
    console.error(err.message);
  }
};

const resetPokedex = () => {
  pokedexGrid.innerHTML = "";
  offset = 0;
  loadMoreBtn.setAttribute("data-load", true);
};

const pokedexError = (message) => {
  pokedexGrid.innerHTML = "";
  const pokedexError = document.createElement("div");
  pokedexError.classList.add("pokedex-error-wrapper");
  pokedexError.innerHTML = `
  <div class="error-img-wrapper">
    <img src="./assets/images/error-img.svg" alt="error img" />
  </div>
  <h2>Oops Something Went Wrong</h2>
  <p>
    ${message}
  </p>`;
  pokedexGrid.appendChild(pokedexError);
};

const pokedexToType = async (type) => {
  const typeNum = pokemonTypeData[type];
  if (siteLoading || pokedexGrid.getAttribute(pokedexFilter) === type) {
    console.error(
      "Something is Loading or You Clicked the Same Type of Pokemon"
    );
    return;
  }
  startLoadSpinner();
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeNum}`);
    const data = await response.json();
    currentData = data;
    resetPokedex();
    pokedexGrid.setAttribute(pokedexFilter, type);
    await loadMoreType();
  } catch (err) {
    console.error(err.message);
    pokedexError("The Pokemon Type was unable to load.");
    stopLoadSpinner();
  }
};

const loadMoreHandler = () => {
  const currentFilter = pokedexGrid.getAttribute(pokedexFilter);

  if (loadMoreBtn.getAttribute("data-load") == "true") {
    currentFilter === "all" ? loadMoreAllTypes(gridLoadLimit) : loadMoreType();
  }
};

const loadMoreAllTypes = async (limit) => {
  if (siteLoading) return;
  startLoadSpinner();
  try {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    let response = await fetch(url);
    response = await response.json();
    for (let result of response.results) {
      await placePokemonCard(result.url, pokedexGrid);
    }
  } catch (err) {
    console.error(err.message);
    pokedexError("An unexpected error has occurred.");
  } finally {
    removeFaves();
    offset += limit;
    stopLoadSpinner();
  }
};

const loadMoreType = async () => {
  const completion = offset + gridLoadLimit;
  if (!siteLoading) startLoadSpinner();
  for (let i = offset; i < completion; i++) {
    const currentPokemon = currentData.pokemon[i];
    if (!validate(currentPokemon, loadAction)) return;
    const url = currentData.pokemon[i].pokemon.url;
    await placePokemonCard(url, pokedexGrid);
  }
  removeFaves();
  offset = completion;
  stopLoadSpinner();
};

const fetchSinglePokemon = async (pokemon, destination) => {
  const favorites = JSON.parse(localStorage.getItem(pokemonFavs));
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
  pokemon = pokemon.toLowerCase();
  startLoadSpinner();
  await placePokemonCard(url, destination);
  stopLoadSpinner();
};

const disableLoadMore = () => {
  loadMoreBtn.setAttribute("data-load", false);
};

const startLoadSpinner = () => {
  loaderIcon.setAttribute("data-visible", true);
  siteLoading = true;
};

const stopLoadSpinner = () => {
  loaderIcon.setAttribute("data-visible", false);
  siteLoading = false;
};

const toggleIcon = (icon) => {
  const regular = icon.classList.contains("fa-regular");
  icon.classList.remove(`${regular === true ? "fa-regular" : "fa-solid"}`);
  icon.classList.add(`${regular === true ? "fa-solid" : "fa-regular"}`);

  if (icon.classList.contains("fa-heart")) {
    return `${regular === true ? "favored" : "unfavored"}`;
  }
};

const toggleSearchNavigation = () => {
  const value = navigationSearch.getAttribute("data-expanded");
  navigationSearch.setAttribute(
    "data-expanded",
    value == "true" ? "false" : "true"
  );
};

const getPokemonImg = (attempt1, attempt2) => {
  if (attempt1) {
    return attempt1;
  }
  if (attempt2) {
    return attempt2;
  }
  return defaultPokemonImg;
};

const validate = (item, action) => {
  if (!item) {
    if (action === loadAction) {
      disableLoadMore();
      console.log("You have reached max load");
    }
    return false;
  } else {
    return true;
  }
};

const titleCase = (string) => {
  return string.charAt(0).toUpperCase() + string.substring(1);
};

const addGlobalEventListener = (type, selector, callback) => {
  document.addEventListener(type, (e) => {
    if (e.target.matches(selector)) callback(e);
  });
};

const onStartup = () => {
  setFavsInLS();
  setSiteTheme();
  loadMoreAllTypes(gridLoadLimit);
};

const pokemonTypeData = {
  normal: "1",
  fighting: "2",
  flying: "3",
  poison: "4",
  ground: "5",
  rock: "6",
  bug: "7",
  ghost: "8",
  steel: "9",
  fire: "10",
  water: "11",
  grass: "12",
  electric: "13",
  psychic: "14",
  ice: "15",
  dragon: "16",
  dark: "17",
  fairy: "18",
};

const attackerTypeChart = {
  normal: {
    noEffect: ["ghost"],
    weak: ["rock", "steel"],
    strong: [],
  },
  fire: {
    noEffect: [],
    weak: ["fire", "water", "rock", "dragon"],
    strong: ["grass", "ice", "bug", "steel"],
  },
  water: {
    noEffect: [],
    weak: ["water", "grass", "dragon"],
    strong: ["fire", "ground", "rock"],
  },
  electric: {
    noEffect: ["ground"],
    weak: ["electric", "grass", "dragon"],
    strong: ["water", "flying"],
  },
  grass: {
    noEffect: [],
    weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
    strong: ["water", "ground", "rock"],
  },
  ice: {
    noEffect: [],
    weak: ["water", "ice", "steel", "fire"],
    strong: ["grass", "ground", "flying", "dragon"],
  },
  fighting: {
    noEffect: ["ghost"],
    weak: ["poison", "flying", "psychic", "bug", "fairy"],
    strong: ["normal", "ice", "rock", "dark", "steel"],
  },
  poison: {
    noEffect: ["steel"],
    weak: ["poison", "ground", "rock", "ghost"],
    strong: ["grass", "fairy"],
  },
  ground: {
    noEffect: ["flying"],
    weak: ["grass", "bug"],
    strong: ["fire", "electric", "poison", "rock", "steel"],
  },
  flying: {
    noEffect: [],
    weak: ["rock", "electric", "steel"],
    strong: ["grass", "fighting", "bug"],
  },
  psychic: {
    noEffect: ["dark"],
    weak: ["psychic", "steel"],
    strong: ["poison", "fighting"],
  },
  bug: {
    noEffect: [],
    weak: ["fire", "fighting", "flying", "poison", "ghost", "steel", "fairy"],
    strong: ["dark", "psychic", "grass"],
  },
  rock: {
    noEffect: [],
    weak: ["ground", "fighting", "steel"],
    strong: ["fire", "ice", "flying", "bug"],
  },
  ghost: {
    noEffect: ["normal"],
    weak: ["steel", "dark"],
    strong: ["ghost", "psychic"],
  },
  dragon: {
    noEffect: ["fairy"],
    weak: ["steel"],
    strong: ["dragon"],
  },
  dark: {
    noEffect: [],
    weak: ["fighting", "dark", "steel", "fairy"],
    strong: ["ghost", "psychic"],
  },
  steel: {
    noEffect: [],
    weak: ["fire", "water", "steel"],
    strong: ["rock", "fairy", "ice"],
  },
  fairy: {
    noEffect: [],
    weak: ["fire", "poison", "steel"],
    strong: ["fighting", "dragon", "dark"],
  },
};

onStartup();

pokedexNav.forEach((type) => {
  type.addEventListener("click", (e) => {
    const type = e.target.getAttribute("data-type");
    if (type === "all") {
      pokedexGrid.setAttribute(pokedexFilter, "all");
      resetPokedex();
      loadMoreAllTypes(gridLoadLimit);
    } else {
      pokedexToType(type);
    }
    if (navigationSearch.getAttribute("data-expanded") === "true") {
      toggleSearchNavigation();
    }
  });
});

addGlobalEventListener("click", pokemonCard, (e) => {
  const parent = e.target.parentElement;
  const heartIcon = parent.querySelector(".fa-heart");
  const name = parent.dataset.pokemon;
  togglePokemonFavorites(heartIcon);
  removePokemonCard(name);
});

navigationSearch.addEventListener("click", () => {
  if (navigationSearch.getAttribute("data-expanded") === "false") {
    toggleSearchNavigation();
  }
});

navigationSearch.addEventListener("submit", async (event) => {
  const favorites = JSON.parse(localStorage.getItem(pokemonFavs));
  const pokemon = document.getElementById("pokemon").value;
  event.preventDefault(); // stops auto submit
  resetPokedex();
  disableLoadMore();
  await fetchSinglePokemon(pokemon, pokedexGrid);
  pokedexGrid.setAttribute(pokedexFilter, pokemon);
  navigationSearch.reset();
  const heartIcon = document.querySelector(
    `[data-pokemon=${pokemon}] .fa-heart`
  );
  if (favorites.includes(pokemon)) {
    toggleIcon(heartIcon);
  }
});

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

loadMoreBtn.addEventListener("click", loadMoreHandler);
