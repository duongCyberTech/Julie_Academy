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
  Collapse, 
  Link as MuiLink, // Thêm Link của MUI
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
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

        </CommentsCard>
      </motion.div>
      
      <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
              {toast.message}
          </Alert>
      </Snackbar>

    </Container>
  );
}