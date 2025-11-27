import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

/**
 * Lấy thống kê đăng ký (Gia sư + Học sinh) trong 7 ngày
 * @returns {Promise<number[]>} Mảng 7 con số
 */
export const getRegisterStats = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/register-stats', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching register stats:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy thống kê lớp học được tạo trong 7 ngày
 * @returns {Promise<number[]>} Mảng 7 con số
 */
export const getClassCreatedStats = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/class-created-stats', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching class created stats:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy thống kê lượt làm bài thi trong 7 ngày
 * @returns {Promise<number[]>} Mảng 7 con số
 */
export const getExamTakenStats = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/exam-taken-stats', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching exam taken stats:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy tổng số lớp đang hoạt động
 * @returns {Promise<number>} 1 con số
 */
export const getNumberOfActiveClasses = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/number-of-active-classes', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching active classes count:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy tổng số câu hỏi trong kho
 * @returns {Promise<number>} 1 con số
 */
export const getNumberOfQuestions = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/number-of-questions', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching questions count:', error.response?.data || error.message);
        throw error;
    }
};