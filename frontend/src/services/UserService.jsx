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

export const getUserDetailsForTag = async (class_id, search = "") => {
  try {
    const token = localStorage.getItem('token')
    const response = await apiClient.get(`/users/tag/${class_id}`, {
      params: { search },
      ...getAuthHeaders(token),
    });
    return response;    
  } catch (error) {
    throw error
  }
}

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
 * Tương ứng với: PATCH /users/{id}
 */
export const updateUser = async (userId, userData, token) => {
  try {
    const response = await apiClient.patch(
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

/**
 * Lấy danh sách con cái của phụ huynh đang đăng nhập
 * Tương ứng với: GET /users/parents/children
 */
export const getMyChildren = async (token) => {
  try {
    const response = await apiClient.get(
      "/users/parents/children",
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching children list:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Lấy thông tin hồ sơ người dùng
 * @param {string} userId - ID của người dùng
 * @param {string} token - Token xác thực
 */
export const getUserProfile = async (userId, token) => {
  try {
    const response = await apiClient.get(`/users/${userId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật thông tin hồ sơ người dùng (bao gồm cả tải ảnh)
 * @param {string} userId - ID của người dùng
 * @param {FormData} formData - Dữ liệu form cần cập nhật
 * @param {string} token - Token xác thực
 */
export const updateUserProfile = async (userId, formData, token) => {
  try {
    const authConfig = getAuthHeaders(token);
    const response = await apiClient.patch(`/users/${userId}`, formData, {
      ...authConfig,
      headers: {
        ...authConfig.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
/**
 * Thay đổi mật khẩu người dùng
 * Tương ứng với: PATCH hoặc POST /users/{id}/password
 * @param {string} userId - ID của người dùng
 * @param {Object} passwordData - { oldPassword, newPassword }
 * @param {string} token - Token xác thực
 */
export const changePassword = async (userId, passwordData, token) => {
  try {
    const response = await apiClient.patch(
      `/users/password`, 
      passwordData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error changing password for user ${userId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};