const html = document.querySelector("html");
const themeBtn = document.querySelector("#theme-btn");
const waveBgImg = document.querySelector(".wave-bg");
const heroChatBox = document.querySelector(".chat-box-wrapper img");

const pokemonFavs = "pokemonFavorites";
const pokemonCardName = ".pokemon-card-name";
const pokedexGrid = document.querySelector(".pokedex-grid");

const pokemonType = ".type";

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
          <h3 class="pokemon-card-name">${pokemonName}</h3>
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
          <div class="type type-${type1}">${type1}</div>
          ${
            type2 !== null
              ? `<div class="type type-${type2}">${type2}</div>`
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
    const url = `https://pokeapi.co/api/v2/pokemon?limit=30&offset=${offset}`;
    let response = await fetch(url);
    response = await response.json();
    for (let result of response.results) {
      await buildPokemonCard(result.url);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setPokemonFavs();
    uppercasePokemonNames();
    colorCardTypeTags();
    favesClickListener();
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

const updateHeartIcons = () => {
  const pokemonFavsData = JSON.parse(localStorage.getItem(pokemonFavs));

  pokemonFavsData.forEach((pokemon) => {
    toggleIcon(document.querySelector(`[data-pokemon="${pokemon}"] i`));
  });
};

const bounceAnimation = (target) => {
  target.style.animation = "heartBounce 500ms ease";
  setTimeout(() => {
    target.style.removeProperty("animation");
  }, 550);
};

const setPokemonFavs = () => {
  if (!localStorage.getItem(pokemonFavs)) {
    localStorage.setItem(pokemonFavs, JSON.stringify([]));
  } else {
    updateHeartIcons();
  }
};

const uppercasePokemonNames = () => {
  document.querySelectorAll(".pokedex-grid-item").forEach((card) => {
    const cardName = card.querySelector(pokemonCardName).innerHTML;
    const firstLett = cardName.slice(0, 1).toUpperCase();
    card.querySelector(
      pokemonCardName
    ).innerHTML = `${firstLett}${cardName.slice(1, cardName.length)}`;
  });
};

const colorCardTypeTags = () => {
  document.querySelectorAll(pokemonType).forEach((type) => {
    const typeClass = type.className;
    const pokemonType = typeClass.slice(10, typeClass.length);
    type.style.backgroundColor = `var(--${pokemonType})`;
  });
};

const favesClickListener = () => {
  document.querySelectorAll(".pokemon-card-tab i").forEach((heart) => {
    heart.addEventListener("click", (e) => {
      bounceAnimation(e.target);
      togglePokemonFavorites(e.target);
    });
  });
};

updatePokedex();

themeBtn.addEventListener("click", () => {
  toggleSiteTheme();
});
