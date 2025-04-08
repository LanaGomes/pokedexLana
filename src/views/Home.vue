<template>
  <NavBar />
  <main class="main">
    <div v-for="poke in pokemons" :key="poke.id" class="card-body">
      <router-link :to="{ name: 'detalhes', params: { id: poke.id } }">
        <p class="pokemonID"># {{ poke.id }}</p>

        <img
          :src="poke.sprites.front_default"
          :alt="poke.name"
          class="pokemonSprite"
        />
        <p class="pokemonNome">{{ poke.name }}</p>
      </router-link>
    </div>

    <div v-if="loading">Carregando mais...</div>
    <div v-if="error">{{ error }}</div>
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import axios from "axios";
import NavBar from "../components/NavBar.vue";
import { RouterLink } from "vue-router";

const pokemons = ref([]);
const loading = ref(false);
const error = ref("");
const offset = ref(0);
const limit = 20;

async function fetchPokemons() {
  loading.value = true;
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset.value}`
    );
    const results = response.data.results;

    const details = await Promise.all(
      results.map((poke) => axios.get(poke.url).then((res) => res.data))
    );

    pokemons.value.push(...details);
    offset.value += limit;
  } catch (err) {
    error.value = "Erro ao carregar os Pokémons.";
  } finally {
    loading.value = false;
  }
}

function handleScroll() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 10 && !loading.value) {
    fetchPokemons();
  }
}

onMounted(() => {
  fetchPokemons();
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
main {
  flex-wrap: wrap;
  display: flex;
  justify-content: space-around;
  gap: 10px;
  margin: 2rem 1.5rem 1rem 1.5rem;
  color: rgb(32, 32, 32);
}

.card-body {
  border: 1px;
  border-color: rgb(175, 175, 175);
  border-radius: 15px;
  border-style: solid;
  box-shadow: 5px 4px 8px rgb(175, 175, 175);

  display: flex;
  flex-direction: column;
  text-align: right;
  align-items: center;
  width: 12rem;
}

.pokemonID {
  margin: 0.6rem 0.6rem 0 0;
}

.pokemonNome {
  text-align: center;
  margin: 0 0 5px 0;
}
</style>
