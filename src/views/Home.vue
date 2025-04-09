<template>
  <NavBar />
  <div class="barra-busca">
    <button @click="alternarModoBusca" class="botao-alternar">
      {{ modoBusca === "A" ? "#" : "A" }}
    </button>
    <input
      class="campo-busca"
      :type="modoBusca === 'A' ? 'text' : 'number'"
      v-model="valorBusca"
      :placeholder="modoBusca === 'A' ? 'Digite o nome' : 'Digite o ID'"
    />
    <img class="icone-busca" src="/src/assets/search.png" />
  </div>

  <div class="filtro-tipo">
    <header class="titulo-filtro">Filtrar</header>
    <select v-model="tipoPokemonSelecionado" @change="filtrarPokemonPorTipo">
      <option disabled value="">Selecione um tipo</option>
      <option
        class="opcao-tipo"
        v-for="(tipo, index) in tiposPokemon"
        :key="tipo"
        :value="tipo"
      >
        {{ tipo }}
      </option>
    </select>
  </div>

  <main class="galeria-pokemons">
    <div
      v-for="pokemon in listaPokemons"
      :key="pokemon.id"
      class="cartao-pokemon"
    >
      <router-link :to="{ name: 'detalhes', params: { id: pokemon.id } }">
        <p class="id-pokemon"># {{ pokemon.id }}</p>

        <img
          :src="pokemon.sprites.front_default"
          :alt="pokemon.name"
          class="sprite-pokemon"
        />
        <p class="nome-pokemon">{{ pokemon.name }}</p>
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

const tipoPokemonSelecionado = ref("");
const filtrarPokemonPorTipo = async () => {
  if (!tipoPokemonSelecionado.value) return;

  carregando.value = true;
  mensagemErro.value = "";
  listaPokemons.value = [];

  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/type/${tipoPokemonSelecionado.value}`
    );
    const listaPokemonsTipo = response.data.pokemon;

    const detalhes = await Promise.all(
      listaPokemonsTipo
        .slice(0, 100)
        .map((poke) => axios.get(poke.pokemon.url).then((res) => res.data))
    );

    listaPokemons.value = detalhes;
  } catch (err) {
    mensagemErro.value = "Erro ao carregar pokémons do tipo selecionado.";
  } finally {
    carregando.value = false;
  }
};

const tiposPokemon = ref("#");

onMounted(async () => {
  const response = await fetch("https://pokeapi.co/api/v2/type/");
  const data = await response.json();
  tiposPokemon.value = data.results.map((tipo) => tipo.name);
});

const modoBusca = ref("#");
const valorBusca = ref("");

const alternarModoBusca = () => {
  modoBusca.value = modoBusca.value === "A" ? "#" : "A";
};

const listaPokemons = ref([]);
const carregando = ref(false);
const mensagemErro = ref("");
const paginacaoOffset = ref(0);
const quantidadePorPagina = 500;

async function carregarPokemons() {
  carregando.value = true;
  mensagemErro.value = "";

  try {
    const termoBusca = valorBusca.value.toString().trim();

    if (termoBusca !== "") {
      if (modoBusca.value === "#") {
        const id = parseInt(termoBusca);
        if (isNaN(id)) {
          mensagemErro.value = "ID inválido.";
          return;
        }

        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        listaPokemons.value = [response.data];
      } else {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${termoBusca.toLowerCase()}`
        );
        listaPokemons.value = [response.data];
      }
    } else {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${quantidadePorPagina}&offset=${paginacaoOffset.value}`
      );

      const resultados = response.data.results;

      const detalhes = await Promise.all(
        resultados.map((pokemon) =>
          axios.get(pokemon.url).then((res) => res.data)
        )
      );

      listaPokemons.value.push(...detalhes);
      paginacaoOffset.value += quantidadePorPagina;
    }
  } catch (err) {
    mensagemErro.value = "Pokémon não encontrado.";
  } finally {
    carregando.value = false;
  }
}

let tempoDebounce;
watch(valorBusca, () => {
  clearTimeout(tempoDebounce);
  tempoDebounce = setTimeout(async () => {
    const termoBusca = String(valorBusca.value).trim();

    if (tipoPokemonSelecionado.value && termoBusca !== "") {
      tipoPokemonSelecionado.value = "";
      listaPokemons.value = [];
      paginacaoOffset.value = 0;
    }

    await carregarPokemons();
  }, 500);
});

function aoRolarPagina() {
  const topoScroll = window.scrollY;
  const alturaJanela = window.innerHeight;
  const alturaDocumento = document.documentElement.scrollHeight;

  if (
    topoScroll + alturaJanela >= alturaDocumento - 10 &&
    !carregando.value &&
    valorBusca.value.trim() === "" &&
    tipoPokemonSelecionado.value === ""
  ) {
    carregarPokemons();
  }
}

onMounted(() => {
  carregarPokemons();
  window.addEventListener("scroll", aoRolarPagina);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", aoRolarPagina);
});
</script>

<style scoped>
li {
  list-style: none;
}

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

.icone-busca {
  height: 2rem;
  margin-left: 0.5rem;
}

.filtro-tipo {
  display: flex;
  margin: 1rem 0;
  justify-content: center;
  align-items: center;
}

.titulo-filtro {
  color: #d75757;
}

.filtro-tipo select {
  font-size: 1rem;
  padding: 0.5rem;
  background-color: white;
  color: rgb(41, 41, 41);
  margin-left: 1rem;
  border-color: #d75757;
  border-radius: 5px;
}

.opcao-tipo {
  text-transform: capitalize;
}

.mensagem-carregando,
.mensagem-erro {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  color: #d75757;
}
</style>
