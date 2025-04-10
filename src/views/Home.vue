<template>
  <NavBar />

  <section class="opcoesDePesquisaContainer">
    <h3>Pesquisar por</h3>
    <select class="opcoesDePesquisa" v-model="tipoBuscaSelecionado">
      <option value="todos">Todos</option>
      <option value="nome">Nome</option>
      <option value="id">ID</option>
      <option value="tipo">Tipo</option>
    </select>
  </section>

  <div
    class="barra-busca"
    v-if="tipoBuscaSelecionado === 'nome' || tipoBuscaSelecionado === 'id'"
  >
    <input
      class="campo-busca"
      :type="tipoBuscaSelecionado === 'id' ? 'number' : 'text'"
      v-model="valorBusca"
      :placeholder="
        tipoBuscaSelecionado === 'id' ? 'Digite o ID' : 'Digite o nome'
      "
    />
  </div>

  <div class="barra-busca" v-if="tipoBuscaSelecionado === 'tipo'">
    <select class="opcoesTipo" v-model="valorBusca" @change="carregarPokemons">
      <option disabled value="">Selecione um tipo</option>
      <option v-for="tipo in tiposPokemon" :key="tipo" :value="tipo">
        {{ tipo }}
      </option>
    </select>
  </div>

  <main class="galeria-pokemons">
    <div
      v-for="pokemon in listaPokemons"
      :style="{
        backgroundColor: typeColors[pokemon.types[0]?.type.name] || '#f1f1f1',
      }"
      :key="pokemon.id"
      class="cartao-pokemon"
    >
      <router-link :to="{ name: 'detalhes', params: { id: pokemon.id } }">
        <p style="color: white" class="id-pokemon"># {{ pokemon.id }}</p>
        <img
          style="width: 10rem; height: 10rem"
          :src="pokemon.sprites.front_default"
          :alt="pokemon.name"
          class="sprite-pokemon"
        />
        <p style="color: aliceblue" class="nome-pokemon">
          {{ pokemon.name }}
        </p>
      </router-link>
    </div>

    <div v-if="carregando" class="mensagem-carregando">Carregando mais...</div>
    <div v-if="mensagemErro" class="mensagem-erro">{{ mensagemErro }}</div>
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import axios from "axios";
import NavBar from "../components/NavBar.vue";

const tipoBuscaSelecionado = ref("todos");
const valorBusca = ref("");
const listaPokemons = ref([]);
const tiposPokemon = ref([]);
const carregando = ref(false);
const mensagemErro = ref("");
const paginacaoOffset = ref(0);
const quantidadePorPagina = 500;

onMounted(async () => {
  await carregarPokemons();
  await carregarTipos();
  window.addEventListener("scroll", aoRolarPagina);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", aoRolarPagina);
});

const carregarTipos = async () => {
  const response = await axios.get("https://pokeapi.co/api/v2/type/");
  tiposPokemon.value = response.data.results.map((tipo) => tipo.name);
};

const carregarPokemons = async () => {
  carregando.value = true;
  mensagemErro.value = "";
  listaPokemons.value = [];

  try {
    if (tipoBuscaSelecionado.value === "todos") {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${quantidadePorPagina}&offset=${paginacaoOffset.value}`
      );
      const resultados = response.data.results;

      const detalhes = await Promise.all(
        resultados.map((pokemon) =>
          axios.get(pokemon.url).then((res) => res.data)
        )
      );

      listaPokemons.value = detalhes;
      paginacaoOffset.value += quantidadePorPagina;
    } else if (tipoBuscaSelecionado.value === "nome") {
      const nome = valorBusca.value.toLowerCase().trim();
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${nome}`
      );
      listaPokemons.value = [response.data];
    } else if (tipoBuscaSelecionado.value === "id") {
      const id = parseInt(valorBusca.value);
      if (isNaN(id)) {
        mensagemErro.value = "ID inválido.";
        return;
      }
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );
      listaPokemons.value = [response.data];
    } else if (tipoBuscaSelecionado.value === "tipo") {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/type/${valorBusca.value}`
      );
      const listaPokemonsTipo = response.data.pokemon;

      const detalhes = await Promise.all(
        listaPokemonsTipo
          .slice(0, 100)
          .map((poke) => axios.get(poke.pokemon.url).then((res) => res.data))
      );

      listaPokemons.value = detalhes;
    }
  } catch (err) {
    mensagemErro.value = "Pokémon não encontrado.";
  } finally {
    carregando.value = false;
  }
};

watch(valorBusca, async (val) => {
  if (
    tipoBuscaSelecionado.value === "nome" ||
    tipoBuscaSelecionado.value === "id"
  ) {
    clearTimeout(tempoDebounce);
    tempoDebounce = setTimeout(() => {
      carregarPokemons();
    }, 500);
  }
});

watch(tipoBuscaSelecionado, async (novoValor) => {
  valorBusca.value = "";
  listaPokemons.value = [];
  paginacaoOffset.value = 0;
  if (novoValor === "todos") await carregarPokemons();
});

let tempoDebounce;
function aoRolarPagina() {
  const topoScroll = window.scrollY;
  const alturaJanela = window.innerHeight;
  const alturaDocumento = document.documentElement.scrollHeight;

  if (
    topoScroll + alturaJanela >= alturaDocumento - 10 &&
    !carregando.value &&
    tipoBuscaSelecionado.value === "todos"
  ) {
    carregarPokemons();
  }
}
const typeColors = {
  grass: "#63c781",
  fire: "#e08b4f",
  water: "#768fc9",
  bug: "#313131",
  normal: "#A8A878",
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
.galeria-pokemons {
  flex-wrap: wrap;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
  margin: 2rem 1.5rem 1rem 1.5rem;
  color: rgb(32, 32, 32);
}

.cartao-pokemon {
  border: 1px solid rgb(175, 175, 175);
  border-radius: 15px;
  box-shadow: 5px 4px 8px rgb(175, 175, 175);
  display: flex;
  flex-direction: column;
  text-align: right;
  align-items: center;
  width: 12rem;

  transition: background-color 0.3s ease;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cartao-pokemon:hover {
  transform: scale(1.05);
  box-shadow: 8px 6px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.id-pokemon {
  margin: 0.6rem 0.6rem 0 0;
}

.nome-pokemon {
  text-align: center;
  margin: 0 0 5px 0;
}

.sprite-pokemon {
  width: 96px;
  height: 96px;
}

.barra-busca {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.botao-alternar {
  padding: 1rem 1.2rem;
  margin: 0 0.5rem;
  border-radius: 50px;
  border-style: none;
  background-color: #d75757;
  color: white;
  font-weight: bold;
}

.campo-busca {
  color: black;
  width: 50%;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 50px;
  border-style: none;
  background-color: white;
  box-shadow: inset -2px 2px 3px 2px rgba(32, 32, 32, 0.2);
}

.opcoesDePesquisa,
.opcoesTipo {
  font-size: 1rem;
  padding: 0.5rem 2rem;
  background-color: white;
  color: rgb(41, 41, 41);
  margin-left: 1rem;
  border-color: #d75757;
  border-radius: 8px;
}

.opcoesDePesquisa {
}

.opcoesDePesquisaContainer {
  display: flex;
  margin: 2rem;
  color: #d75757;
}

.mensagem-carregando,
.mensagem-erro {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  color: #d75757;
}
</style>
