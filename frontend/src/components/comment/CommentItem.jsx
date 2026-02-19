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
  Link as MuiLink, // Thêm Link của MUI
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import ReplyIcon from '@mui/icons-material/Reply'
import SendIcon from '@mui/icons-material/Send';

import { getRelativeTime } from "../../utils/DateTimeFormatter";
import { CommentImageList } from "../Image/ImageList";

// === COMPONENT BÌNH LUẬN ĐỆ QUY (ĐÃ NÂNG CẤP @MENTION) ===
// === (YÊU CẦU 2) COMPONENT BÌNH LUẬN ĐỆ QUY (ĐÃ SỬA LỖI VALIDATE DOM) ===
const CommentItem = ({ comment, onReplySubmit, isNested = false }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    if (replyContent.trim() === "") return;
    // Truyền cả comment.id (cha) và comment.author_name (người bị reply)
    onReplySubmit(comment.comment_id, replyContent, comment.sender.email);
    setReplyContent("");
    setIsReplying(false);
  };

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
                {comment.content}
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