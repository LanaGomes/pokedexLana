<template>
  <NavBar />

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

  <section class="opcoesDePesquisaContainer">
    <h3>{{ $t("geral.Search for") }}</h3>
    <select class="opcoesDePesquisa" v-model="tipoBuscaSelecionado">
      <option value="todos">{{ $t("geral.Todos") }}</option>
      <option value="nome">{{ $t("geral.Nome ou ID") }}</option>
      <option value="tipo">{{ $t("geral.Tipo") }}</option>
    </select>
    <div class="barra-busca" v-if="tipoBuscaSelecionado === 'nome'">
      <input
        class="campo-busca"
        type="text"
        v-model="valorBusca"
        placeholder="Digite nome ou ID "
      />
    </div>

    <div class="barra-busca" v-if="tipoBuscaSelecionado === 'tipo'">
      <select
        class="opcoesTipo"
        v-model="valorBusca"
        @change="carregarPokemons"
      >
        <option disabled value="">{{ $t("geral.Selecione um tipo") }}</option>
        <option v-for="tipo in tiposPokemon" :key="tipo" :value="tipo">
          {{ $t(`tipos.${tipo}`) }}
        </option>
      </select>
    </div>
  </section>

  <main class="galeria-pokemons">
    <div
      v-for="pokemon in listaPokemons"
      :style="{
        background: typeGradients[pokemon.types[0]?.type.name] || '#f1f1f1',
      }"
      :key="pokemon.id"
      class="cartao-pokemon"
    >
      <router-link :to="{ name: 'detalhes', params: { id: pokemon.id } }">
        <p style="color: white" class="id-pokemon"># {{ pokemon.id }}</p>
        <img
          style="width: 8rem; height: 8rem"
          :src="pokemon.sprites.front_default"
          :alt="pokemon.name"
          class="sprite-pokemon"
        />
      </router-link>
      <p style="color: aliceblue" class="nome-pokemon">
        {{ capitalizeFirstLetter(pokemon.name) }}
      </p>
      <template class="pokemonTiposContainer">
        <div
          v-for="(item, index) in pokemon?.types"
          :key="index"
          class="pokemonTipos"
        >
          <span v-if="item.type.name">{{ $t(`tipos.${item.type.name}`) }}</span>
        </div></template
      >
    </div>

    <div v-if="carregando" class="mensagem-carregando">
      <img
        class="gif-carregando"
        alt="carregando..."
        src="/public/carregando.gif"
      />
    </div>
    <div v-if="mensagemErro" class="mensagem-erro">{{ mensagemErro }}</div>
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import axios from "axios";
import NavBar from "../components/NavBar.vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

function setLanguage(lang) {
  locale.value = lang;
  localStorage.setItem("locale", lang);
}

const tipoBuscaSelecionado = ref("todos");
const valorBusca = ref("");
const listaPokemons = ref([]);
const tiposPokemon = ref([]);
const carregando = ref(false);
const mensagemErro = ref("");
const paginacaoOffset = ref(0);
const quantidadePorPagina = 500;

function capitalizeFirstLetter(string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

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
      console.log(listaPokemons.value);

      paginacaoOffset.value += quantidadePorPagina;
    } else if (tipoBuscaSelecionado.value === "nome") {
      const nome = valorBusca.value.toLowerCase().trim();
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${nome}`
      );
      listaPokemons.value = [response.data];
    } else if (tipoBuscaSelecionado.value === "id") {
      const id = parseInt(valorBusca.value);
      if (id !== "" && isNaN(id)) {
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
const typeGradients = {
  grass: "linear-gradient(135deg, #63c781, #3ea06a)",
  fire: "linear-gradient(135deg, #e08b4f, #e86028)",
  water: "linear-gradient(135deg, #768fc9, #4b6eb1)",
  bug: "linear-gradient(135deg, #313131, #1f1f1f)",
  normal: "linear-gradient(135deg, #A8A878, #888866)",
  poison: "linear-gradient(135deg, #966c96, #774977)",
  electric: "linear-gradient(135deg, #e0c865, #d4b53f)",
  ground: "linear-gradient(135deg, #978451, #7d6b3a)",
  fairy: "linear-gradient(135deg, #EE99AC, #e77d94)",
  fighting: "linear-gradient(135deg, #C03028, #8a1e1a)",
  psychic: "linear-gradient(135deg, #F85888, #d84070)",
  rock: "linear-gradient(135deg, #757575, #555555)",
  ghost: "linear-gradient(135deg, #705898, #4e3d6d)",
  ice: "linear-gradient(135deg, #98D8D8, #79bcbc)",
  dragon: "linear-gradient(135deg, #8d68e6, #6f48c8)",
  dark: "linear-gradient(135deg, #1b1b1b, #000000)",
  steel: "linear-gradient(135deg, #B8B8D0, #9898b0)",
  flying: "linear-gradient(135deg, #dad6e6, #bcb8ce)",
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
  text-align: center;

  font-weight: bolder;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  color: white; /* ou um tom claro */
  font-weight: bold;
}

.nome-pokemon {
  text-align: center;
  margin: 0 0 5px 0;
  font-weight: bolder;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  color: white; /* ou um tom claro */
  font-weight: bold;
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
  width: 80%;
  font-size: 1rem;
  padding: 0.8rem;
  border-radius: 50px;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(212, 212, 212);
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

.opcoesDePesquisaContainer {
  display: flex;
  justify-content: center;
  align-items: center;

  color: #d75757;

  flex-wrap: wrap;
}

.mensagem-carregando,
.mensagem-erro {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  color: #d75757;
}

.pokemonTiposContainer {
  display: flex;
  flex-direction: row;

  justify-content: center;
}

.pokemonTipos {
  margin: 0.6rem;
  padding: 0.1rem 0.4rem;

  align-content: center;

  border-width: 1px;
  border-radius: 8px;
  text-transform: capitalize;
  background-color: rgba(245, 245, 245, 0.63);
  color: rgb(59, 59, 59);
}

.gif-carregando {
  width: 100px;
  height: 100px;
  display: block;
  margin: 0 auto;
}
</style>
