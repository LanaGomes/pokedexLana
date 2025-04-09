<template>
  <NavBar />
  <div class="search">
    <button @click="alternarTipo" class="botaoAlternar">
      {{ tipo === "A" ? "#" : "A" }}
    </button>
    <input
      class="inputBuscar"
      :type="tipo === 'A' ? 'text' : 'number'"
      v-model="valor"
      :placeholder="tipo === 'A' ? 'Digite o nome' : 'Digite o ID'"
    />
    <img class="searchLogo" src="/src/assets/search.png" />
  </div>

  <div class="filterContainer">
    <header>Filtrar</header>

    <select>
      <option disabled value="">Selecione um tipo</option>
      <option
        class="optionTipo"
        v-for="(type, index) in types"
        :key="type"
        :value="type"
      >
        {{ type }}
      </option>
    </select>
  </div>
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
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import axios from "axios";
import NavBar from "../components/NavBar.vue";

//Array tipos de pokemon
const types = ref("#");
onMounted(async () => {
  const response = await fetch("https://pokeapi.co/api/v2/type/");
  const data = await response.json();
  types.value = data.results.map((tipo) => tipo.name);
});

// Alternar tipo de entrada campo buscar
const tipo = ref("#");
const valor = ref("");

const alternarTipo = () => {
  tipo.value = tipo.value === "A" ? "#" : "A";
};

// importar e carregar pokemons
const pokemons = ref([]);
const loading = ref(false);
const error = ref("");
const offset = ref(0);
const limit = 100;

// Função principal
async function fetchPokemons() {
  loading.value = true;
  error.value = "";

  try {
    const busca = valor.value.toString().trim();

    if (busca !== "") {
      if (tipo.value === "#") {
        const id = parseInt(busca);
        if (isNaN(id)) {
          error.value = "ID inválido.";
          return;
        }

        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        pokemons.value = [response.data];
      } else {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${busca.toLowerCase()}`
        );
        pokemons.value = [response.data];
      }
    } else {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset.value}`
      );

      const results = response.data.results;

      const details = await Promise.all(
        results.map((poke) => axios.get(poke.url).then((res) => res.data))
      );

      pokemons.value.push(...details);
      offset.value += limit;
    }
  } catch (err) {
    error.value = "Pokémon não encontrado.";
  } finally {
    loading.value = false;
  }
}
// Debounce manual
let debounceTimeout;
watch(valor, () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    offset.value = 0;
    pokemons.value = [];
    fetchPokemons();
  }, 500); // Espera 500ms após parar de digitar
});

// Scroll infinito
function handleScroll() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (
    scrollTop + windowHeight >= documentHeight - 10 &&
    !loading.value &&
    valor.value.trim() === ""
  ) {
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
li {
  list-style: none;
}
main {
  flex-wrap: wrap;
  display: flex;
  justify-content: space-around;
  align-items: center;
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

.search {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.botaoAlternar {
  padding: 1rem 1.2rem;
  margin: 0 0.5rem;
  border-radius: 50px;
  border-style: none;
  background-color: #d75757;
}

.inputBuscar {
  color: black;
  width: 50%;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 50px;
  border-style: none;
  background-color: white;
  box-shadow: inset -2px 2px 3px 2px rgba(32, 32, 32, 0.2);
}

.searchLogo {
  height: 2rem;
  margin-left: 0.5rem;
}

.filterContainer {
  display: flex;
  margin: 1rem 0;

  justify-content: center;
  align-items: center;
}

.filterContainer img {
  height: 1.5rem;
  margin: 0 0.2rem;
}

.filterContainer select {
  font-size: 1rem;
  padding: 0.5rem;
  background-color: white;
  color: rgb(41, 41, 41);
  margin-left: 1rem;
  border-color: #d75757;
  border-radius: 5px;
}
.filterContainer header {
  color: #d75757;
}
</style>
