import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => {
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

// ==========================================
// EMAIL CHAIN APIs (Cấu hình gửi email tự động)
// ==========================================

export const createEmailChain = async (classId, data, token) => {
    try {
        const response = await apiClient.post(`/email-chain/${classId}`, data, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAllEmailChains = async (classId, token) => {
    try {
        const response = await apiClient.get(`/email-chain/class/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getEmailChainById = async (configId, token) => {
    try {
        const response = await apiClient.get(`/email-chain/config/${configId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateEmailChain = async (configId, data, token) => {
    try {
        const response = await apiClient.patch(`/email-chain/${configId}`, data, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteEmailChain = async (configId, token) => {
    try {
        const response = await apiClient.delete(`/email-chain/${configId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};