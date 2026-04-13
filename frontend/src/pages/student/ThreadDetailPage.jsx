import React, { useState, useEffect, useRef } from "react";
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
  CardContent,
  Chip,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getCommentsByThread, createComment, fetchCommentsUntil, pinComment, unpinComment } from "../../services/CommentService";
import { getThreadById } from "../../services/ThreadService";
import { socket, decodedData } from "../../services/ApiClient";
import QuiltedImageList from "../../components/Image/ImageList";
import CommentItem from "../../components/comment/CommentItem";
import CommentInput, {extractEmailsFromComment} from "../../components/comment/CommentInput";
import VisuallyHiddenInput from "../../components/Input/VisuallyHiddenInput";
import { getRelativeTime } from "../../utils/DateTimeFormatter";

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Close from '@mui/icons-material/Close'
import CloudUpload from "@mui/icons-material/CloudUpload";
import UnPinIcon from "../../components/Icon/UnPinIcon";
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';

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

const updateCommentInTree = (nodes, updatedComment) => {
  return nodes.map((node) => {
    if (node.comment_id === updatedComment.parent_cmt_id){
      return {
        ...node,
        cnt_comments: node.cnt + 1,
        replies: updateCommentInTree(node.replies, updatedComment),
        isNested: true
      }
    }
    // Tìm thấy node cần cập nhật
    if (node.comment_id === updatedComment.comment_id) {
      return {
        ...node,
        ...updatedComment,
      };
    }

    // Nếu có bình luận con, tiếp tục đệ quy tìm kiếm
    if (node.replies && node.replies.length > 0) {
      return {
        ...node,
        replies: updateCommentInTree(node.replies, updatedComment),
      };
    }

    return node;
  });
};

