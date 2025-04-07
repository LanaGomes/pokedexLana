<template>
  <header class="headerDetalhes">
    <div class="nomePokemonContainer">
      <RouterLink to="/">
        <img id="imgSeta" src="/src/assets/setaParaEsquerda.png"
      /></RouterLink>
      <h3>Nome do pokemon</h3>
    </div>
    <h4>#000</h4>
  </header>
</template>

<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;

console.log(id);
</script>

<style scoped>
.headerDetalhes {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  justify-items: center;
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
</style>
