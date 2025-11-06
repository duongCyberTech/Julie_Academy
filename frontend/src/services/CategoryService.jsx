import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = (token) => {
  if (!token) {
    console.warn("Authentication token is missing for API request.");
    return {};
  }
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// ===================================
// === API LIÊN QUAN ĐẾN SÁCH (BOOK) ===
// ===================================

/**
 * Lấy danh sách tất cả các sách
 * Tương ứng với: GET /books
 */
export const getAllBooks = async (token) => {
  try {
    const response = await apiClient.get("/books", getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching books:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};


/**
 * Tạo một hoặc nhiều sách mới
 * Tương ứng với: POST /books
 * (KHÔNG ĐỔI - Đã chính xác)
 */

export const createBook = async (bookData, token) => {
  try {
    const response = await apiClient.post(
      "/books",
      { book: bookData },
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating book(s):",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};


// ======================================
// === API LIÊN QUAN ĐẾN CATEGORY ===
// ======================================

/**
 * Lấy danh sách categories (có filter/search/pagination)
 * Tương ứng với: GET /categories
 */
export const getAllCategories = async (params = {}, token) => {
  try {
    const response = await apiClient.get("/categories", {
      params,
      ...getAuthHeaders(token),
    });
    return response.data; 
  } catch (error) {
    console.error(
      `Error fetching categories:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
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
    console.error(
      `Error updating book ${bookId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
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

    console.error(
      `Error updating category ${categoryId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};
/**
 * Tạo một hoặc nhiều category mới
 * Tương ứng với: POST /categories
 * @param {Array<object>} categoryData - Mảng các đối tượng category
 * (Mỗi object PHẢI chứa book_id)
 */
export const createCategory = async (categoryData, token) => {
  try {
    const response = await apiClient.post(
      "/categories",
      categoryData, 
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error creating categories:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};
