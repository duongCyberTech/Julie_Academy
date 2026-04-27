import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Box, Tabs, Tab, Paper, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Button, Typography,
  Fade, Avatar, Stack
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import LocalFloristRoundedIcon from '@mui/icons-material/LocalFloristRounded';
import EmojiNatureRoundedIcon from '@mui/icons-material/EmojiNatureRounded';

// Đường dẫn ảnh
import WaterImage from '../../assets/images/water.webp'; 

import { apiClient } from '../../services/ApiClient';

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(4),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const StyledTabs = styled(Tabs)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    minHeight: 48,
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.5) : '#FFFFFF',
    borderRadius: '12px',
    padding: theme.spacing(0.5),
    boxShadow: isDark ? 'none' : `0 2px 12px ${alpha(theme.palette.primary.main, 0.04)}`,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
    '& .MuiTabs-indicator': {
      display: 'none',
    },
    '& .MuiTabs-flexContainer': {
      gap: theme.spacing(1),
    },
  };
});

const StyledTab = styled(Tab)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '0.9rem',
    minHeight: 40,
    borderRadius: '8px',
    padding: theme.spacing(1, 2.5),
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      boxShadow: isDark ? 'none' : `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&:hover:not(.Mui-selected)': {
      backgroundColor: isDark ? alpha(theme.palette.text.primary, 0.05) : alpha(theme.palette.primary.main, 0.04),
      color: theme.palette.text.primary,
    }
  };
});

const buildCategoryTree = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];
  const map = {};
  const chapters = [];

  categories.forEach((item) => {
    if (!item) return;
    map[item.category_id] = { ...item, children: [] };
  });

  categories.forEach((item) => {
    if (!item) return;
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.category_id]);
    } else {
      chapters.push(map[item.category_id]);
    }
  });

  const getRomanValue = (str) => {
    const match = str.match(/(?:Chương|Phần|Bài)\s+([IVXLCDM]+)(?:[\s:.\-]|$)/i);
    if (!match) return null;
    const roman = match[1].toUpperCase();
    const romanValues = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
      const current = romanValues[roman[i]];
      const next = romanValues[roman[i + 1]];
      if (next && current < next) total -= current;
      else total += current;
    }
    return total;
  };

  const sortCategories = (a, b) => {
    const nameA = a.category_name || '';
    const nameB = b.category_name || '';
    const valA = getRomanValue(nameA);
    const valB = getRomanValue(nameB);
    if (valA !== null && valB !== null) return valA - valB;
    return nameA.localeCompare(nameB, 'vi', { numeric: true });
  };

  Object.values(map).forEach(node => {
    if (node.children.length > 0) node.children.sort(sortCategories);
  });

  chapters.sort(sortCategories);
  return chapters;
};

const LessonNode = memo(({ node, onStartPractice, theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      onClick={() => onStartPractice(node.category_id)}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1.5,
        mb: 1.5,
        ml: { xs: 1, md: 3 },
        backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          transform: 'translateX(4px)',
          boxShadow: isDark ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` : `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
          cursor: 'pointer',
          '& .action-btn': {
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
          }
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.main,
            width: 36,
            height: 36,
            borderRadius: '8px',
          }}
        >
          <AutoStoriesOutlinedIcon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {node.category_name}
        </Typography>
      </Stack>

      <Button
        className="action-btn"
        variant="contained"
        endIcon={<PlayArrowRoundedIcon />}
        startIcon={<WaterDropRoundedIcon sx={{ color: theme.palette.info.light, width: 18 }} />}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
          px: 2,
          py: 0.5,
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: 'none',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onStartPractice(node.category_id);
        }}
      >
        Luyện tập
      </Button>
    </Paper>
  );
});

const ChapterNode = memo(({ node, onStartPractice, theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return (
    <Accordion
      defaultExpanded
      sx={{
        mb: 2,
        borderRadius: '16px !important',
        boxShadow: isDark ? 'none' : `0 2px 12px ${alpha(theme.palette.common.black, 0.02)}`,
        background: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.primary.main, 0.01),
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.1)}`,
        '&:before': { display: 'none' },
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={
          <Avatar sx={{ width: 32, height: 32, bgcolor: isDark ? alpha(theme.palette.text.primary, 0.1) : '#fff', color: theme.palette.text.secondary }}>
            <ExpandMoreIcon fontSize="small" />
          </Avatar>
        }
        sx={{
          p: { xs: 1.5, md: 2 },
          minHeight: 'auto',
          borderBottom: `1px dashed ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.15)}`,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {node.category_name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: { xs: 1.5, md: 2.5 }, pt: 2 }}>
        {node.children.map((childNode) => {
          if (childNode.children && childNode.children.length > 0) {
            return <ChapterNode key={childNode.category_id} node={childNode} onStartPractice={onStartPractice} theme={theme} />;
          }
          return <LessonNode key={childNode.category_id} node={childNode} onStartPractice={onStartPractice} theme={theme} />;
        })}
      </AccordionDetails>
    </Accordion>
  );
});

