import axios from '@/setup/axios.setup';
import { getFullApiUrl, apiRequest } from '@/utils/api.utils';

export default class V3Services {
    constructor() {
        this.basePath = 'v3';
    }

    /**
     * Logs in a user by sending their credentials to the login endpoint.
     */
    async login(userData) {
        return await apiRequest('post', this.basePath, 'login', userData);
    }

    async getSectionGrouping() {
        try {
            return await apiRequest('get', this.basePath, 'dropdown');
        } catch (error) {
            console.error('Error fetching section grouping:', error.response?.data || error.message);
            throw error;
        }
    }

    async getStudentsBySection(id) {
        try {
            return await apiRequest('get', this.basePath, `list/${id}`);
        } catch (error) {
            console.error('Error fetching section grouping:', error.response?.data || error.message);
            throw error;
        }
    }

    async buzz(payload) {
        return await apiRequest('post', this.basePath, 'buzz', payload);
    }

    async resetBuzzerState() {
        return await apiRequest('post', this.basePath, 'reset');
    }

    async logout(data) {
        return await apiRequest('post', this.basePath, 'logout', data);
    }

    async logoutAll(data) {
        return await apiRequest('post', this.basePath, 'logout-all', data);
    }

    

}