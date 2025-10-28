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

/**
 * Lấy danh sách người dùng (có phân trang/tìm kiếm)
 * Tương ứng với: GET /users
 */
export const getAllUsers = async (params = {}, token) => {
  try {
    const response = await apiClient.get("/users", {
      params,
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching users:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết một người dùng theo ID
 * Tương ứng với: GET /users/{id}
 */
export const getUserById = async (userId, token) => {
  try {
    const response = await apiClient.get(
      `/users/${userId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user with id ${userId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Lấy thông tin người dùng theo Email
 * Tương ứng với: GET /users/e
 */
export const getUserByEmail = async (email, token) => {
  try {
    const response = await apiClient.get("/users/e", {
      params: { email },
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user by email ${email}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Tạo người dùng mới
 * Tương ứng với: POST /users
 */
export const createUser = async (userData, token) => {
  try {
    const response = await apiClient.post(
      "/users",
      userData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating user:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Cập nhật toàn bộ thông tin người dùng
 * Tương ứng với: PUT /users/{id}
 */
export const updateUser = async (userId, userData, token) => {
  try {
    const response = await apiClient.put(
      `/users/${userId}`,
      userData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating user with id ${userId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Cập nhật trạng thái người dùng
 * Tương ứng với: PATCH /users/{id}/status
 */
export const updateUserStatus = async (userId, status, token) => {
  try {
    const response = await apiClient.patch(
      `/users/${userId}/status`,
      { status },
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating user status for ${userId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};
