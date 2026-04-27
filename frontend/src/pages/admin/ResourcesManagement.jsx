import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Box, Typography, Paper, Grid, Stack, Button, IconButton, 
  Breadcrumbs, Link as MuiLink, Tooltip, Snackbar, Alert, Divider, 
  useTheme, TextField, InputAdornment, Card, CardContent, 
  CardActionArea, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, Menu, MenuItem, 
  ListItemIcon, ListItemText, Skeleton
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

// Icons
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TopicIcon from "@mui/icons-material/Topic";

// Services (Chỉ giữ lại các API quản lý Khung giáo án)
import { 
  getAllPlans, getPlanDetail, createBook, 
  deleteBook, getAllCategories,
  createCategory, updateCategory, deleteCategory
} from "../../services/CategoryService";

import CreateLessonPlanDialog from "../../components/CreatePlanDialog";

// ==============================================================================
// STYLED COMPONENTS & HELPERS
// ==============================================================================

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
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const NameInputDialog = memo(({ open, onClose, onSubmit, title, label, initialValue = "", loading }) => {
  const [name, setName] = useState(initialValue);
  useEffect(() => { if (open) setName(initialValue); }, [open, initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "16px", backgroundImage: 'none' }}}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" label={label} fullWidth value={name} onChange={(e) => setName(e.target.value)} size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
          <Button type="submit" variant="contained" disableElevation disabled={!name.trim() || loading} sx={{ fontWeight: 700, borderRadius: "8px" }}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

const ResourcesManagement = memo(({ tutorId, token }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const authToken = token || localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const authTutorId = tutorId || storedUser?.userId || storedUser?.uid || storedUser?.id;

  // States: View & Layout
  const [view, setView] = useState("list"); 
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  // States: Data
  const [plans, setPlans] = useState([]);
  const [planInfo, setPlanInfo] = useState(null);
  const [rawCategories, setRawCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // States: UI & Loaders
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // States: Dialogs & Menus
  const [dialogs, setDialogs] = useState({ createPlan: false, createCate: false, editCate: false, editPlanName: false });
  const [tempData, setTempData] = useState({ targetId: null, initialName: "", parentId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, type: null });
  const [contextMenu, setContextMenu] = useState(null);
  const [contextTargetId, setContextTargetId] = useState(null);
  const [planMenuAnchor, setPlanMenuAnchor] = useState(null);

  const showToast = useCallback((message, severity = "success") => setToast({ open: true, message, severity }), []);
  const closeToast = useCallback(() => setToast((prev) => ({ ...prev, open: false })), []);

  // --- API: Load Danh sách Sách ---
  const fetchAllTemplates = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getAllPlans(authToken, authTutorId);
      setPlans(data.filter(p => p.type === 'book'));
    } catch (e) { showToast("Lỗi tải danh sách giáo án", "error"); } 
    finally { setLoading(false); }
  }, [authToken, authTutorId, showToast]);

  useEffect(() => { if (view === "list") fetchAllTemplates(); }, [view, fetchAllTemplates]);

  const handleCreateTemplate = useCallback(async (data) => {
    setActionLoading(true);
    try {
      await createBook([{ ...data, type: 'book' }], authToken);
      showToast("Đã tạo giáo án mẫu mới");
      setDialogs(p => ({ ...p, createPlan: false }));
      fetchAllTemplates();
    } catch (e) { showToast("Lỗi tạo giáo án", "error"); }
    finally { setActionLoading(false); }
  }, [authToken, fetchAllTemplates, showToast]);

  // --- API: Load Chi tiết Cấu trúc ---
  const loadPlanDetail = useCallback(async () => {
    if (!selectedPlanId || !authToken) return;
    setIsInitialLoading(true);
    try {
      const [info, cats] = await Promise.all([
        getPlanDetail(selectedPlanId, authToken),
        getAllCategories({ plan_id: selectedPlanId }, authToken)
      ]);
      setPlanInfo(info);
      let nodes = [];
      if (Array.isArray(cats)) {
        if (cats.length === 2 && Array.isArray(cats[0])) nodes = cats[0];
        else nodes = cats.flat();
      } else if (cats?.data && Array.isArray(cats.data)) { nodes = cats.data; }
      setRawCategories(nodes);
    } catch (e) { showToast("Lỗi tải chi tiết cấu trúc", "error"); }
    finally { setIsInitialLoading(false); }
  }, [selectedPlanId, authToken, showToast]);

  useEffect(() => { if (view === "editor") loadPlanDetail(); }, [view, loadPlanDetail]);

  // --- Logic Cây mục lục ---
  const categoryTreeData = useMemo(() => {
    if (!rawCategories || rawCategories.length === 0) return [];
    const getItemId = (itm) => String(itm.id ?? itm.category_id ?? itm._id ?? "");
    const getParentId = (itm) => {
      const pid = itm.parent_id ?? itm.parentId ?? itm.parent_category_id;
      if (!pid || pid === 0 || String(pid) === "0" || String(pid) === "null") return null;
      return String(pid);
    };

    const parentMap = new Map();
    const allItemIds = new Set(rawCategories.map(getItemId));
    
    // Tạo node ảo cho các parent bị thiếu (đảm bảo cây không bị gãy)
    rawCategories.forEach(item => {
      const pid = getParentId(item);
      if (pid && !allItemIds.has(pid)) {
        if (!parentMap.has(pid)) {
          parentMap.set(pid, { id: pid, category_id: pid, category_name: item.description || "Danh mục gốc", parent_id: null, isFake: true });
        }
      }
    });

    const allNodes = [...Array.from(parentMap.values()), ...rawCategories];
    const buildTree = (items, targetParentId = null) => {
      return items.filter(item => getParentId(item) === targetParentId)
        .map(item => ({ id: getItemId(item), label: String(item.name ?? item.category_name ?? "No Name"), children: buildTree(items, getItemId(item)) }));
    };
    return buildTree(allNodes, null);
  }, [rawCategories]);

  const breadcrumbs = useMemo(() => {
    if (!selectedCategoryId) return [];
    const path = [];
    let currentId = selectedCategoryId;
    while (currentId) {
      const node = rawCategories.find(c => String(c.category_id || c.id) === String(currentId));
      if (node) { path.unshift(node); currentId = node.parent_id ?? node.parentId ?? null; } else break;
    }
    return path;
  }, [selectedCategoryId, rawCategories]);

  const subCategories = useMemo(() => {
    return rawCategories.filter(c => String(c.parent_id ?? c.parentId ?? null) === String(selectedCategoryId));
  }, [rawCategories, selectedCategoryId]);

  const currentCategoryName = useMemo(() => {
    if (!selectedCategoryId) return "Toàn bộ Giáo án";
    const target = rawCategories.find(c => String(c.category_id || c.id) === String(selectedCategoryId));
    return target?.category_name || target?.name || "Danh mục";
  }, [selectedCategoryId, rawCategories]);

  // --- Handlers ---
  const handleTreeSelection = useCallback((event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;
    setSelectedCategoryId(selectedId || null);
  }, []);

  const handleAddCate = useCallback(async (name) => {
    setActionLoading(true);
    try {
      await createCategory([{ category_name: name, description: "System Template", plan_id: selectedPlanId, ...(tempData.parentId ? { parent_id: tempData.parentId } : {}) }], authToken);
      showToast(tempData.parentId ? "Đã thêm bài học" : "Đã thêm chương"); setDialogs(p => ({ ...p, createCate: false })); loadPlanDetail();
    } catch (e) { showToast("Lỗi cập nhật cấu trúc", "error"); } finally { setActionLoading(false); }
  }, [selectedPlanId, tempData.parentId, authToken, loadPlanDetail, showToast]);

  const handleConfirmDelete = useCallback(async () => {
    const { item, type } = deleteConfirm;
    if (!item) return;
    setActionLoading(true);
    try {
      if (type === "plan") { 
        await deleteBook(item.plan_id || item.id, "FORCE", authToken); 
        setView("list"); fetchAllTemplates(); 
      }
      else if (type === "category") { 
        await deleteCategory(selectedPlanId, item.id, "FORCE", authToken); 
        setSelectedCategoryId(null); loadPlanDetail(); 
      }
      showToast("Đã xóa thành công"); setDeleteConfirm({ open: false, item: null, type: null });
    } catch (e) { showToast("Lỗi thao tác xóa", "error"); } finally { setActionLoading(false); }
  }, [deleteConfirm, authToken, selectedPlanId, fetchAllTemplates, loadPlanDetail, showToast]);


  // ======================================================================================
  // RENDER: VIEW DANH SÁCH GIÁO ÁN
  // ======================================================================================
  if (view === "list") return (
    <PageWrapper elevation={0}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', sm: 'center' }} mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" sx={{ letterSpacing: -1 }}>Quản Lý Giáo Án</Typography>
          <Typography color="text.secondary">Thiết kế và xây dựng Khung Chương/Bài học chuẩn cho hệ thống</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddBoxIcon />} size="large" disableElevation onClick={() => setDialogs(p => ({ ...p, createPlan: true }))} sx={{ borderRadius: "12px", fontWeight: 700, px: 3 }}>
          Tạo giáo án mới
        </Button>
      </Stack>

      <TextField 
        fullWidth placeholder="Tìm kiếm giáo án..." 
        sx={{ mb: 4, bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="disabled" /></InputAdornment> } }}
      />

      {loading ? ( <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box> ) : (
        <Grid container spacing={3}>
          {plans.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(plan => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={plan.plan_id}>
              <Card sx={{ borderRadius: "16px", border: '1px solid', borderColor: isDark ? theme.palette.midnight?.border : 'divider', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', borderColor: 'primary.main', boxShadow: 4 } }}>
                <CardActionArea onClick={() => { setSelectedPlanId(plan.plan_id); setView("editor"); }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: "12px" }}><MenuBookIcon color="primary" /></Box>
                      <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1 }}>{plan.title}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip label={plan.subject} size="small" sx={{ fontWeight: 600, borderRadius: "8px", bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }} />
                      <Chip label={`Khối ${plan.grade}`} size="small" sx={{ fontWeight: 600, borderRadius: "8px" }} />
                    </Stack>
                  </CardContent>
                </CardActionArea>
                <Divider />
                <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center">
                  <Tooltip title="Xóa vĩnh viễn"><IconButton color="error" size="small" onClick={() => setDeleteConfirm({ open: true, item: plan, type: "plan" })}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                  <Button size="small" variant="contained" disableElevation sx={{ borderRadius: "8px", fontWeight: 700 }} onClick={() => { setSelectedPlanId(plan.plan_id); setView("editor"); }}>Sửa khung</Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <CreateLessonPlanDialog open={dialogs.createPlan} onClose={() => setDialogs(p => ({ ...p, createPlan: false }))} onSubmit={handleCreateTemplate} loading={actionLoading} />
    </PageWrapper>
  );

  // ======================================================================================
  // RENDER: VIEW EDITOR (QUẢN LÝ CẤU TRÚC CHƯƠNG BÀI)
  // ======================================================================================
  return (
    <PageWrapper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3} sx={{ flexGrow: 1, height: "100%", m: 0, width: "100%" }}>
        
        {/* PANEL TRÁI: CÂY MỤC LỤC */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", px: 0 }}>
          <Box 
            sx={{ 
              display: "flex", flexDirection: "column", height: "100%", 
              bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : "#FFFFFF", 
              borderRadius: "16px", border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}` 
            }}
          >
            <Box p={2} borderBottom="1px solid" borderColor={isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)} sx={{ flexShrink: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box sx={{ overflow: "hidden", mr: 1, display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" onClick={() => { setView("list"); setSelectedPlanId(null); setSelectedCategoryId(null); }} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha(theme.palette.primary.main, 0.05), borderRadius: "8px", mr: 1 }}><ArrowBackIcon fontSize="small" /></IconButton>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontSize="0.7rem" fontWeight={700}>KHUNG GIÁO ÁN</Typography>
                    {isInitialLoading ? <Skeleton variant="text" width={100} /> : <Typography variant="body2" fontWeight={700} noWrap color="text.primary">{planInfo?.title || "..."}</Typography>}
                  </Box>
                </Box>
                <IconButton size="small" onClick={(e) => setPlanMenuAnchor(e.currentTarget)} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha(theme.palette.primary.main, 0.05), borderRadius: "8px" }}><SettingsIcon fontSize="small" /></IconButton>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant={isDark && !selectedCategoryId ? "outlined" : "contained"} size="small"
                  startIcon={selectedCategoryId ? <AddCircleIcon fontSize="small" /> : <AddBoxIcon fontSize="small" />} color={selectedCategoryId ? "secondary" : "primary"}
                  onClick={() => { setTempData({ parentId: selectedCategoryId || null }); setDialogs(p => ({ ...p, createCate: true })); }} 
                  disableElevation 
                  sx={{ flexGrow: 1, textTransform: "none", fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px", whiteSpace: "nowrap", minWidth: 0, px: 1 }}
                >
                  {selectedCategoryId ? "Thêm bài học con" : "Chương mới"}
                </Button>
                {selectedCategoryId && (
                  <Button variant="outlined" color="error" size="small" onClick={() => setDeleteConfirm({ open: true, item: { id: selectedCategoryId, name: currentCategoryName }, type: "category" })} sx={{ minWidth: "36px", p: 0, borderRadius: "8px" }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </Button>
                )}
              </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1, minHeight: 0 }}>
              {isInitialLoading ? (
                 <Stack spacing={1} p={1}>
                    <Skeleton variant="rounded" height={32} sx={{ borderRadius: "8px" }} />
                    <Skeleton variant="rounded" height={32} width="80%" sx={{ ml: 2, borderRadius: "8px" }} />
                 </Stack>
              ) : categoryTreeData.length > 0 ? (
                <RichTreeView
                  items={categoryTreeData} slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                  onSelectedItemsChange={handleTreeSelection} selectedItems={selectedCategoryId ? [selectedCategoryId] : []}
                  slotProps={{ item: (ownerState) => ({ onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); setContextTargetId(ownerState.itemId); setContextMenu(e.currentTarget); } }) }}
                  sx={{ "& .MuiTreeItem-content": { py: 0.5, borderRadius: "8px", "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main", fontWeight: 700 }, "&.Mui-selected:hover": { bgcolor: alpha(theme.palette.primary.main, 0.25) } } }}
                />
              ) : <Box p={2} textAlign="center"><Typography variant="caption" fontWeight={600} color="text.secondary">Chưa có mục lục.</Typography></Box>}
            </Box>
          </Box>
        </Grid>

        {/* PANEL PHẢI: QUẢN LÝ MỤC CON */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", pr: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : "#FFFFFF", borderRadius: "16px", border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}` }}>
            
            {/* Header Phải */}
            <Paper square elevation={0} sx={{ p: 1.5, px: 2, borderBottom: "1px solid", borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3), display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between", alignItems: "center", flexShrink: 0, bgcolor: "transparent", borderRadius: "16px 16px 0 0" }}>
              <Breadcrumbs separator={<ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />}>
                <MuiLink component="button" underline="hover" color="inherit" onClick={() => setSelectedCategoryId(null)} sx={{ display: "flex", alignItems: "center", fontWeight: !selectedCategoryId ? 700 : 500, color: !selectedCategoryId ? 'primary.main' : 'text.secondary' }}>
                  <MenuBookIcon sx={{ mr: 0.5 }} fontSize="small" /> Giáo án gốc
                </MuiLink>
                {breadcrumbs.map((crumb, index) => (
                  index === breadcrumbs.length - 1 
                    ? <Typography key={crumb.category_id} color="text.primary" fontWeight={700} fontSize="0.85rem">{crumb.category_name}</Typography>
                    : <MuiLink key={crumb.category_id} component="button" underline="hover" color="inherit" onClick={() => setSelectedCategoryId(crumb.category_id || crumb.id)} sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.85rem' }}>{crumb.category_name}</MuiLink>
                ))}
              </Breadcrumbs>
              
              <Button variant="outlined" onClick={() => { setTempData({ parentId: selectedCategoryId || null }); setDialogs(p => ({ ...p, createCate: true })); }} size="small" sx={{ borderRadius: "8px", fontWeight: 700, height: '36px' }}>
                <AddBoxIcon fontSize="small" sx={{ mr: { sm: 0.5 } }}/> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Tạo mục con</Box>
              </Button>
            </Paper>

            {/* Content Phải */}
            <Box sx={{ p: 2.5, flexGrow: 1, overflowY: "auto", minHeight: 0, bgcolor: isDark ? 'transparent' : '#F9FAFB' }}>
              {isInitialLoading ? (
                 <Grid container spacing={2}>{[1, 2, 3].map(i => <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={i}><Skeleton variant="rounded" height={70} sx={{ borderRadius: "12px" }} /></Grid>)}</Grid>
              ) : subCategories.length > 0 ? (
                <Grid container spacing={2}>
                  {subCategories.map(subCate => (
                    <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={subCate.category_id || subCate.id}>
                      <Paper elevation={0} variant="outlined" onClick={() => setSelectedCategoryId(subCate.category_id || subCate.id)} sx={{ p: 2, display: "flex", alignItems: "center", cursor: "pointer", borderRadius: "12px", position: "relative", bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : "#FFFFFF", transition: "all 0.2s ease", "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)", boxShadow: 2, "& .action-btns": { opacity: 1 } } }}>
                        <Stack className="action-btns" direction="row" spacing={0.5} sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", opacity: 0, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : "rgba(255,255,255,0.9)", borderRadius: "8px", p: 0.5, boxShadow: `0 2px 8px ${alpha('#000', 0.1)}` }}>
                           <Tooltip title="Đổi tên"><IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); setTempData({ targetId: subCate.category_id || subCate.id, initialName: subCate.category_name }); setDialogs(p => ({...p, editCate: true})); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                           <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, item: { id: subCate.category_id || subCate.id, name: subCate.category_name }, type: "category" }); }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                        <TopicIcon color="primary" sx={{ mr: 1.5, opacity: 0.8 }} />
                        <Typography variant="body2" fontWeight={700} color="text.primary" noWrap sx={{ flexGrow: 1, pr: 6 }}>{subCate.category_name}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" minHeight="200px" opacity={0.6}>
                  <TopicIcon sx={{ fontSize: 60, color: "text.disabled", mb: 1.5 }} />
                  <Typography variant="body1" fontWeight={700} color="text.secondary">Mục này chưa có nội dung con</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* --- Menus & Dialogs --- */}
      <Menu open={Boolean(planMenuAnchor)} anchorEl={planMenuAnchor} onClose={() => setPlanMenuAnchor(null)} PaperProps={{ sx: { borderRadius: "12px", backgroundImage: 'none', mt: 1, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setTempData({ initialName: planInfo?.title }); setDialogs(p => ({ ...p, editPlanName: true })); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}>Đổi tên giáo án</ListItemText></MenuItem>
        <Divider />
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setDeleteConfirm({ open: true, item: { id: selectedPlanId, name: planInfo?.title }, type: "plan" }); }}><ListItemIcon><DeleteForeverIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}>Xóa vĩnh viễn</ListItemText></MenuItem>
      </Menu>

      <Menu open={Boolean(contextMenu)} anchorEl={contextMenu} onClose={() => setContextMenu(null)} PaperProps={{ sx: { borderRadius: "12px", backgroundImage: 'none', border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
        <MenuItem onClick={() => { setTempData({ targetId: contextTargetId, initialName: "..." }); setDialogs(p => ({ ...p, editCate: true })); setContextMenu(null); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}>Đổi tên</ListItemText></MenuItem>
        <MenuItem onClick={() => { setDeleteConfirm({ open: true, item: { id: contextTargetId, name: "mục này" }, type: "category" }); setContextMenu(null); }}><ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}>Xóa</ListItemText></MenuItem>
      </Menu>

      <NameInputDialog open={dialogs.createCate} onClose={() => setDialogs(p => ({ ...p, createCate: false }))} onSubmit={handleAddCate} title={tempData.parentId ? "Thêm bài học con" : "Thêm chương mới"} label="Tên mục" loading={actionLoading} />
      <NameInputDialog open={dialogs.editCate} onClose={() => setDialogs(p => ({ ...p, editCate: false }))} onSubmit={async (name) => { setActionLoading(true); await updateCategory(tempData.targetId, { category_name: name, plan_id: selectedPlanId }, authToken); setDialogs(p => ({...p, editCate: false})); loadPlanDetail(); setActionLoading(false); }} title="Đổi tên mục" label="Tên mới" initialValue={tempData.initialName} loading={actionLoading} />

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: "16px", p: 1, backgroundImage: 'none', border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography fontWeight={600} fontSize="0.95rem">Bạn có chắc muốn xóa <strong>{deleteConfirm.item?.name || "mục này"}</strong>?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(p => ({ ...p, open: false }))} color="inherit" sx={{ fontWeight: 700, borderRadius: "8px" }}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disableElevation sx={{ borderRadius: "8px", fontWeight: 700 }}>Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
});

export default ResourcesManagement;