import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { TransitionGroup } from "react-transition-group";

import {
  Typography,
  Box,
  Button,
  Modal,
  Backdrop,
  Fade,
  Collapse,
  Select,
  MenuItem,
  Paper,
  Avatar,
  Skeleton,
  useTheme
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FindReplaceRoundedIcon from '@mui/icons-material/FindReplaceRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';

import { jwtDecode } from "jwt-decode";

import { PostCreator, PostItem } from "./EditorLayout";
import * as ThreadService from "../../services/ThreadService";
import { getDaysInMonth } from "../../utils/DateTimeFormatter";

const FeedContainer = styled(Box)(({ theme }) => ({
  maxWidth: '720px',
  margin: '0 auto',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(6),
}));

const CreatorCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(2, 2.5),
    marginBottom: theme.spacing(3),
    backgroundColor: isDark ? theme.palette.background.paper : '#fff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
    boxShadow: isDark ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.05)}` : '0 2px 12px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    userSelect: 'none', // Chống bôi đen text khi lỡ click đúp
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: isDark ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.1)}` : `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
    }
  };
});

const CreatorTrigger = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    flexGrow: 1,
    backgroundColor: isDark 
        ? alpha(theme.palette.background.default, 0.8) 
        : alpha(theme.palette.primary.main, 0.04), 
    padding: theme.spacing(1.25, 2.5),
    borderRadius: '24px',
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'all 0.2s ease', 
    border: `1px solid transparent`,
    '&:hover': {
      backgroundColor: isDark 
        ? alpha(theme.palette.background.default, 1) 
        : alpha(theme.palette.primary.main, 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.2), 
      color: theme.palette.text.primary,
    }
  };
});

const FilterCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(3),
    backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.primary.main, 0.02),
    borderRadius: '12px',
    border: `1px dashed ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.3)}`,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5)
  };
});

const StyledModalCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    outline: 'none',
    '&::-webkit-scrollbar': { width: '4px' },
    '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(theme.palette.divider, 0.3), borderRadius: '4px' }
  };
});

const placeholders = [
  "Bạn có câu hỏi bài tập nào không?",
  "Chia sẻ kinh nghiệm học tập của bạn nhé!",
  "Cùng thảo luận về bài học hôm nay nào...",
  "Bạn đang vướng mắc ở điểm nào?"
];

const ThreadForum = memo(({ class_id }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [onFilter, setOnFilter] = useState(false);
    const [day, setDay] = useState(0);
    const [month, setMonth] = useState(0);
    const currentYear = useMemo(() => (new Date()).getFullYear(), []);
    const [year, setYear] = useState(0);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();
    const [currentUser, setCurrentUser] = useState(null);
    const [threads, setThreads] = useState([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [fadeProp, setFadeProp] = useState(true);
    const [activeTab, setActiveTab] = useState('latest');

    useEffect(() => {
        const timeout = setInterval(() => {
            setFadeProp(false);
            setTimeout(() => {
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
                setFadeProp(true);
            }, 300);
        }, 4000);
        return () => clearInterval(timeout);
    }, []);

    const lastThreadElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
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
                if (token && !currentUser) {
                    const decoded = jwtDecode(token);
                    setCurrentUser(decoded);
                }
                setLoading(true);
                const filter = {
                    page,
                    ...(day ? {day} : {}),
                    ...(month ? {month} : {}), 
                    ...(year ? {year} : {})
                };
                const data = await ThreadService.getThreadsByClass(class_id, token, filter);
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
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, [page, class_id, day, month, year]);

    const handleClosePostModal = useCallback(() => setIsPostModalOpen(false), []);
    const handleOpenPostModal = useCallback(() => setIsPostModalOpen(true), []);

    const handleAddNewPost = useCallback((post) => {
        if (post) {
            setThreads(prev => {
                if (prev.some(t => t.thread_id === post.thread_id)) return prev;
                return [post, ...prev];
            });
        }
    }, []);

    const handleUpdatePost = useCallback((updatedPost) => {
        if (updatedPost) {
            setThreads(prev => prev.map(t => t.thread_id === updatedPost.thread_id ? updatedPost : t));
        }
    }, []);

    const handleDeletePost = useCallback((threadId) => {
        if (threadId) {
            setThreads(prev => prev.filter(t => t.thread_id !== threadId));
        }
    }, []);

    const handleToggleFilter = useCallback(async () => {
        if (onFilter) {
            const token = localStorage.getItem('token');
            setLoading(true);
            setPage(1);
            setHasMore(true);
            try {
                const data = await ThreadService.getThreadsByClass(class_id, token, { page: 1 });
                setThreads(data || []);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        setOnFilter(prev => !prev);
        setDay(0);
        setMonth(0);
        setYear(0);
    }, [onFilter, class_id]);

    const handleApplyFilter = useCallback(async () => {
        if (day || month || year) {
            const token = localStorage.getItem('token');
            setLoading(true);
            setPage(1);
            setHasMore(true);
            try {
                const filter = {
                    page: 1,
                    ...(day ? {day} : {}),
                    ...(month ? {month} : {}), 
                    ...(year ? {year} : {})
                };
                const data = await ThreadService.getThreadsByClass(class_id, token, filter);
                setThreads(data || []);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    }, [day, month, year, class_id]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const filterSelectProps = useMemo(() => ({
        variant: "outlined",
        size: "small",
        displayEmpty: true,
        sx: { 
            minWidth: 110, 
            borderRadius: '8px', 
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#fff',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            boxShadow: isDark ? 'none' : `0 2px 8px ${alpha('#000', 0.05)}`,
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'text.primary'
        }
    }), [isDark, theme]);

    const displayedThreads = useMemo(() => {
        if (!threads) return [];
        let sorted = [...threads];
        if (activeTab === 'popular') {
            sorted.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
        } else if (activeTab === 'mine' && currentUser) {
            sorted = sorted.filter(t => t.sender?.uid === currentUser.sub);
        }
        return sorted;
    }, [threads, activeTab, currentUser]);

    return(
        <FeedContainer>
            <CreatorCard elevation={0} onClick={handleOpenPostModal}>
                <Avatar 
                    src={currentUser?.avatar_url} 
                    sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}
                >
                    {currentUser?.fname ? currentUser.fname[0].toUpperCase() : <PersonRoundedIcon />}
                </Avatar>
                
                <CreatorTrigger>
                    <Fade in={fadeProp} timeout={300}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                            {placeholders[placeholderIndex]}
                        </Typography>
                    </Fade>
                </CreatorTrigger>
                
                <Button 
                    variant="contained" 
                    disableElevation
                    sx={{ borderRadius: '8px', fontWeight: 700, px: 2.5, py: 1, textTransform: 'none', display: { xs: 'none', sm: 'flex' } }}
                >
                    Đăng bài
                </Button>
            </CreatorCard>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, px: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Thảo luận chung
                    </Typography>
                    <Button 
                        color={onFilter ? "primary" : "inherit"} 
                        size="small" 
                        variant={onFilter ? "contained" : "text"}
                        disableElevation
                        onClick={handleToggleFilter}
                        startIcon={<TuneRoundedIcon />}
                        sx={{ fontWeight: 600, borderRadius: '8px', color: onFilter ? '#fff' : 'text.secondary', bgcolor: onFilter ? 'primary.main' : 'transparent', px: 1.5 }}
                    >
                        {onFilter ? "Đóng bộ lọc" : "Lọc thời gian"}
                    </Button>
                </Box>

                {/* KHU VỰC TABS PHÂN LOẠI ĐÃ ĐƯỢC FIX LỖI "BÔI ĐEN" VÀ HIỂN THỊ ACTIVE RÕ RÀNG */}
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    <Button
                        size="small"
                        disableElevation
                        variant={activeTab === 'latest' ? "contained" : "outlined"}
                        startIcon={<AccessTimeRoundedIcon fontSize="small" />}
                        onClick={() => handleTabChange('latest')}
                        sx={{ 
                            borderRadius: '20px', 
                            fontWeight: 700, 
                            px: 2, py: 0.5, 
                            textTransform: 'none',
                            userSelect: 'none', // Triệt tiêu việc lỡ click đúp làm bôi đen text
                            WebkitTapHighlightColor: 'transparent',
                            borderColor: activeTab === 'latest' ? 'transparent' : alpha(theme.palette.divider, 0.4),
                            color: activeTab === 'latest' ? '#fff' : 'text.secondary',
                        }}
                    >
                        Mới nhất
                    </Button>
                    <Button
                        size="small"
                        disableElevation
                        variant={activeTab === 'popular' ? "contained" : "outlined"}
                        startIcon={<WhatshotRoundedIcon fontSize="small" />}
                        onClick={() => handleTabChange('popular')}
                        sx={{ 
                            borderRadius: '20px', 
                            fontWeight: 700, 
                            px: 2, py: 0.5, 
                            textTransform: 'none',
                            userSelect: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            borderColor: activeTab === 'popular' ? 'transparent' : alpha(theme.palette.divider, 0.4),
                            color: activeTab === 'popular' ? '#fff' : 'text.secondary',
                        }}
                    >
                        Phổ biến
                    </Button>
                    <Button
                        size="small"
                        disableElevation
                        variant={activeTab === 'mine' ? "contained" : "outlined"}
                        startIcon={<PersonOutlineRoundedIcon fontSize="small" />}
                        onClick={() => handleTabChange('mine')}
                        sx={{ 
                            borderRadius: '20px', 
                            fontWeight: 700, 
                            px: 2, py: 0.5, 
                            textTransform: 'none',
                            userSelect: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            borderColor: activeTab === 'mine' ? 'transparent' : alpha(theme.palette.divider, 0.4),
                            color: activeTab === 'mine' ? '#fff' : 'text.secondary',
                        }}
                    >
                        Của tôi
                    </Button>
                </Box>
            </Box>

            <Collapse in={onFilter} timeout="auto" unmountOnExit>
                <FilterCard elevation={0}>
                    <Select value={year} onChange={(e) => setYear(e.target.value)} {...filterSelectProps}>
                        <MenuItem value={0} sx={{ fontWeight: 500 }}><em>Năm</em></MenuItem>
                        {Array.from({ length: 30 }, (_, i) => currentYear - i).map((item) => (
                            <MenuItem key={item} value={item} sx={{ fontWeight: 500 }}>{item}</MenuItem>
                        ))}
                    </Select>

                    {year > 0 && (
                        <Select value={month} onChange={(e) => setMonth(e.target.value)} {...filterSelectProps}>
                            <MenuItem value={0} sx={{ fontWeight: 500 }}><em>Tháng</em></MenuItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <MenuItem key={m} value={m} sx={{ fontWeight: 500 }}>Tháng {m}</MenuItem>
                            ))}
                        </Select>
                    )}

                    {month > 0 && (
                        <Select value={day} onChange={(e) => setDay(e.target.value)} {...filterSelectProps}>
                            <MenuItem value={0} sx={{ fontWeight: 500 }}><em>Ngày</em></MenuItem>
                            {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map((d) => (
                                <MenuItem key={d} value={d} sx={{ fontWeight: 500 }}>Ngày {d}</MenuItem>
                            ))}
                        </Select>
                    )}

                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Button 
                        color="primary" 
                        size="small" 
                        variant="contained"
                        disableElevation
                        startIcon={<FindReplaceRoundedIcon />}
                        onClick={handleApplyFilter}
                        disabled={!year && !month && !day}
                        sx={{ fontWeight: 600, borderRadius: '8px', px: 2 }}
                    >
                        Áp dụng
                    </Button>
                </FilterCard>
            </Collapse>

            <TransitionGroup>
                {displayedThreads && displayedThreads.length > 0 && displayedThreads.map((thread, index) => {
                    const isLast = displayedThreads.length === index + 1;
                    return (
                        <Collapse key={thread.thread_id}>
                            <Fade in={true} timeout={400}>
                                <Box ref={isLast ? lastThreadElementRef : null} sx={{ mb: 2.5 }}>
                                    <PostItem 
                                        post={thread} 
                                        class_id={class_id} 
                                        handleDelete={handleDeletePost} 
                                        handleUpdate={handleUpdatePost} 
                                    />
                                </Box>
                            </Fade>
                        </Collapse>
                    );
                })}
            </TransitionGroup>

            {loading && (
                <Box sx={{ width: '100%', mb: 3 }}>
                    {[...Array(2)].map((_, i) => (
                        <Paper 
                            key={`skeleton-${i}`} 
                            elevation={0} 
                            sx={{ 
                                p: { xs: 2, md: 3 }, mb: 2.5, borderRadius: '16px', 
                                border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
                                bgcolor: isDark ? theme.palette.background.paper : '#fff'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Skeleton variant="circular" width={44} height={44} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Skeleton variant="text" width="30%" height={24} />
                                    <Skeleton variant="text" width="15%" height={20} />
                                </Box>
                            </Box>
                            <Skeleton variant="rounded" width="100%" height={80} sx={{ borderRadius: '8px' }} />
                        </Paper>
                    ))}
                </Box>
            )}

            {!loading && displayedThreads.length === 0 && (
                <Box sx={{ 
                    textAlign: 'center', p: 6, mt: 2,
                    bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : '#fff', 
                    borderRadius: '24px', 
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}` 
                }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ p: 2.5, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <ForumRoundedIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        </Box>
                    </Box>
                    <Typography variant="h6" color="text.primary" fontWeight={700} mb={1}>
                        Chưa có bài viết nào
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500} mb={4}>
                        Cộng đồng đang chờ những chia sẻ thú vị từ bạn!
                    </Typography>
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<PostAddRoundedIcon />}
                        onClick={handleOpenPostModal}
                        sx={{ borderRadius: '12px', fontWeight: 700, px: 4, py: 1.5, textTransform: 'none' }}
                    >
                        Tạo bài viết đầu tiên
                    </Button>
                </Box>
            )}

            <Modal
                open={isPostModalOpen}
                onClose={handleClosePostModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 400, sx: { backgroundColor: alpha('#000', 0.6), backdropFilter: 'blur(4px)' } } }}
            >
                <Fade in={isPostModalOpen}>
                    <StyledModalCard>
                        <PostCreator 
                            class_id={class_id} 
                            closeModal={handleClosePostModal} 
                            action="create" 
                            handleAdd={handleAddNewPost} 
                        />
                    </StyledModalCard>
                </Fade>
            </Modal>
        </FeedContainer>
    );
});

export default ThreadForum;