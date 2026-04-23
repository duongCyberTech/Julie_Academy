import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Box, Typography, Paper, Grid, Breadcrumbs, Link as MuiLink, Stack,
  Button, IconButton, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText,
  Snackbar, Alert, Divider, useTheme, Skeleton, CircularProgress,
  InputAdornment, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import SettingsIcon from "@mui/icons-material/Settings";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  getAllCategories, createCategory, deleteCategory, deleteBook, getPlanDetail
} from "../../services/CategoryService";
import { updateClass } from "../../services/ClassService";
import {
  getFoldersByClass, createFolder, uploadResource, deleteFolder, fetchPresignedUrl, deleteResource
} from "../../services/ResourceService";

import FilePreviewDialog from "../../components/FilePreviewDialog";

// ĐÃ SỬA: Giảm padding, margin để tận dụng không gian màn hình lớn
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(2),
    padding: theme.spacing(2), // Giảm từ 4 xuống 2 để nới rộng không gian tương tác
    backgroundColor: isDark ? theme.palette.background.default : '#F3F4F6',
    backgroundImage: 'none',
    borderRadius: '20px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 4px 20px rgba(0,0,0,0.02)',
    height: 'calc(100vh - 100px)', // Fix cứng height để flexbox cuộn bên trong
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(1),
      height: 'auto',
      minHeight: 'calc(100vh - 80px)'
    }
  };
});

const addFileToFolderState = (nodes, targetFolderId, newFile) => {
  return nodes.map((node) => {
    if (String(node.folder_id) === String(targetFolderId)) {
      return { ...node, resources: [...(node.resources || []), newFile] };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: addFileToFolderState(node.children, targetFolderId, newFile) };
    }
    return node;
  });
};

