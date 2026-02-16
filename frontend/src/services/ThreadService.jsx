import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

export const createThread = async (threadData) => {
    const token = localStorage.getItem("token")
    try {
        const formData = new FormData();
        formData.append('title', threadData.title);
        formData.append('content', threadData.content);
        formData.append('class_id', threadData.class_id);
        threadData.images.forEach(img => {
            formData.append('images', img)
        });
        const response = await apiClient.post(
            '/threads', 
            formData, 
            {
                headers: {
                    ...getAuthHeaders(token).headers,
                    'Content-Type': 'multipart/form-data', 
                },
            }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const getThreadsByClass = async (classId, token, page = 1) => {
    try {
        const response = await apiClient.get(
            `/threads/class/${classId}?page=${page}`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
};

export const getThreadById = async (threadId, token) => {
    try {
        const response = await apiClient.get(
            `/threads/${threadId}`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }   
};

export const updateThread = async(threadId, threadData) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', threadData.title);
        formData.append('content', threadData.content);
        formData.append('class_id', threadData.class_id);

        threadData.deletedImages.forEach(img => {
            formData.append('deletedImages', img)
        });

        threadData.addImages.forEach(img => {
            formData.append('addImages', img)
        })

        const response = await apiClient.patch(
            `/threads/${threadId}`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(token).headers,
                    'Content-Type': 'multipart/form-data', 
                },
            }
        );
        return response
    } catch (error) {
        throw error;
    }
}

export const followThread = async(threadId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await apiClient.post(
            `/threads/follow/${threadId}`,
            {},
            getAuthHeaders(token)
        );
        return response.data
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const unfollowThread = async(threadId) => {
    try {
        const token = localStorage.getItem('token');
        
        const response = await apiClient.delete(
            `/threads/unfollow/${threadId}`,
            getAuthHeaders(token)
        );
        return response.data
    } catch (error) {
        throw error.response?.data || error;
    }    
}