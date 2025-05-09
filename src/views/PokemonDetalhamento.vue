<template>
  <div
    class="backgroundPokemon"
    :style="{
      backgroundColor: typeColors[pokemon?.types[0]?.type?.name] || '#78B991',
    }"
  >
    <header class="headerDetalhes">
      <div class="nomePokemonContainer">
        <RouterLink to="/">
          <img id="imgSeta" src="/public/setaParaEsquerda.png" />
        </RouterLink>
        <h4 v-if="loading">{{ $t("geral.Carregando...") }}</h4>
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
  <div class="bandeirasContainer" style="margin: 0.5rem">
    <a @click="setLanguage('pt')">
      <img
        style="margin-inline: 8px; width: 2.5rem; height: 2.5rem"
        src="/public/brazilLogo.png"
      />
    </a>
    <a @click="setLanguage('en')">
      <img
        style="margin-inline: 8px; width: 2.5rem; height: 2.5rem"
        src="/public/euaLogo.png"
      />
    </a>
    <a @click="setLanguage('es')">
      <img
        style="margin-inline: 8px; width: 2.5rem; height: 2.5rem"
        src="/public/espanhaLogo.png"
      />
    </a>
  </div>
  <footer>
    <div class="pokemonTiposContainer">
      <div
        v-for="(item, index) in pokemon?.types"
        :key="index"
        :style="{ backgroundColor: typeColors[item.type.name] || '#f1f1f1' }"
        class="pokemonTipos"
      >
        {{ $t(`tipos.${item.type.name}`) }}
      </div>
    </div>

    <div class="pokemonEvolucoes">
      <h2 class="tituloSessao">{{ $t("geral.Evoluções") }}</h2>
      <div class="evoluçaoContainer">
        <template
          v-if="pokemonEvolutions.length > 0"
          v-for="(item, index) in pokemonEvolutions"
          :key="index"
        >
          <div class="evolucao">{{ item }}</div>
        </template>
        <div v-if="pokemonEvolutions.length == 0">
          {{ $t("geral.Este pokémon não evolui :(") }}
        </div>
      </div>
    </div>
    <div class="pokemonAtaques">
      <h2 class="tituloSessao">{{ $t("geral.Ataques por Nível") }}</h2>
      <div class="ataquesPorNivelContainer">
        <div
          v-for="(ataques, nivel) in ataquesPorNivel"
          :key="nivel"
          class="grupoNivel"
        >
          <h3 class="nivelHeader">{{ $t("geral.Nível") }} {{ nivel }}</h3>
          <div class="ataquesContainer">
            <div
              v-for="(ataque, index) in ataques"
              :key="index"
              class="ataqueCard"
            >
              {{ ataque }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <h2 class="tituloSessao">{{ $t("geral.Presença nos Games") }}</h2>
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
        {{ $t("geral.Este pokémon não aparece em jogo algum :O") }}
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink, useRoute } from "vue-router";
import axios from "axios";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

import "vue3-carousel/carousel.css";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";

function setLanguage(lang) {
  locale.value = lang;
  localStorage.setItem("locale", lang);
}

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
    error.value = $t("geral.Erro ao carregar o Pokémon.");
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

const ataquesPorNivel = computed(() => {
  const agrupados = {};

  if (!pokemon.value) return agrupados;

  pokemon.value.moves.forEach((move) => {
    const levelUpInfo = move.version_group_details.find(
      (v) => v.move_learn_method.name === "level-up"
    );

    if (levelUpInfo && levelUpInfo.level_learned_at > 0) {
      const nivel = levelUpInfo.level_learned_at;

      if (!agrupados[nivel]) agrupados[nivel] = [];
      agrupados[nivel].push(capitalizeFirstLetter(move.move.name));
    }
  });

  return Object.keys(agrupados)
    .sort((a, b) => a - b)
    .reduce((acc, key) => {
      acc[key] = agrupados[key];
      return acc;
    }, {});
});
</script>

<style scoped>
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

.ataquesPorNivelContainer {
  margin-left: 2rem;
  padding: 0.5rem 1rem;
}

.ataquesContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));

  gap: 10px;
  padding: 0.5rem;
  max-width: 600px;
}

.ataqueCard {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 10px;
  text-align: center;
  text-transform: capitalize;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.grupoNivel {
  margin-bottom: 1.5rem;
}

.nivelHeader {
  color: #c53e3e;
  font-size: 1.2rem;
  margin: 0.5rem 0;
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

.imgGameIndice {
  height: 8rem;
  width: 8rem;
}

.tituloSessao {
  text-align: center;
  color: #e63c3c;
  border-bottom: #d1d1d1 solid 1px;
  padding: 0.5rem;
  margin-top: 0.8rem;
}

.backgroundPokemon {
  background-color: rgb(120, 185, 145);
}
</style>
