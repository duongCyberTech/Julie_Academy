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

export const uploadResource = async (folderId, file, data, token) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
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
                    'Content-Type': undefined, 
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Upload error:", error);
        throw error.response?.data || error;
    }
};

export const getAllResources = async (token) => {
    try {
        const response = await apiClient.get('/resources', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getResourcesByFolder = async (folderId, token) => {
    try {
        const response = await apiClient.get(`/resources/${folderId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

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

// [ĐÃ SỬA] Thay thế fetchFileStreamS3 bằng API lấy Presigned URL
export const fetchPresignedUrl = async (did, token) => {
    try {
        // Không dùng responseType: 'blob' nữa vì Backend đã trả JSON
        const response = await apiClient.get(`/resources/view/${did}`, getAuthHeaders(token));
        return response.data; // Trả về { signedUrl, fileInfo }
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteResource = async (did, token) => {
    try {
        const response = await apiClient.delete(`/resources/${did}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};


// ==========================================
// FOLDER APIs (Thư mục)
// ==========================================

export const createFolder = async (classId, categoryId, folderData, token) => {
    try {
        const response = await apiClient.post(`/folders/${classId}/${categoryId}`, folderData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getFoldersByClass = async (classId, token) => {
    try {
        const response = await apiClient.get(`/folders/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getFoldersByLayer = async (classId, categoryId, parentId, token) => {
    try {
        const params = {};
        if (parentId) params.parent_id = parentId;
        const response = await apiClient.get(`/folders/${classId}/${categoryId}`, { params, ...getAuthHeaders(token) });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateFolder = async (folderId, data, token) => {
    try {
        const response = await apiClient.patch(`/folders/${folderId}`, data, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteFolder = async (folderId, token) => {
    try {
        const response = await apiClient.delete(`/folders/${folderId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};