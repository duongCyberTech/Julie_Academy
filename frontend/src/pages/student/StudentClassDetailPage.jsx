import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Modal,
  Backdrop,
  Fade,
  TextField,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import ForumIcon from '@mui/icons-material/Forum';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Import hình ảnh
import ClassBg1 from "../../assets/images/homepage1.webp";
import AvatarTutor from "../../assets/images/Avatar.jpg";

const CURRENT_USER_ID = 'u_stu_001'; 

// --- Dữ liệu mẫu  ---
const mockClassInfo = { 
  id: 'cls_001', 
  name: 'Toán 9A1 - Sách Cánh Diều', 
  tutor_name: 'ThS. Lê Thị Bảo Thu', 
  tutor_avatar: AvatarTutor, 
  thumbnail_url: ClassBg1
};

const initialMockThreads = [
    {
        id: 't_001',
        title: 'Thắc mắc về giải bài tập 3 (SGK - tr.15)',
        content: 'Em không hiểu bước 2, tại sao lại bình phương 2 vế ạ?',
        author_id: 'u_stu_002', 
        author_name: 'Nguyễn Văn A',
        author_avatar: null,
        created_at: '2025-11-05T10:30:00Z',
        reply_count: 3
    },
    {
        id: 't_002',
        title: 'Tổng hợp lý thuyết Chương 1: Căn bậc hai',
        content: 'Đây là file tổng hợp lý thuyết chương 1 nhé các em.',
        author_id: 'u_tutor_001', 
        author_name: 'ThS. Lê Thị Bảo Thu',
        author_avatar: AvatarTutor,
        created_at: '2025-11-04T08:00:00Z',
        reply_count: 5
    },
    {
        id: 't_003',
        title: 'Bài tập về nhà 05/11',
        content: 'Các em nộp bài tập về nhà tại đây nhé.',
        author_id: CURRENT_USER_ID, 
        author_name: 'Nguyễn Hàm Hoàng',
        author_avatar: null,
        created_at: '2025-11-05T19:00:00Z',
        reply_count: 0
    },
];

const mockFileSystem = {
  'root': {
    id: 'root',
    type: 'folder',
    name: 'Tài liệu Lớp học',
    children: ['f_001', 'f_002', 'r_001'] 
  },
  'f_001': { 
    id: 'f_001',
    type: 'folder', 
    name: 'Chương 1 - Căn bậc hai', 
    children: ['r_002', 'r_003'] 
  },
  'f_002': { 
    id: 'f_002',
    type: 'folder', 
    name: 'Chương 2 - Hàm số', 
    children: [] 
  },
  'r_001': { 
    id: 'r_001',
    type: 'file', 
    name: 'De-cuong-on-tap-giua-ky.pdf', 
    size: '1.2MB' 
  },
  'r_002': { 
    id: 'r_002',
    type: 'file', 
    name: 'Bai-tap-nang-cao-Can-bac-hai.docx', 
    size: '850KB' 
  },
  'r_003': { 
    id: 'r_003',
    type: 'file', 
    name: 'Ly-thuyet-Can-bac-hai.pdf', 
    size: '500KB' 
  },
};

const mockMembers = [
    { id: 'u_tutor_001', name: 'ThS. Lê Thị Bảo Thu', role: 'Gia sư', avatar: AvatarTutor, email: 'baothu.le@hcmut.edu.vn', joined_date: '01/10/2025' },
    { id: CURRENT_USER_ID, name: 'Nguyễn Hàm Hoàng (Bạn)', role: 'Học sinh', avatar: null, email: 'hoang.nguyen@hcmut.edu.vn', joined_date: '02/10/2025' },
    { id: 'u_stu_002', name: 'Nguyễn Văn A', role: 'Học sinh', avatar: null, email: 'a.nguyen@hcmut.edu.vn', joined_date: '02/10/2025' },
    { id: 'u_stu_003', name: 'Trần Thị B', role: 'Học sinh', avatar: null, email: 'b.tran@hcmut.edu.vn', joined_date: '03/10/2025' },
];

const ClassBanner = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    marginBottom: theme.spacing(3),
}));

const TabContentCard = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    height: '100%',
}));

const ModalCard = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: '600px', 
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: 24,
    padding: theme.spacing(4),
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}
// ------------------------------

