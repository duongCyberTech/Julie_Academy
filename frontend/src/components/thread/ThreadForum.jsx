import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Container,
  Modal,
  Backdrop,
  Fade,
  TextField,
  Menu,
  MenuItem,
  CircularProgress
} from "@mui/material";

// Icons
import AddIcon from '@mui/icons-material/Add';

import { jwtDecode } from "jwt-decode";

import { TabContentCard, ModalCard } from "../Tab/Tab";
import { PostCreator, PostItem } from "./EditorLayout";
import * as ThreadService from "../../services/ThreadService";

export default function ThreadForum({class_id}) {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const [currentUserId, setCurrentUserId] = useState("");
    const [threads, setThreads] = useState([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null); 
    const [postFormData, setPostFormData] = useState({ title: '', content: '' });
    const [anchorEl, setAnchorEl] = useState(null); 
    const [selectedThread, setSelectedThread] = useState(null); 
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const lastThreadElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            setPage(prevPage => prevPage + 1);
        }
        });

        if (node) observer.current.observe(node);
    }, [loading]);

    useEffect(() => {
        const fetchThreads = async () => {
            if (!hasMore) return;
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode(token);
                    setCurrentUserId(decoded.uid);
                }
                setLoading(true);
                const data = await ThreadService.getThreadsByClass(class_id, token, page)
                if (!data || data.length === 0) {
                    setHasMore(false); 
                } else {
                    setThreads(prev => [...prev, ...data]);
                    if (data.length < 10) setHasMore(false);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching threads:", error);
            }
        };

        fetchThreads();
    }, [page]);

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
                    <PostCreator class_id={class_id} closeModal={handleClosePostModal} action="create" />
                </ModalCard>
            </Fade>
        </Modal>
        {/* === HIỆN CÁC BÀI VIẾT TRONG LỚP === */}
        {threads && threads.length && threads.map((thread, index) => {
            if (threads.length === index + 1) {
                return (
                        <div ref={lastThreadElementRef} key={thread.thread_id}>
                            <PostItem post={thread} class_id={class_id} uid={currentUserId} />
                        </div>
                    );
            } else {
                return <PostItem key={thread.thread_id} post={thread} class_id={class_id} />;
            }
        })}
        {loading && <CircularProgress />}
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