import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

/**
 * Lấy toàn bộ thống kê tổng quan cho Admin Dashboard
 * Backend trả về 1 object chứa tất cả các chỉ số.
 * * @param {string} token - JWT Token của admin
 * @returns {Promise<{
 * numRegByWeek: number[],        // Mảng 7 con số thống kê đăng ký 7 ngày qua
 * numClassCreatedByWeek: number[], // Mảng 7 con số thống kê lớp học mới 7 ngày qua
 * numExamTakenByWeek: number[],    // Mảng 7 con số thống kê lượt làm bài 7 ngày qua
 * numActiveClasses: number,        // Tổng số lớp đang hoạt động
 * numQuestion: number              // Tổng số câu hỏi trong hệ thống
 * }>}
 */
export const getAdminStats = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/admin-stats', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching admin stats:', error.response?.data || error.message);
        throw error;
    }
};