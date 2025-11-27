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

export const getAllBooks = async (token) => {
  try {
    const response = await apiClient.get("/books", getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPlansByTutor = async (tutorId, token) => {
  try {
    const response = await apiClient.get(`/books/${tutorId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createBook = async (bookData, token) => {
  try {
    const response = await apiClient.post(
      "/books",
      bookData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createBookByTutor = async (tutorId, bookData, token) => {
  try {
    const response = await apiClient.post(
      `/books/${tutorId}`,
      bookData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateBook = async (bookId, updatedData, token) => {
  try {
    const response = await apiClient.patch(
      `/books/${bookId}`,
      updatedData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteBook = async (bookId, mode, token) => {
  try {
    const response = await apiClient.delete(`/books/${bookId}`, {
      params: { mode },
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllCategories = async (params = {}, token) => {
  try {
    const response = await apiClient.get("/categories", {
      params,
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCategory = async (categoryData, token) => {
  try {
    const response = await apiClient.post(
      "/categories",
      categoryData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCategory = async (categoryId, updatedData, token) => {
  try {
    const response = await apiClient.patch(
      `/categories/${categoryId}`,
      updatedData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCategory = async (categoryId, mode, token) => {
  try {
    const response = await apiClient.delete(`/categories/${categoryId}`, {
      params: { mode },
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};