/*
 * File: frontend/src/pages/student/StudentPracticeResultPage.jsx
 *
 * (TRANG KẾT QUẢ CUỐI PHIÊN LUYỆN TẬP - GIAO DIỆN ĐẸP)
 *
 * Tính năng:
 * 1. Nhận điểm số từ useLocation state.
 * 2. Hiển thị kết quả trực quan (Biểu đồ tròn, Stats).
 * 3. Nút Review điều hướng đúng.
 */

import React from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Chip,
    Paper,
    Divider,
    Stack,
    Avatar,
    alpha,
    useTheme,
    Card,
    CardContent,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';

// ======================================================
// --- MOCK DATA ---
// ======================================================

const MOCK_SESSION_INFO = {
    'cd-c1-s1': {
        topic: 'Chương 1: Phương trình quy về PT bậc nhất 1 ẩn',
        subject: 'Toán 9 (Cánh Diều)',
        duration_minutes: 15,
    },
    // Thêm mock mặc định cho các trường hợp khác để tránh "Không rõ"
    'default': {
        topic: 'Luyện tập Tổng hợp',
        subject: 'Toán 9',
        duration_minutes: 20,
    }
};

// ======================================================
// --- MAIN COMPONENT ---
// ======================================================

export default function StudentPracticeResultPage() {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    // Lấy score từ state (truyền từ StudentPracticeSessionPage)
    const score = location.state?.score; 
    
    // Fallback thông tin session
    const sessionInfo = MOCK_SESSION_INFO[sessionId] || MOCK_SESSION_INFO['default'];
    
    // Nếu không có điểm số (truy cập trực tiếp), quay lại
    if (!score || !score.total) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Không tìm thấy dữ liệu kết quả.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/practice')}>
                    Quay lại Thư viện
                </Button>
            </Container>
        );
    }

    const percentage = Math.round((score.correct / score.total) * 100);
    const isGoodResult = percentage >= 70;
    const resultColor = isGoodResult ? theme.palette.success.main : theme.palette.warning.main;
    
    // Data cho biểu đồ tròn
    const chartData = [
        { name: 'Đúng', value: score.correct, color: theme.palette.success.main },
        { name: 'Sai', value: score.total - score.correct - (score.skipped || 0), color: theme.palette.error.main },
        { name: 'Bỏ qua', value: score.skipped || 0, color: theme.palette.warning.main },
    ];

    // Xử lý nút xem lại chi tiết
    const handleReview = () => {
        navigate(`/student/practice/review/${sessionId}`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            
            {/* Header Card */}
            <Card elevation={0} sx={{ 
                borderRadius: 4, 
                mb: 4, 
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'visible',
                position: 'relative'
            }}>
                {/* Decorative top border */}
                <Box sx={{ 
                    height: 8, 
                    width: '100%', 
                    bgcolor: resultColor, 
                    borderTopLeftRadius: 16, 
                    borderTopRightRadius: 16 
                }} />
                
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4} alignItems="center">
                        {/* Cột Trái: Thông tin & Điểm số */}
                        <Grid item xs={12} md={7}>
                            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1}>
                                KẾT QUẢ LUYỆN TẬP
                            </Typography>
                            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mt: 1 }}>
                                {sessionInfo.topic}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 2 }}>
                                <Chip icon={<SchoolIcon />} label={sessionInfo.subject} color="primary" variant="outlined" />
                                <Chip icon={<AccessTimeIcon />} label="12 phút" variant="outlined" />
                            </Stack>

                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Box textAlign="center">
                                        <Typography variant="h3" fontWeight={700} color="success.main">{score.correct}</Typography>
                                        <Typography variant="body2" color="text.secondary">Câu Đúng</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box textAlign="center">
                                        <Typography variant="h3" fontWeight={700} color="error.main">
                                            {score.total - score.correct - (score.skipped || 0)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Câu Sai</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box textAlign="center">
                                        <Typography variant="h3" fontWeight={700} color="warning.main">{score.skipped || 0}</Typography>
                                        <Typography variant="body2" color="text.secondary">Bỏ qua</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Cột Phải: Biểu đồ tròn */}
                        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                             <Box sx={{ width: 200, height: 200 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Số phần trăm ở giữa */}
                                <Box sx={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'
                                }}>
                                    <Typography variant="h4" fontWeight={800} color={resultColor}>
                                        {percentage}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        CHÍNH XÁC
                                    </Typography>
                                </Box>
                             </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Grid container spacing={2} justifyContent="center">
                <Grid item>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={handleReview}
                        startIcon={<AssignmentIcon />}
                        sx={{ px: 4, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
                    >
                        Xem lại chi tiết bài làm
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined" 
                        size="large" 
                        color="secondary"
                        onClick={() => navigate('/student/practice')}
                        startIcon={<ReplayIcon />}
                        sx={{ px: 4, borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        Luyện tập bài khác
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="text" 
                        size="large" 
                        color="inherit"
                        onClick={() => navigate('/student/dashboard')}
                        startIcon={<TrendingUpIcon />}
                        sx={{ px: 4, borderRadius: 3, textTransform: 'none' }}
                    >
                        Về Dashboard
                    </Button>
                </Grid>
            </Grid>

        </Container>
    );
}