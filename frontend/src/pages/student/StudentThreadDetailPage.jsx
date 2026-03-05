<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
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
<<<<<<< HEAD
  CardContent,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getCommentsByThread, createComment, fetchCommentsUntil } from "../../services/CommentService";
import { getThreadById } from "../../services/ThreadService";
import { socket, decodedData } from "../../services/ApiClient";
import QuiltedImageList from "../../components/Image/ImageList";
import CommentItem from "../../components/comment/CommentItem";
import CommentInput, {extractEmailsFromComment} from "../../components/comment/CommentInput";
import VisuallyHiddenInput from "../../components/Input/VisuallyHiddenInput";
import { getRelativeTime } from "../../utils/DateTimeFormatter";
=======
  TextField,
  Collapse, 
  Link as MuiLink, // Thêm Link của MUI
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
<<<<<<< HEAD
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Close from '@mui/icons-material/Close'
import CloudUpload from "@mui/icons-material/CloudUpload";

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
        if (response.status === 200)
          setComments(prev => {
            const newComments = response.data && response.data.length ? response.data.filter(
              incoming => !prev.some(existing => existing.comment_id === incoming.comment_id)
            ) : [];
            return [...prev, ...newComments];
          });
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

  // Gửi bình luận TRẢ LỜI (Nested)
  const handleReplySubmit = (parentCommentId, content, parentAuthorEmails, images) => {
    console.log(">> [REPLY]: ", parentCommentId)
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

  return thread && (
=======
import ReplyIcon from '@mui/icons-material/Reply'; 

// Import hình ảnh
import AvatarTutor from "../../assets/images/Avatar.jpg";

// --- (GIẢ LẬP ID USER ĐANG ĐĂNG NHẬP) ---
const CURRENT_USER_ID = 'u_stu_001';
// ----------------------------------------

// --- DỮ LIỆU MẪU (LỒNG NHAU) ---

const mockThreadDetail = {
    id: 't_001', 
    title: 'Thắc mắc về giải bài tập 3 (SGK - tr.15)', 
    content: 'Em không hiểu bước 2, tại sao lại bình phương 2 vế ạ? Em cảm ơn.', 
    author_id: 'u_stu_002', 
    author_name: 'Nguyễn Văn A', 
    author_avatar: null, 
    created_at: '2025-11-05T10:30:00Z', 
};

// Dữ liệu đã có cấu trúc lồng nhau
const initialMockComments = [
    {
        id: 'c_001', 
        author_id: 'u_tutor_001',
        author_name: 'ThS. Lê Thị Bảo Thu', 
        author_avatar: AvatarTutor, 
        content: 'Chào em, vì 2 vế đều là số không âm (căn bậc 2 và 3) nên ta có thể bình phương 2 vế để mất dấu căn nhé.', 
        created_at: '2025-11-05T10:35:00Z',
        replies: [ 
            {
                id: 'c_003',
                author_id: 'u_stu_002',
                author_name: 'Nguyễn Văn A',
                author_avatar: null,
                // Yêu cầu 2: Thêm parent_author_name để @mention
                parent_author_name: 'ThS. Lê Thị Bảo Thu', 
                content: 'Dạ em hiểu rồi, em cảm ơn cô.',
                created_at: '2025-11-05T11:05:00Z',
                replies: [] 
            },
            {
                id: 'c_004', // C rep A (trong ảnh)
                author_id: 'u_stu_003',
                author_name: 'Trần Thị B',
                author_avatar: null,
                parent_author_name: 'ThS. Lê Thị Bảo Thu', 
                content: 'Em cũng cảm ơn cô.',
                created_at: '2025-11-05T11:10:00Z',
                replies: [] 
            }
        ]
    },
    {
        id: 'c_002',
        author_id: 'u_stu_003',
        author_name: 'Trần Thị B',
        author_avatar: null,
        content: 'Mình cũng thắc mắc câu này, cảm ơn cô ạ.',
        created_at: '2025-11-05T11:00:00Z',
        replies: []
    },
];
// ------------------------------

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


// === COMPONENT BÌNH LUẬN ĐỆ QUY (ĐÃ NÂNG CẤP @MENTION) ===
// === (YÊU CẦU 2) COMPONENT BÌNH LUẬN ĐỆ QUY (ĐÃ SỬA LỖI VALIDATE DOM) ===
const CommentItem = ({ comment, onReplySubmit, isNested = false }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const handleSubmitReply = () => {
        if (replyContent.trim() === "") return;
        // Truyền cả comment.id (cha) và comment.author_name (người bị reply)
        onReplySubmit(comment.id, replyContent, comment.author_name);
        setReplyContent("");
        setIsReplying(false);
    };

    return (
        <Box>
            <ListItem sx={{ pl: 0, alignItems: 'flex-start' }}>
                <ListItemAvatar>
                    <Avatar src={comment.author_avatar} sx={{ width: 32, height: 32 }}>
                        {!comment.author_avatar && <PersonIcon />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comment.author_name}
                        </Typography>
                    }
                    
                    // === SỬA LỖI VALIDATE DOM BẰNG CÁCH THÊM PROP NÀY ===
                    secondaryTypographyProps={{ component: 'div' }} 
                    // ==================================================

                    secondary={
                        <>
                            <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.primary"
                                sx={{ whiteSpace: 'pre-wrap' }}
                            >
                                {isNested && comment.parent_author_name && (
                                  <MuiLink href="#" underline="hover" sx={{ fontWeight: 600, mr: 0.5 }}>
                                      @{comment.parent_author_name}
                                  </MuiLink>
                                )}
                                {comment.content}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography component="span" variant="caption" display="block">
                                    {new Date(comment.created_at).toLocaleString('vi-VN')}
                                </Typography>
                                <Button 
                                    size="small" 
                                    startIcon={<ReplyIcon />} 
                                    onClick={() => setIsReplying(!isReplying)}
                                    sx={{ ml: 1, textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    Trả lời
                                </Button>
                            </Box>
                        </>
                    }
                />
            </ListItem>
            
            {/* Ô nhập liệu trả lời (ẩn/hiện) */}
            <Collapse in={isReplying}>
                <Box sx={{ display: 'flex', gap: 2, pl: 5, mb: 2 }}>
                    <Avatar sx={{ mt: 1, width: 32, height: 32 }}>
                        <PersonIcon />
                    </Avatar>
                    <TextField
                        label={`Trả lời ${comment.author_name}...`}
                        variant="outlined"
                        fullWidth
                        multiline
                        size="small"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleSubmitReply}
                        size="small"
                        sx={{ height: 'fit-content', mt: 1 }}
                    >
                        <SendIcon />
                    </Button>
                </Box>
            </Collapse>

            {/* Vùng đệ quy: Render các trả lời con */}
            {comment.replies && comment.replies.length > 0 && (
                <Box sx={{ pl: 5, borderLeft: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <List disablePadding>
                        {comment.replies.map((reply) => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                onReplySubmit={onReplySubmit} 
                                isNested={true} // Báo cho component con biết nó là 1 reply
                            />
                        ))}
                    </List>
                </Box>
            )}
            
            <Divider variant="inset" component="li" />
        </Box>
    );
};
// ======================================


// --- COMPONENT CHÍNH ---
export default function StudentThreadDetailPage() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [comments, setComments] = useState(initialMockComments);
  const [newComment, setNewComment] = useState(""); 

  const { classId, threadId } = useParams();
  const navigate = useNavigate();

  const handleCloseToast = (event, reason) => {
      if (reason === 'clickaway') return;
      setToast(prev => ({ ...prev, open: false }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleCommentChange = (event) => {
      setNewComment(event.target.value);
  };
  
  // Gửi bình luận GỐC
  const handleCommentSubmit = () => {
      if (newComment.trim() === "") {
          setToast({ open: true, message: 'Nội dung bình luận không được để trống', severity: 'warning' });
          return;
      }
      
      const newCommentObject = {
        id: `c_${Date.now()}`,
        author_id: CURRENT_USER_ID,
        author_name: 'Nguyễn Hàm Hoàng (Bạn)',
        author_avatar: null,
        content: newComment,
        created_at: new Date().toISOString(),
        replies: [] 
      };
      
      setComments([newCommentObject, ...comments]); 
      setNewComment("");
      setToast({ open: true, message: 'Gửi bình luận thành công!', severity: 'success' });
  };
  
  // Hàm đệ quy để thêm trả lời
  const addReplyToTree = (nodes, parentId, newReply) => {
      return nodes.map(node => {
          if (node.id === parentId) {
              return {
                  ...node,
                  replies: [newReply, ...node.replies]
              };
          }
          if (node.replies && node.replies.length > 0) {
              return {
                  ...node,
                  replies: addReplyToTree(node.replies, parentId, newReply)
              };
          }
          return node;
      });
  };

  // Gửi bình luận TRẢ LỜI (Nested)
  const handleReplySubmit = (parentCommentId, content, parentAuthorName) => {
       const newReplyObject = {
        id: `c_${Date.now()}`,
        author_id: CURRENT_USER_ID,
        author_name: 'Nguyễn Hàm Hoàng (Bạn)',
        author_avatar: null,
        parent_author_name: parentAuthorName, // <-- Thêm tên người bị reply
        content: content,
        created_at: new Date().toISOString(),
        replies: [] 
      };
      
      const newCommentsTree = addReplyToTree(comments, parentCommentId, newReplyObject);
      setComments(newCommentsTree);
      setToast({ open: true, message: 'Gửi trả lời thành công!', severity: 'success' });
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
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <Button 
<<<<<<< HEAD
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack} 
          sx={{ mb: 2 }}
        >
          Quay lại Diễn đàn
=======
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack} 
            sx={{ mb: 2 }}
        >
            Quay lại Diễn đàn
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        </Button>
      </motion.div>

      {/* === NỘI DUNG BÀI VIẾT GỐC (Thread) === */}
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <OriginalPostCard>
<<<<<<< HEAD
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
=======
            <ListItem sx={{ pl: 0, pt: 0, alignItems: 'flex-start' }}>
                <ListItemAvatar>
                    <Avatar src={mockThreadDetail.author_avatar}>
                        {!mockThreadDetail.author_avatar && <PersonIcon />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={mockThreadDetail.author_name}
                    secondary={new Date(mockThreadDetail.created_at).toLocaleString('vi-VN')}
                />
            </ListItem>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                {mockThreadDetail.title}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {mockThreadDetail.content}
            </Typography>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        </OriginalPostCard>
      </motion.div>

      {/* === KHU VỰC BÌNH LUẬN (Comments) - (UC_HS09) === */}
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <CommentsCard>
<<<<<<< HEAD
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
            {comments.map((comment) => (
              <CommentItem 
                key={comment.comment_id} 
                comment={comment} 
                onReplySubmit={handleReplySubmit} 
                class_id={classId}
                setComments={setComments}
                addTreeNode={addReplyToTree}
              />
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
=======
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Bình luận
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ mt: 1 }}>
                    <PersonIcon />
                </Avatar>
                <TextField
                    label="Viết bình luận của bạn..."
                    variant="outlined"
                    fullWidth
                    multiline
                    value={newComment}
                    onChange={handleCommentChange}
                />
                <Button 
                    variant="contained" 
                    onClick={handleCommentSubmit}
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
                        key={comment.id} 
                        comment={comment} 
                        onReplySubmit={handleReplySubmit} 
                        isNested={false} // <-- Bình luận gốc
                    />
                ))}
            </List>

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        </CommentsCard>
      </motion.div>
      
      <Snackbar
<<<<<<< HEAD
        //open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {/* <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
          {toast.message}
        </Alert> */}
=======
          open={toast.open}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
              {toast.message}
          </Alert>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      </Snackbar>

    </Container>
  );
<<<<<<< HEAD
})

export default ThreadDetailPage;
=======
}
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
