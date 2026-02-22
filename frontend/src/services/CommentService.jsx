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
        console.log(">> [SUBMIT]: ", commentData.parent_cmt_id)
        const formData = new FormData()
        formData.append('content', commentData.content)
        if (commentData?.parent_cmt_id) formData.append('parent_cmt_id', commentData.parent_cmt_id)
        if (commentData?.email) formData.append('email', commentData.email)
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

const updateComment = async (threadId, commentId, updateData, images = []) => {
    try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        formData.append('content', updateData.content)
        if (updateData?.deletedImages && updateData?.deletedImages.length)
            updateData.deletedImages.forEach(img => {
                formData.append('deletedImages', img)
            });
        images.forEach(img => {
            formData.append('images', img)
        })

        const response = await apiClient.patch(
            `comments/${threadId}/${commentId}`,
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

const deleteComment = async(threadId, commentId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await apiClient.delete(
            `/comments/${threadId}/${commentId}`,
            getAuthHeaders(token)
        );
        return response
    } catch (error) {
        throw error;
    }
}

export {
    socket,
    createComment,
    getCommentsByThread,
    updateComment,
    deleteComment
}