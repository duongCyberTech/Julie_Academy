import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

/**
 * Lấy số liệu tổng quan của 1 đứa con
 * GET /dashboard/parent/:child_id/overall-stats
 */
export const getStudentStats = async (token, childId) => {
    try {
        const response = await apiClient.get(
            `/dashboard/parent/${childId}/overall-stats`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        console.error(
            '[Parent] Lỗi khi lấy overall-stats:',
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Lấy danh sách lộ trình (sách) áp dụng cho 1 đứa con
 * GET /dashboard/parent/:child_id/plans
 */
export const getMyPlans = async (token, childId) => {
    try {
        const response = await apiClient.get(
            `/dashboard/parent/${childId}/plans`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        console.error(
            '[Parent] Lỗi khi lấy plans:',
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Lấy xu hướng điểm số của 1 đứa con
 * GET /dashboard/parent/:child_id/score-trend?group_time=...&exam_type=...
 */
export const getScoreTrend = async (token, childId, params) => {
    try {
        const response = await apiClient.get(
            `/dashboard/parent/${childId}/score-trend`,
            { ...getAuthHeaders(token), params }
        );
        return response.data;
    } catch (error) {
        console.error(
            '[Parent] Lỗi khi lấy score-trend:',
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Lấy bản đồ kỹ năng (Radar) của 1 đứa con theo lộ trình
 * GET /dashboard/parent/:child_id/skills-map?plan_id=...
 */
export const getSkillsMap = async (token, childId, planId) => {
    try {
        const response = await apiClient.get(
            `/dashboard/parent/${childId}/skills-map`,
            { ...getAuthHeaders(token), params: { plan_id: planId } }
        );
        return response.data;
    } catch (error) {
        console.error(
            '[Parent] Lỗi khi lấy skills-map:',
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Lấy chi tiết 1 chương trong bản đồ kỹ năng (drill down)
 * GET /dashboard/parent/:child_id/skills-map/:chapter_id?plan_id=...
 */
export const getSkillsMapDrillDown = async (token, childId, chapterId, planId) => {
    try {
        const response = await apiClient.get(
            `/dashboard/parent/${childId}/skills-map/${chapterId}`,
            { ...getAuthHeaders(token), params: { plan_id: planId } }
        );
        return response.data;
    } catch (error) {
        console.error(
            '[Parent] Lỗi khi lấy skills-map detail:',
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Lấy lịch sử làm bài của 1 đứa con
 * GET /dashboard/parent/:child_id/current-test?limit=&page=&exam_type=&startAt=&endAt=
 */
export const getHistory = async (token, childId, params) => {
    try {
        const response = await apiClient.get(
            `/dashboard/parent/${childId}/current-test`,
            { ...getAuthHeaders(token), params }
        );
        return response.data;
    } catch (error) {
        console.error(
            '[Parent] Lỗi khi lấy history:',
            error.response?.data || error.message
        );
        throw error;
    }
};