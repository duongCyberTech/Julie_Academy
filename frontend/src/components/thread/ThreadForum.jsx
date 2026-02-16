import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Container,
  Modal,
  Backdrop,
  Fade,
  TextField,
  Menu,
  MenuItem
} from "@mui/material";

// Icons
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

import { jwtDecode } from "jwt-decode";

import { TabContentCard, ModalCard } from "../Tab/Tab";
import FacebookEditor from "./TextEditor";
import EditorLayout from "./EditorLayout";
import FacebookCloneV2, { PostCreator, PostItem } from "./EditorLayout";
import * as ThreadService from "../../services/ThreadService";

export default function ThreadForum({class_id}) {
    const navigate = useNavigate();
    const [currentUserId, setCurrentUserId] = useState("");
    const [threads, setThreads] = useState([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null); 
    const [postFormData, setPostFormData] = useState({ title: '', content: '' });
    const [anchorEl, setAnchorEl] = useState(null); 
    const [selectedThread, setSelectedThread] = useState(null); 
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode(token);
                    setCurrentUserId(decoded.uid);
                }
                // Assuming getThreadsByClass is imported from ThreadService
                const data = await ThreadService.getThreadsByClass(class_id, token)
                setThreads(data);
                console.log("All threads: ", data)
            } catch (error) {
                console.error("Error fetching threads:", error);
            }
        };

        fetchThreads();
    }, []);

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedThread(null);
    };

    const handleClosePostModal = () => setIsPostModalOpen(false);

    const handleOpenPostModal = (postToEdit = null) => {
        if (postToEdit) {
            setEditingPost(postToEdit);
            setPostFormData({ title: postToEdit.title, content: postToEdit.content });
        } else {
            setEditingPost(null);
            setPostFormData({ title: '', content: '' });
        }
        setIsPostModalOpen(true);
        handleCloseMenu();
    };

    const handleDeletePost = () => {
        if (selectedThread) {
        setThreads(threads.filter(t => t.id !== selectedThread.id));
        setToast({ open: true, message: 'Xóa bài viết thành công!', severity: 'error' });
        }
        handleCloseMenu();
    };

    return(
    <Container>
        <TabContentCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bài viết
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenPostModal(null)}
                >
                    Tạo bài viết
                </Button>
            </Box>
        </TabContentCard>
        {/* === MODAL TẠO/SỬA BÀI VIẾT === */}
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
                    <PostCreator class_id={class_id} closeModal={handleClosePostModal} />
                </ModalCard>
            </Fade>
        </Modal>
        {/* === HIỆN CÁC BÀI VIẾT TRONG LỚP === */}
        {threads && threads.length && threads.map((thread) => {
            return <PostItem key={thread.thread_id} post={thread} class_id={class_id} />
        })}
        {/* === MENU SỬA/XÓA BÀI VIẾT === */}
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
        >
            <MenuItem onClick={() => handleOpenPostModal(selectedThread)}>Sửa</MenuItem>
            <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>Xóa</MenuItem>
        </Menu> 
    </Container>
    )                
}