const CategoryTreeRenderer = memo(({ categoryTree, onStartPractice }) => {
  const theme = useTheme();
  
  if (!categoryTree || categoryTree.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
          <EmojiNatureRoundedIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="subtitle1" color="text.primary" fontWeight={700}>
          Mảnh đất đang chờ gieo hạt
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Nội dung cuốn sách này hiện đang được cập nhật.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 2, pb: 4, maxWidth: 1000, mx: 'auto' }}>
      {categoryTree.map((chapterNode) => (
        <ChapterNode
          key={chapterNode.category_id}
          node={chapterNode}
          onStartPractice={onStartPractice}
          theme={theme}
        />
      ))}
    </Box>
  );
});

// Bảng động viên (Refactored Layout: Text bên trái, Ảnh bên phải)
const MotivationalBanner = memo(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: '24px',
        background: isDark ? alpha(theme.palette.background.paper, 0.8) : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.15)}`,
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* TEXT TRÁI */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Góc luyện tập 
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.6, mb: 1.5, pr: { md: 4 } }}>
            Các bài học được thiết kế vừa vặn nhất với sức của bạn. Hệ thống như một người bạn thấu hiểu, sẽ tự động phân tích và đưa ra câu hỏi không quá khó để gây nản, cũng không quá dễ để gây chán.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
            <LocalFloristRoundedIcon sx={{ verticalAlign: 'middle', fontSize: '1.2rem', mr: 0.5 }} />
            Mỗi câu trả lời giúp hệ thống hiểu bạn hơn. Hãy tự tin luyện tập để thu thập "giọt nước" và tưới cho cây tri thức nhé!
          </Typography>
        </Grid>
        
        {/* ẢNH PHẢI */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={WaterImage}
            alt="Water Drop Reward"
            sx={{
              width: { xs: 100, md: 130 },
              height: 'auto',
              display: 'block',
              mx: 'auto',
              objectFit: 'contain',
              filter: isDark ? 'drop-shadow(0 0 16px rgba(255,255,255,0.1))' : 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
              transform: 'scale(1.05)', // Thu hút ánh nhìn hơn một chút
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
});

const StudentAdaptivePage = memo(() => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [books, setBooks] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!token) return;
      try {
        setInitialLoading(true);
        const res = await apiClient.get('/books', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const booksData = res.data?.data || res.data || [];
        if (booksData.length > 0) {
          const preferredOrder = [
            'Toán 9 - Cánh Diều',
            'Toán 9 - Kết Nối Tri Thức Với Cuộc Sống',
            'Toán 9 - Chân Trời Sáng Tạo',
          ];
          const sortedBooks = [...booksData].sort((a, b) => {
            const indexA = preferredOrder.indexOf(a.title || '');
            const indexB = preferredOrder.indexOf(b.title || '');
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setBooks(sortedBooks);
          await fetchCategoriesByPlanId(sortedBooks[0].plan_id);
        }
      } catch (error) {
      } finally {
        setInitialLoading(false);
      }
    };
    fetchBooks();
  }, [token]);

  const fetchCategoriesByPlanId = useCallback(async (planId) => {
    if (!token) return;
    try {
      setTreeLoading(true);
      const res = await apiClient.get(`/categories?plan_id=${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const flatData = res.data?.data || res.data || [];
      setCategoryTree(buildCategoryTree(flatData));
    } catch (error) {
      setCategoryTree([]);
    } finally {
      setTreeLoading(false);
    }
  }, [token]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    const selectedPlanId = books[newValue].plan_id;
    fetchCategoriesByPlanId(selectedPlanId);
  }, [books, fetchCategoriesByPlanId]);

  const handleStartPractice = useCallback((categoryId) => {
    navigate(`/student/adaptive/take/${categoryId}`);
  }, [navigate]);

  if (initialLoading) {
    return (
      <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={50} thickness={4} />
      </PageWrapper>
    );
  }

  if (books.length === 0) {
    return (
      <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Avatar sx={{ width: 100, height: 100, mb: 3, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
          <LocalFloristRoundedIcon sx={{ fontSize: 50 }} />
        </Avatar>
        <Typography variant="h5" fontWeight={700} gutterBottom>Sẵn sàng gieo mầm!</Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>Chưa có lộ trình học tập nào được phân bổ cho bạn.</Typography>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <MotivationalBanner theme={theme} />

      <Box sx={{ maxWidth: 1000, mx: 'auto', width: '100%' }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 3 }}
        >
          {books.map((book, index) => (
            <StyledTab
              key={book.plan_id}
              label={book.title || `Sách ${index + 1}`}
            />
          ))}
        </StyledTabs>

        <Box sx={{ minHeight: '40vh', position: 'relative' }}>
          {treeLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          ) : (
            <Fade in={!treeLoading} timeout={400}>
              <Box>
                <CategoryTreeRenderer categoryTree={categoryTree} onStartPractice={handleStartPractice} />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </PageWrapper>
  );
});

export default StudentAdaptivePage;