/* eslint-disable */
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

// --- Class Controller APIs ---

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

export const getAllClasses = async (params = {}, token) => {
    try {
        const response = await apiClient.get('/classes/get', {
            params,
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all classes:', error.response?.data || error.message);
        throw error;
    }
};

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

export const getClassDetails = async (classId, token) => {
    try {
        const response = await apiClient.get(`/classes/get/detail/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const enrollStudentToClass = async (classId, studentId, token) => {
    try {
        const response = await apiClient.post(`/classes/enroll/${classId}/${studentId}`, {}, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error enrolling student ${studentId} to class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteClass = async (classId, token) => {
    try {
        console.warn(`Attempting to call non-existent API: DELETE /classes/${classId}`);
        const response = await apiClient.delete(`/classes/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error deleting class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Schedule Controller APIs ---

export const createSchedule = async (classId, scheduleData, token) => {
    try {
        const response = await apiClient.post(`/schedule/create/${classId}`, scheduleData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error creating schedule for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteSchedule = async (classId, mode, scheduleIds, token) => {
    try {
        const response = await apiClient.post(
            `/schedule/delete/${classId}`, 
            { data: scheduleIds }, 
            { 
                params: { mode: mode },
                ...getAuthHeaders(token) 
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error deleting schedule for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getScheduleByClass = async (classId, token) => {
    try {
        const response = await apiClient.get(`/schedule/get/class/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching schedule for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getAllSchedule = async (token) => {
    try {
        const response = await apiClient.get('/schedule/get/all', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching all schedule:', error.response?.data || error.message);
        throw error;
    }
};