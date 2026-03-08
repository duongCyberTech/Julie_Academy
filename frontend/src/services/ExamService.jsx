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

// --- Exam Controller APIs ---

export const createExam = async (examData, token) => {
    try {
        const tutorId = getTutorIdFromToken(token);
        const response = await apiClient.post(`/exam/create/new/${tutorId}`, examData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error creating exam:', error.response?.data || error.message);
        throw error;
    }
};

export const addQuestionToExam = async (examId, questionIds, token) => {
    try {
        const response = await apiClient.post(`/exam/add/question/${examId}`, { ques: questionIds }, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error adding questions to exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const removeQuestionFromExam = async (examId, questionId, token) => {
    try {
        const response = await apiClient.post(`/exam/remove/question/${examId}`, { ques_id: questionId }, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error removing question ${questionId} from exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getAllExams = async (params = {}, token) => {
    try {
        const response = await apiClient.get('/exam/get', {
            params,
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all exams:', error.response?.data || error.message);
        throw error;
    }
};

export const getMyExams = async (token, params = {}) => {
    try {
        const tutorId = getTutorIdFromToken(token);
        const response = await apiClient.get(`/exam/get/tutor/${tutorId}`, {
            params,
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching my exams:', error.response?.data || error.message);
        throw error;
    }
};

export const getExamDetail = async (examId, token) => {
    try {
        const response = await apiClient.get(`/exam/get/detail/${examId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getQuestionsOfExam = async (examId, token) => {
    try {
        const response = await apiClient.get(`/exam/get/questions/${examId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching questions for exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const updateExam = async (examId, examData, token) => {
    try {
        const response = await apiClient.patch(`/exam/update/${examId}`, examData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error updating exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Exam Session Controller APIs ---

export const createExamSession = async (examId, classIds, sessionData, token) => {
    try {
        const body = {
            classLst: classIds,
            session: sessionData
        };
        const response = await apiClient.post(`/exam/session/new/${examId}`, body, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error creating session for exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const updateSession = async (examId, sessionId, sessionData, token) => {
    try {
        const response = await apiClient.patch(`/exam/session/update/${examId}/${sessionId}`, sessionData, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error updating session ${sessionId} for exam ${examId}:`, error.response?.data || error.message);
        throw error;
    }
};
export const getSessionsByClass = async (classId, token, params = {}) => { // Thêm params = {}
    try {
        const response = await apiClient.get(`/exam/session/class/${classId}`, {
            params, // Truyền params vào cấu hình axios
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching sessions for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

// 1. Lấy danh sách bài đang làm dở
export const getPendingExamTakens = async (classId, token) => {
    try {
        const response = await apiClient.get(`/exam_taken/pending/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching pending exams for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

// 2. Lấy danh sách bài đã nộp (đã hoàn thành)
export const getCompletedExamTakens = async (classId, token) => {
    try {
        const response = await apiClient.get(`/exam_taken/completed/${classId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error fetching completed exams for class ${classId}:`, error.response?.data || error.message);
        throw error;
    }
};

// 3. Bắt đầu làm bài mới (Lấy đề)
export const takeExam = async (classId, examId, sessionId, token) => {
    try {
        const response = await apiClient.get(`/exam_taken/class/${classId}/${examId}/${sessionId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error taking exam (Class: ${classId}, Exam: ${examId}):`, error.response?.data || error.message);
        throw error;
    }
};

// 4. Tiếp tục làm bài dở dang
export const continueTakeExam = async (etId, token) => {
    try {
        const response = await apiClient.get(`/exam_taken/continue/${etId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error continuing exam (ET_ID: ${etId}):`, error.response?.data || error.message);
        throw error;
    }
};

// 5. Nộp bài
// 5. Nộp bài
export const submitExam = async (etId, classId, submitAns, isDone, token) => {
    try {
        const body = {
            submitAns: submitAns, // ĐÂY LÀ CHÌA KHÓA: Tên biến phải khớp 100% với @Body("submitAns") ở Backend
            isDone: isDone
        };
        const response = await apiClient.post(`/exam_taken/${etId}/class/${classId}`, body, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error submitting exam (ET_ID: ${etId}):`, error.response?.data || error.message);
        throw error;
    }
};

export const getAllAssignmentsForStudent = async (token, params = {}) => {
    try {
        const response = await apiClient.get(`/exam/session/student/all`, {
            params, // ĐÃ THÊM PARAMS Ở ĐÂY ĐỂ TRUYỀN LÊN BACKEND
            ...getAuthHeaders(token)
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching all student assignments:`, error.response?.data || error.message);
        throw error;
    }
};