// --- COMPONENT CHÍNH ---
export default function StudentClassDetailPage() {
  const [tabValue, setTabValue] = useState(0); 
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const { classId } = useParams(); 
  const navigate = useNavigate(); 

  // === STATE CHO DIỄN ĐÀN ===
  const [threads, setThreads] = useState(initialMockThreads);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); 
  const [postFormData, setPostFormData] = useState({ title: '', content: '' });
  const [anchorEl, setAnchorEl] = useState(null); 
  const [selectedThread, setSelectedThread] = useState(null); 
  
//State cho tài liệu
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folderPath, setFolderPath] = useState([mockFileSystem['root']]); 

//State cho thành viên
  const handleChangeTab = (event, newValue) => {
      setTabValue(newValue);
  };

  const handleCloseToast = (event, reason) => {
      if (reason === 'clickaway') return;
      setToast(prev => ({ ...prev, open: false }));
  };
  //Handlers cho diễn đàn
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
  
  const handleClosePostModal = () => setIsPostModalOpen(false);

  const handlePostFormChange = (event) => {
    const { name, value } = event.target;
    setPostFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePostSubmit = () => {
    if (editingPost) {
      setThreads(threads.map(t => 
        t.id === editingPost.id ? { ...t, ...postFormData } : t
      ));
      setToast({ open: true, message: 'Cập nhật bài viết thành công!', severity: 'success' });
    } else {
      const newPost = {
        id: `t_${Date.now()}`,
        ...postFormData,
        author_id: CURRENT_USER_ID,
        author_name: 'Nguyễn Hàm Hoàng (Bạn)',
        author_avatar: null,
        created_at: new Date().toISOString(),
        reply_count: 0
      };
      setThreads([newPost, ...threads]);
      setToast({ open: true, message: 'Đăng bài viết thành công!', severity: 'success' });
    }
    handleClosePostModal();
  };

  const handleOpenMenu = (event, thread) => {
    setAnchorEl(event.currentTarget);
    setSelectedThread(thread);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedThread(null);
  };

  const handleDeletePost = () => {
    if (selectedThread) {
      setThreads(threads.filter(t => t.id !== selectedThread.id));
      setToast({ open: true, message: 'Xóa bài viết thành công!', severity: 'error' });
    }
    handleCloseMenu();
  };

  const handleViewThread = (threadId) => {
    navigate(`/student/classes/${classId}/${threadId}`);
  };

//Handlers cho tài liệu
  const handleFolderClick = (folderId) => {
    const folder = mockFileSystem[folderId];
    if (folder && folder.type === 'folder') {
      setCurrentFolderId(folderId);
      setFolderPath([...folderPath, folder]);
    }
  };

  const handleBreadcrumbClick = (folderId, index) => {
    setCurrentFolderId(folderId);
    setFolderPath(folderPath.slice(0, index + 1));
  };
  
  const handleDownloadFile = (fileName) => {
       setToast({ open: true, message: `Đang tải: ${fileName}...`, severity: 'info' });
  };
  
  const currentFolder = mockFileSystem[currentFolderId];
  const currentFolderItems = currentFolder.children.map(id => mockFileSystem[id]);
  
  const motionVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
          opacity: 1,
          y: 0,
          transition: {
              delay: 0.1,
              duration: 0.5
          }
      }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      
      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <ClassBanner>
            <CardMedia
                component="img"
                height="200"
                image={mockClassInfo.thumbnail_url}
                alt={`Ảnh bìa lớp ${mockClassInfo.name}`}
            />
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {mockClassInfo.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar 
                        src={mockClassInfo.tutor_avatar} 
                        sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                        Gia sư: {mockClassInfo.tutor_name} (ID Lớp: {classId})
                    </Typography>
                </Box>
            </CardContent>
        </ClassBanner>
      </motion.div>

      <motion.div variants={motionVariants} initial="hidden" animate="visible">
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleChangeTab}>
                    <Tab label="Diễn đàn" icon={<ForumIcon />} iconPosition="start" />
                    <Tab label="Tài liệu" icon={<FolderIcon />} iconPosition="start" />
                    <Tab label={`Thành viên (${mockMembers.length})`} icon={<PeopleIcon />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* === TAB 1: DIỄN ĐÀN === */}
            <TabPanel value={tabValue} index={0}>
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
                    <List>
                        {threads.map((thread, index) => (
                            <React.Fragment key={thread.id}>
                                <ListItem
                                    button 
                                    onClick={() => handleViewThread(thread.id)}
                                    secondaryAction={
                                      <>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: { xs: 'none', sm: 'inline' } }}>
                                            {thread.reply_count} trả lời
                                        </Typography>
                                        {thread.author_id === CURRENT_USER_ID && (
                                          <IconButton edge="end" onClick={(e) => handleOpenMenu(e, thread)}>
                                              <MoreVertIcon />
                                          </IconButton>
                                        )}
                                      </>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={thread.author_avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={thread.title}
                                        secondary={`Tác giả: ${thread.author_name} - ${new Date(thread.created_at).toLocaleDateString('vi-VN')}`}
                                    />
                                </ListItem>
                                {index < threads.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                </TabContentCard>
            </TabPanel>

            {/* === TAB 2: TÀI LIỆU === */}
            <TabPanel value={tabValue} index={1}>
                <TabContentCard>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Tài liệu
                    </Typography>
                    
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                        {folderPath.map((folder, index) => (
                            <Link
                                component="button"
                                key={folder.id}
                                underline="hover"
                                color={index === folderPath.length - 1 ? "text.primary" : "inherit"}
                                onClick={() => handleBreadcrumbClick(folder.id, index)}
                                disabled={index === folderPath.length - 1}
                            >
                                {folder.name}
                            </Link>
                        ))}
                    </Breadcrumbs>
                    
                     <List>
                        {currentFolderItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <ListItem
                                    button={item.type === 'folder'} 
                                    onClick={item.type === 'folder' ? () => handleFolderClick(item.id) : null}
                                    secondaryAction={
                                        item.type === 'file' ? (
                                        <IconButton edge="end" onClick={() => handleDownloadFile(item.name)}>
                                            <DownloadIcon />
                                        </IconButton>
                                        ) : (
                                        <NavigateNextIcon />
                                        )
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: item.type === 'folder' ? 'primary.light' : 'grey.200' }}>
                                            {item.type === 'folder' 
                                                ? <FolderIcon color="primary" /> 
                                                : <ArticleIcon color="action" />
                                            }
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={item.type === 'file' ? `Kích thước: ${item.size}` : 'Thư mục'}
                                    />
                                </ListItem>
                                {index < currentFolderItems.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                        {currentFolderItems.length === 0 && (
                            <Typography color="text.secondary" sx={{ ml: 2 }}>Thư mục này trống.</Typography>
                        )}
                    </List>
                </TabContentCard>
            </TabPanel>

            {/* === TAB 3: THÀNH VIÊN === */}
            <TabPanel value={tabValue} index={2}>
                 <TabContentCard>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Thành viên
                    </Typography>
                    <List>
                        {mockMembers.map((member, index) => (
                             <React.Fragment key={member.id}>
                                {/* Đã xóa 'button' và 'onClick' để sửa lỗi */}
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={member.avatar}>
                                            {!member.avatar && <PersonIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={member.name}
                                        secondary={member.role}
                                    />
                                </ListItem>
                                {index < mockMembers.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                 </TabContentCard>
            </TabPanel>
        </Box>
      </motion.div>
      
      <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
              {toast.message}
          </Alert>
      </Snackbar>

      {/* === MODAL TẠO/SỬA BÀI VIẾT === */}
      <Modal
          open={isPostModalOpen}
          onClose={handleClosePostModal}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{ backdrop: { timeout: 500 } }}
      >
          <Fade in={isPostModalOpen}>
              <ModalCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                          {editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                      </Typography>
                      <IconButton onClick={handleClosePostModal}>
                          <CloseIcon />
                      </IconButton>
                  </Box>
                  <Box component="form" sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                          label="Tiêu đề"
                          name="title"
                          value={postFormData.title}
                          onChange={handlePostFormChange}
                          fullWidth
                      />
                      <TextField
                          label="Nội dung"
                          name="content"
                          value={postFormData.content}
                          onChange={handlePostFormChange}
                          fullWidth
                          multiline
                          rows={6}
                      />
                      <Button
                          variant="contained"
                          onClick={handlePostSubmit}
                          sx={{ alignSelf: 'flex-end' }}
                      >
                          {editingPost ? 'Lưu thay đổi' : 'Đăng bài'}
                      </Button>
                  </Box>
              </ModalCard>
          </Fade>
      </Modal>

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
  );
}