import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

/**
 * Lấy danh sách lớp học của gia sư đang đăng nhập.
 * Giả định endpoint: GET /classes/my
 */
export const getMyClasses = async (token) => {
    try {
        const decoded = jwtDecode(token);
        const tutorId = decoded.sub;
        if (!tutorId) throw new Error("Could not find tutor ID in token.");

        // Backend cần một endpoint để lấy lớp học theo tutorId
        const response = await apiClient.get(`/classes/my/${tutorId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching my classes:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Tạo một lớp học mới.
 * Giả định endpoint: POST /classes/create
 */
export const createClass = async (classData, token) => {
    try {
        const response = await apiClient.post('/classes/create', classData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error creating class:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Xóa một lớp học.
 * Giả định endpoint: DELETE /classes/{classId}
 */
export const deleteClass = async (classId, token) => {
    try {
        await apiClient.delete(`/classes/${classId}`, getAuthHeaders(token));
    } catch (error) {
        console.error(`Error deleting class with id ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};