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
        console.log('[API TutorService] getTutorOverallStats trả về:', response.data); // LOG DATA
        return response.data;
    } catch (error) {
        console.error('Error fetching tutor overall stats:', error.response?.data || error.message);
        throw error;
    }
};

export const getExamSessionStats = async (token, dayRange = 7) => {
    try {
        const response = await apiClient.get(`/dashboard/tutor-stats/exam-session`, {
            ...getAuthHeaders(token),
            params: { day_range: dayRange } 
        });
        console.log(`[API TutorService] getExamSessionStats (dayRange: ${dayRange}) trả về:`, response.data); // LOG DATA
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
        console.log(`[API TutorService] getAttentionRequiredStudents (params: ${JSON.stringify(params)}) trả về:`, response.data); // LOG DATA
        return response.data;
    } catch (error) {
        console.error('Error fetching student attention stats:', error.response?.data || error.message);
        throw error;
    }
};