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
  },
  {
    path: "/admin/:id",
    name: "admin",
    component: () => import("../views/Admin.vue"),
  },
  {
    path: "/spinner/:id",
    name: "spinner",
    component: () => import("../views/Spinner.vue"),
  },
  {
    path: "/learn/:id",
    name: "learn",
    component: () => import("../views/Learn.vue"),
  },
  {
    path: "/learn/:id/text-color",
    name: "learn-text-color",
    component: () => import("../views/LearnTextColor.vue"),
  },
  {
    path: "/learn/:id/bg-color",
    name: "learn-bg-color",
    component: () => import("../views/LearnBGColor.vue"),
  },
  {
    path: "/learn/:id/font-size",
    name: "learn-font-size",
    component: () => import("../views/LearnFontSize.vue"),
  },
  {
    path: "/learn/:id/text-align",
    name: "learn-text-align",
    component: () => import("../views/LearnTextAlign.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const userId = localStorage.getItem("userId");

  // Prevent access to Initial if userId exists
  if (to.name === "initial" && userId) {
    next({
      name: "buzzer",
      params: { id: localStorage.getItem("selectedSectionId") || "default" },
    }); // Adjust default route or parameter as needed
  } else {
    next(); // Allow navigation
  }
});

export default router;
