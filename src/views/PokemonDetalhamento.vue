<template>
  <div class="backgroundPokemon">
    <header class="headerDetalhes">
      <div class="nomePokemonContainer">
        <RouterLink to="/">
          <img id="imgSeta" src="/src/assets/setaParaEsquerda.png" />
        </RouterLink>
        <h4 v-if="loading">Carregando...</h4>
        <h4 v-if="error">{{ error }}</h4>
        <h3>{{ pokemon?.name }}</h3>
      </div>
      <h4># {{ pokemon?.id }}</h4>
    </header>

    <!-- Carrossel de Sprites com Setas -->
    <section class="pokemonSprites">
      <Carousel v-bind="carouselConfig">
        <Slide v-for="(sprite, index) in pokemonSprites" :key="index">
          <img :src="sprite" class="pokemonSprite" />
        </Slide>

        <!-- Setas de Navegação -->
        <template #addons>
          <Navigation />
          <Pagination />
        </template>
      </Carousel>
    </section>
  </div>
  <footer>
    <!-- Tipos -->
    <div
      v-for="(item, index) in pokemon?.types"
      :key="index"
      class="pokemonTipos"
    >
      {{ item.type.name }}
    </div>

    <!-- Evoluções -->
    <div class="pokemonEvolucoes">
      <h2>Evoluções</h2>
      <div v-for="(item, index) in pokemonEvolutions" :key="index">
        {{ item }}
      </div>
    </div>

    <!-- Ataques -->
    <div class="pokemonAtaques">
      <h2>Ataques</h2>
      <div v-for="(item, index) in pokemon?.moves" :key="index">
        {{ item.move.name }}
      </div>
    </div>

    <!-- Presença nos games -->
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
import { ref, computed } from "vue";

// Importa o carrossel e as setas
import "vue3-carousel/carousel.css";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";

const route = useRoute();
const id = route.params.id;

const loading = ref(false);
const error = ref("");
const pokemon = ref(null);
const pokemonSpecies = ref(null);
const pokemonEvolutions = ref([]);

// Configuração do carrossel
const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: false,
};

// Computa os sprites válidos e únicos
const pokemonSprites = computed(() => {
  if (!pokemon.value || !pokemon.value.sprites) return [];

  const spriteObject = pokemon.value.sprites;
  const spriteList = [];

  // Primeiro: front_default
  if (spriteObject.front_default) {
    spriteList.push(spriteObject.front_default);
  }

  // Adiciona outros sprites únicos
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

// Carrega dados da API
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
</script>

<style scoped>
* {
  color: black;
}

.headerDetalhes {
  background-color: transparent;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  margin: 0 1rem;
}

.nomePokemonContainer {
  display: flex;
  align-items: center;
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
  margin: 0 auto;
}

.pokemonTipos {
  display: inline-block;
  margin: 0.3rem;
  padding: 0.3rem 0.6rem;
  background-color: #f1f1f1;
  border-radius: 8px;
  text-transform: capitalize;
}

.pokemonEvolucoes,
.pokemonAtaques,
.pokemonGameIndices {
  margin-top: 2rem;
}

.backgroundPokemon {
  background-color: rgb(120, 185, 145);
}
</style>
