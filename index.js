const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

const siteTheme = "pokeTheme";

const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonCard = ".pokemon-card";
const pokemonFavs = "pokemonFavorites";
const pokedexFilter = "data-filter";

const defaultPokemonImg = "./assets/images/default-pokemon.png";
const pokedexNav = document.querySelectorAll(".pokedex-tag-list .type-tag");
const pokedexGrid = document.querySelector(".pokedex-grid");
const favoritesGrid = document.querySelector(".favorites-grid");
const pokedexSearchBtn = document.querySelector(".pokedex-search-button");

const rarityTypes = ["common", "baby", "legendary", "mythical"];

const loadAction = "load-more";
const loadMoreBtn = document.querySelector("[data-load]");
const loaderIcon = document.querySelector(".pokedex-loader");

const sortButtons = document.querySelectorAll(".sort-btn");

const gridLoadLimit = 30;
let cardsLoaded = [];
let siteLoading = false;
let offset = 0;
let currentData;

const modalBackdrop = document.querySelector(".modal-backdrop");

const setSiteTheme = () => {
  const theme = localStorage.getItem("pokeTheme");
  if (!theme) {
    localStorage.setItem(siteTheme, "light");
  } else {
    if (theme === "dark") {
      themeBtn.checked = true;
    }
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
  waveBgImg.setAttribute("src", `./assets/images/wave-${theme}-sm.svg`);
  waveBgImg.setAttribute(
    "srcset",
    `./assets/images/wave-${theme}-sm.svg  630w,
    ./assets/images/wave-${theme}-md.svg 1260w,
    ./assets/images/wave-${theme}-lg.svg 1890w`
  );
};

const favoritesStartup = () => {
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));

  if (!favoredPokemon || favoredPokemon.length === 0) {
    localStorage.setItem(pokemonFavs, JSON.stringify([]));
    gridError(
      "You haven't favored any pokémon. Scroll up to the pokedex and select your favorite pokémon.",
      favoritesGrid
    );
  } else {
    favoredPokemon.forEach((pokemon) => {
      fetchSinglePokemon(pokemon, favoritesGrid);
    });
  }
};

const handleFavsError = () => {
  const faves = JSON.parse(localStorage.getItem(pokemonFavs));
  // throw error
  if (faves.length === 0) {
    gridError(
      "Why don't you love Pokemon. Go love those Pokemon...",
      favoritesGrid
    );
  } else if (favoritesGrid.dataset.error === "true") {
    favoritesGrid.innerHTML = "";
    favoritesGrid.dataset.error = "false";
  }
};

const removeFaves = () => {
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));
  favoredPokemon.forEach((pokemon) => {
    removeCard(pokemon, pokedexGrid);
  });
};

const toggleInStorage = (card, parent) => {
  const name = card.dataset.pokemon;
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));
  if (parent.id === "pokedex-grid") {
    favoredPokemon.push(name);
  } else {
    favoredPokemon.splice(favoredPokemon.indexOf(name), 1);
  }
  localStorage.setItem(pokemonFavs, JSON.stringify(favoredPokemon));
};

const clickedCardHandler = (card) => {
  const parent = card.parentElement;
  const name = card.dataset.pokemon;
  const newParent = parent.id === "pokedex-grid" ? favoritesGrid : pokedexGrid;
  removeCard(name, parent);
  toggleInStorage(card, parent);
  //smooth animation
  setTimeout(() => {
    handleFavsError();
    deployInGrid(card, newParent);
  }, 500);
};

const removeCard = (name, grid) => {
  const card = grid.querySelector(`[data-pokemon=${name}]`);
  if (!card) return; // wasn't fetched in pokedex
  if (card.classList[1]) changeGridStats(false, card.classList[1], grid);
  card.style.transform = "scale(0)";
  //smooth animation
  setTimeout(() => {
    grid.removeChild(card);
  }, 200);
};

const deployInGrid = (card, grid) => {
  grid.appendChild(card);
  toggleCardHeart(card);
  if (card.classList[1]) {
    changeGridStats(true, card.classList[1], grid);
  }
  //smooth animation
  setTimeout(() => {
    card.style.transform = "scale(1)";
  }, 100);
};

