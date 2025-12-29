import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

// --- ICONS ---
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

// --- SERVICES ---
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  deleteBook,
  getPlanDetail,
} from "../../services/CategoryService";
import { updateClass } from "../../services/ClassService";
import {
  getFoldersByClass,
  createFolder,
  uploadResource,
  deleteFolder,
} from "../../services/ResourceService";

import FilePreviewDialog from "../../components/FilePreviewDialog";

// ============================================================================
// HELPER FUNCTIONS 
// ============================================================================

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

// ============================================================================
// SUB-COMPONENTS (Nhỏ lẻ để lại đây cũng được)
// ============================================================================

const FileIcon = ({ mimeType }) => {
  if (mimeType?.includes("pdf")) return <PictureAsPdfIcon color="error" fontSize="large" />;
  if (mimeType?.includes("image")) return <DescriptionIcon color="warning" fontSize="large" />;
  return <DescriptionIcon color="primary" fontSize="large" />;
};

const NameInputDialog = ({ open, onClose, onSubmit, title, label, initialValue = "", loading }) => {
  const [name, setName] = useState(initialValue);
  useEffect(() => { if (open) setName(initialValue); }, [open, initialValue]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label={label} fullWidth value={name} onChange={(e) => setName(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSubmit(name)} variant="contained" disabled={!name || loading}>{loading ? "Lưu..." : "Lưu"}</Button>
      </DialogActions>
    </Dialog>
  );
};

const UploadFileDialog = ({ open, onClose, onSubmit, loading }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const handleSubmit = () => {
    if (file && title) {
      onSubmit(file, { title, description: desc });
      setFile(null); setTitle(""); setDesc("");
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tải lên tài liệu</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Button variant="outlined" component="label" fullWidth sx={{ height: 80, borderStyle: "dashed" }}>
            {file ? file.name : "Chọn file từ máy tính"}
            <input type="file" hidden onChange={(e) => { const f = e.target.files[0]; if (f) { setFile(f); setTitle(f.name); } }} />
          </Button>
          <TextField label="Tên hiển thị" fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Mô tả (tùy chọn)" fullWidth size="small" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!file || !title || loading}>{loading ? "Đang tải..." : "Tải lên"}</Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ResourceManager = ({ classId, planId, token, onRemovePlan }) => {
  // --- STATE ---
  const [planInfo, setPlanInfo] = useState(null);
  const [rawCategories, setRawCategories] = useState([]);
  const [folderTree, setFolderTree] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [dialogs, setDialogs] = useState({
    upload: false,
    createCategory: false,
    editCategory: false,
    createFolder: false,
    editPlanName: false,
  });

  const [planMenuAnchor, setPlanMenuAnchor] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextTargetId, setContextTargetId] = useState(null);

  const [tempData, setTempData] = useState({ parentId: null, categoryId: null, initialName: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, type: null });
  
  // State điều khiển preview file
  const [previewFile, setPreviewFile] = useState(null);

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  // --- DATA LOADING ---
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
      console.error("Load Data Error:", e);
      showToast("Lỗi tải dữ liệu", "error");
    }
  }, [planId, classId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- TREE BUILDING ---
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
        .filter(item => {
           const itemPid = getParentId(item);
           return itemPid === targetParentId;
        })
        .map(item => {
          const itemId = getItemId(item);
          return {
            id: itemId,
            label: String(item.name ?? item.category_name ?? "No Name"),
            children: buildTree(items, itemId),
          };
        });
    };
    return buildTree(allNodes, null);
  }, [rawCategories]);

  // --- HANDLERS ---
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
      // 1. Upload
      const response = await uploadResource(currentFolder.folder_id, file, metaData, token);
      const newUploadedFile = response?.data || response; 

      setDialogs(p => ({ ...p, upload: false }));

      // 2. Optimistic UI Update (Không gọi loadData để tránh race condition)
      setFolderTree(prevTree => addFileToFolderState(prevTree, currentFolder.folder_id, newUploadedFile));

      showToast("Upload thành công");
    } catch (e) {
      console.error(e);
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
        await deleteCategory(item.id, "FORCE", token);
        setSelectedCategoryId(null);
      } else if (type === "plan") {
        await deleteBook(item.id, "FORCE", token);
        if(onRemovePlan) onRemovePlan();
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
      setBreadcrumbs(prev => prev.slice(0, index + 1));
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

  return (
    <Box sx={{ height: "75vh", display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} sx={{ flexGrow: 1, height: "100%" }}>
        {/* LEFT PANEL: TREE VIEW */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", bgcolor: "background.paper", height: "100%", overflow: "hidden" }}>
          <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="background.default" sx={{ flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Box sx={{ overflow: "hidden", mr: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontSize="0.75rem">GIÁO ÁN</Typography>
                <Typography variant="body1" fontWeight="bold" noWrap title={planInfo?.title}>
                  {planInfo?.title || "Đang tải..."}
                </Typography>
              </Box>
              <Tooltip title="Cài đặt">
                <IconButton size="small" onClick={(e) => setPlanMenuAnchor(e.currentTarget)}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box mt={1} display="flex" gap={1}>
              <Button variant="contained" size="small" fullWidth startIcon={selectedCategoryId ? <AddCircleIcon /> : <AddBoxIcon />} color={selectedCategoryId ? "secondary" : "primary"} onClick={handleAddCategoryClick} sx={{ textTransform: "none", fontSize: "0.85rem", boxShadow: "none" }}>
                {selectedCategoryId ? "Thêm bài học" : "Thêm chương mới"}
              </Button>
              {selectedCategoryId && (
                <Tooltip title="Xóa mục này">
                  <Button variant="outlined" color="error" size="small" onClick={() => setDeleteConfirm({ open: true, item: { id: selectedCategoryId, name: currentCategoryName }, type: "category" })} sx={{ minWidth: "40px", px: 0 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </Button>
                </Tooltip>
              )}
            </Box>
            {selectedCategoryId && (
              <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mt={0.5}>
                Đang chọn: <b>{currentCategoryName}</b>
                <MuiLink component="button" onClick={() => setSelectedCategoryId(null)} sx={{ ml: 1, cursor: "pointer", verticalAlign: "baseline" }}>(Huỷ chọn)</MuiLink>
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
              />
            ) : (
              <Box p={3} textAlign="center"><Typography variant="caption" color="text.secondary">Chưa có mục lục.</Typography></Box>
            )}
          </Box>
        </Grid>

        {/* RIGHT PANEL: CONTENT */}
        <Grid size={{ xs: 12, md: 9 }} sx={{ display: "flex", flexDirection: "column", bgcolor: "#f4f6f8", height: "100%", overflow: "hidden" }}>
          {selectedCategoryId ? (
            <>
              <Paper square elevation={0} sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <Box display="flex" alignItems="center">
                  {currentFolder && <IconButton size="small" onClick={handleBack} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>}
                  <Breadcrumbs>
                    <MuiLink component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(null)} sx={{ display: "flex", alignItems: "center", fontWeight: !currentFolder ? "bold" : "normal" }}>
                      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />{currentCategoryName}
                    </MuiLink>
                    {breadcrumbs.map((folder, index) => (
                      <MuiLink key={folder.folder_id} component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(folder, index)}>{folder.folder_name}</MuiLink>
                    ))}
                    {currentFolder && <Typography color="text.primary" fontWeight="bold">{currentFolder.folder_name}</Typography>}
                  </Breadcrumbs>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<CreateNewFolderIcon />} onClick={() => setDialogs(p => ({ ...p, createFolder: true }))} size="small">Tạo thư mục</Button>
                  {currentFolder && <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setDialogs(p => ({ ...p, upload: true }))} size="small">Tải lên</Button>}
                </Stack>
              </Paper>

              <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
                {/* Folders */}
                {currentViewData.folders.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>THƯ MỤC ({currentViewData.folders.length})</Typography>
                    <Grid container spacing={2}>
                      {currentViewData.folders.map(folder => (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={`folder-${folder.folder_id}`}>
                          <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: "center", cursor: "pointer", borderRadius: 2, position: "relative", "&:hover": { bgcolor: "#fff", borderColor: "primary.main", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", "& .del-btn": { opacity: 1 } } }} onClick={() => handleEnterFolder(folder)}>
                            <IconButton className="del-btn" size="small" color="error" sx={{ position: "absolute", top: 4, right: 4, opacity: 0, bgcolor: "rgba(255,255,255,0.8)" }} onClick={(e) => handleDeleteClick(e, folder, "folder")}><DeleteOutlineIcon fontSize="small" /></IconButton>
                            <FolderIcon sx={{ fontSize: 48, color: "#FFC107", mb: 1 }} />
                            <Typography variant="body2" fontWeight="500" noWrap>{folder.folder_name}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {/* Files */}
                {currentViewData.files.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>TÀI LIỆU ({currentViewData.files.length})</Typography>
                    <Grid container spacing={2}>
                      {currentViewData.files.map(file => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`file-${file.did}`}>
                          <Paper elevation={0} variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center", cursor: "pointer", borderRadius: 2, position: "relative", "&:hover": { bgcolor: "#fff", borderColor: "primary.main", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", "& .actions": { opacity: 1 } } }} onClick={() => setPreviewFile(file)}>
                            <Stack className="actions" direction="row" sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", opacity: 0, bgcolor: "rgba(255,255,255,0.9)", borderRadius: 1 }}>
                              <Tooltip title="Xem / Tải"><IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                            </Stack>
                            <Box mr={2}><FileIcon mimeType={file.file_type} /></Box>
                            <Box overflow="hidden" sx={{ mr: 4 }}>
                              <Typography variant="body2" fontWeight="600" noWrap title={file.title}>{file.title}</Typography>
                              <Typography variant="caption" color="text.secondary">V{file.version}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {currentViewData.folders.length === 0 && currentViewData.files.length === 0 && (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60%" opacity={0.6}><FolderOpenIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} /><Typography variant="h6" color="text.secondary">Thư mục trống</Typography></Box>
                )}
              </Box>
            </>
          ) : (
             <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary" flexDirection="column"><Typography variant="h6">👋 Chào mừng!</Typography><Typography>Chọn Chương/Bài học bên trái.</Typography></Box>
          )}
        </Grid>
      </Grid>

      {/* --- DIALOGS & MENUS --- */}
      <Menu open={Boolean(planMenuAnchor)} anchorEl={planMenuAnchor} onClose={() => setPlanMenuAnchor(null)}>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setTempData({ initialName: planInfo?.title }); setDialogs(p => ({ ...p, editPlanName: true })); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên giáo án</ListItemText></MenuItem>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); if(window.confirm("Gỡ giáo án khỏi lớp?")) updateClass(classId, { plan_id: null }, token).then(() => { showToast("Đã gỡ"); if(onRemovePlan) onRemovePlan(); }); }}><ListItemIcon><LinkOffIcon fontSize="small" /></ListItemIcon><ListItemText>Gỡ khỏi lớp</ListItemText></MenuItem>
        <Divider />
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setDeleteConfirm({ open: true, item: { id: planId }, type: "plan" }); }}><ListItemIcon><DeleteForeverIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }}>Xóa vĩnh viễn</ListItemText></MenuItem>
      </Menu>

      <Menu open={Boolean(contextMenu)} anchorEl={contextMenu} onClose={() => setContextMenu(null)}>
        <MenuItem onClick={() => { setTempData({ categoryId: contextTargetId, initialName: "..." }); setDialogs(p => ({ ...p, editCategory: true })); setContextMenu(null); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên</ListItemText></MenuItem>
        <MenuItem onClick={() => { setDeleteConfirm({ open: true, item: { id: contextTargetId, name: "mục này" }, type: "category" }); setContextMenu(null); }}><ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }}>Xóa</ListItemText></MenuItem>
      </Menu>

      <NameInputDialog open={dialogs.createCategory} onClose={() => setDialogs(p => ({ ...p, createCategory: false }))} onSubmit={handleCreateCategory} title={tempData.parentId ? "Thêm bài học" : "Thêm chương mới"} label="Tên mục" loading={actionLoading} />
      <NameInputDialog open={dialogs.createFolder} onClose={() => setDialogs(p => ({ ...p, createFolder: false }))} onSubmit={handleCreateFolder} title="Tạo thư mục" label="Tên thư mục" loading={actionLoading} />
      <UploadFileDialog open={dialogs.upload} onClose={() => setDialogs(p => ({ ...p, upload: false }))} onSubmit={handleUpload} loading={actionLoading} />
      
      {/* --- PREVIEW DIALOG ---
         - Chỉ truyền props, không chứa logic phức tạp.
         - Logic an toàn đã nằm bên trong FilePreviewDialog.
      */}
      <FilePreviewDialog 
        open={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        fileData={previewFile} 
      />

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(p => ({ ...p, open: false }))}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn xóa <strong>{deleteConfirm.item?.name || "mục này"}</strong>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(p => ({ ...p, open: false }))} color="inherit">Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={closeToast} severity={toast.severity} sx={{ width: "100%" }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResourceManager;