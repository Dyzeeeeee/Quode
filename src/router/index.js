import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'initial',
        component: () => import('../views/Initial.vue')
    },
    {
        path: '/buzzer/:section',
        name: 'buzzer',
        component: () => import('../views/Buzzer.vue'),
        props: true
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
