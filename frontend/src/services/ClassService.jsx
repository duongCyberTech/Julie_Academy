import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const getUserIdFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.sub;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export const createClass = async (classData, token) => {
    try {
        const tutorId = getUserIdFromToken(token);
        const response = await apiClient.post(
            `/classes/create/${tutorId}`, 
            classData, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAllClasses = async (params = {}, token) => {
    try {
        const response = await apiClient.get('/classes/get', {
            params,
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getClassesByTutor = async (token, tutorId = null) => {
    try {
        const id = tutorId || getUserIdFromToken(token);
        const response = await apiClient.get(
            `/classes/get/tutor/${id}`, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getClassDetails = async (classId, token) => {
    try {
        const response = await apiClient.get(
            `/classes/get/detail/${classId}`, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const enrollClass = async (classId, studentEmail, token) => {
    try {
        const response = await apiClient.post(
            `/classes/enroll/${classId}`, 
            { studentEmail : studentEmail }, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateClass = async (classId, data, token) => {
    try {
        const response = await apiClient.patch(
            `/classes/${classId}`, 
            data, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const cancelClass = async (studentId, classId, token) => {
    try {
        const response = await apiClient.delete(
            `/classes/${studentId}/${classId}`, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createSchedule = async (classId, scheduleData, token) => {
    try {
        const response = await apiClient.post(
            `/schedule/create/${classId}`, 
            scheduleData, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteSchedule = async (classId, mode, scheduleIds, token) => {
    try {
        const response = await apiClient.post(
            `/schedule/delete/${classId}`, 
            { data: scheduleIds }, 
            { 
                params: { mode },
                ...getAuthHeaders(token) 
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAllSchedules = async (token) => {
    try {
        const response = await apiClient.get(
            '/schedule/get/all', 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getScheduleByClass = async (classId, token) => {
    try {
        const response = await apiClient.get(
            `/schedule/get/class/${classId}`, 
            getAuthHeaders(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};