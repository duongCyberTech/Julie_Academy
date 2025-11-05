import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const getTutorIdFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        const userId = decoded.sub; 
        if (!userId) throw new Error("Could not find user ID (sub) in token.");
        return userId;
    } catch (error) {
        console.error('Invalid or missing token:', error.message);
        throw new Error('Invalid or missing token.');
    }
}

// ===================================
// === API CỦA CLASS CONTROLLER ===
// ===================================

/**
 * Tạo một lớp học mới.
 * API: POST /classes/create/:id
 */
export const createClass = async (classData, token) => {
    try {
        const tutorId = getTutorIdFromToken(token);
        const response = await apiClient.post(`/classes/create/${tutorId}`, classData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error creating class:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy danh sách tất cả các lớp (cho Admin/Tìm kiếm).
 * API: GET /classes/get
 */
export const getAllClasses = async (params = {}, token) => {
    try {
        // Đã khớp
        const response = await apiClient.get('/classes/get', {
            params, // params = { page: 1, limit: 10, search: '...' }
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all classes:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy danh sách lớp học của gia sư đang đăng nhập.
 * API: GET /classes/get/tutor/:id
 */
export const getMyClasses = async (token) => {
    try {
        const tutorId = getTutorIdFromToken(token);
        const response = await apiClient.get(`/classes/get/tutor/${tutorId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching my classes:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy chi tiết một lớp học.
 * API: GET /classes/get/detail/:id
 */
export const getClassDetails = async (classId, token) => {
    try {
        // Đã khớp (File service cũ của bạn đã đúng URL này)
        const response = await apiClient.get(`/classes/get/detail/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Thêm một học sinh vào lớp học.
 * API: POST /classes/enroll/:classId/:studentId
 */
export const enrollStudentToClass = async (classId, studentId, token) => {
    try {
        // Đã khớp
        const response = await apiClient.post(`/classes/enroll/${classId}/${studentId}`, {}, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error enrolling student ${studentId} to class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * (CẢNH BÁO: API NÀY CHƯA TỒN TẠI TRÊN BACKEND)
 * Xóa một lớp học.
 */
export const deleteClass = async (classId, token) => {
    try {
        console.warn(`CẢNH BÁO: Đang gọi API DELETE /classes/${classId} không tồn tại trên ClassController.`);
        // API này không tồn tại trong class.controller.ts, sẽ báo lỗi 404
        const response = await apiClient.delete(`/classes/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error deleting class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};


// =======================================
// === API CỦA SCHEDULE CONTROLLER ===
// =======================================

/**
 * Tạo lịch học (một hoặc nhiều) cho một lớp.
 * API: POST /schedule/create/:class_id
 */
export const createSchedule = async (classId, scheduleData, token) => {
    try {
        // scheduleData là một mảng [ScheduleDto]
        const response = await apiClient.post(`/schedule/create/${classId}`, scheduleData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error creating schedule for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Xóa lịch học (một, nhiều, hoặc tất cả).
 * API: POST /schedule/delete/:class_id?mode=true/false
 */
export const deleteSchedule = async (classId, mode, scheduleIds, token) => {
    try {
        // scheduleIds là một mảng [number]
        // mode là boolean (true = xóa hết, false = xóa theo mảng)
        const response = await apiClient.post(
            `/schedule/delete/${classId}`, 
            { data: scheduleIds }, // Body là { data: [1, 2, 3] }
            { 
                params: { mode: mode }, // Query param
                ...getAuthHeaders(token) 
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error deleting schedule for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy lịch học của một lớp cụ thể.
 * API: GET /schedule/get/class/:class_id
 */
export const getScheduleByClass = async (classId, token) => {
    try {
        const response = await apiClient.get(`/schedule/get/class/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching schedule for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy toàn bộ lịch học (cho Admin).
 * API: GET /schedule/get/all
 */
export const getAllSchedule = async (token) => {
    try {
        const response = await apiClient.get('/schedule/get/all', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching all schedule:', error.response?.data || error.message);
        throw error;
    }
};