// --- COMPONENT CHÍNH ---
const ThreadDetailPage = React.memo(() => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(""); 
  const [curParent, setCurParent] = useState(null)
  const [page, setPage] = useState(1)
  const [cnt, setCnt] = useState(0)

  const { classId, threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState()

  const [isUpload, setIsUpload] = useState(false)
  const [selectedImages, setSelectedImages] = useState([]);

  const location = useLocation();
  const link_data = location.state;
  const hasHandledNav = useRef(false);

  useEffect(() => {
    const fetchThread = async() => {
      try {
        const response = await getThreadById(threadId)
        if (response.data.status === 200) setThread(response.data.data)
      } catch (error) {
        return
      }
    }

    fetchThread()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (link_data?.isNested && link_data?.comment_id && !hasHandledNav.current) {
        hasHandledNav.current = true;
        
        try {
          const targetCommentTree = await fetchCommentsUntil(threadId, link_data.comment_id);
          
          if (targetCommentTree) {
            setComments(prev => {
              const exists = prev.some(c => c.comment_id === targetCommentTree.comment_id);
              if (exists) {
                return updateCommentInTree(prev, targetCommentTree);
              }
              return [targetCommentTree, ...prev]; 
            });

            setTimeout(() => {
              const element = document.getElementById(`comment-${link_data.comment_id}`);
              if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 500);
          }
        } catch (error) {
          console.error("Lỗi khi tải bình luận từ thông báo", error);
        }
      }

      try {
        const response = await getCommentsByThread(threadId, curParent, page);
        if (response.status === 200) {
          setComments(prev => {
            const newComments = response.data && response.data.length ? response.data.filter(
              incoming => !prev.some(existing => existing.comment_id === incoming.comment_id)
            ) : [];
            return [...prev, ...newComments];
          });
        }
      } catch (error) {
        if (error.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          navigate('/login');
        }
      }
    };

    loadData();
  }, [page, threadId]);

  useEffect(() => {
    const targetId = location.hash ? location.hash.substring(1) : null;

    if (targetId) {
      // Đợi một chút để đảm bảo DOM đã được vẽ xong (rất quan trọng nếu có call API)
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-animation'); 
        }
      }, 300); // Tăng thời gian delay nếu API của bạn load chậm hơn
    }
  }, [location, comments]);

  useEffect(() => {
    const targetId = threadId;
    if (!targetId) return;

    socket.emit('join_thread', targetId);

    const handleReceiveComment = (newComment) => {
      setComments((prevList) => {

        const checkDuplicate = (nodes) => {
          return nodes.some(c => 
            c.comment_id === newComment.comment_id || 
            (c.replies && checkDuplicate(c.replies))
          );
        };

        if (checkDuplicate(prevList)) {
          return prevList;
        }

        const updatedTree = addReplyToTree(prevList, newComment.parent_cmt_id, [newComment]);
        
        return updatedTree;
      });
    };

    socket.on('receive_comment', (newComment) => handleReceiveComment(newComment));

    return () => {
      socket.off('receive_comment',(newComment) => handleReceiveComment(newComment));
    };
  }, [thread, curParent]);

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
    navigate(`/${decodedData.role}/classes/${classId}`);
  };
  
  // Gửi bình luận GỐC
  const handleCommentSubmit = async() => {
    const taggedEmails = extractEmailsFromComment(newComment)

    const createNewCommentForm = {
      content: newComment,
      parent_cmt_id: null,
      ...(taggedEmails && taggedEmails.length ? {emails: taggedEmails} : {})
    }
    toast.promise(createComment(thread.thread_id, createNewCommentForm, selectedImages), {
      loading: "Đang đăng bình luận...",
      success: (response) => {
        setCnt(cnt + 1)
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
    if (!parentId) {
      const uniqueNewComments = newReplies.filter(
        newC => !nodes.some(oldC => oldC.comment_id === newC.comment_id)
      );
      return [...uniqueNewComments, ...nodes];
    }

    return nodes.map(node => {
      if (node.comment_id === parentId) {
        const prevNodes = node?.replies && node.replies.length ? node.replies : []
        const uniqueNewComments = newReplies.filter(
          newC => !prevNodes.some(oldC => oldC.comment_id === newC.comment_id)
        );
        return {
          ...node,
          replies: [...uniqueNewComments, ...prevNodes]
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

  const updateNodeInTree = (nodes, targetId, updatePayload) => {
    if (!nodes || nodes.length === 0) return [];

    return nodes.map(node => {
      // 1. Nếu tìm thấy đúng node cần update
      if (node.comment_id === targetId) {
        return {
          ...node,
          ...updatePayload // Ghi đè các field mới (ví dụ: { is_pinned: true })
        };
      }

      // 2. Nếu không phải node này, kiểm tra các node con (đệ quy)
      if (node.replies && node.replies.length > 0) {
        return {
          ...node,
          replies: updateNodeInTree(node.replies, targetId, updatePayload)
        };
      }

      // 3. Nếu không tìm thấy và không có con, giữ nguyên node
      return node;
    });
  };

  // Gửi bình luận TRẢ LỜI (Nested)
  const handleReplySubmit = (parentCommentId, content, parentAuthorEmails, images) => {
    const createNewCommentForm = {
      content: content,
      parent_cmt_id: parentCommentId,
      emails: parentAuthorEmails
    }
    toast.promise(createComment(thread.thread_id, createNewCommentForm, images), {
      loading: "Đang đăng bình luận...",
      success: (response) => {
        setCnt(cnt + 1)
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

  const handlePinComment = async(commentId) => {
    try {
      await pinComment(threadId, commentId)
      setComments(updateNodeInTree(comments, commentId, {is_pinned: true}))
    } catch (error) {
      
    }
  }

  const handleUnPinComment = async(commentId) => {
    try {
      await unpinComment(threadId, commentId)
      setComments(updateNodeInTree(comments, commentId, {is_pinned: false}))
    } catch (error) {
      
    }
  }

  return thread && (
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
            <Button startIcon={<PhotoCamera color="success" />} onClick={() => setIsUpload(!isUpload)}>Ảnh/Video</Button>
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
            {comments.filter(comment => comment.is_pinned == true).map((comment) => (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <CommentItem 
                  key={comment.comment_id} 
                  comment={comment} 
                  onReplySubmit={handleReplySubmit} 
                  class_id={classId}
                  setComments={setComments}
                  addTreeNode={addReplyToTree}
                />
                {!comment.parent_cmt_id && thread.sender.uid == decodedData.sub ? (
                  <Box sx={{ mt: 1 }}> {/* Thêm Box bọc ngoài để căn chỉnh lề trên nếu cần */}
                    {!comment.is_pinned ? (
                      <Tooltip title="Ghim" arrow placement="right"> 
                        <IconButton sx={{ p: 1 }} onClick={() => handlePinComment(comment.comment_id)}>
                          <PushPinRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Bỏ ghim" arrow placement="right">
                        <IconButton sx={{ p: 1 }} onClick={() => handleUnPinComment(comment.comment_id)}>
                          <UnPinIcon width="18px" height="18px" /> {/* Tăng size một chút cho dễ bấm */}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ) : null}
              </Box>
            ))}
            {comments.filter(comment => comment.is_pinned == false).map((comment) => (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <CommentItem 
                  key={comment.comment_id} 
                  comment={comment} 
                  onReplySubmit={handleReplySubmit} 
                  class_id={classId}
                  setComments={setComments}
                  addTreeNode={addReplyToTree}
                />
                {!comment.parent_cmt_id && thread.sender.uid == decodedData.sub ? (
                  <Box sx={{ mt: 1 }}> {/* Thêm Box bọc ngoài để căn chỉnh lề trên nếu cần */}
                    {!comment.is_pinned ? (
                      <Tooltip title="Ghim" arrow placement="right"> 
                        <IconButton sx={{ p: 1 }} onClick={() => handlePinComment(comment.comment_id)}> {/* Dùng padding thay vì aspectRatio */}
                          <PushPinRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Bỏ ghim" arrow placement="right">
                        <IconButton sx={{ p: 1 }} onClick={() => handleUnPinComment(comment.comment_id)}>
                          <UnPinIcon width="18px" height="18px" /> {/* Tăng size một chút cho dễ bấm */}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ) : null}
              </Box>
            ))}
            {thread.cnt_comments > page * 10 ? 
              (<Typography
                sx={{
                  cursor: "pointer",
                  mt: 2,
                  '&:hover': {
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }
                }}
                onClick={() => setPage(page + 1)}
              >
                Xem thêm
              </Typography>) : null
            }
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
})

export default ThreadDetailPage;