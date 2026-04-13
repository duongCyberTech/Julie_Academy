import React, { useState, useEffect } from 'react';
import {
  Container, Box, Tabs, Tab, Paper, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Button, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { apiClient } from '../../services/ApiClient';

// Xây dựng cây  
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

  // Logic sắp xếp số la mã
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

    // Nếu cả 2 đều chứa số La Mã, so sánh theo giá trị La Mã
    if (valA !== null && valB !== null) return valA - valB;
    
    return nameA.localeCompare(nameB, 'vi', { numeric: true });
  };
  Object.values(map).forEach(node => {
    if (node.children.length > 0) {
      node.children.sort(sortCategories);
    }
  });

  // Sắp xếp cho các chương bên ngoài
  chapters.sort(sortCategories);
  // ----------------------------------

  return chapters;
};

// 2. COMPONENT: TabPanel (Nội dung bên dưới Tab Sách)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ 
          pt: 4, 
          pb: 8, 
          backgroundColor: '#fafafa',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center' 
        }}>
          <Box sx={{ width: '100%', maxWidth: 1100, px: { xs: 2, md: 4 } }}>
            {children}
          </Box>
        </Box>
      )}
    </div>
  );
}

// 3. COMPONENT: Render Accordion (Chương) & Button (Bài học)
const TopicNode = ({ node, onStartPractice }) => {
  if (!node) return null;

  const categoryName = node.category_name;
  const hasChildren = node.children?.length > 0;

  if (hasChildren) {
    // RENDER: CHƯƠNG (Accordion)
    return (
      <Accordion
        key={node.category_id}
        sx={{
          mb: 1,
          borderRadius: '8px !important',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'grey.200',
        }}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ '&:hover': { backgroundColor: 'action.hover' }, borderRadius: '8px' }}
        >
          <FolderOpenIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {categoryName}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, backgroundColor: '#fcfcfc', borderTop: '1px solid #f0f0f0' }}>
          {node.children.map((childNode) => (
            <TopicNode
              key={childNode.category_id}
              node={childNode}
              onStartPractice={onStartPractice}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }

  // Render bài học
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        mb: 1.5,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.300',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: 'primary.main',
          cursor: 'pointer',
        },
      }}
      onClick={() => onStartPractice(node.category_id, categoryName)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '75%' }}>
        <ArticleIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {categoryName}
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="small"
        endIcon={<ChevronRightIcon />}
        sx={{ textTransform: 'none', borderRadius: 2, px: 2, boxShadow: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          onStartPractice(node.category_id, categoryName);
        }}
      >
        Luyện tập
      </Button>
    </Paper>
  );
};

// 4. Main component
export default function StudentAdaptivePage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const [books, setBooks] = useState([]); // Danh sách các Sách
  const [categoryTree, setCategoryTree] = useState([]); // Danh sách Chương của Sách đang chọn
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem('token');
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

  // Hàm lấy Chương & Bài học dựa vào plan_id của Sách
  const fetchCategoriesByPlanId = async (planId, token = localStorage.getItem('token')) => {
    try {
      setTreeLoading(true);
      const res = await apiClient.get(`/categories?plan_id=${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const flatData = res.data?.data || res.data || [];
      const treeData = buildCategoryTree(flatData);
      setCategoryTree(treeData);
    } catch (error) {
      console.error(`Lỗi khi tải dữ liệu chương cho plan_id ${planId}:`, error);
      setCategoryTree([]);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const selectedPlanId = books[newValue].plan_id;
    fetchCategoriesByPlanId(selectedPlanId);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {books.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box component="img" src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="Empty State" sx={{ width: 120, opacity: 0.3, mb: 3 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={500}>Chưa có dữ liệu sách nào được cập nhật.</Typography>
        </Box>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden', 
            border: '1px solid', 
            borderColor: 'grey.200', 
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' 
          }}
        >
          {/* Thanh ngang hiển thị các sách */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#fff' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTabs-flexContainer': { flexWrap: 'nowrap' },
                '& .MuiTab-root': { py: 2.5, px: 3, fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' }
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

          {/* Danh sách Chương & Bài học của Sách đang chọn */}
          {books.map((book, index) => (
            <TabPanel key={book.plan_id} value={tabValue} index={index}>
              {treeLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={40} thickness={4} />
                </Box>
              ) : categoryTree.length > 0 ? (
                categoryTree.map((chapterNode) => (
                  <TopicNode
                    key={chapterNode.category_id}
                    node={chapterNode}
                    onStartPractice={handleStartTopicPractice}
                  />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box component="img" src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="Empty State" sx={{ width: 120, opacity: 0.3, mb: 3 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>Chưa có chương học nào trong cuốn sách này.</Typography>
                </Box>
              )}
            </TabPanel>
          ))}
        </Paper>
      )}
    </Container>
  );
}