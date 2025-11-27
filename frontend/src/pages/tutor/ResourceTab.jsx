import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
    Box, Button, Typography, Paper, List, ListItemButton, 
    ListItemText, ListItemIcon, Divider, Breadcrumbs, Link as MuiLink,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Stack, Alert, Tooltip, IconButton
} from '@mui/material';

// Icons
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

// Services
import { getClassDetails, updateClass } from '../../services/ClassService';
import { getAllCategories, getPlansByTutor, createBookByTutor } from '../../services/CategoryService';
import { getFoldersByClass, createFolder, uploadResource } from '../../services/ResourceService';

// Component
import CreateLessonPlanDialog from '../../components/CreatePlanDialog';

// --- Helper Functions ---
const getUserId = (token) => {
    try { return jwtDecode(token).sub; } catch (e) { return null; }
};

const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <PictureAsPdfIcon color="error" fontSize="large" />;
    return <DescriptionIcon color="primary" fontSize="large" />;
};

// --- SUB-COMPONENTS ---

const SetupView = ({ onSelectExisting, onSelectCustom }) => (
    <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
        <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
            Cấu trúc tài liệu lớp học
        </Typography>
        <Typography color="text.secondary" mb={5}>
            Lớp học chưa có giáo án. Vui lòng chọn cách tổ chức tài liệu:
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
            <Grid size={{ xs: 12, md: 5 }}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)', boxShadow: 2 } 
                    }}
                    onClick={onSelectExisting}
                >
                    <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">📚 Chọn giáo án có sẵn</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sử dụng cấu trúc chương/bài chuẩn từ thư viện hoặc các giáo án cũ của bạn.
                    </Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'secondary.main', transform: 'translateY(-4px)', boxShadow: 2 } 
                    }}
                    onClick={onSelectCustom}
                >
                    <Typography variant="h6" color="secondary" gutterBottom fontWeight="bold">✍️ Tạo giáo án mới</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Thiết lập tiêu đề, môn học và tự xây dựng lộ trình riêng cho lớp này.
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    </Paper>
);

