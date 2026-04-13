import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

export const getTutorOverallStats = async (token) => {
    try {
        const response = await apiClient.get('/dashboard/tutor-stats/overall', getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching tutor overall stats:', error.response?.data || error.message);
        throw error;
    }
};

export const getExamSessionStats = async (token, classId, dayRange = 7) => {
    if (!classId) {
        throw new Error("classId is required to fetch exam session stats");
    }

    try {
        const response = await apiClient.get(`/dashboard/tutor-stats/${classId}/exam-session`, {
            ...getAuthHeaders(token),
            params: { day_range: dayRange } 
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching exam session stats:', error.response?.data || error.message);
        throw error;
    }
};

export const getAttentionRequiredStudents = async (token, filters = {}) => {
    const {
        limit = 5,
        page = 1,
        scoreThreshold,
        missedThreshold,
        ...otherQueries 
    } = filters;

    const params = {
        limit,
        page,
        ...(scoreThreshold !== undefined && { grade_threshold: scoreThreshold }),
        ...(missedThreshold !== undefined && { test_miss_threshold: missedThreshold }),
        ...otherQueries
    };

    try {
        const response = await apiClient.get('/dashboard/tutor-stats/student-attention', {
            ...getAuthHeaders(token),
            params 
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching student attention stats:', error.response?.data || error.message);
        throw error;
    }
};