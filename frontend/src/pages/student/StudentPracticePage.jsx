/*
 * File: frontend/src/pages/student/StudentPracticePage.jsx
 *
 * (PHIÊN BẢN SỬA LỖI ID)
 *
 * Cập nhật:
 * 1. Dùng ID mẫu ĐƠN GIẢN (ví dụ: 'cd-c1-s1')
 * để khớp 1-1 với file làm bài.
 * 2. Cập nhật mock data Sách Cánh Diều đầy đủ 10 chương
 * theo file seed bạn cung cấp.
 * 3. Đặt questionCount > 0 CHỈ cho 3 chủ đề đầu tiên
 * (cd-c1-s1, cd-c1-s2, cd-c1-s3) để khớp với file câu hỏi.
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// --- Icons ---
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ======================================================
// --- MOCK DATA (VỚI ID GỌN GÀNG & KHỚP SEED) ---
// ======================================================

const mockCategoryTree = [
  // --- 1. SÁCH CÁNH DIỀU (Dữ liệu thật từ file seed) ---
  {
    categoryId: 'sach-canh-dieu',
    categoryName: 'Sách Cánh Diều',
    children: [
      {
        categoryId: 'cd-c1',
        categoryName: 'Chương I: Phương trình và hệ phương trình bậc nhất',
        children: [
          {
            categoryId: 'cd-c1-s1', // ID ĐƠN GIẢN (Khớp file câu hỏi)
            categoryName: '§1. Phương trình quy về phương trình bậc nhất một ẩn',
            mastery: Math.random(),
            questionCount: 3, // Có câu hỏi
            children: [],
          },
          {
            categoryId: 'cd-c1-s2', // ID ĐƠN GIẢN (Khớp file câu hỏi)
            categoryName: '§2. Phương trình bậc nhất hai ẩn. Hệ hai phương trình bậc nhất hai ẩn',
            mastery: Math.random(),
            questionCount: 3, // Có câu hỏi
            children: [],
          },
          {
            categoryId: 'cd-c1-s3', // ID ĐƠN GIẢN (Khớp file câu hỏi)
            categoryName: '§3. Giải hệ hai phương trình bậc nhất hai ẩn',
            mastery: Math.random(),
            questionCount: 3, // Có câu hỏi
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c2',
        categoryName: 'Chương II: Bất đẳng thức. Bất phương trình bậc nhất một ẩn',
        children: [
          {
            categoryId: 'cd-c2-s1',
            categoryName: '§1. Bất đẳng thức',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c2-s2',
            categoryName: '§2. Bất phương trình bậc nhất một ẩn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c3',
        categoryName: 'Chương III: Căn thức',
        children: [
          {
            categoryId: 'cd-c3-s1',
            categoryName: '§1. Căn bậc hai và căn bậc ba của số thực',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c3-s2',
            categoryName: '§2. Một số phép tính về căn bậc hai của số thực',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c3-s3',
            categoryName: '§3. Căn thức bậc hai và căn thức bậc ba của biểu thức đại số',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c3-s4',
            categoryName: '§4. Một số phép biến đổi căn thức bậc hai của biểu thức đại số',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c4',
        categoryName: 'Chương IV: Hệ thức lượng trong tam giác vuông',
        children: [
          {
            categoryId: 'cd-c4-s1',
            categoryName: '§1. Tỉ số lượng giác của góc nhọn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c4-s2',
            categoryName: '§2. Một số hệ thức về cạnh và góc trong tam giác vuông',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c4-s3',
            categoryName: '§3. Ứng dụng của tỉ số lượng giác của góc nhọn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c5',
        categoryName: 'Chương V: Đường tròn',
        children: [
          {
            categoryId: 'cd-c5-s1',
            categoryName: '§1. Đường tròn. Vị trí tương đối của hai đường tròn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c5-s2',
            categoryName: '§2. Vị trí tương đối của đường thẳng và đường tròn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c5-s3',
            categoryName: '§3. Tiếp tuyến của đường tròn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c5-s4',
            categoryName: '§4. Góc ở tâm. Góc nội tiếp',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c5-s5',
            categoryName: '§5. Độ dài cung tròn, diện tích hình quạt tròn, diện tích hình vành khuyên',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c6',
        categoryName: 'Chương VI: Một số yếu tố thống kê và xác suất',
        children: [
          {
            categoryId: 'cd-c6-s1',
            categoryName: '§1. Mô tả và biểu diễn dữ liệu trên các bảng, biểu đồ',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c6-s2',
            categoryName: '§2. Tần số. Tần số tương đối',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c6-s3',
            categoryName: '§3. Tần số ghép nhóm. Tần số tương đối ghép nhóm',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c6-s4',
            categoryName: '§4. Phép thử ngẫu nhiên và không gian mẫu. Xác suất của biến cố',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c7',
        categoryName: 'Chương VII: Hàm số y = ax^2 (a != 0). Phương trình bậc hai một ẩn',
        children: [
          {
            categoryId: 'cd-c7-s1',
            categoryName: '§1. Hàm số y = ax^2 (a != 0)',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c7-s2',
            categoryName: '§2. Phương trình bậc hai một ẩn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c7-s3',
            categoryName: '§3. Định lí Viète',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c8',
        categoryName: 'Chương VIII: Đường tròn ngoại tiếp và đường tròn nội tiếp',
        children: [
          {
            categoryId: 'cd-c8-s1',
            categoryName: '§1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c8-s2',
            categoryName: '§2. Tứ giác nội tiếp đường tròn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c9',
        categoryName: 'Chương IX: Đa giác đều',
        children: [
          {
            categoryId: 'cd-c9-s1',
            categoryName: '§1. Đa giác đều. Hình đa giác đều trong thực tiễn',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c9-s2',
            categoryName: '§2. Phép quay',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
      {
        categoryId: 'cd-c10',
        categoryName: 'Chương X: Hình học trực quan',
        children: [
          {
            categoryId: 'cd-c10-s1',
            categoryName: '§1. Hình trụ',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c10-s2',
            categoryName: '§2. Hình nón',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
          {
            categoryId: 'cd-c10-s3',
            categoryName: '§3. Hình cầu',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
    ],
  },
  // --- 2. SÁCH CHÂN TRỜI SÁNG TẠO (Dữ liệu mock) ---
  {
    categoryId: 'sach-chan-troi-sang-tao',
    categoryName: 'Sách Chân trời sáng tạo',
    children: [
      {
        categoryId: 'cst-c1',
        categoryName: 'Chương 1: Căn thức',
        children: [
          {
            categoryId: 'cst-c1-s1',
            categoryName: '§1. Đại số',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
    ],
  },
  // --- 3. SÁCH KẾT NỐI TRI THỨC (Dữ liệu mock) ---
  {
    categoryId: 'sach-ket-noi-tri-thuc',
    categoryName: 'Sách Kết nối tri thức',
    children: [
      {
        categoryId: 'kntt-c1',
        categoryName: 'Chương 1: Biểu thức',
        children: [
          {
            categoryId: 'kntt-c1-s1',
            categoryName: '§1. Biểu thức đại số',
            mastery: Math.random(),
            questionCount: 0,
            children: [],
          },
        ],
      },
    ],
  },
];

// ======================================================
// --- END MOCK DATA ---
// ======================================================

/**
 * Component con (đệ quy) để render cây Sách -> Chương -> Bài
 */
