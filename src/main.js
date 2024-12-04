import { createApp } from 'vue';
import './style.css';
import { Icon } from '@iconify/vue';
import App from './App.vue';
import router from './router';
import FontAwesomeIcon from "./font-awesome";

const app = createApp(App);

app.component('Icon', Icon);

app.use(router);

app.component("font-awesome-icon", FontAwesomeIcon);

app.mount('#app');
