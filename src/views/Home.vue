<template>
  <NavBar />
  <main class="main">
    <div
      v-for="poke in pokemons"
      :key="poke.id"
      class="card-body border mb-4 p-4 rounded shadow"
    >
      <p><strong>ID:</strong> {{ poke.id }}</p>
      <p><strong>Nome:</strong> {{ poke.name }}</p>
      <img :src="poke.sprites.front_default" :alt="poke.name" />
    </div>

    <div v-if="loading" class="mt-4 text-center">Carregando mais...</div>
    <div v-if="error" class="alert alert-danger mt-4">{{ error }}</div>
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import axios from "axios";
import NavBar from "../components/NavBar.vue";

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
body {
  display: flex;
  justify-content: space-around;
  gap: 50px;
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>
