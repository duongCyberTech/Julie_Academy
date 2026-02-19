import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TransitionGroup } from "react-transition-group";

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
  CircularProgress,
  Collapse
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

    const lastThreadElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            setPage(prevPage => prevPage + 1);
        }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

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
                    setThreads(prev => {
                        const newThreads = data.filter(
                            incoming => !prev.some(existing => existing.thread_id === incoming.thread_id)
                        );
                        
                        return [...prev, ...newThreads];
                    });
                    if (data.length < 10) setHasMore(false);
                }
                console.log("Current threads list: ", [...threads, ...data])
                setLoading(false);
            } catch (error) {
                console.error("Error fetching threads:", error);
            }
        };

        fetchThreads();
    }, [page]);

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
    };

    const handleAddNewPost = (post) => {
        if (post) {
            setThreads(prev => {
                if (prev.some(t => t.thread_id === post.thread_id)) return prev;
                return [post, ...prev];
            });
        }
    }

    const handleUpdatePost = (updatedPost) => {
        if (updatedPost) {
            setThreads(prev => 
                prev.map(t => t.thread_id === updatedPost.thread_id ? updatedPost : t)
            );
        }
    };

    const handleDeletePost = (threadId) => {
        if (threadId) {
            setThreads(threads.filter(t => t.thread_id !== threadId));
        }
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
                    <PostCreator class_id={class_id} closeModal={handleClosePostModal} action="create" handleAdd={handleAddNewPost} />
                </ModalCard>
            </Fade>
        </Modal>
        {/* === HIỆN CÁC BÀI VIẾT TRONG LỚP === */}
        <TransitionGroup>
        {threads && threads.map((thread, index) => {
            const isLast = threads.length === index + 1;
            return (
            <Collapse key={thread.thread_id}> {/* Key phải nằm ở đây */}
                <Fade in={true} timeout={500}>
                <Box 
                    ref={isLast ? lastThreadElementRef : null} 
                    sx={{ mb: 2 }}
                >
                    <PostItem 
                    post={thread} 
                    class_id={class_id} 
                    uid={currentUserId} 
                    handleDelete={handleDeletePost} 
                    handleUpdate={handleUpdatePost} 
                    />
                </Box>
                </Fade>
            </Collapse>
            );
        })}
        </TransitionGroup>
        {loading && <CircularProgress />}
    </Container>
    )                
}