const getData = (url) => {
  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.error(err.message));
};

const buildPokemonCard = async (url) => {
  const pokemon = await getData(url);
  const species = await getData(pokemon.species.url);
  const rarity = getRarity(species);
  const pokemonImg = getPokemonImg(pokemon);
  const pokemonName = pokemon.name;
  const baseHp = pokemon.stats[0].base_stat;
  const baseAtt = pokemon.stats[1].base_stat;
  const baseDef = pokemon.stats[2].base_stat;
  const pokemonCard = document.createElement("div");

  pokemonCard.classList.add("pokemon-card");
  pokemonCard.classList.add(rarity);
  pokemonCard.setAttribute("data-pokemon", pokemonName);

  const content = `
    <div class="card-body">
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
      <div class="base"></div>
    </div>
    <div class="card-tab">
      <i class="fa-regular fa-heart"></i>
    </div>`;

  pokemonCard.innerHTML = content;
  pokemon.types.forEach((type) => {
    const name = type.type.name;
    const cardBase = pokemonCard.querySelector(".base");
    const typeDiv = `<div class="type-tag" data-type="${name}">${name}</div>`;
    cardBase.innerHTML += typeDiv;
  });
  return pokemonCard;
};

const getRarity = (data) => {
  if (data.is_baby) return rarityTypes[1];
  if (data.is_legendary) return rarityTypes[2];
  if (data.is_mythical) return rarityTypes[3];
  return rarityTypes[0];
};

const resetPokedex = () => {
  pokedexGrid.innerHTML = "";
  offset = 0;
  loadMoreBtn.setAttribute("data-load", true);
};

const gridError = (message, grid) => {
  grid.innerHTML = "";
  grid.setAttribute("data-error", "true");
  const errorWrapper = document.createElement("div");
  errorWrapper.classList.add("error-wrapper");
  errorWrapper.innerHTML = `
  <div class="error-img-wrapper">
    <img src="./assets/images/error-img.svg" alt="error img" />
  </div>
  <h2>Oops Something Went Wrong</h2>
  <p>
    ${message}
  </p>`;
  grid.appendChild(errorWrapper);
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
    gridError("The Pokemon Type was unable to load.", pokedexGrid);
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
    let response = getData(url);
    for (let result of response.results) {
      const card = await buildPokemonCard(result.url);
      cardsLoaded.push(card);
    }
  } catch (err) {
    console.error(err.message);
    gridError("An unexpected error has occurred.", pokedexGrid);
  } finally {
    // TODO: pull all cards to grid
    // TODO: empty loadedCards
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
    if (!validateMorePokemon(currentPokemon, loadAction)) return;
    const url = currentData.pokemon[i].pokemon.url;
    const card = await buildPokemonCard(url);
    cardsLoaded.push(card);
  }
  removeFaves();
  // TODO: add loaded cards
  // TODO: empty loaded cards array
  offset = completion;
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

const fetchSinglePokemon = async (pokemon, destination) => {
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
  pokemon = pokemon.toLowerCase();
  startLoadSpinner();
  resetGridStats(pokedexGrid);
  const card = await buildPokemonCard(url);
  cardsLoaded.push(card);
  stopLoadSpinner();
  if (favoredPokemon.includes(pokemon)) toggleCardHeart(card);
  // TODO: add loaded cards
  // TODO: empty load cards array
};

const toggleCardHeart = (card) => {
  const icon = card.querySelector(".fa-heart");
  const regularIcon = icon.classList.contains("fa-regular");
  icon.classList.remove(`${regularIcon === true ? "fa-regular" : "fa-solid"}`);
  icon.classList.add(`${regularIcon === true ? "fa-solid" : "fa-regular"}`);

  return `${regularIcon === true ? "favored" : "unfavored"}`;
};

const toggleSearchNavigation = () => {
  const value = pokedexSearchBtn.getAttribute("data-expanded");
  pokedexSearchBtn.setAttribute(
    "data-expanded",
    value == "true" ? "false" : "true"
  );
};

