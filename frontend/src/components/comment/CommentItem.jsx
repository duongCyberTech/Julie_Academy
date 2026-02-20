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
  Link as MuiLink, // Thêm Link của MUI
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import ReplyIcon from '@mui/icons-material/Reply'
import SendIcon from '@mui/icons-material/Send';
import { PhotoCamera, Close, CloudUpload } from "@mui/icons-material";

import { getRelativeTime } from "../../utils/DateTimeFormatter";
import { CommentImageList } from "../Image/ImageList";
import { renderContentWithTags } from "./CommentInput";
import VisuallyHiddenInput from "../Input/VisuallyHiddenInput";

// === COMPONENT BÌNH LUẬN ĐỆ QUY (ĐÃ NÂNG CẤP @MENTION) ===
// === (YÊU CẦU 2) COMPONENT BÌNH LUẬN ĐỆ QUY (ĐÃ SỬA LỖI VALIDATE DOM) ===
const CommentItem = ({ comment, onReplySubmit, isNested = false }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [email, setEmail] = useState(comment.sender.email)

  const [isUpload, setIsUpload] = useState(false)
  const [selectedImages, setSelectedImages] = useState([]);
  

  const handleSubmitReply = () => {
    console.log(comment.comment_id)
    if (replyContent.trim() === "") return;
    // Truyền cả comment.id (cha) và comment.author_name (người bị reply)
    onReplySubmit(comment.comment_id, replyContent, email, selectedImages);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleNewImages = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(prev => [...prev, ...files]);
  }

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prevImages) => 
      prevImages.filter((_, index) => index != indexToRemove)
    )
  }

  return (
    <Box>
      <ListItem sx={{ pl: 0, alignItems: 'flex-start' }}>
        <ListItemAvatar>
          <Avatar src={comment?.sender?.avata_url} sx={{ width: 32, height: 32 }}>
            {!comment?.sender?.avata_url && <PersonIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {comment.sender.fname + " " + comment.sender.mname + " " + comment.sender.lname}
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
                sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
              >
                {isNested && (comment.sender.fname + " " + comment.sender.mname + " " + comment.sender.lname) && (
                  <MuiLink href="#" underline="hover" sx={{ fontWeight: 600, mr: 0.5 }}>
                    @{comment.sender.fname + " " + comment.sender.mname + " " + comment.sender.lname}
                  </MuiLink>
                )}
                {renderContentWithTags(comment.content)}
              </Typography>

              <CommentImageList images={comment?.medias} />

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography component="span" variant="caption" display="block">
                  {getRelativeTime(comment.createAt)}
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
            label={`Trả lời ${comment.sender.fname + " " + comment.sender.mname + " " + comment.sender.lname}...`}
            variant="outlined"
            fullWidth
            multiline
            size="small"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, ml: 4 }}>
          <Button startIcon={<PhotoCamera color="success" />} onClick={() => setIsUpload(true)}>Ảnh/Video</Button>
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

export default CommentItem;