const CreateFolderDialog = ({ open, onClose, onSubmit, loading }) => {
    const [name, setName] = useState('');
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Tạo thư mục mới</DialogTitle>
            <DialogContent>
                <TextField 
                    autoFocus margin="dense" label="Tên thư mục" fullWidth variant="outlined"
                    value={name} onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={() => { onSubmit(name); setName(''); }} variant="contained" disabled={!name || loading}>
                    {loading ? 'Đang tạo...' : 'Tạo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const UploadFileDialog = ({ open, onClose, onSubmit, loading }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = () => {
        if (!file || !title) return;
        onSubmit(file, { title, description: desc });
        setFile(null); setTitle(''); setDesc('');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Tải lên tài liệu</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                        Chọn file
                        <input type="file" hidden onChange={(e) => {
                            const f = e.target.files[0];
                            setFile(f);
                            setTitle(f?.name || '');
                        }} />
                    </Button>
                    {file && <Typography variant="caption" color="primary">Đã chọn: {file.name}</Typography>}
                    
                    <TextField label="Tên hiển thị" fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField label="Mô tả (Tùy chọn)" fullWidth size="small" multiline rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!file || !title || loading}>
                    {loading ? 'Đang tải lên...' : 'Tải lên'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// --- MAIN COMPONENT ---

const ResourceTab = ({ classId, token }) => {
    const [tutorId] = useState(() => getUserId(token));
    
    // View & Data States
    const [viewMode, setViewMode] = useState('LOADING'); // LOADING | SETUP | MANAGER
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [folderTree, setFolderTree] = useState([]); 
    const [currentFolder, setCurrentFolder] = useState(null); 
    const [books, setBooks] = useState([]); 

    // UI Dialog States
    const [dialogs, setDialogs] = useState({ 
        selectBook: false, 
        createPlan: false, // Dialog tạo giáo án mới
        createFolder: false, 
        upload: false 
    });
    
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // --- INITIALIZATION ---
    const initData = useCallback(async () => {
        try {
            const cls = await getClassDetails(classId, token);
            if (cls.plan_id) {
                await loadManagerData(cls.plan_id);
                setViewMode('MANAGER');
            } else {
                const bks = await getPlansByTutor(tutorId, token);
                setBooks(bks);
                setViewMode('SETUP');
            }
        } catch (error) {
            console.error(error);
            setFeedback({ message: 'Lỗi kết nối dữ liệu', severity: 'error' });
        }
    }, [classId, tutorId, token]);

    useEffect(() => {
        if (classId && token && tutorId) initData();
    }, [initData]);

    const loadManagerData = async (planId) => {
        try {
            const catsRes = await getAllCategories({ plan_id: planId, mode: 'tree' }, token);
            setCategories(catsRes.data || []);
            const folders = await getFoldersByClass(classId, token);
            setFolderTree(folders || []);
        } catch (error) {
            console.error(error);
            setFeedback({ message: 'Không tải được dữ liệu giáo án', severity: 'error' });
        }
    };

    // --- HANDLERS: SETUP PHASE ---

    // 1. Chọn giáo án có sẵn
    const handleSelectExistingBook = async (bookId) => {
        try {
            await updateClass(classId, { plan_id: bookId }, token);
            await loadManagerData(bookId);
            setViewMode('MANAGER');
            setDialogs(prev => ({ ...prev, selectBook: false }));
        } catch (e) {
            setFeedback({ message: 'Lỗi cập nhật lớp học', severity: 'error' });
        }
    };

    // 2. Tạo giáo án mới (Custom)
    const handleCreateCustomPlan = async (planData) => {
        setActionLoading(true);
        try {
            // Bước 1: Tạo giáo án mới (Backend nhận mảng nên phải wrap [])
            const res = await createBookByTutor(tutorId, [planData], token);
            
            // Backend trả về mảng các plan đã tạo, lấy phần tử đầu tiên
            const newPlan = res[0]; 
            
            if (!newPlan || !newPlan.plan_id) {
                throw new Error("Không lấy được ID giáo án mới");
            }

            // Bước 2: Gán giáo án mới vào lớp
            await updateClass(classId, { plan_id: newPlan.plan_id }, token);

            // Bước 3: Load dữ liệu và chuyển view
            await loadManagerData(newPlan.plan_id);
            setViewMode('MANAGER');
            setDialogs(prev => ({ ...prev, createPlan: false }));
            setFeedback({ message: 'Tạo giáo án thành công!', severity: 'success' });

        } catch (e) {
            console.error(e);
            setFeedback({ message: e.message || 'Tạo giáo án thất bại', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // --- HANDLERS: MANAGER PHASE ---

    const handleRemovePlan = async () => {
        if (!window.confirm("Bạn có chắc muốn gỡ giáo án hiện tại?")) return;
        try {
            // Gửi null để gỡ plan_id (Cần backend hỗ trợ nhận null)
            await updateClass(classId, { plan_id: null }, token);
            setViewMode('SETUP');
            setCategories([]);
            setFolderTree([]);
            // Reload danh sách sách để cập nhật nếu có sách mới tạo
            const bks = await getPlansByTutor(tutorId, token);
            setBooks(bks);
        } catch (e) {
            setFeedback({ message: 'Lỗi khi gỡ giáo án', severity: 'error' });
        }
    };

    const handleCreateFolderAction = async (folderName) => {
        if (!selectedCategory) return;
        setActionLoading(true);
        try {
            await createFolder(tutorId, classId, {
                folder_name: folderName,
                parent_id: currentFolder?.folder_id || null, 
                cate_id: selectedCategory.category_id
            }, token);
            setFeedback({ message: 'Đã tạo thư mục', severity: 'success' });
            setDialogs(prev => ({ ...prev, createFolder: false }));
            const folders = await getFoldersByClass(classId, token);
            setFolderTree(folders || []);
        } catch (e) {
            setFeedback({ message: 'Lỗi tạo thư mục', severity: 'error' });
        } finally { setActionLoading(false); }
    };

    const handleUploadAction = async (file, metaData) => {
        if (!selectedCategory) return;
        setActionLoading(true);
        try {
            await uploadResource(tutorId, file, {
                ...metaData,
                cate_id: selectedCategory.category_id,
                folder: currentFolder ? [currentFolder.folder_id] : []
            }, token);
            setFeedback({ message: 'Upload thành công', severity: 'success' });
            setDialogs(prev => ({ ...prev, upload: false }));
            const folders = await getFoldersByClass(classId, token);
            setFolderTree(folders || []);
        } catch (e) {
            setFeedback({ message: 'Upload thất bại', severity: 'error' });
        } finally { setActionLoading(false); }
    };

    // Helper display logic
    const getDisplayItems = () => {
        if (!selectedCategory) return [];
        let items = [];
        if (!currentFolder) {
            items = folderTree.filter(f => f.category_id === selectedCategory.category_id && !f.parent_id);
        } else {
            const findFolder = (nodes, id) => {
                for (const node of nodes) {
                    if (node.folder_id === id) return node;
                    if (node.children) {
                        const found = findFolder(node.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };
            const activeNode = findFolder(folderTree, currentFolder.folder_id);
            if (activeNode) {
                items = [...(activeNode.children || []), ...(activeNode.resources || [])];
            }
        }
        return items;
    };
    const displayItems = getDisplayItems();

    // --- RENDER ---

    if (viewMode === 'LOADING') return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    // 1. SETUP SCREEN
    if (viewMode === 'SETUP') {
        return (
            <>
                <SetupView 
                    onSelectExisting={() => setDialogs({ ...dialogs, selectBook: true })} 
                    onSelectCustom={() => setDialogs({ ...dialogs, createPlan: true })} 
                />
                
                {/* Dialog Chọn Sách */}
                <Dialog open={dialogs.selectBook} onClose={() => setDialogs({ ...dialogs, selectBook: false })}>
                    <DialogTitle>Chọn Giáo Án Có Sẵn</DialogTitle>
                    <DialogContent dividers>
                        <List>
                            {books.length > 0 ? books.map(b => (
                                <ListItemButton key={b.plan_id} onClick={() => handleSelectExistingBook(b.plan_id)}>
                                    <ListItemText primary={b.title} secondary={`Môn: ${b.subject} - Khối ${b.grade}`} />
                                </ListItemButton>
                            )) : (
                                <Typography p={2} color="text.secondary">Bạn chưa có giáo án nào.</Typography>
                            )}
                        </List>
                    </DialogContent>
                </Dialog>

                {/* Dialog Tạo Giáo Án Mới */}
                <CreateLessonPlanDialog 
                    open={dialogs.createPlan}
                    onClose={() => setDialogs({ ...dialogs, createPlan: false })}
                    onSubmit={handleCreateCustomPlan}
                    loading={actionLoading}
                />
            </>
        );
    }

    // 2. MANAGER SCREEN
    return (
        <Box sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
            {feedback && <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>{feedback.message}</Alert>}

            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                {/* LEFT: Categories */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                    <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="background.default" display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold">Mục lục</Typography>
                        <Tooltip title="Đổi giáo án khác">
                            <IconButton size="small" onClick={handleRemovePlan}>
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <List component="nav" sx={{ overflowY: 'auto', flexGrow: 1 }}>
                        {categories.length > 0 ? categories.map((cat) => (
                            <ListItemButton 
                                key={cat.category_id}
                                selected={selectedCategory?.category_id === cat.category_id}
                                onClick={() => { setSelectedCategory(cat); setCurrentFolder(null); }}
                                sx={{ borderRadius: 1, mb: 0.5, mx: 1 }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <FolderIcon fontSize="small" color={selectedCategory?.category_id === cat.category_id ? "primary" : "action"} />
                                </ListItemIcon>
                                <ListItemText primary={cat.category_name} primaryTypographyProps={{ fontSize: '0.9rem', noWrap: true }} />
                            </ListItemButton>
                        )) : (
                            <Box p={2} textAlign="center">
                                <Typography variant="caption" color="text.secondary">Giáo án này chưa có mục lục.</Typography>
                                <Button size="small" sx={{ mt: 1 }}>+ Thêm chương</Button>
                            </Box>
                        )}
                    </List>
                </Grid>

                {/* RIGHT: Resources */}
                <Grid size={{ xs: 12, md: 9 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {selectedCategory ? (
                        <>
                            <Box p={2} borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                                <Breadcrumbs aria-label="breadcrumb">
                                    <MuiLink 
                                        component="button" variant="body1" underline="hover" color="inherit"
                                        onClick={() => setCurrentFolder(null)}
                                        sx={{ fontWeight: !currentFolder ? 'bold' : 'normal' }}
                                    >
                                        {selectedCategory.category_name}
                                    </MuiLink>
                                    {currentFolder && <Typography color="text.primary" fontWeight="bold">{currentFolder.folder_name}</Typography>}
                                </Breadcrumbs>
                                <Stack direction="row" spacing={1}>
                                    <Button startIcon={<CreateNewFolderIcon />} onClick={() => setDialogs(prev => ({ ...prev, createFolder: true }))} size="small">Thư mục</Button>
                                    <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setDialogs(prev => ({ ...prev, upload: true }))} size="small">Tải lên</Button>
                                </Stack>
                            </Box>
                            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', bgcolor: '#f9f9f9' }}>
                                {displayItems.length > 0 ? (
                                    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(110px, 1fr))" gap={2}>
                                        {displayItems.map((item, idx) => {
                                            const isFolder = !!item.folder_name;
                                            return (
                                                <Paper 
                                                    key={item.folder_id || item.did || idx} variant="outlined"
                                                    sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' } }}
                                                    onClick={() => isFolder ? setCurrentFolder(item) : window.open(item.file_path, '_blank')}
                                                >
                                                    <Box mb={1}>{isFolder ? <FolderIcon sx={{ fontSize: 40, color: '#FFC107' }} /> : getFileIcon(item.file_type)}</Box>
                                                    <Typography variant="caption" component="div" sx={{ wordBreak: 'break-word', lineHeight: 1.2 }}>{item.folder_name || item.title}</Typography>
                                                </Paper>
                                            );
                                        })}
                                    </Box>
                                ) : (
                                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="50%" color="text.secondary">
                                        <UploadFileIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                        <Typography variant="body2">Thư mục trống</Typography>
                                    </Box>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary" bgcolor="#f9f9f9">
                            <Typography>👈 Chọn một mục từ danh sách bên trái để bắt đầu</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* Popups */}
            <CreateFolderDialog 
                open={dialogs.createFolder} 
                onClose={() => setDialogs(prev => ({ ...prev, createFolder: false }))} 
                onSubmit={handleCreateFolderAction} 
                loading={actionLoading} 
            />
            <UploadFileDialog 
                open={dialogs.upload} 
                onClose={() => setDialogs(prev => ({ ...prev, upload: false }))} 
                onSubmit={handleUploadAction} 
                loading={actionLoading} 
            />
        </Box>
    );
};

export default ResourceTab;