const TopicNode = ({ node, onStartPractice }) => {
  const isChapter = node.children.length > 0;
  const isLesson = node.children.length === 0;

  if (isChapter) {
    // Đây là CHƯƠNG -> Render Accordion
    return (
      <Accordion
        key={node.categoryId}
        sx={{
          boxShadow: 'none',
          '&:before': { display: 'none' },
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <FolderOpenIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {node.categoryName}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, backgroundColor: 'grey.50' }}>
          {node.children.map((lessonNode) => (
            <TopicNode
              key={lessonNode.categoryId}
              node={lessonNode}
              onStartPractice={onStartPractice}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }

  // Đây là BÀI HỌC (chủ đề) -> Render Nút bấm
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1.5,
        m: 1,
        backgroundColor: 'background.paper',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: node.questionCount > 0 ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          cursor: node.questionCount > 0 ? 'pointer' : 'not-allowed',
        },
        opacity: node.questionCount === 0 ? 0.6 : 1,
      }}
      onClick={() =>
        node.questionCount > 0 &&
        onStartPractice(node.categoryId, node.categoryName)
      }
    >
      {/* Tên bài học */}
      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '50%' }}>
        <ArticleIcon
          fontSize="small"
          sx={{ mr: 1.5, color: 'primary.main' }}
        />
        <Typography variant="body2" sx={{ lineHeight: 1.4 }} noWrap>
          {node.categoryName}
        </Typography>
      </Box>

      {/* % Thành thạo và Nút Bắt đầu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`${Math.round(node.mastery * 100)}%`}
          title="Độ thành thạo"
          color={
            node.mastery > 0.8
              ? 'success'
              : node.mastery > 0.4
              ? 'warning'
              : 'error' // Đã sửa (theo yêu cầu < 40% là 'error')
          }
          size="small"
          variant="filled" // Đã sửa (theo yêu cầu < 40% là 'filled')
          sx={{ fontWeight: 500 }}
        />
        <Button
          variant="outlined"
          size="small"
          endIcon={<ChevronRightIcon />}
          onClick={(e) => {
            if (node.questionCount > 0) {
              e.stopPropagation();
              onStartPractice(node.categoryId, node.categoryName);
            }
          }}
          disabled={node.questionCount === 0}
        >
          {node.questionCount > 0 ? `Luyện tập` : 'Trống'}
        </Button>
      </Box>
    </Paper>
  );
};

/**
 * Component chính: Trang Luyện Tập
 */
export default function StudentPracticePage() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleStartTopicPractice = (lessonId, lessonName) => {
    console.log(
      `Bắt đầu buổi luyện tập (thích ứng) cho: ${lessonName} (ID: ${lessonId})`
    );
    navigate(`session/${lessonId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Thư viện Luyện tập
      </Typography>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="Chọn sách giáo khoa"
          >
            {mockCategoryTree.map((book, index) => (
              <Tab
                key={book.categoryId}
                label={book.categoryName}
                icon={<MenuBookIcon />}
                iconPosition="start"
                id={`book-tab-${index}`}
                aria-controls={`book-tabpanel-${index}`}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
            ))}
          </Tabs>
        </Box>

        {mockCategoryTree.map((book, index) => (
          <Box
            key={book.categoryId}
            role="tabpanel"
            hidden={currentTab !== index}
            id={`book-tabpanel-${index}`}
            aria-labelledby={`book-tab-${index}`}
            sx={{
              maxHeight: 'calc(100vh - 300px)', // Giới hạn chiều cao
              overflowY: 'auto',
            }}
          >
            {currentTab === index && (
              <Box>
                {book.children.map((chapterNode) => (
                  <TopicNode
                    key={chapterNode.categoryId}
                    node={chapterNode}
                    onStartPractice={handleStartTopicPractice}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Paper>
    </Container>
  );
}