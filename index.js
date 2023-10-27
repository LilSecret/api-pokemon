const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonFavs = "pokemonFavorites";
const pokedexGrid = document.querySelector(".pokedex-grid");
const pokedexNav = document.querySelectorAll(".pokedex-navigation .type");
const loadMoreBtn = document.querySelector("[data-type='load-more']");

const gridLoadLimit = 30;
let offset = 0;

const toggleSiteTheme = () => {
  const documentTheme = html.getAttribute("data-theme");
  const theme = documentTheme === "light" ? "dark" : "light";
  html.setAttribute("data-theme", theme);

  heroChatBox.setAttribute("src", `./assets/images/chatbox-${theme}.svg`);
  waveBgImg.setAttribute("src", `./assets/images/wave-bg-${theme}.svg`);
};

const buildPokemonCard = async (url) => {
  try {
    let res = await fetch(url);
    res = await res.json();
    const pokemonImg = res.sprites.other.dream_world.front_default;
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
    console.log(err);
  }
};

const updatePokedex = async () => {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${gridLoadLimit}&offset=${offset}`;
    let response = await fetch(url);
    response = await response.json();
    for (let result of response.results) {
      await buildPokemonCard(result.url);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setPokemonFavs();
    offset += gridLoadLimit;
  }
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
  pokedexGrid.innerHTML = "";
  const typeNum = pokemonTypeData[type];
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeNum}`);
    const responseJson = await response.json();
    for (let i = 0; i < 30; i++) {
      const url = responseJson.pokemon[i].pokemon.url;
      buildPokemonCard(url);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setPokemonFavs();
  }
};

const loadMoreHandler = () => {};

const titleCase = (string) => {
  return string.charAt(0).toUpperCase() + string.substring(1);
};

const addGlobalEventListener = (type, selector, callback) => {
  document.addEventListener(type, (e) => {
    if (e.target.matches(selector)) callback(e);
  });
};

const startup = async () => {
  await updatePokedex();
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
    pokedexToType(type);
  });
});

addGlobalEventListener("click", ".fa-heart", (e) => {
  bounceAnimation(e.target);
  togglePokemonFavorites(e.target);
});

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});

loadMoreBtn.addEventListener("click", () => {
  updatePokedex();
});
