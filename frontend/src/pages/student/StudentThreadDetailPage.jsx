import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Snackbar,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  TextField,
  CardContent,
  Collapse,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { socket, getCommentsByThread, createComment } from "../../services/CommentService";
import QuiltedImageList from "../../components/Image/ImageList";
import CommentItem from "../../components/comment/CommentItem";
import CommentInput from "../../components/comment/CommentInput";
import VisuallyHiddenInput from "../../components/Input/VisuallyHiddenInput";
import { getRelativeTime } from "../../utils/DateTimeFormatter";

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import { PhotoCamera, Close, CloudUpload } from "@mui/icons-material";

// --- STYLED COMPONENTS ---
const OriginalPostCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const CommentsCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
}));
// ------------------------------

// --- COMPONENT CHÍNH ---
export default function ThreadDetailPage() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(""); 
  const [curParent, setCurParent] = useState(null)
  const [page, setPage] = useState(1)

  const { classId, threadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [thread, setThread] = useState(location.state)

  const [isUpload, setIsUpload] = useState(false)
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const fetchComments = async() => {
      toast.promise(getCommentsByThread(thread.thread_id, curParent, page), {
        loading: "Loading...",
        success: (response) => {
          setComments(prev => {
              const newComments = response && response.length ? response.filter(
                incoming => !prev.some(existing => existing.comment_id === incoming.comment_id)
              ) : [];
              
              return [...prev, ...newComments];
          });
          return
        },
        error: (err) => {
          if (err.status === 401) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
          return err.message || "Có lỗi xảy ra!";
        },
        duration: 2000
      })
    }

    fetchComments()
  },[thread, curParent])

  useEffect(() => {
    socket.emit('join_thread', thread.thread_id || threadId);

    socket.on('receive_comment', (newComment) => {
      console.log("New comment posted: ", newComment)
      setComments((prev) => {
        if (prev.some(c => c.comment_id === newComment.comment_id)) return prev;
        return addReplyToTree(comments, curParent, [newComment]);
      });
    });

    return () => {
      socket.off('receive_comment');
      socket.disconnect();
    };
  }, [thread, curParent])

  const handleNewImages = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(prev => [...prev, ...files]);
  }

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prevImages) => 
      prevImages.filter((_, index) => index != indexToRemove)
    )
  }

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };
  
  // Gửi bình luận GỐC
  const handleCommentSubmit = async() => {
    const createNewCommentForm = {
      content: newComment,
      parent_cmt_id: null
    }
    toast.promise(createComment(thread.thread_id, createNewCommentForm, selectedImages), {
      loading: "Đang đăng bình luận...",
      success: (response) => {
        return "Đã đăng bình luận!"
      },
      error: (err) => {
        return err.message || "Đăng bình luận thất bại!"
      },
      duration: 3000
    })
    
    setNewComment("");
    setSelectedImages([])
  };
  
  // Hàm đệ quy để thêm trả lời
  const addReplyToTree = (nodes, parentId, newReplies) => {
    return nodes.map(node => {
      if (node.comment_id === parentId) {
        const prevNodes = node?.replies && node.replies.length ? node.replies : []
        return {
          ...node,
          replies: [...newReplies, ...prevNodes]
        };
      }
      if (node.replies && node.replies.length > 0) {
        return {
          ...node,
          replies: addReplyToTree(node.replies, parentId, newReplies)
        };
      }
      return node;
    });
  };

  // Gửi bình luận TRẢ LỜI (Nested)
  const handleReplySubmit = (parentCommentId, content, parentAuthorEmail, images) => {
    console.log(">> [REPLY]: ", parentCommentId)
    const createNewCommentForm = {
      content: content,
      parent_cmt_id: parentCommentId,
      email: parentAuthorEmail
    }
    toast.promise(createComment(thread.thread_id, createNewCommentForm, images), {
      loading: "Đang đăng bình luận...",
      success: (response) => {
        return "Đã đăng bình luận!"
      },
      error: (err) => {
        return err.message || "Đăng bình luận thất bại!"
      },
      duration: 3000
    })
  };
  
  const motionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.5
      }
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack} 
          sx={{ mb: 2 }}
        >
          Quay lại Diễn đàn
        </Button>
      </motion.div>

      {/* === NỘI DUNG BÀI VIẾT GỐC (Thread) === */}
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <OriginalPostCard>
          <ListItem sx={{ pl: 0, pt: 0, alignItems: 'flex-start' }}>
            <ListItemAvatar>
              <Avatar src={thread?.sender?.avatar_url} alt={`${thread?.sender?.fname[0] + thread?.sender?.lname[0]}` || "Ava"} />
            </ListItemAvatar>
            <ListItemText
              primary={thread.sender.fname + " " + thread.sender.mname + " " + thread.sender.lname}
              secondary={getRelativeTime(thread.createAt)}
            />
          </ListItem>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {thread.title}
          </Typography>
          <CardContent sx={{ pt: 0, pb: 1 }}>
            {/* Render HTML Content với style Tag */}
            {thread.content && (
              <Typography 
                component="div" 
                variant="body1" 
                dangerouslySetInnerHTML={{ __html: thread.content }}
                sx={{ 
                    mb: 1,
                    '& b, & strong': { fontWeight: 700 },
                    '& i, & em': { fontStyle: 'italic' }
                }}
              />
            )}
          </CardContent>
          <QuiltedImageList images={thread.medias} />
        </OriginalPostCard>
      </motion.div>

      {/* === KHU VỰC BÌNH LUẬN (Comments) - (UC_HS09) === */}
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <CommentsCard>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Bình luận
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar sx={{ mt: 1 }}>
              <PersonIcon />
            </Avatar>
            <CommentInput 
              class_id={classId}
              value={newComment}
              setValue={setNewComment}
            />
          </Box>

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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button startIcon={<PhotoCamera color="success" />} onClick={() => setIsUpload(true)}>Ảnh/Video</Button>
            <Button 
              variant="contained" 
              onClick={() => handleCommentSubmit()}
              sx={{ height: 'fit-content', mt: 1 }}
            >
              <SendIcon />
            </Button>
          </Box>

          <Divider />
          
          {/* Danh sách bình luận */}
          <List>
            {comments.map((comment) => (
              <CommentItem 
                key={comment.comment_id} 
                comment={comment} 
                onReplySubmit={handleReplySubmit} 
                isNested={false}
                class_id={classId}
                setComments={setComments}
                addTreeNode={addReplyToTree}
              />
            ))}
          </List>

        </CommentsCard>
      </motion.div>
      
      <Snackbar
        //open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {/* <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
          {toast.message}
        </Alert> */}
      </Snackbar>

    </Container>
  );
}