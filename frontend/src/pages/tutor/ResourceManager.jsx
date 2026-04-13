import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, Breadcrumbs, Link as MuiLink, Stack,
  Button, IconButton, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText,
  Snackbar, Alert, Divider, useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

import {
  getAllCategories, createCategory, deleteCategory, deleteBook, getPlanDetail
} from "../../services/CategoryService";
import { updateClass } from "../../services/ClassService";
import {
  getFoldersByClass, createFolder, uploadResource, deleteFolder, fetchFileStreamS3
} from "../../services/ResourceService";

import FilePreviewDialog from "../../components/FilePreviewDialog";

const addFileToFolderState = (nodes, targetFolderId, newFile) => {
  return nodes.map((node) => {
    if (String(node.folder_id) === String(targetFolderId)) {
      return {
        ...node,
        resources: [...(node.resources || []), newFile],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: addFileToFolderState(node.children, targetFolderId, newFile),
      };
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

const FileIcon = ({ mimeType }) => {
  if (mimeType?.includes("pdf")) return <PictureAsPdfIcon color="error" fontSize="large" />;
  if (mimeType?.includes("image")) return <DescriptionIcon color="warning" fontSize="large" />;
  return <DescriptionIcon color="primary" fontSize="large" />;
};

const NameInputDialog = ({ open, onClose, onSubmit, title, label, initialValue = "", loading }) => {
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    if (open) setName(initialValue);
  }, [open, initialValue]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label={label} fullWidth value={name} onChange={(e) => setName(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
        <Button onClick={() => onSubmit(name)} variant="contained" disableElevation disabled={!name || loading} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UploadFileDialog = ({ open, onClose, onSubmit, loading }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const theme = useTheme();

  const handleSubmit = () => {
    if (file && title) {
      const safeFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9.\-_]/g, "");

      const cleanFile = new File([file], safeFileName, { type: file.type });

      onSubmit(cleanFile, { title, description: desc });
      setFile(null);
      setTitle("");
      setDesc("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Tải lên tài liệu</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              height: 80, borderStyle: "dashed", borderRadius: 2, borderWidth: 2,
              borderColor: theme.palette.mode === 'dark' ? theme.palette.midnight?.border : 'divider'
            }}
          >
            {file ? file.name : "Chọn file từ máy tính"}
            <input type="file" hidden onChange={(e) => {
              const f = e.target.files[0];
              if (f) {
                setFile(f);
                setTitle(f.name);
              }
            }} />
          </Button>
          <TextField label="Tên hiển thị" fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Mô tả (tùy chọn)" fullWidth size="small" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disableElevation disabled={!file || !title || loading} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {loading ? "Đang tải..." : "Tải lên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ResourceManager = ({ classId, planId, token, onRemovePlan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
  const [blobUrl, setBlobUrl] = useState(null);

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const loadData = useCallback(async () => {
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
      } else if (catsRes?.data && Array.isArray(catsRes.data)) {
        nodes = catsRes.data;
      }
      setRawCategories(nodes);
      setFolderTree(foldersRes || []);
    } catch (e) {
      showToast("Lỗi tải dữ liệu", "error");
    }
  }, [planId, classId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          parentMap.set(pid, {
            id: pid, category_id: pid, category_name: item.description || "Danh mục gốc", parent_id: null, isFake: true
          });
        }
      }
    });

    const allNodes = [...Array.from(parentMap.values()), ...rawCategories];

    const buildTree = (items, targetParentId = null) => {
      return items
        .filter(item => getParentId(item) === targetParentId)
        .map(item => ({
          id: getItemId(item),
          label: String(item.name ?? item.category_name ?? "No Name"),
          children: buildTree(items, getItemId(item)),
        }));
    };

    return buildTree(allNodes, null);
  }, [rawCategories]);

  const handleTreeSelection = (event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;
    if (selectedId) {
      setSelectedCategoryId(selectedId);
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      setSelectedCategoryId(null);
    }
  };

  const handleAddCategoryClick = () => {
    setTempData({ parentId: selectedCategoryId || null });
    setDialogs(p => ({ ...p, createCategory: true }));
  };

  const handleCreateCategory = async (name) => {
    setActionLoading(true);
    try {
      await createCategory([{
        category_name: name,
        description: "Created by tutor",
        plan_id: planId,
        ...(tempData.parentId ? { parent_id: tempData.parentId } : {})
      }], token);

      setDialogs(p => ({ ...p, createCategory: false }));
      await loadData();
      showToast(tempData.parentId ? "Đã thêm bài học" : "Đã thêm chương mới");
    } catch (e) {
      showToast("Lỗi tạo mục lục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const currentViewData = useMemo(() => {
    if (!selectedCategoryId) return { folders: [], files: [] };
    if (currentFolder) {
      const activeNode = findFolderNode(folderTree, currentFolder.folder_id);
      return activeNode
        ? { folders: activeNode.children || [], files: activeNode.resources || [] }
        : { folders: [], files: [] };
    } else {
      const rootFolders = folderTree.filter(f => String(f.category_id) === String(selectedCategoryId) && !f.parent_id);
      return { folders: rootFolders, files: [] };
    }
  }, [selectedCategoryId, currentFolder, folderTree]);

  const handleCreateFolder = async (name) => {
    setActionLoading(true);
    try {
      await createFolder(classId, selectedCategoryId, {
        folder_name: name,
        parent_id: currentFolder?.folder_id
      }, token);
      setDialogs(p => ({ ...p, createFolder: false }));
      await loadData();
      showToast("Tạo thư mục thành công");
    } catch (e) {
      showToast("Lỗi tạo thư mục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpload = async (file, metaData) => {
    if (!currentFolder) {
      showToast("Vui lòng chọn hoặc tạo một thư mục để tải lên", "warning");
      return;
    }
    setActionLoading(true);
    try {
      const response = await uploadResource(currentFolder.folder_id, file, metaData, token);
      const newUploadedFile = response?.data || response;

      setDialogs(p => ({ ...p, upload: false }));
      setFolderTree(prevTree => addFileToFolderState(prevTree, currentFolder.folder_id, newUploadedFile));
      showToast("Upload thành công");
    } catch (e) {
      showToast("Lỗi upload file", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (e, item, type) => {
    e.stopPropagation();
    setDeleteConfirm({ open: true, item, type });
  };

  const handleConfirmDelete = async () => {
    const { item, type } = deleteConfirm;
    if (!item) return;
    setActionLoading(true);
    try {
      if (type === "folder") {
        await deleteFolder(item.folder_id, token);
      } else if (type === "category") {
        await deleteCategory(planId, item.id, "FORCE", token);
        setSelectedCategoryId(null);
      } else if (type === "plan") {
        await deleteBook(item.id, "FORCE", token);
        if (onRemovePlan) onRemovePlan();
      }
      showToast("Đã xóa thành công");
      await loadData();
      setDeleteConfirm({ open: false, item: null, type: null });
    } catch (e) {
      showToast("Lỗi khi xóa", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnterFolder = (folder) => {
    setBreadcrumbs(prev => [...prev, currentFolder].filter(Boolean));
    setCurrentFolder(folder);
  };

  const handleBreadcrumbClick = (folder, index) => {
    if (!folder) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      setCurrentFolder(folder);
      setBreadcrumbs(prev => prev.slice(0, index));
    }
  };

  const handleBack = () => {
    if (breadcrumbs.length > 0) {
      const parent = breadcrumbs[breadcrumbs.length - 1];
      setCurrentFolder(parent);
      setBreadcrumbs(prev => prev.slice(0, -1));
    } else {
      setCurrentFolder(null);
    }
  };

  const currentCategoryName = useMemo(() => {
    if (!selectedCategoryId) return "";
    const findLabel = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node.label;
        if (node.children) {
          const found = findLabel(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    return findLabel(categoryTreeData, selectedCategoryId) || "Danh mục";
  }, [selectedCategoryId, categoryTreeData]);

  const handlePreviewClick = async (e, file) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      const fileBlob = await fetchFileStreamS3(file.did, token);
      const objectUrl = URL.createObjectURL(fileBlob);
      setBlobUrl(objectUrl);
      setPreviewFile({ ...file, secureViewUrl: objectUrl });
    } catch (error) {
      showToast("Lỗi khi tải dữ liệu file từ Server", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  };

  return (
    <Box sx={{ height: "75vh", display: "flex", flexDirection: "column" }}>
      <Grid container spacing={0} sx={{ flexGrow: 1, height: "100%" }}>
        <Grid size={{ xs: 12, md: 3 }} sx={{
          borderRight: "1px solid", borderColor: isDark ? theme.palette.midnight?.border : "divider",
          display: "flex", flexDirection: "column",
          bgcolor: "background.paper", height: "100%", overflow: "hidden",
          borderTopLeftRadius: 16, borderBottomLeftRadius: 16
        }}>
          <Box p={2} borderBottom="1px solid" borderColor={isDark ? theme.palette.midnight?.border : "divider"} bgcolor={isDark ? alpha(theme.palette.primary.main, 0.05) : "background.default"} sx={{ flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Box sx={{ overflow: "hidden", mr: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontSize="0.75rem" fontWeight={700}>GIÁO ÁN</Typography>
                <Typography variant="body1" fontWeight="bold" noWrap title={planInfo?.title} color="text.primary">
                  {planInfo?.title || "Đang tải..."}
                </Typography>
              </Box>
              <Tooltip title="Cài đặt">
                <IconButton size="small" onClick={(e) => setPlanMenuAnchor(e.currentTarget)} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'transparent' }}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box mt={1.5} display="flex" gap={1}>
              <Button
                variant={isDark && !selectedCategoryId ? "outlined" : "contained"}
                size="small"
                fullWidth
                startIcon={selectedCategoryId ? <AddCircleIcon /> : <AddBoxIcon />}
                color={selectedCategoryId ? "secondary" : "primary"}
                onClick={handleAddCategoryClick}
                disableElevation
                sx={{ textTransform: "none", fontSize: "0.85rem", fontWeight: 600, borderRadius: 1.5 }}
              >
                {selectedCategoryId ? "Thêm bài học" : "Thêm chương mới"}
              </Button>
              {selectedCategoryId && (
                <Tooltip title="Xóa mục này">
                  <Button variant="outlined" color="error" size="small" onClick={() => setDeleteConfirm({ open: true, item: { id: selectedCategoryId, name: currentCategoryName }, type: "category" })} sx={{ minWidth: "40px", px: 0, borderRadius: 1.5 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </Button>
                </Tooltip>
              )}
            </Box>
            {selectedCategoryId && (
              <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mt={1}>
                Đang chọn: <b>{currentCategoryName}</b>
                <MuiLink component="button" onClick={() => setSelectedCategoryId(null)} sx={{ ml: 1, cursor: "pointer", verticalAlign: "baseline", fontWeight: 600 }}> (Huỷ chọn)</MuiLink>
              </Typography>
            )}
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1, minHeight: 0 }}>
            {categoryTreeData.length > 0 ? (
              <RichTreeView
                items={categoryTreeData}
                slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                onSelectedItemsChange={handleTreeSelection}
                selectedItems={selectedCategoryId ? [selectedCategoryId] : []}
                slotProps={{ item: (ownerState) => ({ onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); setContextTargetId(ownerState.itemId); setContextMenu(e.currentTarget); } }) }}
                sx={{
                  "& .MuiTreeItem-content": {
                    py: 0.5, borderRadius: 1.5,
                    "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main", fontWeight: "bold" },
                    "&.Mui-selected:hover": { bgcolor: alpha(theme.palette.primary.main, 0.25) }
                  }
                }}
              />
            ) : (
              <Box p={3} textAlign="center"><Typography variant="caption" color="text.secondary">Chưa có mục lục.</Typography></Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }} sx={{ display: "flex", flexDirection: "column", bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : "#F9FAFB", height: "100%", overflow: "hidden", borderTopRightRadius: 16, borderBottomRightRadius: 16 }}>
          {selectedCategoryId ? (
            <>
              <Paper square elevation={0} sx={{ p: 2, borderBottom: "1px solid", borderColor: isDark ? theme.palette.midnight?.border : "divider", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, bgcolor: "background.paper" }}>
                <Box display="flex" alignItems="center">
                  {currentFolder && <IconButton size="small" onClick={handleBack} sx={{ mr: 1, bgcolor: isDark ? alpha('#fff', 0.05) : alpha(theme.palette.primary.main, 0.05) }}><ArrowBackIcon fontSize="small" /></IconButton>}
                  <Breadcrumbs separator={<ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />}>
                    <MuiLink component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(null)} sx={{ display: "flex", alignItems: "center", fontWeight: !currentFolder ? 700 : 500, color: !currentFolder ? 'primary.main' : 'text.secondary' }}>
                      <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />{currentCategoryName}
                    </MuiLink>
                    {breadcrumbs.map((folder, index) => (
                      <MuiLink key={folder.folder_id} component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(folder, index)} sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {folder.folder_name}
                      </MuiLink>
                    ))}
                    {currentFolder && <Typography color="text.primary" fontWeight={700}>{currentFolder.folder_name}</Typography>}
                  </Breadcrumbs>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="outlined" startIcon={<CreateNewFolderIcon />} onClick={() => setDialogs(p => ({ ...p, createFolder: true }))} size="small" sx={{ borderRadius: 1.5, fontWeight: 600 }}>Tạo thư mục</Button>
                  {currentFolder && <Button variant="contained" disableElevation startIcon={<UploadFileIcon />} onClick={() => setDialogs(p => ({ ...p, upload: true }))} size="small" sx={{ borderRadius: 1.5, fontWeight: 600 }}>Tải lên</Button>}
                </Stack>
              </Paper>

              <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
                {currentViewData.folders.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700} sx={{ mb: 2 }}>THƯ MỤC ({currentViewData.folders.length})</Typography>
                    <Grid container spacing={2}>
                      {currentViewData.folders.map(folder => (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={`folder-${folder.folder_id}`}>
                          <Paper
                            elevation={0} variant="outlined"
                            onClick={() => handleEnterFolder(folder)}
                            sx={{
                              p: 2, textAlign: "center", cursor: "pointer", borderRadius: 3, position: "relative",
                              bgcolor: "background.paper", borderColor: isDark ? theme.palette.midnight?.border : "divider",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                borderColor: "primary.main",
                                boxShadow: isDark ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}` : "0 4px 12px rgba(0,0,0,0.06)",
                                transform: "translateY(-2px)",
                                "& .del-btn": { opacity: 1 }
                              }
                            }}
                          >
                            <IconButton className="del-btn" size="small" color="error" sx={{ position: "absolute", top: 4, right: 4, opacity: 0, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : "rgba(255,255,255,0.9)", '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }} onClick={(e) => handleDeleteClick(e, folder, "folder")}><DeleteOutlineIcon fontSize="small" /></IconButton>
                            <FolderIcon sx={{ fontSize: 52, color: "#FFC107", mb: 1.5 }} />
                            <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>{folder.folder_name}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {currentViewData.files.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700} sx={{ mb: 2 }}>TÀI LIỆU ({currentViewData.files.length})</Typography>
                    <Grid container spacing={2}>
                      {currentViewData.files.map(file => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`file-${file.did}`}>
                          <Paper
                            elevation={0} variant="outlined"
                            onClick={(e) => handlePreviewClick(e, file)}
                            sx={{
                              p: 2, display: "flex", alignItems: "center", cursor: "pointer", borderRadius: 3, position: "relative",
                              bgcolor: "background.paper", borderColor: isDark ? theme.palette.midnight?.border : "divider",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                borderColor: "primary.main",
                                boxShadow: isDark ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}` : "0 4px 12px rgba(0,0,0,0.06)",
                                transform: "translateY(-2px)",
                                "& .actions": { opacity: 1 }
                              }
                            }}
                          >
                            <Stack className="actions" direction="row" sx={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", opacity: 0, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : "rgba(255,255,255,0.9)", borderRadius: 1.5, p: 0.5 }}>
                              <Tooltip title="Xem / Tải">
                                <IconButton size="small" color="primary" onClick={(e) => handlePreviewClick(e, file)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <Box mr={2.5} sx={{ display: 'flex', alignItems: 'center' }}><FileIcon mimeType={file.file_type} /></Box>
                            <Box overflow="hidden" sx={{ pr: 4 }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap title={file.title}>{file.title}</Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>Phiên bản {file.version}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {currentViewData.folders.length === 0 && currentViewData.files.length === 0 && (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60%" opacity={0.5}>
                    <FolderOpenIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>Thư mục trống</Typography>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary" flexDirection="column">
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>👋 Chào mừng!</Typography>
              <Typography variant="body1">Vui lòng chọn Chương/Bài học ở menu bên trái để bắt đầu quản lý tài liệu.</Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <Menu open={Boolean(planMenuAnchor)} anchorEl={planMenuAnchor} onClose={() => setPlanMenuAnchor(null)} PaperProps={{ sx: { borderRadius: 2, backgroundImage: 'none', mt: 1 } }}>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setTempData({ initialName: planInfo?.title }); setDialogs(p => ({ ...p, editPlanName: true })); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên giáo án</ListItemText></MenuItem>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); if (window.confirm("Gỡ giáo án khỏi lớp?")) updateClass(classId, { plan_id: null }, token).then(() => { showToast("Đã gỡ"); if (onRemovePlan) onRemovePlan(); }); }}><ListItemIcon><LinkOffIcon fontSize="small" /></ListItemIcon><ListItemText>Gỡ khỏi lớp</ListItemText></MenuItem>
        <Divider />
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setDeleteConfirm({ open: true, item: { id: planId }, type: "plan" }); }}><ListItemIcon><DeleteForeverIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main", fontWeight: 600 }}>Xóa vĩnh viễn</ListItemText></MenuItem>
      </Menu>

      <Menu open={Boolean(contextMenu)} anchorEl={contextMenu} onClose={() => setContextMenu(null)} PaperProps={{ sx: { borderRadius: 2, backgroundImage: 'none' } }}>
        <MenuItem onClick={() => { setTempData({ categoryId: contextTargetId, initialName: "..." }); setDialogs(p => ({ ...p, editCategory: true })); setContextMenu(null); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên</ListItemText></MenuItem>
        <MenuItem onClick={() => { setDeleteConfirm({ open: true, item: { id: contextTargetId, name: "mục này" }, type: "category" }); setContextMenu(null); }}><ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main", fontWeight: 600 }}>Xóa</ListItemText></MenuItem>
      </Menu>

      <NameInputDialog open={dialogs.createCategory} onClose={() => setDialogs(p => ({ ...p, createCategory: false }))} onSubmit={handleCreateCategory} title={tempData.parentId ? "Thêm bài học" : "Thêm chương mới"} label="Tên mục" loading={actionLoading} />
      <NameInputDialog open={dialogs.createFolder} onClose={() => setDialogs(p => ({ ...p, createFolder: false }))} onSubmit={handleCreateFolder} title="Tạo thư mục" label="Tên thư mục" loading={actionLoading} />
      <UploadFileDialog open={dialogs.upload} onClose={() => setDialogs(p => ({ ...p, upload: false }))} onSubmit={handleUpload} loading={actionLoading} />

      <FilePreviewDialog
        open={!!previewFile}
        onClose={handleClosePreview}
        fileData={previewFile}
      />

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: 3, p: 1, backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn xóa <strong>{deleteConfirm.item?.name || "mục này"}</strong>?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(p => ({ ...p, open: false }))} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disableElevation sx={{ borderRadius: 2, fontWeight: 700 }}>Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResourceManager;