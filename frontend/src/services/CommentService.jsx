import { apiClient, getAuthHeaders } from "./ApiClient";

const createComment = async (threadId, commentData, images) => {
    try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('content', commentData.content)
        if (commentData?.parent_cmt_id) formData.append('parent_cmt_id', commentData.parent_cmt_id)
        if (commentData?.emails && commentData?.emails.length) commentData.emails.forEach((item) => {formData.append('emails', item)})
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
        return response;
    } catch (error) {
        return error;
    }
};

const fetchCommentsUntil = async (threadId, commentId) => {
    try {
        const token = localStorage.getItem('token')
        const response = await apiClient.get(
            `/comments/until/${threadId}/${commentId}`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        return error;
    }
}

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

const pinComment = async (threadId, commentId) => {
    try {
        const token = localStorage.getItem('token')
        await apiClient.patch(`comments/pin/${threadId}/${commentId}`, {}, getAuthHeaders(token))
    } catch (error) {
        
    }
}

const unpinComment = async (threadId, commentId) => {
    try {
        const token = localStorage.getItem('token')
        await apiClient.patch(`comments/unpin/${threadId}/${commentId}`, {}, getAuthHeaders(token))
    } catch (error) {
        
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
    createComment,
    getCommentsByThread,
    fetchCommentsUntil,
    updateComment,
    pinComment,
    unpinComment,
    deleteComment
}