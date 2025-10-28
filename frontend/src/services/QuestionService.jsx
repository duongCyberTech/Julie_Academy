import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

const getAuthHeaders = (token) => {
    if (!token) {
        console.warn("Authentication token is missing for API request.");
        return {};
    }
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const getAllPublicQuestions = async (params = {}, token) => {
    try {
        const response = await apiClient.get('/questions/get', {
            params,
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching public questions:', error.response?.data || error.message);
        throw error;
    }
};

export const getMyQuestions = async (params = {}, token) => {
    try {
        const decoded = jwtDecode(token);
        const tutorId = decoded.sub; 
        if (!tutorId) throw new Error("Could not find tutor ID in token.");

        const response = await apiClient.get(`/questions/get/my/${tutorId}`, {
            params,
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching my questions:', error.response?.data || error.message);
        throw error;
    }
};

export const getQuestionById = async (questionId, token) => {
    try {
        const response = await apiClient.get(`/questions/get/detail/${questionId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching question with id ${questionId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createQuestion = async (questionsData, token) => {
    try {
        const decoded = jwtDecode(token);
        const tutorId = decoded.sub;
        if (!tutorId) throw new Error("Could not find tutor ID in token.");

        const response = await apiClient.post(`/questions/create/${tutorId}`, questionsData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error creating question:', error.response?.data || error.message);
        throw error;
    }
};


export const updateQuestion = async (questionId, questionData, token) => {
    try {
        const response = await apiClient.patch(`/questions/update/ques/${questionId}`, questionData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error updating question with id ${questionId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteQuestion = async (questionId, token) => {
    try {
        await apiClient.delete(`/questions/delete/question/${questionId}`, getAuthHeaders(token));
    } catch (error) {
        console.error(`Error deleting question with id ${questionId}:`, error.response?.data || error.message);
        throw error;
    }
};