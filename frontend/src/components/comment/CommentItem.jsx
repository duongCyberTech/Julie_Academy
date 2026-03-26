import { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Collapse,
  Chip,
  Tooltip
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import ReplyIcon from '@mui/icons-material/Reply'
import SendIcon from '@mui/icons-material/Send';
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Close from '@mui/icons-material/Close'
import CloudUpload from "@mui/icons-material/CloudUpload";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { getRelativeTime } from "../../utils/DateTimeFormatter";
import { CommentImageList } from "../Image/ImageList";
import CommentInput, { renderContentWithTags, extractEmailsFromComment } from "./CommentInput";
import VisuallyHiddenInput from "../Input/VisuallyHiddenInput";
import { getCommentsByThread, updateComment, deleteComment } from "../../services/CommentService";

import ConfirmAction from "../ActionModal/ConfirmModal";

const CommentItem = ({ comment, onReplySubmit, class_id = null, setComments = null, addTreeNode = null }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [user, setUser] = useState(jwtDecode(localStorage.getItem('token')))

  const [isUpload, setIsUpload] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [selectedImages, setSelectedImages] = useState(comment?.medias || []);
  const [addImages, setAddImages] = useState([])
  const [deleteImages, setDeleteImages] = useState([])
  const [updateContent, setUpdateContent] = useState(comment.content || "")
  const [isNested, setIsNested] = useState(comment.isNested)
  const [page, setPage] = useState(1)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  
  const handleFetchChildComments = async() => {
    toast.promise(getCommentsByThread(comment.thread_id, comment.comment_id, page), {
      loading: "Đang tải bình luận...",
      success: (response) => {
        setIsNested(true)
        setComments(prev => addTreeNode(prev, comment.comment_id, response.data))
        return "Đã tải bình luận!"
      },
      error: (err) => {
        return err.message
      }
    })
  }

  const handleLoadMore = async() => {
    setPage(page + 1)
    toast.promise(getCommentsByThread(comment.thread_id, comment.comment_id, page + 1), {
      loading: "Đang tải bình luận...",
      success: (response) => {
        setIsNested(true)
        setComments(prev => addTreeNode(prev, comment.comment_id, response))
        return "Đã tải bình luận!"
      },
      error: (err) => {
        return err.message
      }
    })
  }

  const handleSubmitReply = () => {
    if (replyContent.trim() === "") return;
    const taggedEmails = extractEmailsFromComment(replyContent)
    onReplySubmit(comment.comment_id, replyContent, taggedEmails, selectedImages);
    setIsNested(true)
    setReplyContent("");
    setIsReplying(false);
    setSelectedImages([])
    setIsUpload(false)
  };

  const handleUpdate = async() => {
    const updateData = {
      content: updateContent,
      deletedImages: deleteImages
    }
    toast.promise(updateComment(comment.thread_id, comment.comment_id, updateData, addImages), {
      loading: "Đang cập nhật...",
      success: (response) => {
        setComments((prev) => {
          const updateCommentInTree = (nodes, updatedComment) => {
            return nodes.map((node) => {
              if (node.comment_id === updatedComment.parent_cmt_id){
                setIsNested(true)
                return {
                  ...node,
                  cnt_comments: node.cnt + 1,
                  replies: updateCommentInTree(node.replies, updatedComment)
                }
              }

              if (node.comment_id === updatedComment.comment_id) {
                return {
                  ...node,
                  ...updatedComment,
                };
              }

              if (node.replies && node.replies.length > 0) {
                return {
                  ...node,
                  replies: updateCommentInTree(node.replies, updatedComment),
                };
              }

              return node;
            });
          };

          return updateCommentInTree(prev, response.data)
        })

        setIsUpdate(false)
        return "Cập nhật thành công!"
      },
      error: (err) => {
        return err.message
      },
      duration: 2000
    })
  }

  const handleNewImages = (event) => {
    const files = Array.from(event.target.files);
    if (isUpdate) setSelectedImages(prev => [...prev, ...files]);
    setSelectedImages(prev => [...prev, ...files]);
  }

  const handleRemoveImage = (indexToRemove) => {
    if (isUpdate) setDeleteImages(prev => [...prev, selectedImages[indexToRemove]])
    setSelectedImages((prevImages) => 
      prevImages.filter((_, index) => index != indexToRemove)
    )
  }

  const handleRemoveAddImage = (indexToRemove) => {
    setAddImages((prevImages) => 
      prevImages.filter((_, index) => index != indexToRemove)
    )
  }

  const handleDelete = async(commentId) => {
    toast.promise(deleteComment(comment.thread_id, comment.comment_id), {
      loading: "Đang xóa...",
      success: (response) => {
        setComments((prev) => {
          const removeCommentFromTree = (nodes, targetId) => {
            return nodes
              .filter((node) => node.comment_id !== targetId)
              .map((node) => {
                if (node.replies && node.replies.length > 0) {
                  return {
                    ...node,
                    replies: removeCommentFromTree(node.replies, targetId),
                  };
                }
                return node;
              });
          };

          return removeCommentFromTree(prev, commentId)
        })
        return "Xóa thành công!"
      },
      error: (err) => {
        return err.message
      }
    })
  }

  return (
    <Box id={`msg_${comment.comment_id}`}>
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
          
          secondaryTypographyProps={{ component: 'div' }} 

          secondary={
            <>
              {isUpdate ? 
                <CommentInput 
                  class_id={class_id}
                  value={updateContent}
                  setValue={setUpdateContent}
                /> :
                <Typography 
                  component="span" 
                  variant="body2" 
                  color="text.primary"
                  sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
                >
                  {renderContentWithTags(comment.content)}
                </Typography>
              }

              <CommentImageList images={comment?.medias} />

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 2 }}>
                <Typography component="span" variant="caption" display="block">
                  {getRelativeTime(comment.createAt)}
                </Typography>
                {comment && (comment.cnt_comments) ? (
                  !isNested ? 
                  (<Typography 
                    component="span" variant="caption" display="block"
                    sx={{
                      cursor: "pointer",
                      '&:hover': {
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }
                    }}
                    onClick={
                      () => handleFetchChildComments()
                    }
                  >
                    Xem {comment.cnt_comments} phản hồi
                  </Typography>) : 
                  (<Typography 
                    component="span" variant="caption" display="block"
                    sx={{
                      cursor: "pointer",
                      '&:hover': {
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }
                    }}
                    onClick={
                      () => setIsNested(false)
                    }
                  >
                    Thu gọn
                  </Typography>)
                ) : null}

                {comment.sender.uid === user.sub ? 
                  (!isUpdate ? (
                    <>
                      <Typography
                        component="span" variant="caption" display="block"
                        sx={{
                          cursor: "pointer",
                          '&:hover': {
                            color: 'primary.main',
                            fontWeight: 'bold'
                          }
                        }}
                        onClick={() => {setUpdateContent(comment.content); setIsUpdate(true); setIsUpload(true)}}
                      >
                        Chỉnh sửa
                      </Typography>

                      <Typography
                        component="span" variant="caption" display="block"
                        sx={{
                          cursor: "pointer",
                          '&:hover': {
                            color: 'error.main',
                            fontWeight: 'bold'
                          }
                        }}
                        onClick={() => setIsDeleteModal(true)}
                      >
                        Xóa
                      </Typography>
                    </>
                  ) : 
                  <>
                    <Button startIcon={<PhotoCamera color="success" />} onClick={() => setIsUpload(!isUpload)}>Ảnh/Video</Button>
                    <Button onClick={() => handleUpdate()}>Save</Button>
                  </>) : null
                }

                <Button 
                  size="small" 
                  startIcon={<ReplyIcon />} 
                  onClick={
                    () => {
                      setIsReplying(!isReplying)
                      if (comment.sender.email !== user.email)
                      setReplyContent(`@[${comment.sender.fname + " " + (comment?.sender?.mname ? comment.sender.mname + " " : "") + comment.sender.lname}](${comment.sender.email})`)
                    }
                  }
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
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
          <CommentInput 
            class_id={class_id}
            value={replyContent}
            setValue={setReplyContent}
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
                  src={!isUpdate ? URL.createObjectURL(img) : img} 
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, ml: 4 }}>
          <Button startIcon={<PhotoCamera color="success" />} onClick={() => setIsUpload(!isUpload)}>Ảnh/Video</Button>
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
      {isNested && comment.replies && comment.replies.length > 0 && (
        <Box sx={{ pl: 5, borderLeft: (theme) => `1px solid ${theme.palette.divider}` }}>
          <List disablePadding>
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.comment_id} 
                comment={reply} 
                onReplySubmit={onReplySubmit} 
                class_id={class_id}
                setComments={setComments}
                addTreeNode={addTreeNode}
              />
            ))}
            {comment.cnt_comments > page * 10 ? 
              (<Typography
                sx={{
                  cursor: "pointer",
                  mt: 2,
                  '&:hover': {
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }
                }}
                onClick={() => handleLoadMore()}
              >
                Xem thêm
              </Typography>) : null
            }
          </List>
        </Box>
      )}
      
      <Divider variant="inset" component="li" />

      <ConfirmAction 
        title="Bạn chắc chắn xóa bình luận?"
        content="Ấn nút Xóa để xác nhận."
        action={handleDelete}
        actionParams={[comment.comment_id]}
        btnColor="error"
        startIcon={<DeleteOutline />}
        open={isDeleteModal}
        setOpen={setIsDeleteModal}
        btnContent="Xóa"
      />
    </Box>
  );
};

export default CommentItem;