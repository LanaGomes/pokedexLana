<template>
  <div
    class="backgroundPokemon"
    :style="{
      backgroundColor: typeColors[pokemon?.types?.[0]?.type?.name] || '#78B991',
    }"
  >
    <header class="headerDetalhes">
      <div class="nomePokemonContainer">
        <RouterLink to="/">
          <img id="imgSeta" src="/public/setaParaEsquerda.png" />
        </RouterLink>
        <h4 v-if="loading">Carregando...</h4>
        <h4 v-if="error">{{ error }}</h4>
        <h3>{{ capitalizeFirstLetter(pokemon?.name) }}</h3>
      </div>
      <h4># {{ pokemon?.id }}</h4>
    </header>

    <section class="pokemonSprites">
      <Carousel v-bind="carouselConfig">
        <Slide v-for="(sprite, index) in pokemonSprites" :key="index">
          <img :src="sprite" class="pokemonSprite" />
        </Slide>

        <template #addons>
          <Navigation />
          <Pagination />
        </template>
      </Carousel>
    </section>
  </div>
  <footer>
    <div class="pokemonTiposContainer">
      <div
        v-for="(item, index) in pokemon?.types"
        :key="index"
        :style="{ backgroundColor: typeColors[item.type.name] || '#f1f1f1' }"
        class="pokemonTipos"
      >
        {{ item.type.name }}
      </div>
    </div>

    <div class="pokemonEvolucoes">
      <h2 class="tituloSessao">Evoluções</h2>
      <div class="evoluçaoContainer">
        <template
          v-if="pokemonEvolutions.length > 0"
          v-for="(item, index) in pokemonEvolutions"
          :key="index"
        >
          <div class="evolucao">{{ item }}</div>
        </template>
        <div v-if="pokemonEvolutions.length == 0">
          Este pokémon não evolui :(
        </div>
      </div>
    </div>
    <div class="pokemonAtaques">
      <h2 class="tituloSessao">Ataques</h2>
      <template class="ataquesContainer">
        <div v-for="(item, index) in pokemon?.moves" :key="index">
          {{ capitalizeFirstLetter(item.move.name) }}
        </div>
      </template>
    </div>
    <h2 class="tituloSessao">Presença nos Games</h2>
    <div class="pokemonGameIndices">
      <div
        class="imgGameContainer"
        v-for="(item, index) in pokemon?.game_indices"
        :key="index"
      >
        <img class="imgGameIndice" :src="`/${item.version.name}.jpg`" />
        {{ capitalizeFirstLetter(item.version.name) }}
      </div>
      <div
        style="padding-bottom: 1rem; margin-inline: 0.5rem; text-align: center"
        v-if="pokemon?.game_indices.length == 0"
      >
        Este pokémon não aparece em jogo algum :O
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink, useRoute } from "vue-router";
import axios from "axios";
import { ref, computed } from "vue";

import "vue3-carousel/carousel.css";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";

function capitalizeFirstLetter(string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const route = useRoute();
const id = route.params.id;

const loading = ref(false);
const error = ref("");
const pokemon = ref(null);
const pokemonSpecies = ref(null);
const pokemonEvolutions = ref([]);

const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: false,
};

const pokemonSprites = computed(() => {
  if (!pokemon.value || !pokemon.value.sprites) return [];

  const spriteObject = pokemon.value.sprites;
  const spriteList = [];

  if (spriteObject.front_default) {
    spriteList.push(spriteObject.front_default);
  }

  Object.entries(spriteObject).forEach(([key, value]) => {
    if (
      typeof value === "string" &&
      value !== null &&
      value !== spriteObject.front_default
    ) {
      spriteList.push(value);
    }
  });

  return spriteList;
});

async function fetchPokemon() {
  loading.value = true;
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    pokemon.value = response.data;

    const responseSpecies = await axios.get(pokemon.value.species.url);
    pokemonSpecies.value = responseSpecies.data;

    const responseEvolutions = await axios.get(
      pokemonSpecies.value.evolution_chain.url
    );
    const data = responseEvolutions.data;

    const arrayAuxiliar = [];
    data.chain.evolves_to.forEach((evo) => {
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
  } catch (err) {
    console.error(err);
    error.value = "Erro ao carregar o Pokémon.";
  } finally {
    loading.value = false;
  }
}

fetchPokemon();

const typeColors = {
  grass: "#63c781",
  fire: "#e08b4f",
  water: "#768fc9",
  bug: "#535353",
  normal: "#697c88",
  poison: "#966c96",
  electric: "#e0c865",
  ground: "#978451",
  fairy: "#EE99AC",
  fighting: "#C03028",
  psychic: "#F85888",
  rock: "#757575",
  ghost: "#705898",
  ice: "#98D8D8",
  dragon: "#8d68e6",
  dark: "#1b1b1b",
  steel: "#B8B8D0",
  flying: "#dad6e6",
};
</script>

<style scoped>
* {
  color: #697c88;
}

.headerDetalhes {
  background-color: transparent;
  padding: 0.2rem 0.5rem;
  display: flex;
  justify-content: space-between;
  margin: 0 1rem;
}

.nomePokemonContainer {
  display: flex;
  align-items: center;
}

.nomePokemonContainer h3,
h4 {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
}

#imgSeta {
  margin-right: 1rem;
  width: 2rem;
  height: 2rem;
}

.pokemonSprites {
  margin: 1rem auto;
  max-width: 300px;
}

.pokemonSprite {
  height: 15rem;
  width: auto;
  display: block;
  margin: 1.5rem;
}

.evoluçaoContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.evolucao {
  margin: 0.3rem;
  padding: 0.5rem 2rem;
  background-color: #f14040;

  color: #e9e9e9;
  border-radius: 10px;
  text-transform: capitalize;
}

.pokemonTiposContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.pokemonTipos {
  margin: 0.3rem;
  padding: 0.5rem 2rem;
  background-color: #f1f1f1;
  border-radius: 20px;
  text-transform: capitalize;
  color: rgb(32, 32, 32);
}

.pokemonEvolucoes,
.pokemonAtaques,
.pokemonGameIndices {
  margin-top: 2rem;
}

.ataquesContainer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  justify-items: center;

  margin: 0.2rem;
}

.pokemonGameIndices {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.imgGameContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.backgroundPokemon {
  background-color: rgb(120, 185, 145);
}

.imgGameIndice {
  height: 8rem;
  width: 8rem;
}

.tituloSessao {
  text-align: center;
  color: #e63c3c;
  border-bottom: #d1d1d1;
  border-bottom-style: solid;
  border-width: 1px;
  padding: 0.5rem;
  margin-top: 0.8rem;
}
</style>
