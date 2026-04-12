import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

// Services
import { getClassDetails } from '../../services/ClassService';

const StudentResourceTab = ({ classId, token }) => {
    const [loading, setLoading] = useState(true);
    const [planId, setPlanId] = useState(null); 
    const [error, setError] = useState(null);

    const checkClassStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Kiểm tra xem lớp học đã được thầy cô gắn plan (tài liệu) nào chưa
            const cls = await getClassDetails(classId, token);
            setPlanId(cls.plan_id || null);
        } catch (e) {
            setError("Không thể tải thông tin tài liệu. Bạn thử lại sau nhé!");
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        if (classId && token) checkClassStatus();
    }, [checkClassStatus]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} thickness={4} color="primary" />
        </Box>
    );
    
    if (error) return (
        <Alert severity="error" sx={{ borderRadius: '16px', mb: 2 }}>
            {error}
        </Alert>
    );

    return (
        <Box>
            {!planId ? (
                /* --- TRẠNG THÁI TRỐNG: KHI GIÁO VIÊN CHƯA ĐĂNG TÀI LIỆU --- */
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 6, 
                        textAlign: 'center', 
                        backgroundColor: '#f4fbf7', // Nền xanh ngọc nhạt 
                        borderRadius: '24px',
                        border: '2px dashed #a5d6a7' // Viền đứt nét dễ thương
                    }}
                >
                    <AutoStoriesIcon sx={{ fontSize: 72, color: '#81c784', mb: 2, opacity: 0.8 }} />
                    <Typography variant="h6" fontWeight="700" color="text.secondary">
                        Góc Tài Liệu Trống
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Thầy cô chưa tải lên tài liệu hay bài giảng nào cho lớp mình.
                        <br/>Bạn hãy quay lại kiểm tra sau nhé!
                    </Typography>
                </Paper>
            ) : (
                /* --- GIAO DIỆN XEM TÀI LIỆU: KHI ĐÃ CÓ PLAN ID --- */
                <StudentResourceViewer 
                    classId={classId} 
                    planId={planId} 
                    token={token} 
                />
            )}
        </Box>
    );
};

export default memo(StudentResourceTab);