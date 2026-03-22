import { useState, useEffect, useRef, useCallback } from "react";
import { TransitionGroup } from "react-transition-group";

import {
  Typography,
  Box,
  Button,
  Container,
  Modal,
  Backdrop,
  Fade,
  CircularProgress,
  Collapse,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from "@mui/material";

// Icons
import AddIcon from '@mui/icons-material/Add';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FindReplaceRoundedIcon from '@mui/icons-material/FindReplaceRounded';

import { jwtDecode } from "jwt-decode";

import { TabContentCard, ModalCard } from "../Tab/Tab";
import { PostCreator, PostItem } from "./EditorLayout";
import * as ThreadService from "../../services/ThreadService";
import { getDaysInMonth } from "../../utils/DateTimeFormatter";

export default function ThreadForum({class_id}) {
    const [onFilter, setOnFilter] = useState(false)
    const [day, setDay] = useState(0)
    const [month, setMonth] = useState(0)
    const currentYear = (new Date()).getFullYear()
    const [year, setYear] = useState(0)

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();
    const [currentUserId, setCurrentUserId] = useState("");
    const [threads, setThreads] = useState([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

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
                const filter = {
                    page,
                    ...(day ? {day} : {}),
                    ...(month ? {month} : {}), 
                    ...(year ? {year} : {})
                }
                const data = await ThreadService.getThreadsByClass(class_id, token, filter)
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

                setLoading(false);
            } catch (error) {
                console.error("Error fetching threads:", error);
            }
        };

        fetchThreads();
    }, [page]);

    const handleClosePostModal = () => setIsPostModalOpen(false);

    const handleOpenPostModal = () => {
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

    const handleToggleFilter = async() => {
        if (onFilter) {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.uid);
            }
            setLoading(true);
            const filter = {
                page: 1
            }
            const data = await ThreadService.getThreadsByClass(class_id, token, filter)
            setThreads(data)
            setLoading(false)
        }
        setOnFilter(!onFilter)
        setDay(0)
        setMonth(0)
        setYear(0)
    }

    const handleApplyFilter = async() => {
        if (day || month || year) {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.uid);
            }
            setLoading(true);
            const filter = {
                page: 1,
                ...(day ? {day} : {}),
                ...(month ? {month} : {}), 
                ...(year ? {year} : {})
            }
            const data = await ThreadService.getThreadsByClass(class_id, token, filter)
            setThreads(data)
            setLoading(false)
        }
    }

    return(
    <Container>
        <TabContentCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bài viết
                </Typography>
                <Box sx={{display: "flex", gap: 3}}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenPostModal()}
                    >
                        Tạo bài viết
                    </Button>
                </Box>
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
        {/* === BỘ LỌC === */}
        <Box sx={{display: "flex", gap: 3, mt: 2, float: "inline-end"}}>
            {onFilter && <Box sx={{display: "flex", gap: 1}}>
                <Select
                    value={year}
                    label="Năm"
                    onChange={(e) => setYear(e.target.value)}
                    variant="outlined"
                    color="primary"
                >
                    <MenuItem value={0}>
                        <em>Chọn Năm</em>
                    </MenuItem>
                    {Array.from({ length: 30 }, (_, i) => currentYear - i).map((item) => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </Select>

                {/* SELECT THÁNG - Chỉ hiện khi đã chọn Năm */}
                {year > 0 && (
                <Select
                    value={month}
                    label="Tháng"
                    onChange={(e) => setMonth(e.target.value)}
                    variant="outlined"
                >
                    <MenuItem value={0}><em>Chọn Tháng</em></MenuItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                    ))}
                </Select>
                )}

                {/* SELECT NGÀY - Chỉ hiện khi đã chọn Tháng */}
                {month > 0 && (
                <Select
                    value={day}
                    label="Ngày"
                    onChange={(e) => setDay(e.target.value)}
                    variant="outlined"
                >
                    <MenuItem value={0}><em>Chọn Ngày</em></MenuItem>
                    {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map((d) => (
                    <MenuItem key={d} value={d}>Ngày {d}</MenuItem>
                    ))}
                </Select>
                )}
                <Button 
                    color="success" size="medium" variant="outlined"
                    startIcon={<FindReplaceRoundedIcon />}
                    onClick={() => handleApplyFilter()}
                >
                    Áp dụng
                </Button>
            </Box>}
            <Button 
                color="primary" size="medium" variant="outlined"
                onClick={() => handleToggleFilter()}
                endIcon={<TuneRoundedIcon />}
            >
                Bộ lọc 
            </Button>
        </Box>
        {/* === HIỆN CÁC BÀI VIẾT TRONG LỚP === */}
        <TransitionGroup>
        {threads && threads?.length && threads.map((thread, index) => {
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