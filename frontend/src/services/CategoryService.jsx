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
 * @param {Array<object>} bookData - Mảng các đối tượng sách (title, subject, grade, description?)
 */
export const createBook = async (bookData, token) => {
  try {
    // Controller nhận { "book": [...] }
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

/**
 * Cập nhật thông tin một sách
 * Tương ứng với: PATCH /books/{book_id} (Giả định endpoint)
 * @param {string} bookId - ID của sách cần cập nhật
 * @param {object} bookData - Dữ liệu cập nhật (Partial<BookDto>)
 */
export const updateBook = async (bookId, bookData, token) => {
  try {
    const response = await apiClient.patch(
      `/books/${bookId}`, // Giả định endpoint là PATCH /books/:id
      bookData,
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

// ======================================
// === API LIÊN QUAN ĐẾN CATEGORY ===
// ======================================

/**
 * Lấy danh sách categories thuộc về một sách (có filter/search/pagination)
 * Tương ứng với: GET /categories/{book_id}
 */
export const getAllCategories = async (bookId, params = {}, token) => {
  try {
    const response = await apiClient.get(`/categories/${bookId}`, {
      params,
      ...getAuthHeaders(token),
    });
    return response.data; // Backend trả về { data: [], total: number }
  } catch (error) {
    console.error(
      `Error fetching categories for book ${bookId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Tạo một hoặc nhiều category mới cho một sách
 * Tương ứng với: POST /categories/{book_id}
 * @param {string} bookId
 * @param {Array<object>} categoryData - Mảng các đối tượng category (category_name, description?)
 */
export const createCategory = async (bookId, categoryData, token) => {
  try {
    // Controller nhận { "categories": [...] }
    const response = await apiClient.post(
      `/categories/${bookId}`,
      { categories: categoryData },
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error creating categories for book ${bookId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Cập nhật thông tin một category
 * Tương ứng với: PATCH /categories/{category_id} (Giả định endpoint)
 * @param {string} categoryId - ID của category cần cập nhật
 * @param {object} categoryData - Dữ liệu cập nhật (Partial<CategoryDto>)
 */
export const updateCategory = async (categoryId, categoryData, token) => {
  try {
    const response = await apiClient.patch(
      `/categories/${categoryId}`, // Giả định endpoint là PATCH /categories/:id
      categoryData,
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

