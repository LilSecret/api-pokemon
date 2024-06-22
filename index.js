const BASE_URL = "https://pokeapi.co/api/v2/";

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
    favoredPokemon.forEach(async (pokemon) => {
      const card = await buildPokemonCard(pokemon);
      toggleCardHeart(card, "favorite");
      deployInGrid(card, favoritesGrid);
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

const clickedCardHandler = async (card) => {
  const parent = card.parentElement;
  const name = card.dataset.pokemon;
  const newParent = parent.id === "pokedex-grid" ? favoritesGrid : pokedexGrid;
  const cardStatus = getCardStatus(card);

  if (cardStatus === "favorited" && parent === pokedexGrid) {
    alert(`${name} is already in your favorites`);
  } else {
    await removeCardFromGrid(name, parent);
    newParent === favoritesGrid
      ? toggleCardHeart(card, "favorite")
      : toggleCardHeart(card);
    validateGrid(parent);
    toggleInStorage(card, parent);
    deployInGrid(card, newParent);
    handleGridError(newParent);
  }
};

const removeCardFromGrid = (name, grid) => {
  const card = grid.querySelector(`[data-pokemon=${name}]`);

  if (!card) {
    console.error(
      `The Pokemon card by the name of ${name} is not in the ${grid}`
    );
    return;
  }
  updateGridStats("subtract", card.classList[1], grid);
  return new Promise((resolve) => {
    card.style.transform = "scale(0)";
    setTimeout(() => {
      grid.removeChild(card);
      resolve(card);
    }, 200);
  });
};

const deployInGrid = (card, grid) => {
  grid.appendChild(card);
  updateGridStats("add", card.classList[1], grid);
  //smooth animation
  setTimeout(() => {
    card.style.transform = "scale(1)";
  }, 100);
};

const getData = (url) => {
  return fetch(url).then((res) => res.json());
};

const buildPokemonCard = async (pokemon) => {
  const url = BASE_URL + "pokemon/" + pokemon;
  const data = await getData(url);
  const species = await getData(data.species.url);
  const rarity = getRarity(species);
  const pokemonImg = getPokemonImg(data);
  const pokemonName = data.name;
  const baseHp = data.stats[0].base_stat;
  const baseAtt = data.stats[1].base_stat;
  const baseDef = data.stats[2].base_stat;
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
  data.types.forEach((type) => {
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
  resetGridStats(pokedexGrid);
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

const validateGrid = (grid) => {
  if (grid.children.length === 0) {
    switch (grid) {
      case pokedexGrid:
        gridError(
          "Click the all tag in the navigation for more pokemon",
          pokedexGrid
        );
        break;
      case favoritesGrid:
        gridError(
          "Why don't you love Pokemon. Go love those Pokemon...",
          favoritesGrid
        );
        break;

      default:
        throw new Error(`Your ${grid} does not exist`);
    }
  }
};

const handleGridError = (grid) => {
  if (
    grid.getAttribute("data-error") === "true" &&
    grid.children.length === 2
  ) {
    grid.removeChild(grid.firstChild);
    grid.setAttribute("data-error", false);
  }
};

const pokedexToType = async (type) => {
  const typeId = pokemonTypeID[type];
  const url = BASE_URL + "type/" + typeId;
  if (siteLoading || pokedexGrid.getAttribute(pokedexFilter) === type) {
    console.error(
      "Something is Loading or You Clicked the Same Type of Pokemon"
    );
    return;
  }

  toggleLoadingSpinner(true);
  getData(url)
    .then((response) => {
      currentData = response;
      pokedexGrid.setAttribute(pokedexFilter, type);
      resetPokedex();
    })
    .then(() => {
      loadMoreType();
    })
    .catch((err) => {
      console.error(err.message);
      gridError(err.message, pokedexGrid);
    })
    .finally(() => {
      toggleLoadingSpinner(false);
    });
};

const loadMoreHandler = () => {
  const currentFilter = pokedexGrid.getAttribute(pokedexFilter);

  if (loadMoreBtn.getAttribute("data-load") == "true") {
    currentFilter === "all" ? loadMoreAllTypes(gridLoadLimit) : loadMoreType();
  }
};

const loadMoreAllTypes = async (limit) => {
  if (siteLoading) return;
  toggleLoadingSpinner(true);
  const url = `${BASE_URL}pokemon/?limit=${limit}&offset=${offset}`;

  getData(url)
    .then(async (response) => {
      const unfavoredPokemon = getUnfavoredPokemonFromAPIList(response.results);
      unfavoredPokemon.forEach(async (pokemon) => {
        const card = await buildPokemonCard(pokemon);
        deployInGrid(card, pokedexGrid);
      });
    })
    .then(() => {
      offset += limit;
    })
    .catch((err) => {
      console.error(err.message);
      gridError(err.message, pokedexGrid);
    })
    .finally(() => {
      toggleLoadingSpinner(false);
    });
};

const loadMoreType = async () => {
  const completion = offset + gridLoadLimit;
  const currentDataPokemonArray = currentData.pokemon.slice(offset, completion);
  const unfavoredPokemon = getUnfavoredPokemonFromAPIList(
    currentDataPokemonArray
  );

  if (!siteLoading) toggleLoadingSpinner(true);
  unfavoredPokemon.forEach(async (pokemon) => {
    const card = await buildPokemonCard(pokemon);
    deployInGrid(card, pokedexGrid);
  });
  offset = completion;
  toggleLoadingSpinner(false);
};

const disableLoadMore = () => {
  loadMoreBtn.setAttribute("data-load", false);
};

const toggleLoadingSpinner = (boolean) => {
  siteLoading = boolean;
  loaderIcon.setAttribute("data-visible", boolean);
};

const fetchSinglePokemon = async (pokemon, destination) => {
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));
  pokemon = pokemon.toLowerCase();
  toggleLoadingSpinner(true);
  resetGridStats(pokedexGrid);
  const card = await buildPokemonCard(pokemon);
  deployInGrid(card, pokedexGrid);
  toggleLoadingSpinner(false);
  if (favoredPokemon.includes(pokemon)) toggleCardHeart(card);
};

const toggleCardHeart = (card, favored) => {
  const icon = card.querySelector(".fa-heart");
  icon.classList.remove(
    `${favored === "favorite" ? "fa-regular" : "fa-solid"}`
  );
  icon.classList.add(`${favored === "favorite" ? "fa-solid" : "fa-regular"}`);

  return card;
};

const getCardStatus = (card) => {
  const icon = card.querySelector(".fa-heart");
  const isCardFavored = icon.classList.contains("fa-solid");

  return isCardFavored ? "favorited" : "unfavorited";
};

const toggleExpandNavSearch = () => {
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
      alert("You have loaded the rest of the Pokemon of this kind");
    }
    return false;
  } else {
    return true;
  }
};

const getUnfavoredPokemonFromAPIList = (pokemonAPIList) => {
  const favoredPokemon = JSON.parse(localStorage.getItem(pokemonFavs));
  const pokemonNamesArray = [];

  pokemonAPIList.forEach((pokemonObject) => {
    pokemonNamesArray.push(pokemonObject.name || pokemonObject.pokemon.name);
  });

  return pokemonNamesArray.filter(
    (pokemon) => !favoredPokemon.includes(pokemon)
  );
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
  await loadMoreAllTypes(gridLoadLimit);
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
  rarityTypes.forEach((rarity) => {
    const stat = parent.querySelector(`[data-type="${rarity}"]`);
    stat.innerHTML = 0;
  });
};

const updateGridStats = (add, rarityType, grid) => {
  const gridBase = grid.parentElement.querySelector(".grid-data");
  const rarityAmount = gridBase.querySelector(`[data-type="${rarityType}"]`);

  if (add === "add") {
    rarityAmount.innerHTML = +rarityAmount.innerHTML + 1;
  } else {
    rarityAmount.innerHTML = +rarityAmount.innerHTML - 1;
  }
};

const pokemonTypeID = {
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
      toggleExpandNavSearch();
    }
    resetGridStats(pokedexGrid);
  });
});

addGlobalEventListener("click", pokemonCard, (e) => {
  clickedCardHandler(e.target);
});

pokedexSearchBtn.addEventListener("click", () => {
  if (pokedexSearchBtn.getAttribute("data-expanded") === "false") {
    toggleExpandNavSearch();
  }
});

pokedexSearchBtn.addEventListener("submit", (event) => {
  event.preventDefault();
  const inputValue = document.getElementById("pokemon").value;
  if (inputValue.length > 3) {
    const pokemonNames = validatePokemonName(inputValue);
    if (pokemonNames) {
      resetPokedex();
      disableLoadMore();
      pokedexGrid.setAttribute(pokedexFilter, "custom");
      pokemonNames.forEach(async (name) => {
        const card = await buildPokemonCard(name);
        deployInGrid(card, pokedexGrid);
      });
      pokedexSearchBtn.reset();
    }
  }
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
