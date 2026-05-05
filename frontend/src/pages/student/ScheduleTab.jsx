import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
    Box, Typography, Paper, CircularProgress,
    Stack, List, ListItem, ListItemText, Divider, Link,
    Chip, useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import LinkIcon from '@mui/icons-material/Link';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { getScheduleByClass } from '../../services/ClassService';

const DAY_OPTIONS = [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
    { value: 8, label: 'Chủ Nhật' }
];

const StudentScheduleTab = ({ classId, token }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSchedules = useCallback(async () => {
        if (!classId || !token) return;
        setLoading(true);
        try {
            const data = await getScheduleByClass(classId, token);
            const sortedData = Array.isArray(data) ? data.sort((a, b) => {
                if (a.meeting_date !== b.meeting_date) return a.meeting_date - b.meeting_date;
                return a.startAt.localeCompare(b.startAt);
            }) : [];
            setSchedules(sortedData);
        } catch (error) {
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const getDayLabel = (val) => DAY_OPTIONS.find(d => d.value === Number(val))?.label || 'N/A';

    return (
        <Box p={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <EventAvailableOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                    Lịch học hiện tại ({schedules.length})
                </Typography>
            </Box>

            <Paper 
                variant="outlined" 
                sx={{ 
                    borderRadius: '12px', 
                    borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6),
                    bgcolor: 'background.paper',
                    overflow: 'hidden'
                }}
            >
                <List disablePadding>
                    {loading ? (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : schedules.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Chưa có lịch học nào được xếp cho lớp này.</Typography>
                        </Box>
                    ) : (
                        schedules.map((item, index) => (
                            <React.Fragment key={item.schedule_id}>
                                <ListItem
                                    sx={{ 
                                        py: 1.5,
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02) }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                                                <Chip 
                                                    label={getDayLabel(item.meeting_date)} 
                                                    color="primary" 
                                                    size="small" 
                                                    sx={{ fontWeight: 700, minWidth: 70, borderRadius: 1.5, height: 24, fontSize: '0.75rem' }}
                                                />
                                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                                    {item.startAt} - {item.endAt}
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            item.link_meet ? (
                                                <Link href={item.link_meet} target="_blank" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 500, fontSize: '0.8rem' }}>
                                                    <LinkIcon fontSize="small" sx={{ fontSize: 16 }}/> Vào phòng học
                                                </Link>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'inline-block', mt: 0.5 }}>Chưa có link</Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                                {index < schedules.length - 1 && <Divider sx={{ borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6) }} />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default memo(StudentScheduleTab);