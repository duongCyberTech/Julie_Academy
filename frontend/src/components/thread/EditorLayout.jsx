import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Button, 
  IconButton,  
  TextField,
  Card, 
  CardHeader, 
  CardContent, 
  Divider, 
  Chip,
  Modal,
  Backdrop,
  Fade,
  Tooltip,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Close from '@mui/icons-material/Close';
import Public from '@mui/icons-material/Public';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CloudUpload from '@mui/icons-material/CloudUpload';
import ArrowForwardIosSharp from '@mui/icons-material/ArrowForwardIosSharp';
import ModeEditRounded from '@mui/icons-material/ModeEditRounded';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Delete from '@mui/icons-material/Delete';
import DeleteOutline from '@mui/icons-material/DeleteOutline';

import { toast } from 'sonner';

import RichTextEditor from '../RichTextEditor';

import { 
  createThread,
  followThread,
  unfollowThread,
  updateThread,
  deleteThread
} from '../../services/ThreadService';
import { getRelativeTime } from '../../utils/DateTimeFormatter';
import ConfirmAction from '../ActionModal/ConfirmModal';
import ListUserModal from '../ActionModal/ThreadRestrictedModal';
import { FollowToggleButton } from './FollowToggleButton';
import { ModalCard } from "../Tab/Tab";
import VisuallyHiddenInput from '../Input/VisuallyHiddenInput';
import QuiltedImageList from '../Image/ImageList';

const globalStyles = `
  .mention-node {
    color: #1877F2;
    background-color: rgba(24, 119, 242, 0.1);
    font-weight: 600;
    border-radius: 4px;
    padding: 0 4px;
    text-decoration: none;
    display: inline-block;
  }
  .custom-editor:empty:before {
    content: attr(placeholder);
    color: #65676b;
    pointer-events: none;
    display: block; 
  }
`;

