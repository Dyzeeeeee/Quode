import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://anahaw.shop/',
    
});

export default instance;