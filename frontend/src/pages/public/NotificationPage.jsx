import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CircleIcon from '@mui/icons-material/Circle';

import { getRelativeTime } from "../../utils/DateTimeFormatter";
import { socket, decodedData } from '../../services/ApiClient';
import { getNotificationsByUser, markAsRead } from '../../services/NotificationService';

// ==========================================
// STYLED COMPONENTS (Chuẩn Design System)
// ==========================================
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexShrink: 0,
  flexWrap: 'wrap',
  gap: theme.spacing(2)
}));

const ListContainer = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: isDark ? 'none' : '0px 4px 12px rgba(0,0,0,0.02)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  };
});

const ScrollableList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(theme.palette.text.secondary, 0.2),
    borderRadius: "10px",
    "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) },
  },
}));

// ==========================================
// MAIN COMPONENT
// ==========================================
const NotificationPage = memo(() => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [readStatus, setReadStatus] = useState(0); // 0: Tất cả, -1: Chưa đọc
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await getNotificationsByUser(page, readStatus);
        if (isMounted) setNotifications(res);
      } catch (err) {
        console.error("Fetch notifications error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchNotifications();
    
    return () => { isMounted = false; };
  }, [page, readStatus]);

  useEffect(() => {
    const handleNewNotify = (noti) => {
      setNotifications((prev) => [noti, ...prev]);
    };
    socket.on('receive_notification', handleNewNotify);
    
    return () => {
      socket.off('receive_notification', handleNewNotify);
    };
  }, []);

  const handleNavigateNoti = useCallback((noti) => {
    if (!decodedData) return;
    switch (noti.type) {
      case "thread": {
        if (noti.link_wrapper_id && noti.link_primary_id) {
          if (noti.link_partial_id) {
            navigate(
              `/${decodedData.role}/classes/${noti.link_wrapper_id}/${noti.link_primary_id}#msg_${noti.link_partial_id}`,
              {
                state: {
                  thread_id: noti.link_primary_id,
                  comment_id: noti.link_partial_id,
                  isNested: true,
                },
              }
            );
          } else {
            navigate(`/${decodedData.role}/classes/${noti.link_wrapper_id}/${noti.link_primary_id}`);
          }
        }
        return;
      }
      case "exam": {
        navigate(`/student/assignment`);
        return;
      }
      case "class": {
        navigate(`/${decodedData.role}/classes/${noti.link_primary_id}`);
        return;
      }
      default:
        break;
    }
  }, [navigate]);

  const handleNotiClick = useCallback(async (noti) => {
    // Kiểm tra xem đã đọc chưa
    const isAlreadyRead = noti.have_read || noti.isRead;

    try {
      if (!isAlreadyRead) {
        await markAsRead(noti.notice_id);
        
        // Optimistic Update: Cập nhật giao diện thành "Đã đọc" ngay lập tức
        setNotifications(prev => prev.map(n => 
          n.notice_id === noti.notice_id ? { ...n, have_read: true, isRead: true } : n
        ));

        // BẮN TÍN HIỆU TOÀN CỤC CHO HEADER TỰ ĐỘNG TRỪ SỐ LƯỢNG ĐI 1
        window.dispatchEvent(new CustomEvent('notification_read'));
      }
    } catch (e) {
      console.error("Lỗi mark as read", e);
    }
    handleNavigateNoti(noti);
  }, [handleNavigateNoti]);

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Thông báo
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Cập nhật các hoạt động và tin nhắn mới nhất dành cho bạn
          </Typography>
        </Box>

        <ToggleButtonGroup
          color="primary"
          value={readStatus}
          exclusive
          onChange={(e, newVal) => {
            if (newVal !== null) setReadStatus(newVal);
          }}
          size="small"
          sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
        >
          <ToggleButton value={0} sx={{ fontWeight: 600, px: 3 }}>Tất cả</ToggleButton>
          <ToggleButton value={-1} sx={{ fontWeight: 600, px: 3 }}>Chưa đọc</ToggleButton>
        </ToggleButtonGroup>
      </HeaderBar>

      <ListContainer elevation={0}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} py={8}>
            <CircularProgress />
          </Box>
        ) : notifications.length > 0 ? (
          <ScrollableList>
            <List disablePadding>
              {notifications.map((noti, index) => {
                const isRead = noti.have_read || noti.isRead;
                
                return (
                  <React.Fragment key={noti.notice_id || index}>
                    <ListItem
                      onClick={() => handleNotiClick(noti)}
                      sx={{
                        py: 2.5,
                        px: { xs: 2, sm: 3 },
                        bgcolor: isRead 
                            ? 'transparent' 
                            : (isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04)),
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: isDark 
                            ? alpha(theme.palette.primary.main, 0.15) 
                            : alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={noti.sender?.avatar_url}
                          sx={{
                            width: 48,
                            height: 48,
                            mr: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`
                          }}
                        >
                          {!noti.sender?.avatar_url && <NotificationsIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body1" 
                            color="text.primary"
                            sx={{ 
                                fontWeight: isRead ? 500 : 700, 
                                mb: 0.5,
                                lineHeight: 1.4
                            }}
                          >
                            {noti.message}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {getRelativeTime(noti.notifyAt)}
                          </Typography>
                        }
                      />
                      
                      {!isRead && (
                        <CircleIcon sx={{ fontSize: 12, color: 'primary.main', ml: 2, flexShrink: 0 }} />
                      )}
                    </ListItem>
                    {index < notifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </ScrollableList>
        ) : (
          <Box sx={{ 
              border: '2px dashed', borderColor: 'divider', borderRadius: 3, 
              p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', 
              justifyContent: 'center', py: 10, m: 3 
          }}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              Không có thông báo nào
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              {readStatus === -1 ? "Bạn đã đọc hết tất cả thông báo." : "Chưa có hoạt động mới nào dành cho bạn."}
            </Typography>
          </Box>
        )}
      </ListContainer>
    </PageWrapper>
  );
});

export default NotificationPage;