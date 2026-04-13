import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

// Hàm hỗ trợ lấy headers chứa token
const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

/**
 * Lấy số liệu thống kê tổng quan của học sinh
 */
export const getStudentStats = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/student-stats', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy student stats:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy danh sách sách / lộ trình (my plans)
 */
export const getMyPlans = async (token) => {
    try {
        const response = await apiClient.get('/books', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách books:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy dữ liệu xu hướng điểm số
 */
export const getScoreTrend = async (token, params) => {
    try {
        const response = await apiClient.get('/dashboard/student/score-trend', {
            ...getAuthHeaders(token),
            params // params chứa group_time và exam_type
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy score trend:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy dữ liệu bản đồ kỹ năng (Radar chart)
 */
export const getSkillsMap = async (token, planId) => {
    try {
        const response = await apiClient.get('/dashboard/student/skills-map', {
            ...getAuthHeaders(token),
            params: { plan_id: planId }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy skills map:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy dữ liệu chi tiết của một chương trong bản đồ kỹ năng (Drill down)
 */
export const getSkillsMapDrillDown = async (token, chapterId, planId) => {
    try {
        const response = await apiClient.get(`/dashboard/student/skills-map/${chapterId}`, {
            ...getAuthHeaders(token),
            params: { plan_id: planId }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết skills map:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy lịch sử làm bài của học sinh
 */
export const getHistory = async (token, params) => {
    try {
        const response = await apiClient.get('/dashboard/student/current-test', {
            ...getAuthHeaders(token),
            params // params chứa limit, page, exam_type, startAt, endAt
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử làm bài:', error.response?.data || error.message);
        throw error;
    }
};