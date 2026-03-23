import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

// Components
import ResourceSetup from './ResourceSetup';
import ResourceManager from './ResourceManager';

// Services
import { getClassDetails } from '../../services/ClassService';

const getUserId = (token) => {
    try { return jwtDecode(token).sub; } catch (e) { return null; }
};

const ResourceTab = ({ classId, token }) => {
    const [tutorId] = useState(() => getUserId(token));
    const [loading, setLoading] = useState(true);
    const [planId, setPlanId] = useState(null); 
    const [error, setError] = useState(null);

    const checkClassStatus = useCallback(async () => {
        setLoading(true);
        try {
            const cls = await getClassDetails(classId, token);
            setPlanId(cls.plan_id || null);
        } catch (e) {
            setError("Lỗi tải thông tin lớp học.");
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        if (classId && token) checkClassStatus();
    }, [checkClassStatus]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={30} />
        </Box>
    );
    
    if (error) return (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
            {error}
        </Alert>
    );

    return (
        <Box>
            {!planId ? (
                <ResourceSetup 
                    classId={classId} 
                    tutorId={tutorId} 
                    token={token} 
                    onSetupComplete={(newPlanId) => setPlanId(newPlanId)} 
                />
            ) : (
                <ResourceManager 
                    classId={classId} 
                    planId={planId} 
                    tutorId={tutorId} 
                    token={token} 
                    onRemovePlan={() => setPlanId(null)} 
                />
            )}
        </Box>
    );
};

export default ResourceTab;