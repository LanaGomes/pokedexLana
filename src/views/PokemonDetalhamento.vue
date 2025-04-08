<template>
  <header class="headerDetalhes">
    <div class="nomePokemonContainer">
      <RouterLink to="/">
        <img id="imgSeta" src="/src/assets/setaParaEsquerda.png"
      /></RouterLink>
      <h4 v-if="loading">Carregando...</h4>
      <h4 v-if="error">{{ error }}</h4>
      <h3>
        {{ pokemon?.species.name }}
      </h3>
    </div>
    <h4># {{ pokemon?.id }}</h4>
  </header>
  <section>
    <img
      :src="pokemon.sprites.front_default"
      :alt="pokemon.name"
      class="pokemonSprite"
    />
  </section>
  <footer>
    <div
      v-for="(item, index) in pokemon?.types"
      :key="index"
      class="pokemonTipos"
    >
      {{ item.type.name }}
    </div>
    <div
      class="pokemonEvolucoes"
      v-for="(item, index) in pokemon?.types"
      :key="index"
    >
      {{ item.type.name }}
    </div>
    <div class="pokemonAtaques"></div>
    <div class="pokemonGameIndices"></div>
  </footer>
</template>

<script setup>
import { RouterLink, useRoute } from "vue-router";
import axios from "axios";
import { ref } from "vue";

const route = useRoute();
const id = route.params.id;
console.log(id);

const loading = ref(false);
const error = ref("");
const pokemon = ref(null);

async function fetchPokemon() {
  loading.value = true;
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    pokemon.value = await response.data;
    console.log(pokemon.value);
  } catch (err) {
    error.value = "Erro ao carregar o Pokémon.";
  } finally {
    loading.value = false;
  }
}

fetchPokemon();
</script>

<style scoped>
* {
  color: black;
}
.headerDetalhes {
  color: black;
  background-color: transparent;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  justify-items: center;
  margin: 0 1rem 0 1rem;
}

.nomePokemonContainer {
  display: flex;
}

#imgSeta {
  margin-top: 1rem;
  margin-right: 1rem;
  width: 2rem;
  height: 2rem;
  align-items: center;
}

.pokemonSprite {
  height: 20rem;
  border: red;
  border-width: 2px;
  border-style: solid;
}
</style>
