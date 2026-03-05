import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { getRelativeTime } from "../../utils/DateTimeFormatter";
import { socket, decodedData } from '../../services/ApiClient';
import { getNotificationsByUser, markAsRead } from '../../services/NotificationService';

const NotificationPage = React.memo(() => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1)
  const [readStatus, setReadStatus] = useState(0)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotificationsByUser(page, readStatus);
        setNotifications(res);
      } catch (err) {
        console.error("Fetch notifications error", err);
      }
    };
    fetchNotifications();
  },[page, readStatus])

  useEffect(() => {
    const handleNewNotify = (noti) => {
      setNotifications(prev => [noti, ...prev]);
    };

    socket.on('receive_notification', handleNewNotify);

    return () => {
      socket.off('receive_notification', handleNewNotify);
    };
  }, []);

  const handleNavigateNoti = (noti) => {
    if (!decodedData) return

    switch(noti.type) {
      case "thread": {
        if (noti.link_wrapper_id && noti.link_primary_id) {
          if (noti.link_partial_id) {
            navigate(
              `/${decodedData.role}/classes/${noti.link_wrapper_id}/${noti.link_primary_id}#${noti.link_partial_id}`, 
              {state: {
                thread_id: noti.link_primary_id,
                comment_id: noti.link_partial_id,
                isNested: true
              }}
            )
          } else {
            navigate(`/${decodedData.role}/classes/${noti.link_wrapper_id}/${noti.link_primary_id}`)
          }
        }
        return
      }
      case "exam": {
        navigate(`/student/assignment`)
        return
      }
    }
  }

  const handleNotiClick = async(noti) => {
    markAsRead(noti.notice_id)
    handleNavigateNoti(noti)
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 1 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon />
            <Typography variant="h6">Thông báo của bạn</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label="Tất cả" 
              size="small"
              onClick={() => setReadStatus(0)}
              sx={{ 
                bgcolor: readStatus === 0 ? 'white' : 'transparent', 
                color: readStatus === 0 ? 'primary.main' : 'white',
                border: '1px solid white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }} 
            />
            <Chip 
              label="Chưa đọc" 
              size="small"
              onClick={() => setReadStatus(-1)}
              sx={{ 
                bgcolor: readStatus === -1 ? 'white' : 'transparent', 
                color: readStatus === -1 ? 'primary.main' : 'white',
                border: '1px solid white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }} 
            />
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((noti, index) => (
              <React.Fragment key={noti.notice_id || index}>
                <ListItem
                  button
                  onClick={() => handleNotiClick(noti)}
                  sx={{
                    bgcolor: noti.have_read ? 'primary.light' : 'action.hover',
                    transition: '0.3s',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={noti.sender?.avatar_url}> {/* Đã sửa lỗi avata_url */}
                      {!noti.sender?.avatar_url && <NotificationsIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: noti.isRead ? 400 : 700 }}>
                        {noti.message}
                      </Typography>
                    }
                    secondary={getRelativeTime(noti.notifyAt)}
                  />
                  {!noti.isRead && <CircleIcon sx={{ fontSize: 12, color: 'primary.main', ml: 1 }} />}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Chưa có thông báo nào dành cho Julie</Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Container>
  );
});

export default NotificationPage;