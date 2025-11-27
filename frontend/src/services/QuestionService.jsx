import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = (token) => {
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const createQuestion = async (tutorId, questionsData, token) => {
  try {
    const response = await apiClient.post(
      `/questions/create/${tutorId}`,
      questionsData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllQuestions = async (params = {}, token) => {
  try {
    const response = await apiClient.get("/questions/get", {
      params,
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuestionsByCategory = async (categoryId, params = {}, token) => {
  try {
    const response = await apiClient.get(
      `/questions/get/category/${categoryId}`,
      {
        params,
        ...getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyQuestions = async (tutorId, params = {}, token) => {
  try {
    const response = await apiClient.get(
      `/questions/get/my/${tutorId}`,
      {
        params,
        ...getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuestionById = async (questionId, token) => {
  try {
    const response = await apiClient.get(
      `/questions/get/detail/${questionId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuestion = async (questionId, questionData, token) => {
  try {
    const response = await apiClient.patch(
      `/questions/update/ques/${questionId}`,
      questionData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteQuestion = async (questionId, token) => {
  try {
    const response = await apiClient.delete(
      `/questions/delete/question/${questionId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addAnswers = async (questionId, answersData, token) => {
  try {
    const response = await apiClient.post(
      `/questions/add/answer/${questionId}`,
      answersData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAnswer = async (questionId, answerId, answerData, token) => {
  try {
    const response = await apiClient.patch(
      `/questions/update/answer/${questionId}/${answerId}`,
      answerData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAnswer = async (questionId, answerId, token) => {
  try {
    const response = await apiClient.delete(
      `/questions/delete/answer/${questionId}/${answerId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};