const getPokemonImg = (data) => {
  const img =
    data.sprites.other.dream_world.front_default ||
    data.sprites.other["official-artwork"].front_default;
  return img ? img : defaultPokemonImg;
};

const validateMorePokemon = (item, action) => {
  if (!item) {
    if (action === loadAction) {
      disableLoadMore();
      alert("You have loaded the rest of the Pokemon");
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

const onStartup = async () => {
  const url = `https://pokeapi.co/api/v2/pokemon/bulbasaur`;
  const card = await buildPokemonCard(url);
  pokedexGrid.appendChild(card);
  // FIXME: setSiteTheme();
  // FIXME: loadMoreAllTypes(gridLoadLimit);
  // FIXME: favoritesStartup();
};

const closeModal = (modal) => {
  modal.classList.remove("active");
  modalBackdrop.classList.remove("active");
  // if modal id is inside navigation
  if (modal.classList.contains("nav-modal")) {
    const activeLink = document.querySelector(".nav-item.active");
    activeLink.classList.remove("active");
  }
};

const openModal = (modalBtn) => {
  let modal = modalBtn.getAttribute("data-modal");
  modal = document.querySelector(`#${modal}`);

  modal.classList.add("active");
  modalBackdrop.classList.add("active");

  if (modalBtn.classList.contains("nav-item")) {
    modalBtn.classList.add("active");
  }
};

const toggleSortCards = (button, deck) => {
  const deckArray = Array.from(deck.children);
  const newHTML = button.innerHTML === "A-Z" ? "Z-A" : "A-Z";
  const newArray =
    button.innerHTML === "A-Z"
      ? deckArray.sort((a, b) =>
          a.dataset.pokemon.localeCompare(b.dataset.pokemon)
        )
      : deckArray.sort((a, b) =>
          b.dataset.pokemon.localeCompare(a.dataset.pokemon)
        );

  deck.innerHTML = "";
  button.innerHTML = newHTML;
  newArray.forEach((card) => deck.appendChild(card));
};

const resetGridStats = (grid) => {
  const parent = grid.parentElement;
  specialCards.forEach((special) => {
    const stat = parent.querySelector(`[data-type="${special}"]`);
    stat.innerHTML = 0;
  });
};

const changeGridStats = (add, special, grid) => {
  const base = grid.parentElement.querySelector(".grid-data");
  const specialAmount = base.querySelector(`[data-type="${special}"]`);
  add
    ? (specialAmount.innerHTML = +specialAmount.innerHTML + 1)
    : (specialAmount.innerHTML = +specialAmount.innerHTML - 1);
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
    if (pokedexSearchBtn.getAttribute("data-expanded") === "true") {
      toggleSearchNavigation();
    }
    resetGridStats(pokedexGrid);
  });
});

addGlobalEventListener("click", pokemonCard, (e) => {
  clickedCardHandler(e.target);
});

pokedexSearchBtn.addEventListener("click", () => {
  if (pokedexSearchBtn.getAttribute("data-expanded") === "false") {
    toggleSearchNavigation();
  }
});

pokedexSearchBtn.addEventListener("submit", (event) => {
  const pokemon = document.getElementById("pokemon").value;
  event.preventDefault();
  resetPokedex();
  disableLoadMore();
  fetchSinglePokemon(pokemon, pokedexGrid);
  pokedexGrid.setAttribute(pokedexFilter, pokemon);
  pokedexSearchBtn.reset();
});

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

sortButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const button = e.target;
    const buttonsGrid = `.${button.parentElement.parentElement.id}-grid`;
    const gridToSort = document.querySelector(buttonsGrid);
    toggleSortCards(button, gridToSort);
  });
});

loadMoreBtn.addEventListener("click", loadMoreHandler);

addGlobalEventListener("click", "[data-exit]", (e) => {
  const openedModal = document.querySelector(".modal.active");
  closeModal(openedModal);
});

addGlobalEventListener("click", "[data-modal]", (e) => {
  openModal(e.target);
});
