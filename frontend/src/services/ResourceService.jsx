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
// RESOURCE APIs (Tài liệu/File)
// ==========================================

/**
 * Upload tài liệu mới vào một thư mục
 * Endpoint: POST /resources/:folder_id
 */
export const uploadResource = async (folderId, file, data, token) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Các trường data (ResourceDto: title, description, version, num_pages...)
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        const response = await apiClient.post(
            `/resources/${folderId}`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(token).headers,
                    'Content-Type': 'multipart/form-data', 
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Upload error:", error);
        throw error.response?.data || error;
    }
};

/**
 * Lấy tất cả tài liệu của giáo viên đang đăng nhập
 * Endpoint: GET /resources
 */
export const getAllResources = async (token) => {
    try {
        const response = await apiClient.get('/resources', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Lấy tài liệu trong một thư mục cụ thể
 * Endpoint: GET /resources/:folder_id
 */
export const getResourcesByFolder = async (folderId, token) => {
    try {
        const response = await apiClient.get(`/resources/${folderId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Cập nhật thông tin tài liệu
 * Endpoint: PATCH /resources/:did
 */
export const updateResource = async (docId, data, token) => {
    try {
        const response = await apiClient.patch(
            `/resources/${docId}`,
            data,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==========================================
// FOLDER APIs (Thư mục)
// ==========================================

/**
 * Tạo thư mục mới
 * Endpoint: POST /folders/:class_id/:category_id
 * Body: { folder_name, parent_id? }
 */
export const createFolder = async (classId, categoryId, folderData, token) => {
    try {
        const response = await apiClient.post(
            `/folders/${classId}/${categoryId}`,
            folderData,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Lấy cây thư mục của lớp (Trả về dạng Nested Tree)
 * Endpoint: GET /folders/:class_id
 */
export const getFoldersByClass = async (classId, token) => {
    try {
        const response = await apiClient.get(
            `/folders/${classId}`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Lấy danh sách thư mục theo tầng (Layer)
 * Endpoint: GET /folders/:class_id/:category_id?parent_id=...
 */
export const getFoldersByLayer = async (classId, categoryId, parentId, token) => {
    try {
        const params = {};
        if (parentId) params.parent_id = parentId;

        const response = await apiClient.get(
            `/folders/${classId}/${categoryId}`,
            {
                params,
                ...getAuthHeaders(token)
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Cập nhật tên thư mục
 * Endpoint: PATCH /folders/:folder_id
 */
export const updateFolder = async (folderId, data, token) => {
    try {
        const response = await apiClient.patch(
            `/folders/${folderId}`,
            data,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Xóa thư mục (Xóa đệ quy cả con)
 * Endpoint: DELETE /folders/:folder_id
 */
export const deleteFolder = async (folderId, token) => {
    try {
        const response = await apiClient.delete(
            `/folders/${folderId}`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

