import axios from "axios";
import { jwtDecode } from "jwt-decode";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = (token) => {
  if (!token) {
    console.error("Authentication token is missing for API request.");
    return {};
  }
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// --- QUESTION APIs ---


/**
 * Tạo câu hỏi mới.
 * Tự động lấy tutorId từ token.
 * @param {Array<object>} questionsData - Dữ liệu câu hỏi (payload)
 * @param {string} token - JWT Token
 */
export const createQuestion = async (questionsData, token) => {
  try {
    // 1. Tự động giải mã token để lấy tutorId
    const decoded = jwtDecode(token);
    const tutorId = decoded.sub; 
    if (!tutorId) {
      console.error("Tutor ID is required (decoded from token).");
      throw new Error("Tutor ID is required.");
    }
    const response = await apiClient.post(
      `/questions/create/${tutorId}`, 
      questionsData,                
      getAuthHeaders(token)          
    );
    return response.data;
  } catch (error) {
    console.error("Error creating question(s):", error.response?.status, error.response?.data || error.message);
    throw error;
  }
};
// ==============================================================
// === KẾT THÚC SỬA ===
// ==============================================================

export const getAllQuestions = async (params = {}, token) => {
  try {
    const response = await apiClient.get("/questions/get", {
      params,
      ...getAuthHeaders(token),
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching public questions:", error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

export const getQuestionsByCategory = async (categoryId, params = {}, token) => {
  if (!categoryId) {
      console.warn("Category ID is missing for fetching questions by category.");
      return { data: [], total: 0 }; 
  }
  try {
    const response = await apiClient.get(`/questions/get/category/${categoryId}`, {
      params,
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching questions for category ${categoryId}:`, error.response?.status, error.response?.data || error.message);
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
      ...getAuthHeaders(token),
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching my questions:", error.response?.status, error.response?.data || error.message);
    throw error;
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
    console.error(`Error fetching question detail for id ${questionId}:`, error.response?.status, error.response?.data || error.message);
    throw error;
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
    console.error(`Error updating question with id ${questionId}:`, error.response?.status, error.response?.data || error.message);
    throw error;
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
    console.error(`Error deleting question with id ${questionId}:`, error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

// --- ANSWER APIs ---

export const addAnswers = async (questionId, answersData, token) => {
  try {
    const response = await apiClient.post(
      `/questions/add/answer/${questionId}`,
      answersData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding answers for question ${questionId}:`, error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

export const updateAnswer = async (questionId, answerId, answerData, token) => {
  try {
    const aidNum = Number(answerId);
    if (isNaN(aidNum)) { throw new Error("Answer ID (aid) must be a number."); }
    const response = await apiClient.patch(
      `/questions/update/answer/${questionId}/${aidNum}`,
      answerData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating answer ${answerId} for question ${questionId}:`, error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

export const deleteAnswer = async (questionId, answerId, token) => {
  try {
    const aidNum = Number(answerId);
     if (isNaN(aidNum)) { throw new Error("Answer ID (aid) must be a number."); }
    const response = await apiClient.delete(
      `/questions/delete/answer/${questionId}/${aidNum}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting answer ${answerId} for question ${questionId}:`, error.response?.status, error.response?.data || error.message);
    throw error;
  }
};