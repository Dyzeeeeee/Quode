import axios from '@/setup/axios.setup';

/**
 * Appends the module name and endpoint to the Axios instance's base URL.
 * 
 * @param {string} moduleName - The name of the module.
 * @param {string} endpoint - The specific endpoint within that module.
 * @return {string} The full URL for the API call.
 */
export function getFullApiUrl(moduleName, endpoint) {
    return `/${moduleName}/${endpoint}`;
}

/**
 * Makes an API request using the specified method, URL, and data.
 * Handles setting up headers and error handling.
 *
 * @param {string} method - The HTTP method (e.g., 'get', 'post', 'patch', 'delete').
 * @param {string} basePath - The base path for the API endpoint.
 * @param {string} url - The specific API endpoint path.
 * @param {Object} [data=null] - The data to be sent with the request (for POST, PATCH, PUT).
 * @param {string} [token=null] - The authorization token to include in the request headers.
 * @param {string} [responseType='json'] - The expected response type (e.g., 'json', 'blob').
 * @param {Object} [additionalOptions={}] - Additional Axios request options.
 * @returns {Promise<Object|string>} - The response data or a message if no data is found.
 * @throws {Error} - Throws an error if the request fails.
 */
export async function apiRequest(
    method,
    basePath,
    url,
    data = null,
    token = null,
    responseType = 'json',
    additionalOptions = {}
) {
    const options = {
        method,
        url: getFullApiUrl(basePath, url),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        data,
        responseType,
        ...additionalOptions,
    };

    try {
        const response = await axios(options);
        if (response.status === 204) {
            return 'No data found.';
        }
        return response.data;
    } catch (error) {
        console.error(
            `Error during API call. Method: ${method}, URL: ${options.url}`,
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

/**
 * Encodes URL parts to ensure they are safe to include in a URL.
 * 
 * @param {...string} parts - The parts of the URL that need to be encoded.
 * @return {string} The encoded URL parts concatenated by a slash.
 */
export function encodeUrlParts(...parts) {
    return parts.map(encodeURIComponent).join('/');
}