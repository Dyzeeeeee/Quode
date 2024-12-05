import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "initial",
    component: () => import("../views/Initial.vue"),
  },
  {
    path: "/buzzer/:id",
    name: "buzzer",
    component: () => import("../views/Buzzer.vue"),
    // props: true
  },
  {
    path: "/spinner/:id",
    name: "spinner",
    component: () => import("../views/Spinner.vue"),
    // props: true
  },
  {
    path: "/learn/:id",
    name: "learn",
    component: () => import("../views/Learn.vue"),
    // props: true
  },
  {
    path: "/learn/:id/text-color",
    name: "learn-text-color",
    component: () => import("../views/LearnTextColor.vue"),
    // props: true
  },
  {
    path: "/learn/:id/bg-color",
    name: "learn-bg-color",
    component: () => import("../views/LearnBGColor.vue"),
    // props: true
  },
  {
    path: "/learn/:id/text-color",
    name: "learn-text-color",
    component: () => import("../views/LearnTextColor.vue"),
    // props: true
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
