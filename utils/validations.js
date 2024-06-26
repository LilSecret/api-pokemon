const validatePokemonName = (name) => {
  const formatName = convertToHyphenCase(name);
  const pokemonArr = APIPokemonNames.filter((pokemon) =>
    pokemon.includes(formatName)
  );
  return pokemonArr.length > 0 ? pokemonArr : false;
};

function arraysAreEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}
