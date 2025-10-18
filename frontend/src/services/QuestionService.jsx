import axios from 'axios';
const API_URL = import.meta.env.BACKEND_URL || 'http://localhost:4000';
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthHeaders = (token) => {
  if (!token) {
    console.error("Authentication token is missing for API request.");
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getQuestions = async (params = {}, token) => {
  try {
    const response = await apiClient.get('/questions', {
      params, 
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error.response?.data || error.message);
    throw error;
  }
};

export const getQuestionById = async (id, token) => {
  try {
    const response = await apiClient.get(`/questions/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching question with id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createQuestion = async (questionData, token) => {
  try {
    const response = await apiClient.post('/questions', questionData, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error.response?.data || error.message);
    throw error;
  }
};

export const updateQuestion = async (id, questionData, token) => {
  try {
    const response = await apiClient.put(`/questions/${id}`, questionData, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating question with id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteQuestion = async (id, token) => {
  try {
    await apiClient.delete(`/questions/${id}`, {
      headers: getAuthHeaders(token),
    });
  } catch (error) {
    console.error(`Error deleting question with id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};