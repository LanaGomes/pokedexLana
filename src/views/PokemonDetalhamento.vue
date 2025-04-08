<template>
  <header class="headerDetalhes">
    <div class="nomePokemonContainer">
      <RouterLink to="/">
        <img id="imgSeta" src="/src/assets/setaParaEsquerda.png"
      /></RouterLink>
      <h4 v-if="loading">Carregando...</h4>
      <h4 v-if="error">{{ error }}</h4>
      <h3>
        {{ pokemon?.name }}
      </h3>
    </div>
    <h4># {{ pokemon?.id }}</h4>
  </header>
  <section>
    <img
      :src="pokemon?.sprites.front_default"
      :alt="pokemon?.name"
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
    <div class="pokemonEvolucoes">
      <h2>Evoluções</h2>
      <div v-for="(item, index) in pokemonEvolutions" :key="index">
        {{ item }}
      </div>
    </div>
    <div class="pokemonAtaques">
      <h2>Ataques</h2>
      <div v-for="(item, index) in pokemon?.moves" :key="index">
        {{ item.move.name }}
      </div>
    </div>
    <div class="pokemonGameIndices">
      <h2>Presença nos Games</h2>
      <div v-for="(item, index) in pokemon?.game_indices" :key="index">
        {{ item.version.name }}
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink, useRoute } from "vue-router";
import axios from "axios";
import { ref } from "vue";

const route = useRoute();
const id = route.params.id;

const loading = ref(false);
const error = ref("");
const pokemon = ref(null);
const pokemonSpecies = ref(null);
const pokemonEvolutions = ref([]);

async function fetchPokemon() {
  loading.value = true;
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    pokemon.value = await response.data;

    // usar os dados do pokemon para fazer uma chamada no endpoint de species
    const responseSpecies = await axios.get(pokemon.value.species.url);
    pokemonSpecies.value = await responseSpecies.data;

    // depois de ter o resultado de species, chamar o endpoint de evoluition chain que está dentro do resultado de species
    const responseEvolutions = await axios.get(
      pokemonSpecies.value.evolution_chain.url
    );
    const pokemonEvolutionsData = await responseEvolutions.data;

    let arrayAuxiliar = [];
    pokemonEvolutionsData.chain.evolves_to.forEach((evo) => {
      if (pokemon.value.species.name !== evo.species.name) {
        arrayAuxiliar.push(evo.species.name);
      }

      if (evo.evolves_to.length > 0) {
        evo.evolves_to.forEach((evo2) => {
          if (pokemon.value.species.name !== evo2.species.name) {
            arrayAuxiliar.push(evo2.species.name);
          }
        });
      }
    });

    pokemonEvolutions.value = arrayAuxiliar;
    console.log(pokemonEvolutions.value);
  } catch (err) {
    console.log(err);

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
