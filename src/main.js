import { createApp } from 'vue';
import './style.css';
import { Icon } from '@iconify/vue';
import App from './App.vue';
import router from './router';
import FontAwesomeIcon from "./font-awesome";
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primevue/themes/aura';

const app = createApp(App);

app.component('Icon', Icon);

app.use(router);

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.use(ToastService);

app.component("font-awesome-icon", FontAwesomeIcon);

app.mount('#app');
