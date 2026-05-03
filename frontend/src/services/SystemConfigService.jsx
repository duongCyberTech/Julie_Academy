import { apiClient, getAuthHeaders } from "./ApiClient";

const getSystemConfig = async () => {
    const token = localStorage.getItem('token');
    const response = await apiClient.get('/system-config', getAuthHeaders(token));
    return response.data;
}

const updateSystemConfig = async (config) => {
    const token = localStorage.getItem('token');
    const response = await apiClient.patch('/system-config', config, getAuthHeaders(token));
    return response.data;
}

export {
    getSystemConfig,
    updateSystemConfig
}