const siteTheme = "pokeTheme";

const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonCard = ".pokemon-card";
const pokemonFavs = "pokemonFavorites";
const pokedexFilter = "data-filter";
const pokedex = ".pokedex-grid";
const favorite = ".favorites";

const card = ".pokedex-grid-item";
const defaultPokemonImg = "./assets/images/default-pokemon.png";
const pokedexNav = document.querySelectorAll(".pokedex-navigation .type");
const pokedexGrid = document.querySelector(".pokedex-grid");
const favoritesGrid = document.querySelector(".favorites-grid");
const navigationSearch = document.querySelector(".navigation-search-wrapper");

const specialCards = ["baby", "legendary", "mythical"];

const loadAction = "load-more";
const loadMoreBtn = document.querySelector("[data-load]");
const loaderIcon = document.querySelector(".pokedex-loader-wrapper");

const sortButtons = document.querySelectorAll(".sort-btn");

const gridLoadLimit = 30;
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

const removeFaves = () => {
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));
  favoredPokemon.forEach((pokemon) => {
    removeCard(pokemon, pokedexGrid);
  });
};

const handleFavsError = () => {
  const faves = JSON.parse(localStorage.getItem(pokemonFavs));
  // throw error
  if (faves.length === 0) {
    gridError(
      "You have removed all your favorites. Why are you so mean. Go back and love those pokemon or I'll have to call the cops on you.",
      favoritesGrid
    );
  } else if (favoritesGrid.dataset.error === "true") {
    favoritesGrid.innerHTML = "";
    favoritesGrid.dataset.error = "false";
  }
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

const placePokemonCard = async (url, destination) => {
  try {
    let res = await fetch(url);
    res = await res.json();
    let species = await fetch(res.species.url);
    species = await species.json();
    const special = logSpecial(species, destination);
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

    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    if (special) pokemonCard.classList.add(special);
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
        <div class="base">
          <div class="type type-tag" data-type="${type1}">${type1}</div>
          ${
            type2 !== null
              ? `<div class="type type-tag" data-type="${type2}">${type2}</div>`
              : ""
          }
        </div>
      </div>
      <div class="card-tab">
        <i class="fa-regular fa-heart"></i>
      </div>`;

    pokemonCard.innerHTML = content;
    destination.appendChild(pokemonCard);
  } catch (err) {
    const errorMessage =
      "It looks like the Pokemon you have entered does not exist. Please Try again.";
    gridError(errorMessage, pokedexGrid);
    disableLoadMore();
    console.error(err.message);
  }
};

const logSpecial = (data, grid) => {
  let special = false;
  if (data.is_baby) special = specialCards[0];
  if (data.is_legendary) special = specialCards[1];
  if (data.is_mythical) special = specialCards[2];
  if (special) {
    changeGridStats(true, special, grid);
  }
  return special;
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
    let response = await fetch(url);
    response = await response.json();
    for (let result of response.results) {
      await placePokemonCard(result.url, pokedexGrid);
    }
  } catch (err) {
    console.error(err.message);
    gridError("An unexpected error has occurred.", pokedexGrid);
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
  await placePokemonCard(url, destination);
  stopLoadSpinner();
  const card = document.querySelector(`[data-pokemon=${pokemon}]`);
  if (favoredPokemon.includes(pokemon)) {
    toggleCardHeart(card);
  }
};

const toggleCardHeart = (card) => {
  const icon = card.querySelector(".fa-heart");
  const regularIcon = icon.classList.contains("fa-regular");
  icon.classList.remove(`${regularIcon === true ? "fa-regular" : "fa-solid"}`);
  icon.classList.add(`${regularIcon === true ? "fa-solid" : "fa-regular"}`);

  return `${regularIcon === true ? "favored" : "unfavored"}`;
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

const onStartup = async () => {
  setSiteTheme();
  loadMoreAllTypes(gridLoadLimit);
  favoritesStartup();
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

const sortCards = (deck) => {
  const deckArray = Array.from(deck.children);
  const newArr = deckArray.sort((a, b) =>
    a.dataset.pokemon.localeCompare(b.dataset.pokemon)
  );

  deck.innerHTML = "";
  newArr.forEach((card) => deck.appendChild(card));
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
    if (navigationSearch.getAttribute("data-expanded") === "true") {
      toggleSearchNavigation();
    }
    resetGridStats(pokedexGrid);
  });
});

addGlobalEventListener("click", pokemonCard, (e) => {
  clickedCardHandler(e.target);
});

navigationSearch.addEventListener("click", () => {
  if (navigationSearch.getAttribute("data-expanded") === "false") {
    toggleSearchNavigation();
  }
});

navigationSearch.addEventListener("submit", (event) => {
  const pokemon = document.getElementById("pokemon").value;
  event.preventDefault(); // stops auto submit
  resetPokedex();
  disableLoadMore();
  fetchSinglePokemon(pokemon, pokedexGrid);
  pokedexGrid.setAttribute(pokedexFilter, pokemon);
  navigationSearch.reset();
});

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

sortButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const buttonGrid = `.${e.target.parentElement.parentElement.id}-grid`;
    const gridToSort = document.querySelector(buttonGrid);
    sortCards(gridToSort);
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