export const PostCreator = memo(({ class_id = "", closeModal, action = "create", post = null, handleAdd = null, handleUpdate = null }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [user, setUser] = useState(null);
  const [isUpload, setIsUpload] = useState(action === "update");
  const [title, setTitle] = useState(post?.title || "");
  const [htmlContent, setHtmlContent] = useState(post?.content || "");
  const [selectedImages, setSelectedImages] = useState(post?.medias || []);
  const [addImages, setAddImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [isRestricted, setIsRestricted] = useState(action === "create" ? false : post?.is_restricted);
  const [restrictedModal, setRestrictedModal] = useState(false);
  const [openList, setOpenList] = useState(action === "create" ? [] : post?.open_list);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(jwtDecode(token));
    }
  }, []);

  const handleNewImages = (event) => {
    const files = Array.from(event.target.files);
    if (action === "create") setSelectedImages(prev => [...prev, ...files]);
    else setAddImages(prev => [...prev, ...files]);
  };

  const handleSubmit = async () => {
    if (!htmlContent && !title) return;
    const newPostData = {
      title,
      content: htmlContent,
      images: selectedImages,
      class_id,
      open_list: openList,
      is_restricted: isRestricted
    };
    toast.promise(createThread(newPostData), {
      loading: "Đang tạo bài viết...",
      success: (data) => {  
        if(handleAdd) handleAdd(data.data.data);
        closeModal();
        return "Tạo bài viết thành công!";
      },
      error: (err) => {
        closeModal();
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 3000
    });

    setTitle('');
    setHtmlContent('');
    setSelectedImages([]);
  };

  const handleSave = async () => {
    if (!htmlContent && !title) return;
    const updatedPostData = {
      title,
      content: htmlContent,
      deletedImages: deleteImages,
      addImages,
      class_id,
      open_list: openList,
      is_restricted: isRestricted
    };
    toast.promise(updateThread(post.thread_id, updatedPostData), {
      loading: `Đang cập nhật bài viết...`,
      success: (data) => {
        if(handleUpdate) handleUpdate(data.data.data);
        closeModal();
        return "Cập nhật bài viết thành công!";
      },
      error: (err) => {
        closeModal();
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 3000
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    if (action === "update") setDeleteImages(prev => [...prev, selectedImages[indexToRemove]]);
    setSelectedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveAddImage = (indexToRemove) => {
    setAddImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleChangeAccess = (e) => {
    const value = e.target.value; 
    if (value) setRestrictedModal(true);
    else setOpenList([]);
    setIsRestricted(value);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2.5, md: 3 }, 
        borderRadius: '16px',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
      }}
    >
      <style>{globalStyles}</style>

      {/* --- Header: Thông tin người dùng & Audience Selector --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar 
          src={user?.avatar_url} 
          sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}
        >
          {user ? (user.fname?.[0] || user.sub?.[0] || 'U').toUpperCase() : 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2, mb: 0.5 }}>
            {user ? `${user.fname || ''} ${user.lname || ''}`.trim() : 'Tài khoản của bạn'}
          </Typography>
          
          {/* Nút thả xuống gọn gàng giống Facebook/LinkedIn */}
          <Select
            value={isRestricted}
            onChange={handleChangeAccess}
            size="small"
            variant="outlined"
            sx={{ 
              height: 26, 
              fontSize: '0.8rem', 
              fontWeight: 600,
              borderRadius: '6px', 
              bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.action.hover, 0.5),
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-select': { py: 0, pl: 1, pr: 3, display: 'flex', alignItems: 'center', gap: 0.5 },
              color: 'text.secondary'
            }}
          >
            <MenuItem value={false} sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
               <Public fontSize="small" sx={{ mr: 1, fontSize: 16 }} /> Công khai
            </MenuItem>
            <MenuItem value={true} sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
               <LockRoundedIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} /> Riêng tư
            </MenuItem>
          </Select>
        </Box>
      </Box>

      {/* --- Body: Content Area Seamless --- */}
      <Box sx={{ mb: 2 }}>
        <TextField
            placeholder="Tiêu đề thảo luận..."
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            InputProps={{
                disableUnderline: true,
                sx: { fontSize: '1.15rem', fontWeight: 700, color: 'text.primary', mb: 1 }
            }}
        />
        <RichTextEditor 
          placeholder="Bạn muốn chia sẻ điều gì? (Gõ $ để viết công thức toán)"
          value={htmlContent}
          onChange={setHtmlContent}
        />
      </Box>

      {/* --- Staging Area --- */}
      {isUpload && (
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1.5, 
            mb: 3, 
            overflowX: 'auto', 
            p: 1.5,
            minHeight: 90,
            border: `1px dashed ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`, 
            borderRadius: '12px',
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.3) : alpha(theme.palette.primary.main, 0.02),
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(theme.palette.divider, 0.3), borderRadius: '4px' }
          }}
        >
          {selectedImages.map((img, idx) => (
            <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(idx)}
                sx={{ position: 'absolute', top: 4, right: 4, p: 0.5, bgcolor: alpha('#000', 0.5), color: '#fff', '&:hover': { bgcolor: 'error.main' } }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
              <img src={action === "update" ? img : URL.createObjectURL(img)} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}

          {addImages.map((img, idx) => (
            <Box key={`add-${idx}`} sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
              <IconButton
                size="small"
                onClick={() => handleRemoveAddImage(idx)}
                sx={{ position: 'absolute', top: 4, right: 4, p: 0.5, bgcolor: alpha('#000', 0.5), color: '#fff', '&:hover': { bgcolor: 'error.main' } }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
              <img src={URL.createObjectURL(img)} alt={`preview add ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}

          <Button
            component="label"
            sx={{ 
              width: 80, height: 80, flexShrink: 0, display: 'flex', flexDirection: 'column',
              borderRadius: '8px', border: `1px dashed ${theme.palette.primary.main}`,
              bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
            }}
          >
            <CloudUpload fontSize="small" />
            <Box sx={{ fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>Thêm</Box>
            <VisuallyHiddenInput type="file" multiple accept="image/*,video/*" onChange={handleNewImages} />
          </Button>
        </Box>
      )}

      <Divider sx={{ mb: 2, borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5) }} />
      
      {/* --- Footer Actions --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          startIcon={<PhotoCamera />} 
          onClick={() => setIsUpload(true)}
          sx={{ fontWeight: 600, color: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: '8px', px: 2 }}
        >
          Ảnh/Video
        </Button>
        <Box sx={{display: 'flex', gap: 1.5}}>
          {isRestricted && (
            <Button variant="outlined" color="primary" onClick={() => setRestrictedModal(true)} sx={{ borderRadius: '8px', fontWeight: 600 }}>
              Danh sách xem
            </Button>
          )}

          <Button 
            variant="contained" 
            disableElevation
            onClick={action === "create" ? handleSubmit : handleSave} 
            disabled={!htmlContent && !selectedImages.length && !title}
            sx={{ borderRadius: '8px', fontWeight: 700, px: 3 }}
          >
            {action === "create" ? "Đăng bài" : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>

      <ListUserModal
        class_id={class_id}
        open={restrictedModal}
        setOpen={setRestrictedModal}
        setRestricted={setIsRestricted}
        selectedIds={openList}
        setSelectedIds={setOpenList}
      />
    </Paper>
  );
});

export const PostItem = memo(({ post, class_id, handleUpdate, handleDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [user, setUser] = useState(null);
  const [initState, setInitState] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        if (post.followers?.length > 0 && post.followers.includes(decoded.sub)) setInitState(true);
        setUser(decoded);
    }
  }, [post, class_id]);

  const handleClosePostModal = () => setIsPostModalOpen(false);

  const handleFollowChange = async(newState) => {
    const action = initState ? unfollowThread : followThread;
    toast.promise(action(post.thread_id), {
      loading: initState ? 'Đang bỏ theo dõi...' : 'Đang thực hiện theo dõi...',
      success: () => {
        setInitState(!initState);
        return initState ? 'Đã bỏ theo dõi bài viết' : 'Đã theo dõi thành công!';
      },
      error: (err) => {
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 2000
    });
  };

  const handleViewThread = (threadId) => {
    if (!threadId || !user) return;
    navigate(`/${user.role}/classes/${class_id}/${threadId}`, { state: post });
  };

  const handleDeleteThread = () => {
    toast.promise(deleteThread(post.thread_id), {
      loading: 'Đang xóa bài viết...',
      success: () => {
        handleDelete(post.thread_id);
        setDeleteModal(false);
        return "Đã xóa thành công!";
      },
      error: (err) => {
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 2000
    });
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        mt: 2, 
        borderRadius: '16px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        transition: 'all 0.2s ease',
      }}
    >
      <style>{globalStyles}</style>
      
      <CardHeader
        avatar={
            <Avatar src={post?.sender?.avatar_url} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}>
                {post?.sender?.fname?.[0] || "U"}
            </Avatar>
        }
        title={
            <Typography fontWeight={700} color="text.primary">
                {`${post?.sender?.fname || ''} ${post?.sender?.mname || ''} ${post?.sender?.lname || ''}`.replace(/\s+/g, ' ').trim()}
            </Typography>
        }
        subheader={
            <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>{getRelativeTime(post.createAt)}</Typography> 
                {post.is_restricted ? <LockRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} /> : <Public sx={{ fontSize: 14, color: 'text.secondary' }} />}
            </Box>
        }
        action={ user && post.sender.uid !== user.sub ? (
          <Box sx={{ pr: 1, pt: 0.5 }}>
            <FollowToggleButton 
              initialIsFollowing={initState} 
              onToggle={handleFollowChange}
              thread_id={post.thread_id}
            />
          </Box>
        ) : (
          <IconButton size="small" sx={{ mr: 1, mt: 1 }}>
            <MoreHoriz />
          </IconButton>
        )}
      />
      
      <CardContent sx={{ pt: 0, pb: 1, px: 2.5 }}>
        {post.title && (
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={1} sx={{ lineHeight: 1.3 }}>
                {post.title}
            </Typography>
        )}
        {post.content && (
          <Typography 
            component="div" 
            variant="body1" 
            dangerouslySetInnerHTML={{ __html: post.content }}
            sx={{ 
                color: 'text.secondary',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                '& b, & strong': { fontWeight: 700, color: 'text.primary' },
                '& i, & em': { fontStyle: 'italic' }
            }}
          />
        )}
      </CardContent>

      {post.medias && post.medias.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <QuiltedImageList images={post.medias} />
        </Box>
      )}

      <Divider sx={{ borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4) }} />
      <Box sx={{ p: 1.5, px: 2.5, display: 'flex', justifyContent: "end", gap: 1, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.01) }}>
        {user && post.sender.uid === user.sub && (
          <>
          <Tooltip title="Chỉnh sửa bài viết" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => setIsPostModalOpen(true)}
              sx={{ 
                borderRadius: '8px',
                p: 1, 
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              <ModeEditRounded fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa bài viết" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => setDeleteModal(true)}
              sx={{ 
                borderRadius: '8px',
                p: 1,
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.1),
                "&:hover": { bgcolor: 'error.main', color: 'white' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          </>
        )}
        <Tooltip title="Xem chi tiết và Bình luận" arrow placement="top">
          <Button 
            variant="contained"
            disableElevation
            endIcon={<ArrowForwardIosSharp sx={{ fontSize: '14px !important' }} />}
            sx={{ borderRadius: '8px', fontWeight: 600, px: 2, py: 0.5, textTransform: 'none' }}
            onClick={() => handleViewThread(post.thread_id)}
          >
            Chi tiết
          </Button>
        </Tooltip>
      </Box>

      <Modal
        open={isPostModalOpen}
        onClose={handleClosePostModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 400, sx: { backgroundColor: alpha('#000', 0.6), backdropFilter: 'blur(4px)' } } }}
      >
        <Fade in={isPostModalOpen}>
          <Box sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '100%', maxWidth: "800px", maxHeight: '90vh', overflowY: 'auto',
              borderRadius: '16px', outline: 'none'
          }}>
            <PostCreator class_id={class_id} closeModal={handleClosePostModal} action="update" post={post} handleUpdate={handleUpdate} />
          </Box>
        </Fade>
      </Modal>

      <ConfirmAction 
        title="Bạn chắc chắn muốn xóa bài viết?"
        content="Hành động này không thể hoàn tác. Ấn nút xóa để xác nhận."
        btnContent="Xóa bài viết"
        open={deleteModal}
        setOpen={setDeleteModal}
        action={handleDeleteThread}
        btnColor="error"
        startIcon={<DeleteOutline />}
      />
    </Card>
  );
});

export default function FacebookCloneV2() {
  return <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', py: 4 }}></Box>;
}