import React, { useState, useEffect } from 'react';
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
  ImageList, 
  ImageListItem, 
  Modal,
  Backdrop,
  Fade,
  Tooltip
} from '@mui/material';

import { 
  PhotoCamera, 
  Close, 
  Public,
  CloudUpload, 
  ArrowForwardIosSharp,
  ModeEditRounded,
  MoreHoriz,
  Delete
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';
import { toast } from 'sonner'

import RichTextEditor from '../RichTextEditor';

import { 
  createThread,
  followThread,
  unfollowThread,
  updateThread,
  deleteThread
} from '../../services/ThreadService';
import { getRelativeTime } from '../../utils/DateTimeFormatter';
import BasicModal, { ListModal } from './ImageModal';
import { FollowToggleButton } from './FollowToggleButton';
import { ModalCard } from "../Tab/Tab"

// --- 1. CONFIG & STYLES ---
const MOCK_USER = {
  id: 'u1',
  name: 'Nguyễn Văn Dev',
  avatar: 'https://i.pravatar.cc/150?u=u1',
};

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// CSS giả lập hiệu ứng Tag và Editor
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
    display: block; /* For Firefox */
  }
`;

// --- 3. COMPONENT GRID ẢNH (Logic Facebook) ---
function srcset(image, size, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

export function QuiltedImageList({ images = [] }) {
  const [open, setOpen] = React.useState(false);
  const [openRemain, setOpenRemain] = useState(false)
  const [selectedImg, setSelectedImg] = React.useState(null);

  const handleOpen = (img) => {
    setSelectedImg(img);
    setOpen(true);
  };

  const getGridConfig = (index, total) => {
    if (total === 1) return { cols: 4, rows: 4 };
    if (total === 2) return { cols: 2, rows: 4 };
    if (total === 3) return index === 0 ? { cols: 2, rows: 4 } : { cols: 2, rows: 2 };
    if (total === 4) return { cols: 2, rows: 2 } 
    if (total > 4) {
      if (index === 0) return { cols: 2, rows: 2 };
      if (index <= 3) return { cols: 2, rows: 2 }; 
    }
    return { cols: 2, rows: 2 };
  };

  return (
    <Box sx={{ width: "100%" }}>
      <ImageList
        sx={{ width: "100%", mb: 0 }}
        variant="quilted"
        cols={4}
        rowHeight={100}
      >
        {images.slice(0, 4).map((item, index) => {
          const { cols, rows } = getGridConfig(index, images.length);
          const isLastVisible = index === 3;
          const remainingCount = images.length - 4;

          return (
            <ImageListItem 
              key={index} 
              cols={cols} 
              rows={rows}
              sx={{ position: 'relative', cursor: 'pointer' }}
              onClick={images.length <= 4 ?
                () => handleOpen(item) :
                () => setOpenRemain(true)
              }
            >
              <img
                src={item}
                alt="Post content"
                loading="lazy"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
              {isLastVisible && remainingCount > 0 && (
                <Box sx={{
                  position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.5rem', fontWeight: 'bold'
                }}>
                  +{remainingCount}
                </Box>
              )}
            </ImageListItem>
          );
        })}
      </ImageList>

      {/* Đưa Modal ra ngoài vòng lặp */}
      <BasicModal 
        image={selectedImg} 
        open={open} 
        setOpen={setOpen} 
      />
      <ListModal 
        images={images.slice(3)} 
        open={openRemain} 
        setOpen={setOpenRemain} 
      />
    </Box>
  );
}

// --- 4. CREATE POST COMPONENT ---
export const PostCreator = ({ class_id = "", closeModal, action = "create", post = null, handleAdd = null, handleUpdate = null }) => {
  const [isUpload, setIsUpload] = useState(action == "update")
  const [title, setTitle] = useState(post?.title || "")
  const [htmlContent, setHtmlContent] = useState(post?.content || "");
  const [selectedImages, setSelectedImages] = useState(post?.medias || []);
  const [addImages, setAddImages] = useState([])
  const [deleteImages, setDeleteImages] = useState([])

  const handleNewImages = (event) => {
    const files = Array.from(event.target.files);
    if (action == "create") setSelectedImages(prev => [...prev, ...files]);
    else setAddImages(prev => [...prev, ...files])
  }

  const handleSubmit = async () => {
    if (!htmlContent && !title) return;
    const newPostData ={
      title,
      content: htmlContent,
      images: selectedImages,
      class_id
    }
    toast.promise(createThread(newPostData), {
      loading: "Đang tạo bài viết...",
      success: (data) => {  
        console.log(data)
        handleAdd(data.data.data);
        closeModal()

        return "Tạo bài viết thành công!"
      },
      error: (err) => {
        closeModal()
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 3000
    })

    setTitle('')
    setHtmlContent('');
    setSelectedImages([]);
  };

  const handleSave = async () => {
    if (!htmlContent && !title) return;
    const updatedPostData ={
      title,
      content: htmlContent,
      deletedImages: deleteImages,
      addImages,
      class_id
    }
    toast.promise(updateThread(post.thread_id, updatedPostData), {
      loading: `Đang cập nhật bài viết và thêm ${addImages.length} ảnh...`,
      success: (data) => {
        handleUpdate(data.data.data)
        closeModal()

        return "Cập nhật bài viết thành công!"
      },
      error: (err) => {
        closeModal()
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 3000
    })

    setTitle('')
    setHtmlContent('');
    setSelectedImages([]);
    setAddImages([])
    setDeleteImages([])
  }

  const handleRemoveImage = (indexToRemove) => {
    if (action == "update") setDeleteImages(prev => [...prev, selectedImages[indexToRemove]])
    setSelectedImages((prevImages) => 
      prevImages.filter((_, index) => index != indexToRemove)
    )
  }

  const handleRemoveAddImage = (indexToRemove) => {
    setAddImages((prevImages) => 
      prevImages.filter((_, index) => index != indexToRemove)
    )
  }

  return (
    <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          {/* Nhúng Editor vào đây */}
          <TextField
              label="Tiêu đề"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
          />
          <RichTextEditor 
            placeholder="Nhập nội dung... Gõ $ và công thức để viết toán (VD: $E=mc^2$)"
            value={htmlContent}
            onChange={setHtmlContent}
          />
        </Box>
      </Box>

      {/* Staging Area (Vùng chờ upload) */}
      {isUpload && (
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2, 
            overflowX: 'auto', 
            py: 1,
            justifyContent: 'center', 
            alignItems: 'center',      
            minHeight: 100,
            border: '1px dashed #ccc', 
            borderRadius: 2,
            bgcolor: '#fafafa'
          }}
        >
          {/* Danh sách ảnh đã chọn */}
          {selectedImages.map((img, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                position: 'relative', 
                width: 80, 
                height: 80, 
                flexShrink: 0,
                boxShadow: 2,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(idx)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'error.main', color: 'white' }
                }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
              
              <img 
                src={action == "update" ? img : URL.createObjectURL(img)} 
                alt={`preview ${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              <Chip 
                label={idx + 1} 
                size="small" 
                color="primary" 
                sx={{ 
                  position: 'absolute', 
                  bottom: 2, 
                  left: 2, 
                  height: 16, 
                  fontSize: 10,
                  pointerEvents: 'none' 
                }} 
              />
            </Box>
          ))}

          {addImages.map((img, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                position: 'relative', 
                width: 80, 
                height: 80, 
                flexShrink: 0,
                boxShadow: 2,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleRemoveAddImage(idx)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'error.main', color: 'white' }
                }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
              
              <img 
                src={URL.createObjectURL(img)} 
                alt={`preview ${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              <Chip 
                label={idx + 1} 
                size="small" 
                color="primary" 
                sx={{ 
                  position: 'absolute', 
                  bottom: 2, 
                  left: 2, 
                  height: 16, 
                  fontSize: 10,
                  pointerEvents: 'none' 
                }} 
              />
            </Box>
          ))}

          {/* Nút Upload nằm cuối danh sách hoặc đứng một mình */}
          <Button
            component="label"
            variant="outlined"
            sx={{ 
              width: 80, 
              height: 80, 
              flexShrink: 0, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              borderStyle: 'dashed'
            }}
          >
            <CloudUpload />
            <Box sx={{ fontSize: 10, mt: 0.5 }}>Thêm</Box>
            <VisuallyHiddenInput
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={
                (event) => handleNewImages(event)
              }
            />
          </Button>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<PhotoCamera color="success" />} onClick={() => setIsUpload(true)}>Ảnh/Video</Button>
        <Button 
          variant="contained" 
          onClick={
            action == "create" ? 
            () => handleSubmit() :
            () => handleSave()
          } 
          disabled={!htmlContent && !selectedImages.length}
        >
          {action == "create" ? "Đăng" : "Lưu"}
        </Button>
      </Box>
    </Paper>
  );
};

// --- 5. POST ITEM (RENDERER) ---
export const PostItem = ({ post, class_id, handleUpdate, handleDelete }) => {
  const [uid, setUid] = useState('')
  const [initState, setInitState] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const decoded = jwtDecode(token)
    if (post.followers?.length > 0 && post.followers.includes(decoded.sub)) setInitState(true)
    setUid(decoded.sub)
  }, [post, class_id])

  const handleClosePostModal = () => setIsPostModalOpen(false);

  const handleFollowChange = async(newState) => {
    console.log(`User status changed to: ${newState ? 'Following' : 'Unfollowed'}`);
    const action = initState ? unfollowThread : followThread;
    toast.promise(action(post.thread_id), {
      loading: initState ? 'Đang bỏ theo dõi...' : 'Đang thực hiện theo dõi...',
      success: (data) => {
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
    if (threadId == "") return
    navigate(`/student/classes/${class_id}/${threadId}`);
  };

  const handleDeleteThread = () => {
    toast.promise(deleteThread(post.thread_id), {
      loading: 'Đang xóa bài viết...',
      success: (data) => {
        handleDelete(post.thread_id)
        return "Đã xóa thành công!"
      },
      error: (err) => {
        if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        return err.message || "Có lỗi xảy ra!";
      },
      duration: 2000
    });
  }

  return (
    <Card sx={{ mt: 2, borderRadius: 2 }}>
      <style>{globalStyles}</style>
      
      <CardHeader
        avatar={<Avatar src={post?.sender?.avatar_url} alt={`${post?.sender?.fname[0] + post?.sender?.lname[0]}` || "Ava"} />}
        title={<Typography fontWeight="bold">{post.sender.fname + " " + post.sender.mname + " " + post.sender.lname}</Typography>}
        subheader={
            <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="caption">{getRelativeTime(post.createAt)}</Typography> 
                <Public sx={{ fontSize: 14, color: 'text.secondary' }} />
            </Box>
        }
        action={ post.sender.uid !== uid ? (
          <Box sx={{ pr: 1, pt: 0.5 }}>
            <FollowToggleButton 
              initialIsFollowing={initState} 
              onToggle={handleFollowChange}
              thread_id={post.thread_id}
            />
          </Box>
        ) : (
          <IconButton>
            <MoreHoriz />
          </IconButton>
        )}
      />
      
      <CardContent sx={{ pt: 0, pb: 1 }}>
        {/* Render HTML Content với style Tag */}
        {post.content && (
          <Typography 
            component="div" 
            variant="body1" 
            dangerouslySetInnerHTML={{ __html: post.content }}
            sx={{ 
                mb: 1,
                '& b, & strong': { fontWeight: 700 },
                '& i, & em': { fontStyle: 'italic' }
            }}
          />
        )}
      </CardContent>

      {/* --- PHẦN GRID ẢNH --- */}
      {post.medias && post.medias.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <QuiltedImageList images={post.medias} />
        </Box>
      )}

      {/* Footer Actions */}
      <Divider />
      <Box sx={{ p: 1, display: 'flex', justifyContent: "end", gap: 1 }}>
        {post.sender.uid == uid ? 
          <>
          <Tooltip title="Chỉnh sửa bài viết" arrow placement="top">
            <IconButton
              onClick={() => setIsPostModalOpen(true)}
              sx={{ 
                border: '1px solid', 
                borderColor: 'primary.main', 
                borderRadius: '8px',
                p: '6px', 
                color: 'primary.main',
                "&:hover": {
                  bgcolor: 'primary.main',
                  border: "0px",
                  borderColor: 'white',
                  color: 'white',
                  transform: 'translateY(-2px) translateZ(2px)',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
                }
              }}
            >
              <ModeEditRounded />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa bài viết" arrow placement="top">
            <IconButton
              onClick={() => handleDeleteThread()}
              sx={{ 
                border: '1px solid', 
                borderColor: 'error.main', 
                borderRadius: '8px',
                p: '6px',
                color: 'error.main',
                "&:hover": {
                  bgcolor: 'error.main',
                  border: "0px",
                  borderColor: 'white',
                  color: 'white',
                  transform: 'translateY(-2px) translateZ(2px)',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
                }
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
          </>
         : null
        }
        <Tooltip title="Xem chi tiết" arrow placement="top">
          <IconButton 
            sx={{ 
              border: '1px solid', 
              borderColor: 'success.main', 
              borderRadius: '8px',
              p: '6px',
              color: 'success.main',
              "&:hover": {
                bgcolor: 'success.main',
                border: "0px",
                borderColor: 'white',
                color: 'white',
                transform: 'translateY(-2px) translateZ(2px)',
                transition: 'all 0.2s ease-in-out',
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
              }
            }}
            onClick={() => handleViewThread(post.thread_id)}
          >
            <ArrowForwardIosSharp />
          </IconButton>
        </Tooltip>
      </Box>
      <Modal
        open={isPostModalOpen}
        onClose={handleClosePostModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
        sx={{
          width: "800px",
          alignSelf: "center",
          justifySelf: "center",
          height: "80vh"
        }}
      >
        <Fade in={isPostModalOpen}>
          <ModalCard sx={{margin: 0, padding: 0}}>
            <PostCreator class_id={class_id} closeModal={handleClosePostModal} action="update" post={post} handleUpdate={handleUpdate} />
          </ModalCard>
        </Fade>
      </Modal>
    </Card>
  );
};

// --- 6. MAIN APP ---
export default function FacebookCloneV2() {
  const [posts, setPosts] = useState([
    {
      id: 999,
      user: MOCK_USER,
      contentHtml: 'Demo layout có <b>padding</b> và hỗ trợ <span class="mention-node">@Tag Bạn Bè</span>.',
      images: [
        'https://picsum.photos/id/1018/1000/600',
        'https://picsum.photos/id/1015/1000/600', 
        'https://picsum.photos/id/1019/1000/600'
      ],
      createdAt: '1 giờ trước',
    }
  ]);

  return (
    <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <PostCreator onPost={(newPost) => setPosts([newPost, ...posts])} />
        {posts.map(p => <PostItem key={p.id} post={p} />)}
      </Box>
    </Box>
  );
}