const findFolderNode = (nodes, id) => {
  for (const node of nodes) {
    if (String(node.folder_id) === String(id)) return node;
    if (node.children) {
      const found = findFolderNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const FileIcon = memo(({ mimeType }) => {
  if (mimeType?.includes("pdf")) return <PictureAsPdfIcon color="error" fontSize="large" />;
  if (mimeType?.includes("image")) return <DescriptionIcon color="warning" fontSize="large" />;
  return <DescriptionIcon color="primary" fontSize="large" />;
});

const NameInputDialog = memo(({ open, onClose, onSubmit, title, label, initialValue = "", loading }) => {
  const [name, setName] = useState(initialValue);
  useEffect(() => { if (open) setName(initialValue); }, [open, initialValue]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px", backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label={label} fullWidth value={name} onChange={(e) => setName(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
        <Button onClick={() => onSubmit(name)} variant="contained" disableElevation disabled={!name || loading} sx={{ borderRadius: "8px", fontWeight: 600 }}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const UploadFileDialog = memo(({ open, onClose, onSubmit, loading }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const theme = useTheme();

  const handleSubmit = useCallback(() => {
    if (file && title) {
      const safeFileName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9.\-_]/g, "");
      const cleanFile = new File([file], safeFileName, { type: file.type });
      onSubmit(cleanFile, { title, description: desc });
      setFile(null); setTitle(""); setDesc("");
    }
  }, [file, title, desc, onSubmit]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "12px", backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Tải lên tài liệu</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Button
            variant="outlined" component="label" fullWidth
            sx={{
              height: 100, borderStyle: "dashed", borderRadius: "12px", borderWidth: 2,
              borderColor: theme.palette.mode === 'dark' ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5),
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <UploadFileIcon color="primary" fontSize="large" />
              <Typography fontWeight={600} color="text.secondary" variant="body2">
                {file ? file.name : "Kéo thả hoặc Nhấn để chọn file"}
              </Typography>
            </Stack>
            <input type="file" hidden onChange={(e) => {
              const f = e.target.files[0];
              if (f) { setFile(f); setTitle(f.name); }
            }} />
          </Button>
          <TextField label="Tên hiển thị" fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Mô tả (tùy chọn)" fullWidth size="small" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disableElevation disabled={!file || !title || loading} sx={{ borderRadius: "8px", fontWeight: 600 }}>
          {loading ? "Đang tải..." : "Tải lên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const ResourceManager = memo(({ classId, planId, token, onRemovePlan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingFileId, setLoadingFileId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [planInfo, setPlanInfo] = useState(null);
  const [rawCategories, setRawCategories] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [dialogs, setDialogs] = useState({ upload: false, createCategory: false, editCategory: false, createFolder: false, editPlanName: false });
  const [planMenuAnchor, setPlanMenuAnchor] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextTargetId, setContextTargetId] = useState(null);
  const [tempData, setTempData] = useState({ parentId: null, categoryId: null, initialName: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, type: null });
  const [previewFile, setPreviewFile] = useState(null);

  const showToast = useCallback((message, severity = "success") => setToast({ open: true, message, severity }), []);
  const closeToast = useCallback(() => setToast((prev) => ({ ...prev, open: false })), []);

  const loadData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const [planRes, catsRes, foldersRes] = await Promise.all([
        getPlanDetail(planId, token),
        getAllCategories({ plan_id: planId }, token),
        getFoldersByClass(classId, token),
      ]);
      setPlanInfo(planRes);
      let nodes = [];
      if (Array.isArray(catsRes)) {
        if (catsRes.length === 2 && Array.isArray(catsRes[0])) nodes = catsRes[0];
        else nodes = catsRes.flat();
      } else if (catsRes?.data && Array.isArray(catsRes.data)) { nodes = catsRes.data; }
      setRawCategories(nodes);
      setFolderTree(foldersRes || []);
    } catch (e) { showToast("Lỗi tải dữ liệu", "error"); } 
    finally { setIsInitialLoading(false); }
  }, [planId, classId, token, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const handleTreeSelection = useCallback((event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;
    if (selectedId) {
      setSelectedCategoryId(selectedId); setCurrentFolder(null); setBreadcrumbs([]); setSearchQuery("");
    } else { setSelectedCategoryId(null); }
  }, []);

  const handleCreateCategory = useCallback(async (name) => {
    setActionLoading(true);
    try {
      await createCategory([{ category_name: name, description: "Created by tutor", plan_id: planId, ...(tempData.parentId ? { parent_id: tempData.parentId } : {}) }], token);
      setDialogs(p => ({ ...p, createCategory: false }));
      await loadData();
      showToast(tempData.parentId ? "Đã thêm bài học" : "Đã thêm chương mới");
    } catch (e) { showToast("Lỗi tạo mục lục", "error"); } 
    finally { setActionLoading(false); }
  }, [planId, tempData.parentId, token, loadData, showToast]);

  const currentViewData = useMemo(() => {
    if (!selectedCategoryId) return { folders: [], files: [] };
    if (currentFolder) {
      const activeNode = findFolderNode(folderTree, currentFolder.folder_id);
      return activeNode ? { folders: activeNode.children || [], files: activeNode.resources || [] } : { folders: [], files: [] };
    } else {
      const rootFolders = folderTree.filter(f => String(f.category_id) === String(selectedCategoryId) && !f.parent_id);
      return { folders: rootFolders, files: [] };
    }
  }, [selectedCategoryId, currentFolder, folderTree]);

  const filteredViewData = useMemo(() => {
    if (!searchQuery.trim()) return currentViewData;
    const query = searchQuery.toLowerCase();
    return {
      folders: currentViewData.folders.filter(f => f.folder_name.toLowerCase().includes(query)),
      files: currentViewData.files.filter(f => f.title.toLowerCase().includes(query))
    };
  }, [currentViewData, searchQuery]);

  const handleCreateFolder = useCallback(async (name) => {
    setActionLoading(true);
    try {
      await createFolder(classId, selectedCategoryId, { folder_name: name, parent_id: currentFolder?.folder_id }, token);
      setDialogs(p => ({ ...p, createFolder: false }));
      await loadData();
      showToast("Tạo thư mục thành công");
    } catch (e) { showToast("Lỗi tạo thư mục", "error"); } 
    finally { setActionLoading(false); }
  }, [classId, selectedCategoryId, currentFolder, token, loadData, showToast]);

  const handleUpload = useCallback(async (file, metaData) => {
    if (!currentFolder) { showToast("Vui lòng chọn thư mục", "warning"); return; }
    setActionLoading(true);
    try {
      const response = await uploadResource(currentFolder.folder_id, file, metaData, token);
      setDialogs(p => ({ ...p, upload: false }));
      setFolderTree(prevTree => addFileToFolderState(prevTree, currentFolder.folder_id, response?.data || response));
      showToast("Upload thành công");
    } catch (e) { showToast("Lỗi upload file", "error"); } 
    finally { setActionLoading(false); }
  }, [currentFolder, token, showToast]);

  const handleConfirmDelete = useCallback(async () => {
    const { item, type } = deleteConfirm;
    if (!item) return;
    setActionLoading(true);
    try {
      if (type === "folder") await deleteFolder(item.folder_id, token);
      else if (type === "category") { await deleteCategory(planId, item.id, "FORCE", token); setSelectedCategoryId(null); }
      else if (type === "plan") { await deleteBook(item.id, "FORCE", token); if (onRemovePlan) onRemovePlan(); }
      else if (type === "file") await deleteResource(item.did, token);
      showToast("Đã xóa"); await loadData(); setDeleteConfirm({ open: false, item: null, type: null });
    } catch (e) { showToast("Lỗi xóa", "error"); } 
    finally { setActionLoading(false); }
  }, [deleteConfirm, token, planId, onRemovePlan, loadData, showToast]);

  const handleEnterFolder = useCallback((folder) => {
    setBreadcrumbs(prev => [...prev, currentFolder].filter(Boolean));
    setCurrentFolder(folder); setSearchQuery("");
  }, [currentFolder]);

  const handleBreadcrumbClick = useCallback((folder, index) => {
    if (!folder) { setCurrentFolder(null); setBreadcrumbs([]); } 
    else { setCurrentFolder(folder); setBreadcrumbs(prev => prev.slice(0, index)); }
    setSearchQuery("");
  }, []);

  const currentCategoryName = useMemo(() => {
    if (!selectedCategoryId) return "";
    const findLabel = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node.label;
        if (node.children) { const found = findLabel(node.children, id); if (found) return found; }
      }
      return null;
    };
    return findLabel(categoryTreeData, selectedCategoryId) || "Danh mục";
  }, [selectedCategoryId, categoryTreeData]);

  const handlePreviewClick = useCallback(async (e, file) => {
    e.stopPropagation();
    setLoadingFileId(file.did);
    try {
      const data = await fetchPresignedUrl(file.did, token);
      setPreviewFile({ ...file, secureViewUrl: data.signedUrl });
    } catch (error) { showToast(error.message || "Lỗi tải file", "error"); } 
    finally { setLoadingFileId(null); }
  }, [token, showToast]);

  return (
    <PageWrapper elevation={0}>
      <Grid container spacing={2} sx={{ flexGrow: 1, height: "100%", m: 0, width: "100%" }}>
        
        {/* PANEL TRÁI */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <Box 
            sx={{ 
              display: "flex", flexDirection: "column", height: "100%", 
              bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : "#FFFFFF", 
              borderRadius: "16px", border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}` 
            }}
          >
            <Box p={2} borderBottom="1px solid" borderColor={isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)} sx={{ flexShrink: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box sx={{ overflow: "hidden", mr: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontSize="0.7rem" fontWeight={700}>GIÁO ÁN</Typography>
                  {isInitialLoading ? <Skeleton variant="text" width={100} /> : <Typography variant="body2" fontWeight={700} noWrap color="text.primary">{planInfo?.title || "Chưa có tên"}</Typography>}
                </Box>
                <IconButton size="small" onClick={(e) => setPlanMenuAnchor(e.currentTarget)} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha(theme.palette.primary.main, 0.05), borderRadius: "8px" }}><SettingsIcon fontSize="small" /></IconButton>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant={isDark && !selectedCategoryId ? "outlined" : "contained"} size="small"
                  startIcon={selectedCategoryId ? <AddCircleIcon fontSize="small" /> : <AddBoxIcon fontSize="small" />} color={selectedCategoryId ? "secondary" : "primary"}
                  onClick={() => { setTempData({ parentId: selectedCategoryId || null }); setDialogs(p => ({ ...p, createCategory: true })); }} 
                  disableElevation 
                  sx={{ 
                    flexGrow: 1, textTransform: "none", fontSize: "0.8rem", fontWeight: 700, 
                    borderRadius: "8px", whiteSpace: "nowrap", minWidth: 0, px: 1 // ĐÃ SỬA: Không cho phép chữ xuống dòng
                  }}
                >
                  {selectedCategoryId ? "Thêm bài học" : "Chương mới"}
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

        {/* PANEL PHẢI */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          {isInitialLoading ? (
            <Box p={3} bgcolor={isDark ? alpha(theme.palette.background.paper, 0.4) : "#FFFFFF"} borderRadius="16px" border={`1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`} height="100%">
               <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
               <Grid container spacing={2}>{[1, 2, 3].map(i => <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}><Skeleton variant="rounded" height={80} sx={{ borderRadius: "12px" }} /></Grid>)}</Grid>
            </Box>
          ) : selectedCategoryId ? (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : "#FFFFFF", borderRadius: "16px", border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}` }}>
              
              <Paper square elevation={0} sx={{ p: 1.5, px: 2, borderBottom: "1px solid", borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3), display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between", alignItems: "center", flexShrink: 0, bgcolor: "transparent", borderRadius: "16px 16px 0 0" }}>
                <Box display="flex" alignItems="center">
                  {currentFolder && <IconButton size="small" onClick={() => { if (breadcrumbs.length > 0) { setCurrentFolder(breadcrumbs[breadcrumbs.length - 1]); setBreadcrumbs(prev => prev.slice(0, -1)); } else setCurrentFolder(null); setSearchQuery(""); }} sx={{ mr: 1, bgcolor: isDark ? alpha('#fff', 0.05) : alpha(theme.palette.primary.main, 0.05), borderRadius: "8px" }}><ArrowBackIcon fontSize="small" /></IconButton>}
                  <Breadcrumbs separator={<ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />}>
                    <MuiLink component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(null)} sx={{ display: "flex", alignItems: "center", fontWeight: !currentFolder ? 700 : 500, color: !currentFolder ? 'primary.main' : 'text.secondary' }}><HomeIcon sx={{ mr: 0.5 }} fontSize="small" />{currentCategoryName}</MuiLink>
                    {breadcrumbs.map((folder, index) => <MuiLink key={folder.folder_id} component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(folder, index)} sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.85rem' }}>{folder.folder_name}</MuiLink>)}
                    {currentFolder && <Typography color="text.primary" fontWeight={700} fontSize="0.85rem">{currentFolder.folder_name}</Typography>}
                  </Breadcrumbs>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField 
                    placeholder="Tìm tài liệu..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: "8px", bgcolor: isDark ? alpha('#fff', 0.03) : '#F9FAFB', height: '36px' } } }}
                    sx={{ width: { xs: 120, sm: 160, md: 200 } }}
                  />
                  <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)} sx={{ height: '36px' }}>
                    <ToggleButton value="grid" sx={{ borderRadius: "8px", p: 0.5 }}><GridViewIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="list" sx={{ borderRadius: "8px", p: 0.5 }}><ViewListIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
                  <Button variant="outlined" onClick={() => setDialogs(p => ({ ...p, createFolder: true }))} size="small" sx={{ borderRadius: "8px", fontWeight: 700, height: '36px', whiteSpace: 'nowrap', minWidth: 0 }}><CreateNewFolderIcon fontSize="small" sx={{ mr: { sm: 0.5 } }}/><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Thư mục</Box></Button>
                  {currentFolder && <Button variant="contained" disableElevation onClick={() => setDialogs(p => ({ ...p, upload: true }))} size="small" sx={{ borderRadius: "8px", fontWeight: 700, height: '36px', whiteSpace: 'nowrap', minWidth: 0 }}><UploadFileIcon fontSize="small" sx={{ mr: { sm: 0.5 } }}/><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Tải lên</Box></Button>}
                </Stack>
              </Paper>

              <Box sx={{ p: 2.5, flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
                {filteredViewData.folders.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700} sx={{ mb: 1.5, fontSize: '0.75rem' }}>THƯ MỤC ({filteredViewData.folders.length})</Typography>
                    <Grid container spacing={2}>
                      {filteredViewData.folders.map(folder => (
                        <Grid size={viewMode === "grid" ? { xs: 6, sm: 4, xl: 3 } : { xs: 12 }} key={`folder-${folder.folder_id}`}>
                          <Paper
                            elevation={0} variant="outlined" onClick={() => handleEnterFolder(folder)}
                            sx={{
                              p: viewMode === "grid" ? 2 : 1.5, display: "flex", flexDirection: viewMode === "grid" ? "column" : "row", alignItems: "center", cursor: "pointer", borderRadius: "12px", position: "relative",
                              bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : "#F9FAFB", borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3), transition: "all 0.2s ease",
                              "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)", "& .del-btn": { opacity: 1 } }
                            }}
                          >
                            <IconButton className="del-btn" size="small" color="error" sx={{ position: "absolute", top: 4, right: 4, opacity: 0, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : "rgba(255,255,255,0.9)", borderRadius: "8px" }} onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, item: folder, type: "folder" }); }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                            <FolderIcon sx={{ fontSize: viewMode === "grid" ? 44 : 28, color: "#FFC107", mb: viewMode === "grid" ? 1 : 0, mr: viewMode === "list" ? 1.5 : 0 }} />
                            <Typography variant="body2" fontWeight={700} color="text.primary" noWrap sx={{ flexGrow: 1, textAlign: viewMode === "grid" ? "center" : "left", fontSize: '0.85rem' }}>{folder.folder_name}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {filteredViewData.files.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700} sx={{ mb: 1.5, fontSize: '0.75rem' }}>TÀI LIỆU ({filteredViewData.files.length})</Typography>
                    <Grid container spacing={2}>
                      {filteredViewData.files.map(file => {
                        const isLoading = loadingFileId === file.did;
                        return (
                        <Grid size={viewMode === "grid" ? { xs: 12, sm: 6, xl: 4 } : { xs: 12 }} key={`file-${file.did}`}>
                          <Paper
                            elevation={0} variant="outlined" onClick={(e) => handlePreviewClick(e, file)}
                            sx={{
                              p: 1.5, display: "flex", alignItems: "center", cursor: "pointer", borderRadius: "12px", position: "relative",
                              bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : "#F9FAFB", borderColor: isLoading ? 'primary.main' : isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3),
                              transition: "all 0.2s ease", opacity: isLoading ? 0.7 : 1,
                              "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)", "& .actions": { opacity: 1 } }
                            }}
                          >
                            <Stack className="actions" direction="row" sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", opacity: 0, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : "rgba(255,255,255,0.9)", borderRadius: "8px", p: 0.5, boxShadow: `0 2px 8px ${alpha('#000', 0.1)}` }}>
                              {!isLoading && (
                                <>
                                  <Tooltip title="Xem"><IconButton size="small" color="primary" onClick={(e) => handlePreviewClick(e, file)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                  <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, item: file, type: "file" }); }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                                </>
                              )}
                            </Stack>
                            <Box mr={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32 }}>
                              {isLoading ? <CircularProgress size={20} thickness={5} /> : <FileIcon mimeType={file.file_type} />}
                            </Box>
                            <Box overflow="hidden" sx={{ pr: 4, flexGrow: 1, display: viewMode === "list" ? "flex" : "block", alignItems: "center", justifyContent: "space-between" }}>
                              <Typography variant="body2" fontWeight={700} color={isLoading ? 'primary.main' : 'text.primary'} noWrap title={file.title} sx={{ fontSize: '0.85rem' }}>{file.title}</Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: viewMode === "list" ? 0 : 0.5, display: 'block' }}>{isLoading ? "Đang mở..." : `Bản v${file.version}`}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                        )
                      })}
                    </Grid>
                  </Box>
                )}
                {filteredViewData.folders.length === 0 && filteredViewData.files.length === 0 && (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" minHeight="200px" opacity={0.5}>
                    <FolderOpenIcon sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={700}>{searchQuery ? "Không tìm thấy kết quả" : "Thư mục trống"}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary" flexDirection="column" bgcolor={isDark ? alpha(theme.palette.background.paper, 0.4) : "#FFFFFF"} borderRadius="16px" border={`1px dashed ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}`}>
              <FolderOpenIcon sx={{ fontSize: 50, mb: 1.5, color: alpha(theme.palette.primary.main, 0.3) }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: 'text.primary' }}>Chưa chọn mục lục</Typography>
              <Typography variant="body2" fontWeight={500}>Vui lòng chọn Chương/Bài học bên trái.</Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Menus and Dialogs remain identical to previous implementation */}
      <Menu open={Boolean(planMenuAnchor)} anchorEl={planMenuAnchor} onClose={() => setPlanMenuAnchor(null)} PaperProps={{ sx: { borderRadius: "12px", backgroundImage: 'none', mt: 1, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setTempData({ initialName: planInfo?.title }); setDialogs(p => ({ ...p, editPlanName: true })); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}>Đổi tên giáo án</ListItemText></MenuItem>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); if (window.confirm("Gỡ giáo án?")) updateClass(classId, { plan_id: null }, token).then(() => { showToast("Đã gỡ"); if (onRemovePlan) onRemovePlan(); }); }}><ListItemIcon><LinkOffIcon fontSize="small" /></ListItemIcon><ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}>Gỡ khỏi lớp</ListItemText></MenuItem>
        <Divider />
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setDeleteConfirm({ open: true, item: { id: planId }, type: "plan" }); }}><ListItemIcon><DeleteForeverIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}>Xóa vĩnh viễn</ListItemText></MenuItem>
      </Menu>

      <Menu open={Boolean(contextMenu)} anchorEl={contextMenu} onClose={() => setContextMenu(null)} PaperProps={{ sx: { borderRadius: "12px", backgroundImage: 'none', border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
        <MenuItem onClick={() => { setTempData({ categoryId: contextTargetId, initialName: "..." }); setDialogs(p => ({ ...p, editCategory: true })); setContextMenu(null); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}>Đổi tên</ListItemText></MenuItem>
        <MenuItem onClick={() => { setDeleteConfirm({ open: true, item: { id: contextTargetId, name: "mục này" }, type: "category" }); setContextMenu(null); }}><ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}>Xóa</ListItemText></MenuItem>
      </Menu>

      <NameInputDialog open={dialogs.createCategory} onClose={() => setDialogs(p => ({ ...p, createCategory: false }))} onSubmit={handleCreateCategory} title={tempData.parentId ? "Thêm bài học" : "Thêm chương mới"} label="Tên mục" loading={actionLoading} />
      <NameInputDialog open={dialogs.createFolder} onClose={() => setDialogs(p => ({ ...p, createFolder: false }))} onSubmit={handleCreateFolder} title="Tạo thư mục" label="Tên thư mục" loading={actionLoading} />
      <UploadFileDialog open={dialogs.upload} onClose={() => setDialogs(p => ({ ...p, upload: false }))} onSubmit={handleUpload} loading={actionLoading} />

      <FilePreviewDialog open={!!previewFile} onClose={() => setPreviewFile(null)} fileData={previewFile} />

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: "16px", p: 1, backgroundImage: 'none', border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography fontWeight={600} fontSize="0.95rem">Bạn có chắc muốn xóa <strong>{deleteConfirm.item?.name || deleteConfirm.item?.folder_name || deleteConfirm.item?.title || "mục này"}</strong>?</Typography></DialogContent>
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

export default ResourceManager;