import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Paper, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Button, Typography
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { apiClient } from '../../services/ApiClient';

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3), 
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none', 
    borderRadius: '24px', 
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)', 
    display: 'flex', 
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: { margin: theme.spacing(1), padding: theme.spacing(2) }
  };
});

// Hàm hỗ trợ xây dựng cây danh mục
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

// Component hiển thị nội dung từng Tab 
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ 
          pt: 4, 
          pb: 8, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center' 
        }}>
          <Box sx={{ width: '100%', maxWidth: 1100 }}>
            {children}
          </Box>
        </Box>
      )}
    </div>
  );
}

// Component hiển thị từng Chương/Bài 
const TopicNode = ({ node, onStartPractice }) => {
  if (!node) return null;
  const categoryName = node.category_name;
  const hasChildren = node.children?.length > 0;

  if (hasChildren) {
    return (
      <Accordion
        key={node.category_id}
        sx={{
          mb: 1,
          borderRadius: '12px !important',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
        }}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ '&:hover': { backgroundColor: 'action.hover' }, borderRadius: '12px' }}
        >
          <FolderOpenIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{categoryName}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, backgroundColor: alpha('#000', 0.01), borderTop: '1px solid', borderColor: 'divider' }}>
          {node.children.map((childNode) => (
            <TopicNode key={childNode.category_id} node={childNode} onStartPractice={onStartPractice} />
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        p: 2, mb: 1.5, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid', borderColor: 'grey.300',
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderColor: 'primary.main', cursor: 'pointer' },
      }}
      onClick={() => onStartPractice(node.category_id)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '75%' }}>
        <ArticleIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{categoryName}</Typography>
      </Box>
      <Button
        variant="contained" color="primary" size="small" endIcon={<ChevronRightIcon />}
        sx={{ textTransform: 'none', borderRadius: 2, px: 2, boxShadow: 'none' }}
        onClick={(e) => { e.stopPropagation(); onStartPractice(node.category_id); }}
      >
        Luyện tập
      </Button>
    </Paper>
  );
};

// --- MAIN COMPONENT ---
export default function StudentAdaptivePage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [books, setBooks] = useState([]); 
  const [categoryTree, setCategoryTree] = useState([]); 
  const [initialLoading, setInitialLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem('token');
        const res = await apiClient.get('/books', { headers: { Authorization: `Bearer ${token}` } });
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
          await fetchCategoriesByPlanId(sortedBooks[0].plan_id, token);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách Sách:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const fetchCategoriesByPlanId = async (planId, token = localStorage.getItem('token')) => {
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
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    fetchCategoriesByPlanId(books[newValue].plan_id);
  };

  const handleStartTopicPractice = (categoryId) => {
    navigate(`/student/adaptive/take/${categoryId}`);
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>🎯 Luyện tập thích ứng</Typography>
      
      {books.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box component="img" src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="Empty State" sx={{ width: 120, opacity: 0.3, mb: 3 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={500}>Chưa có dữ liệu sách nào được cập nhật.</Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'transparent' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth" 
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTabs-flexContainer': { flexWrap: 'nowrap' },
                '& .MuiTab-root': { py: 2, px: 3, fontWeight: 700, fontSize: '0.95rem', textTransform: 'none' }
              }}
            >
              {books.map((book, index) => (
                <Tab
                  key={book.plan_id}
                  label={book.title || `Sách ${index + 1}`}
                  icon={<MenuBookIcon />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {books.map((book, index) => (
            <TabPanel key={book.plan_id} value={tabValue} index={index}>
              {treeLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={40} thickness={4} />
                </Box>
              ) : categoryTree.length > 0 ? (
                categoryTree.map((chapterNode) => (
                  <TopicNode key={chapterNode.category_id} node={chapterNode} onStartPractice={handleStartTopicPractice} />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box component="img" src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="Empty State" sx={{ width: 120, opacity: 0.3, mb: 3 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>Chưa có chương học nào trong sách này.</Typography>
                </Box>
              )}
            </TabPanel>
          ))}
        </Box>
      )}
    </PageWrapper>
  );
}