import { createApp } from 'vue';
import './style.css';
import axios from 'axios'; // Import axios
import { Icon } from '@iconify/vue'; // Import the Icon component
import App from './App.vue';
import router from './router';

// Set the base URL for axios requests
const baseURL = 'https://anahaw.shop/';
axios.defaults.baseURL = baseURL;

// Create the Vue app and use the router
const app = createApp(App);

// Register the Icon component globally
app.component('Icon', Icon);

// Use the router
app.use(router);

// Mount the app
app.mount('#app');
