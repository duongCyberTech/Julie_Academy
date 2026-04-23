import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => {
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

// ==========================================
// TUTOR ANALYSIS APIs (Thống kê & Báo cáo)
// ==========================================

/**
 * Lấy dữ liệu thống kê toàn diện của 1 bài kiểm tra trong 1 lớp học cụ thể
 * @param {string} classId - ID của lớp học
 * @param {string} examId - ID của bài kiểm tra
 * @param {number|string} sessionId - ID của phiên thi (lần giao bài)
 * @param {string} token - JWT Token xác thực
 * @returns {Promise<Object>} Object chứa overview, charts và student_list
 */
export const getExamSessionDashboard = async (classId, examId, sessionId, token) => {
    try {
        
        const response = await apiClient.get(
            `/analysis/tutor/class/${classId}/exam/${examId}/session/${sessionId}`,
            getAuthHeaders(token)
        );

        return response.data;
    } catch (error) {
        console.error("[API ERROR] Lỗi khi lấy dữ liệu thống kê điểm:");
        console.error(" - Mã lỗi:", error.response?.status);
        console.error(" - Chi tiết lỗi:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getStudentAnalytics = async (studentId, token) => {
    try {
        const response = await apiClient.get(
            `/analysis/${studentId}`,
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};