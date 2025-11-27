import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => {
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const uploadResource = async (tutorId, file, data, token) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                if (key === 'folder' && Array.isArray(data[key])) {
                    data[key].forEach(folderId => formData.append('folder[]', folderId));
                } else {
                    formData.append(key, data[key]);
                }
            }
        });

        const response = await apiClient.post(
            `/resources/${tutorId}`,
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
        throw error.response?.data || error;
    }
};

export const createFolder = async (tutorId, classId, folderData, token) => {
    try {
        const response = await apiClient.post(
            `/folders/${tutorId}/${classId}`,
            folderData,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

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