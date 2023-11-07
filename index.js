const siteTheme = "pokeTheme";
const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonFavs = "pokemonFavorites";
const pokedexFilter = "data-filter";
const defaultPokemonImg = "./assets/images/default-pokemon.png";
const pokedexGrid = document.querySelector(".pokedex-grid");
const pokedexNav = document.querySelectorAll(".pokedex-navigation .type");

const loadAction = "load-more";
const loadMoreBtn = document.querySelector("[data-load]");
const loaderIcon = document.querySelector(".pokedex-loader-wrapper");

const gridLoadLimit = 30;
let loading = false;
let offset = 0;
let currentData;

const toggleSiteTheme = () => {
  const newTheme =
    html.getAttribute("data-theme") === "light" ? "dark" : "light";

  localStorage.setItem(siteTheme, newTheme);
  changeThemedElements(newTheme);
};

const setSiteTheme = () => {
  const theme = localStorage.getItem("pokeTheme");
  if (!theme) {
    localStorage.setItem(siteTheme, "light");
  } else {
    changeThemedElements(theme);
  }
};

const changeThemedElements = (theme) => {
  html.setAttribute("data-theme", theme);
  heroChatBox.setAttribute("src", `./assets/images/chatbox-${theme}.svg`);
  waveBgImg.setAttribute("src", `./assets/images/wave-bg-${theme}.svg`);
};

const buildPokemonCard = async (url) => {
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
    gridItem.classList.add("pokedex-grid-item");
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
          <div class="type" data-type="${type1}">${type1}</div>
          ${
            type2 !== null
              ? `<div class="type" data-type="${type2}">${type2}</div>`
              : ""
          }
        </div>
      </div>
      <div class="pokemon-card-tab">
        <i class="fa-regular fa-heart"></i>
      </div>`;

    gridItem.innerHTML = content;
    pokedexGrid.appendChild(gridItem);
  } catch (err) {
    console.log(err.message);
  }
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

const loadMoreAllTypes = async (limit) => {
  if (loading) return;
  toggleLoader();
  try {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    let response = await fetch(url);
    response = await response.json();
    for (let result of response.results) {
      await buildPokemonCard(result.url);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setPokemonFavs();
    offset += limit;
    toggleLoader();
  }
};

const validate = (item, action) => {
  if (!item) {
    if (action === loadAction) {
      disableLoadMore();
      console.log("max pokemon reached");
    }
    return false;
  } else {
    return true;
  }
};

const disableLoadMore = () => {
  loadMoreBtn.setAttribute("data-load", false);
};

const resetPokedex = () => {
  pokedexGrid.innerHTML = "";
  offset = 0;
  loadMoreBtn.setAttribute("data-load", true);
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

const toggleIcon = (icon) => {
  const regular = icon.classList.contains("fa-regular");
  icon.classList.remove(`${regular === true ? "fa-regular" : "fa-solid"}`);
  icon.classList.add(`${regular === true ? "fa-solid" : "fa-regular"}`);

  if (icon.classList.contains("fa-heart")) {
    return `${regular === true ? "favored" : "unfavored"}`;
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
    pokemonFavsData.forEach((pokemon) => {
      const icon = document.querySelector(`[data-pokemon=${pokemon}] i`);
      if (!icon || icon.classList.contains("fa-solid")) {
        return;
      } else {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }
    });
  }
};

const pokedexToType = async (type) => {
  const typeNum = pokemonTypeData[type];
  if (loading || pokedexGrid.getAttribute(pokedexFilter) === type) {
    console.error(
      "Something is Loading or You Clicked the Same Type of Pokemon"
    );
    return;
  }
  toggleLoader();
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeNum}`);
    const responseJson = await response.json();
    currentData = responseJson;
    resetPokedex();
    pokedexGrid.setAttribute(pokedexFilter, type);
    loadMoreType();
  } catch (err) {
    console.log(err);
  } finally {
    toggleLoader();
  }
};

const loadMoreType = () => {
  const completion = offset + gridLoadLimit;
  for (let i = offset; i < completion; i++) {
    const currentPokemon = currentData.pokemon[i];
    if (!validate(currentPokemon, loadAction)) return;
    const url = currentData.pokemon[i].pokemon.url;

    buildPokemonCard(url);
  }
  setTimeout(() => {
    setPokemonFavs();
  }, 100);
  offset = completion;
};

const loadSinglePokemon = (pokemon) => {
  pokemon = pokemon.toLowerCase();
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
  resetPokedex();
  disableLoadMore();
  buildPokemonCard(url);
  pokedexGrid.setAttribute(pokedexFilter, pokemon);
};

const loadMoreHandler = () => {
  const currentFilter = pokedexGrid.getAttribute(pokedexFilter);

  if (loadMoreBtn.getAttribute("data-load") == "true") {
    currentFilter === "all" ? loadMoreAllTypes(gridLoadLimit) : loadMoreType();
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

const toggleLoader = () => {
  const newAction = loading === false ? true : false;
  loaderIcon.setAttribute("data-visible", newAction);
  loading = newAction;
};

const startup = async () => {
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

startup();

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
  });
});

addGlobalEventListener("click", ".fa-heart", (e) => {
  bounceAnimation(e.target);
  togglePokemonFavorites(e.target);
});

document
  .querySelector(".navigation-search-wrapper")
  .addEventListener("click", (e) => {
    e.target.setAttribute("data-search-expanded", true);
  });

document
  .querySelector(".navigation-search-wrapper")
  .addEventListener("submit", (event) => {
    const pokemon = document.getElementById("pokemon").value;
    event.preventDefault(); // stops auto submit
    loadSinglePokemon(pokemon);
  });

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

loadMoreBtn.addEventListener("click", loadMoreHandler);
