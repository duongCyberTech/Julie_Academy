/*
 * File: frontend/src/pages/student/StudentPracticeResultPage.jsx
 *
 * (TRANG KẾT QUẢ CUỐI PHIÊN LUYỆN TẬP - ĐÃ SỬA LỖI ĐIỀU HƯỚNG REVIEW)
 *
 * Tính năng:
 * 1. Nhận điểm số (correct/total) qua state của useLocation.
 * 2. CUNG CẤP NÚT REVIEW ĐIỀU HƯỚNG ĐÚNG TỚI '/student/practice/review/:sessionId'.
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Chip,
    Paper,
    Divider,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; 

// ======================================================
// --- MOCK DATA (Giả lập thông tin Session) ---
// ======================================================

const MOCK_SESSION_INFO = {
    'cd-c1-s1': {
        topic: 'Chương 1: Phương trình quy về PT bậc nhất 1 ẩn',
        subject: 'Toán 9 (Cánh Diều)',
        duration_minutes: 10, // Giả định thời gian luyện tập
    },
};

// Hàm giả định tính thời gian làm bài (nếu muốn)
const calculateMockDuration = (durationMinutes) => {
    // Giả định thời gian làm là 80% thời gian tối đa
    const seconds = Math.floor(durationMinutes * 60 * 0.8); 
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds} giây`;
};

// ======================================================
// --- MAIN COMPONENT ---
// ======================================================

export default function StudentPracticeResultPage() {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy score từ state (truyền từ StudentPracticeSessionPage)
    const score = location.state?.score; 
    const sessionInfo = MOCK_SESSION_INFO[sessionId] || { 
        topic: 'Phiên Luyện Tập Chung', 
        subject: 'Không rõ',
        duration_minutes: 15,
    };
    
    // Nếu không có điểm số, quay lại trang luyện tập
    if (!score || !score.total || !score.correct) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Không tìm thấy dữ liệu kết quả.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/practice')}>
                    Quay lại Trang Luyện tập
                </Button>
            </Container>
        );
    }

    const percentage = Math.round((score.correct / score.total) * 100);
    const isGoodResult = percentage >= 70;
    const resultColor = isGoodResult ? 'success' : 'warning';

    // 🔥 XỬ LÝ NÚT XEM LẠI CHI TIẾT (Điều hướng đúng)
    const handleReview = () => {
        // Điều hướng TỚI TRANG REVIEW chuyên biệt
        navigate(`/student/practice/review/${sessionId}`); 
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Kết quả Phiên Luyện tập
            </Typography>

            {/* 1. KHUNG TỔNG QUAN VÀ ĐIỂM SỐ */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderLeft: `5px solid ${isGoodResult ? '#4CAF50' : '#FF9800'}` }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid #eee' } }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: `${resultColor}.main` }}>
                            {percentage}%
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Tỉ lệ chính xác
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            {sessionInfo.topic}
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MenuBookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body1">Môn học: {sessionInfo.subject}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body1">
                                        Thời gian: {calculateMockDuration(sessionInfo.duration_minutes)} (Giả định)
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Chip label={`Tổng câu: ${score.total}`} color="default" sx={{ mr: 1, fontWeight: 600 }} />
                                <Chip label={`Đúng: ${score.correct}`} color="success" sx={{ mr: 1, fontWeight: 600 }} />
                                <Chip label={`Sai: ${score.total - score.correct}`} color="error" sx={{ fontWeight: 600 }} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            
            {/* 2. KHUNG HÀNH ĐỘNG VÀ GỢI Ý */}
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    {isGoodResult ? 'Chúc mừng! Kiến thức đã vững vàng.' : 'Cần chú trọng cải thiện những câu sai.'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleReview} // Gọi hàm điều hướng đã sửa
                        startIcon={<CheckCircleIcon />}
                    >
                        Xem lại chi tiết bài làm
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={() => navigate('/student/practice')} 
                        startIcon={<ReplayIcon />}
                    >
                        Tiếp tục luyện tập khác
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        onClick={() => navigate('/student/dashboard')} 
                        startIcon={<TrendingUpIcon />}
                    >
                        Xem bản đồ kiến thức
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}