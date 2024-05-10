import { APIPokemonNames } from "../APIPokemonNames";
import { convertToHyphenCase } from "./transformations";

export const validatePokemonName = (name) => {
  const formatName = convertToHyphenCase(name);
  const pokemonArr = APIPokemonNames.filter((pokemon) =>
    pokemon.includes(formatName)
  );
  return pokemonArr.length > 0 ? pokemonArr : false;
};
