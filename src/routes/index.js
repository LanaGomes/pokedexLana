import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import PokemonDetalhamento from "../views/PokemonDetalhamento.vue";

//const Home = { template: "<div>Home</div>" };
//const PokemonDetalhamento = { template: "<div>PokemonDetalhamento</div>" };

const routes = [
  { path: "/", component: Home },
  {
    path: "/PokemonDetalhamento/:id",
    name: "detalhes",
    component: () => import("../views/PokemonDetalhamento.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
