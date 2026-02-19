import { io } from 'socket.io-client';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');

const createComment = async (threadId, commentData, images) => {
    try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('content', commentData.content)
        if (commentData?.parent_cmt_id) formData.append('parent_cmt_id', commentData.parent_cmt_id)
        images.forEach(item => {formData.append('images', item)})

        const response = await apiClient.post(
            `/comments/${threadId}`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(token).headers,
                    'Content-Type': 'multipart/form-data', 
                },
            }
        )

        return response
    } catch (error) {
        throw error
    }
}

const getCommentsByThread = async (threadId, parentCmtId, page = 1) => {
    try {
        const token = localStorage.getItem('token')
        const response = await apiClient.get(
            `/comments/thread/${threadId}?page=${page}` + (parentCmtId ? `&pnt=${parentCmtId}` : ""),
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        return error;
    }
};

export {
    socket,
    createComment,
    getCommentsByThread
}