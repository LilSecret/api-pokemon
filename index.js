const siteTheme = "pokeTheme";
const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonFavs = "pokemonFavorites";
const pokedexGrid = document.querySelector(".pokedex-grid");
const pokedexNav = document.querySelectorAll(".pokedex-navigation .type");

const load = "load-more";
const loadMoreBtn = document.querySelector("[data-load]");

const gridLoadLimit = 30;
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

    const defaultImg = res.sprites.other.dream_world.front_default;
    const backupImg = res.sprites.other["official-artwork"].front_default;
    const pokemonImg = defaultImg !== null ? defaultImg : backupImg;
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

const loadMoreAllTypes = async (limit) => {
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
  }
};

const validate = (item, action) => {
  if (!item) {
    if (action === load) {
      loadMoreBtn.setAttribute("data-load", false);
      console.log("max pokemon");
    }
    return false;
  } else {
    return true;
  }
};

const resetPokedex = () => {
  pokedexGrid.innerHTML = "";
  offset = 0;
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
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeNum}`);
    const responseJson = await response.json();
    currentData = responseJson;
    resetPokedex();
    pokedexGrid.setAttribute("data-filter", type);
    loadMoreType();
  } catch (err) {
    console.log(err);
  } finally {
    setPokemonFavs();
  }
};

const loadMoreType = () => {
  const completion = offset + gridLoadLimit;
  for (let i = offset; i < completion; i++) {
    console.log(currentData.pokemon);
    const url = currentData.pokemon[i].pokemon.url;

    if (!validate(url, load)) return;
    buildPokemonCard(url);
  }
  offset = completion;
};

const loadMoreHandler = () => {
  const currentFilter = pokedexGrid.getAttribute("data-filter");

  if (loadMoreBtn.getAttribute("data-load") == "true") {
    currentData === "all" ? loadMoreAllTypes(gridLoadLimit) : loadMoreType();
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

const startup = async () => {
  setSiteTheme();
  loadMoreAllTypes(gridLoadLimit);
  // buildPokemonCard("https://pokeapi.co/api/v2/pokemon/amaura");
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
      pokedexGrid.setAttribute("data-filter", "all");
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

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

loadMoreBtn.addEventListener("click", loadMoreHandler);
