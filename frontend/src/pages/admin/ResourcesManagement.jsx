import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, Stack, Button, IconButton, 
  Breadcrumbs, Link as MuiLink, Tooltip, Menu, MenuItem, 
  ListItemIcon, ListItemText, Snackbar, Alert, Divider, 
  useTheme, TextField, InputAdornment, Card, CardContent, 
  CardActionArea, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import FolderIcon from "@mui/icons-material/Folder";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { 
  getAllPlans, getPlanDetail, createBook, 
  updateBook, deleteBook, getAllCategories,
  createCategory, updateCategory, deleteCategory
} from "../../services/CategoryService";

import CreateLessonPlanDialog from "../../components/CreatePlanDialog";

const NameInputDialog = ({ open, onClose, onSubmit, title, label, initialValue = "", loading }) => {
  const [name, setName] = useState("");
  useEffect(() => { if (open) setName(initialValue); }, [open, initialValue]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, backgroundImage: 'none' }}}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" label={label} fullWidth value={name} onChange={(e) => setName(e.target.value)} size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || loading} sx={{ fontWeight: 700, borderRadius: 2 }}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ResourcesManagement = ({ tutorId, token }) => {
  const theme = useTheme();
  
  const [view, setView] = useState("list"); 
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [plans, setPlans] = useState([]);
  const [planInfo, setPlanInfo] = useState(null);
  const [rawCategories, setRawCategories] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [dialogs, setDialogs] = useState({ createPlan: false, editPlan: false, createCate: false, editCate: false });
  const [menuAnchor, setMenuAnchor] = useState({ plan: null, cate: null });
  const [tempData, setTempData] = useState({ targetId: null, initialName: "" });

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const fetchAllTemplates = useCallback(async () => {
    // CHỐT CHẶN 401: Kiểm tra token trước khi gọi
    if (!token || token === "null") return;

    setLoading(true);
    try {
      const data = await getAllPlans(token, tutorId);
      // Admin chỉ quản lý các giáo án mẫu hệ thống
      setPlans(data.filter(p => p.type === 'book'));
    } catch (e) {
      if (e.response?.status === 401) showToast("Phiên làm việc hết hạn", "error");
      else showToast("Lỗi tải danh sách giáo án mẫu", "error");
    } finally { setLoading(false); }
  }, [token, tutorId]);

  useEffect(() => { if (view === "list") fetchAllTemplates(); }, [view, fetchAllTemplates]);

  const handleCreateTemplate = async (data) => {
    setActionLoading(true);
    try {
      await createBook([{ ...data, type: 'book' }], token);
      showToast("Đã tạo giáo án mẫu mới thành công");
      setDialogs(p => ({ ...p, createPlan: false }));
      fetchAllTemplates();
    } catch (e) { showToast("Lỗi khi tạo giáo án mẫu", "error"); }
    finally { setActionLoading(false); }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn giáo án mẫu này khỏi hệ thống?")) return;
    try {
      // Admin sử dụng chế độ FORCE để dọn sạch toàn bộ cấu trúc
      await deleteBook(id, "FORCE", token);
      showToast("Đã xóa vĩnh viễn giáo án mẫu");
      fetchAllTemplates();
    } catch (e) { showToast("Không thể xóa. Giáo án có thể đang được sử dụng."); }
  };

  // ----------------------------------------------------------------------------
  // LOGIC: THIẾT KẾ CẤU TRÚC (VIEW: EDITOR)
  // ----------------------------------------------------------------------------
  const loadPlanDetail = useCallback(async () => {
    // CHỐT CHẶN UNDEFINED: Ngăn gọi API khi chưa chọn plan
    if (!selectedPlanId || selectedPlanId === "undefined" || !token) return;

    setLoading(true);
    try {
      const [info, cats] = await Promise.all([
        getPlanDetail(selectedPlanId, token),
        getAllCategories({ plan_id: selectedPlanId }, token)
      ]);
      setPlanInfo(info);
      // Chuẩn hóa dữ liệu categories từ backend
      setRawCategories(Array.isArray(cats) ? cats : (cats?.data || []));
    } catch (e) { showToast("Lỗi tải cấu trúc giáo án", "error"); }
    finally { setLoading(false); }
  }, [selectedPlanId, token]);

  useEffect(() => { if (view === "editor") loadPlanDetail(); }, [view, loadPlanDetail]);

  // Xây dựng cây thư mục cho Admin thiết kế
  const treeItems = useMemo(() => {
    const build = (parentId = null) => {
      return rawCategories
        .filter(c => (c.parent_id === parentId || (!parentId && !c.parent_id)))
        .map(c => ({
          id: String(c.category_id || c.id),
          label: c.category_name,
          children: build(String(c.category_id || c.id))
        }));
    };
    return build(null);
  }, [rawCategories]);

  const handleAddCate = async (name) => {
    setActionLoading(true);
    try {
      await createCategory([{
        category_name: name,
        plan_id: selectedPlanId,
        parent_id: selectedCategoryId // Thêm vào mục đang chọn hoặc làm mục gốc
      }], token);
      showToast("Đã thêm vào cấu trúc mẫu");
      setDialogs(p => ({ ...p, createCate: false }));
      loadPlanDetail();
    } catch (e) { showToast("Lỗi cập nhật cấu trúc", "error"); }
    finally { setActionLoading(false); }
  };

  const handleUpdateCateName = async (newName) => {
    setActionLoading(true);
    try {
      await updateCategory(tempData.targetId, { category_name: newName, plan_id: selectedPlanId }, token);
      showToast("Đã đổi tên chương mẫu");
      setDialogs(p => ({ ...p, editCate: false }));
      loadPlanDetail();
    } catch (e) { showToast("Lỗi khi đổi tên", "error"); }
    finally { setActionLoading(false); }
  };

  const handleDeleteCate = async (cateId, name) => {
    if (!window.confirm(`Xóa vĩnh viễn mục "${name}" và toàn bộ bài học bên trong?`)) return;
    try {
      await deleteCategory(selectedPlanId, cateId, "FORCE", token);
      showToast("Đã xóa khỏi cấu trúc");
      setSelectedCategoryId(null);
      loadPlanDetail();
    } catch (e) { showToast("Lỗi khi xóa mục mục", "error"); }
  };

  // ----------------------------------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------------------------------
  
  // --- MÀN HÌNH DANH SÁCH (DASHBOARD) ---
  if (view === "list") return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="primary" sx={{ letterSpacing: -1 }}>Quản Lý Giáo Án Mẫu</Typography>
          <Typography color="text.secondary">Thiết kế "khung xương" chương trình chuẩn cho hệ thống</Typography>
        </Box>
        <Button 
          variant="contained" startIcon={<AddBoxIcon />} size="large" disableElevation
          onClick={() => setDialogs(p => ({ ...p, createPlan: true }))}
          sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
        >
          Tạo giáo án mẫu mới
        </Button>
      </Stack>

      <TextField 
        fullWidth placeholder="Tìm kiếm giáo án trong kho mẫu..." 
        sx={{ mb: 4, bgcolor: 'background.paper', "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="disabled" /></InputAdornment> }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {plans.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(plan => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={plan.plan_id}>
              <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', transition: '0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => { setSelectedPlanId(plan.plan_id); setView("editor"); }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, display: 'flex' }}>
                        <LibraryBooksIcon color="primary" />
                      </Box>
                      <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1 }}>{plan.title}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip label={plan.subject} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      <Chip label={`Khối ${plan.grade}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </Stack>
                  </CardContent>
                </CardActionArea>
                <Divider />
                <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center" bgcolor={alpha(theme.palette.background.default, 0.5)}>
                  <Tooltip title="Xóa vĩnh viễn khỏi kho mẫu">
                    <IconButton color="error" size="small" onClick={() => handleDeleteTemplate(plan.plan_id)}><DeleteForeverIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }} onClick={() => { setSelectedPlanId(plan.plan_id); setView("editor"); }}>
                    Thiết kế khung
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
          {plans.length === 0 && !loading && (
            <Grid item size={{ xs: 12 }}>
              <Paper sx={{ p: 5, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5), border: '2px dashed', borderColor: 'divider' }}>
                <Typography color="text.secondary">Kho mẫu đang trống. Hãy tạo giáo án mẫu đầu tiên.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <CreateLessonPlanDialog 
        open={dialogs.createPlan} 
        onClose={() => setDialogs(p => ({ ...p, createPlan: false }))} 
        onSubmit={handleCreateTemplate}
        loading={actionLoading}
      />
    </Box>
  );

  // --- MÀN HÌNH EDITOR (THIẾT KẾ KHUNG XƯƠNG) ---
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Paper square elevation={0} sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => { setView("list"); setSelectedPlanId(null); setSelectedCategoryId(null); }}><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ lineHeight: 1 }}>EDITOR GIÁO ÁN MẪU</Typography>
            <Typography variant="h6" fontWeight={700}>{planInfo?.title || "Đang tải..."}</Typography>
          </Box>
          <Chip label="Bản Gốc Hệ Thống" color="info" size="small" variant="filled" sx={{ fontWeight: 700, borderRadius: 1 }} />
        </Stack>
      </Paper>

      <Grid container sx={{ flexGrow: 1, overflow: "hidden" }}>
        {/* PANEL TRÁI: CÂY MỤC LỤC MẪU */}
        <Grid item size={{ xs: 12, md: 4, lg: 3 }} sx={{ borderRight: "1px solid", borderColor: "divider", p: 2, overflowY: "auto", bgcolor: "background.paper" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="overline" fontWeight={700} color="text.secondary">Cấu trúc Skeleton</Typography>
            <Button 
              size="small" startIcon={<AddCircleIcon />} variant="contained" disableElevation
              onClick={() => setDialogs(p => ({ ...p, createCate: true }))}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              Thêm mục
            </Button>
          </Stack>
          
          <RichTreeView 
            items={treeItems}
            onSelectedItemsChange={(e, id) => setSelectedCategoryId(id)}
            slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
            slotProps={{
              item: (ownerState) => ({
                onContextMenu: (e) => {
                  e.preventDefault();
                  setTempData({ targetId: ownerState.itemId, initialName: ownerState.label });
                  setMenuAnchor({ ...menuAnchor, cate: e.currentTarget });
                }
              })
            }}
            sx={{
              "& .MuiTreeItem-content": { borderRadius: 2, py: 0.5, "&.Mui-selected": { fontWeight: 700, color: 'primary.main' } }
            }}
          />
        </Grid>

        {/* PANEL PHẢI: CHI TIẾT & HÀNH ĐỘNG */}
        <Grid item size={{ xs: 12, md: 8, lg: 9 }} sx={{ bgcolor: alpha(theme.palette.background.default, 0.4), p: 4, overflowY: "auto" }}>
          {selectedCategoryId ? (
            <Box maxWidth="md">
              <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
                  <Box>
                    <Typography variant="overline" color="primary" fontWeight={700}>Đang chọn mục mẫu</Typography>
                    <Typography variant="h4" fontWeight={700}>{tempData.initialName || "Chi tiết mục"}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setDialogs(p => ({ ...p, editCate: true }))}>Đổi tên</Button>
                    <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => handleDeleteCate(selectedCategoryId, tempData.initialName)}>Xóa</Button>
                  </Stack>
                </Stack>
                
                <Divider sx={{ mb: 3 }} />
                
                <Alert severity="info" sx={{ borderRadius: 3, fontWeight: 500 }}>
                  Gia sư khi mượn giáo án này sẽ được cung cấp sẵn bộ khung chương trình này. Bạn có thể thêm các bài học con hoặc tải tài liệu mẫu trực tiếp vào đây.
                </Alert>
              </Paper>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" sx={{ opacity: 0.3 }}>
              <LibraryBooksIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>Chọn một chương để thiết kế nội dung mẫu</Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* --- CÁC DIALOGS VÀ MENUS --- */}
      <Menu anchorEl={menuAnchor.cate} open={Boolean(menuAnchor.cate)} onClose={() => setMenuAnchor({ ...menuAnchor, cate: null })}>
        <MenuItem onClick={() => { setMenuAnchor({ ...menuAnchor, cate: null }); setDialogs(p => ({ ...p, editCate: true })); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên mục mẫu</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor({ ...menuAnchor, cate: null }); handleDeleteCate(tempData.targetId, tempData.initialName); }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: 'error.main' }}>Xóa khỏi cấu trúc</ListItemText>
        </MenuItem>
      </Menu>

      <NameInputDialog 
        open={dialogs.createCate} onClose={() => setDialogs(p => ({ ...p, createCate: false }))}
        onSubmit={handleAddCate} title={selectedCategoryId ? "Thêm bài học mẫu" : "Thêm chương mới"} label="Tên mục lục" loading={actionLoading}
      />
      
      <NameInputDialog 
        open={dialogs.editCate} onClose={() => setDialogs(p => ({ ...p, editCate: false }))}
        onSubmit={handleUpdateCateName} title="Đổi tên mục trong khung mẫu" label="Tên mới" initialValue={tempData.initialName} loading={actionLoading}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResourcesManagement;