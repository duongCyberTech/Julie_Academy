import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
  CircularProgress,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { io } from "socket.io-client";

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
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

// --- SERVICES ---
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateBook,
  deleteBook,
  getPlanDetail,
} from "../../services/CategoryService";
import { updateClass } from "../../services/ClassService";
import {
  getFoldersByClass,
  createFolder,
  uploadResource,
  deleteFolder,
  // Không import deleteResource vì chưa có
} from "../../services/ResourceService";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ============================================================================
// SUB-COMPONENTS (Dialogs, Icons)
// ============================================================================

const FileIcon = ({ mimeType }) => {
  if (mimeType?.includes("pdf")) return <PictureAsPdfIcon color="error" fontSize="large" />;
  if (mimeType?.includes("image")) return <DescriptionIcon color="warning" fontSize="large" />;
  return <DescriptionIcon color="primary" fontSize="large" />;
};

// --- PREVIEW & DOWNLOAD DIALOG (Socket.io) ---
const FilePreviewDialog = ({ open, onClose, fileData }) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const chunksRef = useRef([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (open && fileData) {
      startStreaming();
    }
    // Cleanup khi đóng dialog
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      chunksRef.current = [];
      setProgress(0);
      setIsDownloading(false);
      setError(null);
    };
  }, [open, fileData]);

  const startStreaming = () => {
    setIsDownloading(true);
    setProgress(0);
    setError(null);
    chunksRef.current = [];
    
    // Kết nối Socket
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      // Gửi sự kiện yêu cầu tải file
      socket.emit("START_DOWNLOAD", { docsId: fileData.did, startByte: 0 });
    });

    socket.on("CHUNK", (payload) => {
      // Decode base64 chunk
      const binaryString = window.atob(payload.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      chunksRef.current.push(bytes);
      setProgress(payload.progress);
    });

    socket.on("COMPLETE", () => {
      setIsDownloading(false);
      setProgress(100);
      const blob = new Blob(chunksRef.current, { type: fileData.file_type });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    });

    socket.on("ERROR", (err) => {
      console.error("Socket error:", err);
      setError(err.message || "Lỗi tải file");
      setIsDownloading(false);
    });
  };

  const handleDownloadToDisk = () => {
    if (!blobUrl) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileData.title || "downloaded-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" noWrap sx={{ maxWidth: 400 }}>
            {fileData?.title || "Xem tài liệu"}
          </Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ height: "70vh", p: 0, display: "flex", flexDirection: "column", bgcolor: "#f5f5f5" }}>
        {isDownloading ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress variant="determinate" value={progress} size={60} />
            <Typography mt={2}>Đang tải dữ liệu... {Math.round(progress)}%</Typography>
            <Box sx={{ width: "50%", mx: "auto", mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          </Box>
        ) : error ? (
           <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "error.main" }}>
             <Typography>{error}</Typography>
           </Box>
        ) : blobUrl ? (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", overflow: "hidden", bgcolor: "#eee" }}>
            {fileData.file_type?.includes("image") ? (
              <img src={blobUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="preview" />
            ) : fileData.file_type?.includes("pdf") ? (
              <iframe src={blobUrl} width="100%" height="100%" style={{ border: "none" }} title="pdf-preview" />
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Typography>Không hỗ trợ xem trước định dạng này.</Typography>
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isDownloading && blobUrl && (
          <Button variant="contained" startIcon={<CloudDownloadIcon />} onClick={handleDownloadToDisk}>
            Tải về máy
          </Button>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// --- SIMPLE INPUT DIALOGS ---
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
// MAIN COMPONENT: RESOURCE MANAGER
// ============================================================================

const ResourceManager = ({ classId, planId, tutorId, token, onRemovePlan }) => {
  // --- STATE ---
  const [planInfo, setPlanInfo] = useState(null);
  const [rawCategories, setRawCategories] = useState([]); // Dữ liệu phẳng từ API
  const [folderTree, setFolderTree] = useState([]);       // Folder/Files từ API

  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // ID của Chương/Bài đang chọn
  const [currentFolder, setCurrentFolder] = useState(null);           // Folder đang xem (null = root của category)
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Dialog states
  const [dialogs, setDialogs] = useState({
    upload: false,
    createCategory: false,
    editCategory: false,
    createFolder: false,
    editPlanName: false,
  });

  // Context Menu & Selection
  const [planMenuAnchor, setPlanMenuAnchor] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextTargetId, setContextTargetId] = useState(null);

  // Temporary Data for Actions
  const [tempData, setTempData] = useState({ parentId: null, categoryId: null, initialName: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, type: null });
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

      // Xử lý chuẩn hóa dữ liệu category
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

  // --- TREE VIEW BUILDING LOGIC (Đã sửa lỗi thêm không vào cây) ---
  const categoryTreeData = useMemo(() => {
    if (!rawCategories || rawCategories.length === 0) return [];

    // 1. Helper chuẩn hóa ID về String để so sánh chính xác
    const getItemId = (itm) => String(itm.id ?? itm.category_id ?? itm._id ?? "");
    const getParentId = (itm) => {
      const pid = itm.parent_id ?? itm.parentId ?? itm.parent_category_id;
      // Quy ước: null, undefined, 0, "0", "null" đều là ROOT
      if (!pid || pid === 0 || String(pid) === "0" || String(pid) === "null") return null;
      return String(pid);
    };

    // 2. Tạo Map để handle cha giả (nếu dữ liệu bị thiếu cha)
    const parentMap = new Map();
    const allItemIds = new Set(rawCategories.map(getItemId));

    rawCategories.forEach(item => {
      const pid = getParentId(item);
      if (pid && !allItemIds.has(pid)) {
        if (!parentMap.has(pid)) {
          parentMap.set(pid, {
             id: pid, 
             category_id: pid, 
             category_name: item.description || "Danh mục gốc", 
             parent_id: null,
             isFake: true 
          });
        }
      }
    });

    // Gộp data thật và data cha giả
    const allNodes = [...Array.from(parentMap.values()), ...rawCategories];

    // 3. Hàm đệ quy dựng cây
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
            children: buildTree(items, itemId), // Đệ quy tìm con
          };
        });
    };

    return buildTree(allNodes, null);
  }, [rawCategories]);

  // --- EVENT HANDLERS ---

  const handleTreeSelection = (event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;
    if (selectedId) {
      setSelectedCategoryId(selectedId);
      setCurrentFolder(null); // Reset view bên phải về root
      setBreadcrumbs([]);
    } else {
      setSelectedCategoryId(null);
    }
  };

  const handleAddCategoryClick = () => {
    setTempData({ parentId: selectedCategoryId || null });
    setDialogs(p => ({ ...p, createCategory: true }));
  };

  // Logic tạo Category (Bắt buộc loadData sau khi tạo để cập nhật cây)
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
      
      // Load lại để API trả về danh sách mới nhất
      await loadData();
      
      showToast(tempData.parentId ? "Đã thêm bài học" : "Đã thêm chương mới");
    } catch (e) {
      console.error(e);
      showToast("Lỗi tạo mục lục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Logic hiển thị File/Folder
  const currentViewData = useMemo(() => {
    if (!selectedCategoryId) return { folders: [], files: [] };

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

    if (currentFolder) {
      const activeNode = findFolderNode(folderTree, currentFolder.folder_id);
      return activeNode ? { folders: activeNode.children || [], files: activeNode.resources || [] } : { folders: [], files: [] };
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
      await uploadResource(currentFolder.folder_id, file, metaData, token);
      setDialogs(p => ({ ...p, upload: false }));
      await loadData(); // Reload để file mới hiện ra
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
        showToast("Đã xóa thư mục và toàn bộ file con");
      } else if (type === "category") {
        await deleteCategory(item.id, "FORCE", token);
        showToast("Đã xóa mục lục");
        setSelectedCategoryId(null);
      } else if (type === "plan") {
        await deleteBook(item.id, "FORCE", token);
        showToast("Đã xóa giáo án vĩnh viễn");
        if(onRemovePlan) onRemovePlan();
      } 
      // Không có block xóa "file" vì chưa có API
      
      await loadData();
      setDeleteConfirm({ open: false, item: null, type: null });
    } catch (e) {
      showToast("Lỗi khi xóa", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkPlan = async () => {
    if (!window.confirm("Bạn chắc chắn muốn gỡ giáo án này khỏi lớp? (Dữ liệu không mất)")) return;
    setActionLoading(true);
    try {
      await updateClass(classId, { plan_id: null }, token);
      showToast("Đã gỡ giáo án khỏi lớp");
      if (onRemovePlan) onRemovePlan();
    } catch (e) {
      showToast("Lỗi gỡ giáo án", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Helpers Navigation
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

  // ==========================================================================
  // RENDER UI
  // ==========================================================================
  return (
    <Box sx={{ height: "75vh", display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} sx={{ flexGrow: 1, height: "100%" }}>
        
        {/* --- LEFT: TREE VIEW --- */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", bgcolor: "background.paper", height: "100%", overflow: "hidden" }}>
          {/* Header */}
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

            {/* Smart Add Button */}
            <Box mt={1} display="flex" gap={1}>
              <Button
                variant="contained" size="small" fullWidth
                startIcon={selectedCategoryId ? <AddCircleIcon /> : <AddBoxIcon />}
                color={selectedCategoryId ? "secondary" : "primary"}
                onClick={handleAddCategoryClick}
                sx={{ textTransform: "none", fontSize: "0.85rem", boxShadow: "none" }}
              >
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
            
            {/* Selection Info */}
            {selectedCategoryId && (
              <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mt={0.5}>
                Đang chọn: <b>{currentCategoryName}</b>
                <MuiLink component="button" onClick={() => setSelectedCategoryId(null)} sx={{ ml: 1, cursor: "pointer", verticalAlign: "baseline" }}>(Huỷ chọn)</MuiLink>
              </Typography>
            )}
          </Box>

          {/* Tree Content */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1, minHeight: 0 }}>
            {categoryTreeData.length > 0 ? (
              <RichTreeView
                items={categoryTreeData}
                slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                onSelectedItemsChange={handleTreeSelection}
                selectedItems={selectedCategoryId ? [selectedCategoryId] : []}
                slotProps={{
                   item: (ownerState) => ({
                      onContextMenu: (e) => {
                        e.preventDefault(); e.stopPropagation();
                        setContextTargetId(ownerState.itemId);
                        setContextMenu(e.currentTarget);
                      }
                   })
                }}
              />
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="caption" color="text.secondary">Chưa có mục lục. Bấm "Thêm chương mới".</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* --- RIGHT: CONTENT VIEW --- */}
        <Grid size={{ xs: 12, md: 9 }} sx={{ display: "flex", flexDirection: "column", bgcolor: "#f4f6f8", height: "100%", overflow: "hidden" }}>
          {selectedCategoryId ? (
            <>
              {/* Breadcrumbs & Toolbar */}
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
                  {currentFolder && (
                    <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setDialogs(p => ({ ...p, upload: true }))} size="small">Tải lên</Button>
                  )}
                </Stack>
              </Paper>

              {/* Folders & Files Grid */}
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
                              {/* Đã ẩn nút Xóa File theo yêu cầu */}
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

                {/* Empty State */}
                {currentViewData.folders.length === 0 && currentViewData.files.length === 0 && (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60%" opacity={0.6}>
                    <FolderOpenIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Thư mục trống</Typography>
                    <Typography variant="body2" color="text.disabled">{currentFolder ? "Hãy tải lên tài liệu" : "Hãy tạo thư mục mới"}</Typography>
                  </Box>
                )}
              </Box>
            </>
          ) : (
             <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary" flexDirection="column">
                <Typography variant="h6" gutterBottom>👋 Chào mừng bạn!</Typography>
                <Typography>Chọn một <strong>Chương/Bài học</strong> từ danh sách bên trái để quản lý.</Typography>
             </Box>
          )}
        </Grid>
      </Grid>

      {/* --- MENUS & DIALOGS --- */}
      <Menu open={Boolean(planMenuAnchor)} anchorEl={planMenuAnchor} onClose={() => setPlanMenuAnchor(null)}>
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setTempData({ initialName: planInfo?.title }); setDialogs(p => ({ ...p, editPlanName: true })); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên giáo án</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUnlinkPlan}>
          <ListItemIcon><LinkOffIcon fontSize="small" /></ListItemIcon><ListItemText>Gỡ khỏi lớp</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setPlanMenuAnchor(null); setDeleteConfirm({ open: true, item: { id: planId }, type: "plan" }); }}>
          <ListItemIcon><DeleteForeverIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }}>Xóa vĩnh viễn</ListItemText>
        </MenuItem>
      </Menu>

      <Menu open={Boolean(contextMenu)} anchorEl={contextMenu} onClose={() => setContextMenu(null)}>
        <MenuItem onClick={() => { setTempData({ categoryId: contextTargetId, initialName: "..." }); setDialogs(p => ({ ...p, editCategory: true })); setContextMenu(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Đổi tên</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setDeleteConfirm({ open: true, item: { id: contextTargetId, name: "mục này" }, type: "category" }); setContextMenu(null); }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon><ListItemText sx={{ color: "error.main" }}>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <NameInputDialog open={dialogs.createCategory} onClose={() => setDialogs(p => ({ ...p, createCategory: false }))} onSubmit={handleCreateCategory} title={tempData.parentId ? "Thêm bài học" : "Thêm chương mới"} label="Tên mục" loading={actionLoading} />
      <NameInputDialog open={dialogs.createFolder} onClose={() => setDialogs(p => ({ ...p, createFolder: false }))} onSubmit={handleCreateFolder} title="Tạo thư mục" label="Tên thư mục" loading={actionLoading} />
      
      <UploadFileDialog open={dialogs.upload} onClose={() => setDialogs(p => ({ ...p, upload: false }))} onSubmit={handleUpload} loading={actionLoading} />
      
      <FilePreviewDialog open={!!previewFile} onClose={() => setPreviewFile(null)} fileData={previewFile} />

      {/* Confirm Delete */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(p => ({ ...p, open: false }))}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa <strong>{deleteConfirm.item?.name || "mục này"}</strong>?</Typography>
          {deleteConfirm.type === "folder" && <Alert severity="warning" sx={{ mt: 1 }}>Cảnh báo: Xóa thư mục sẽ xóa toàn bộ file bên trong!</Alert>}
          {deleteConfirm.type === "plan" && <Alert severity="error" sx={{ mt: 1 }}>Hành động này sẽ xóa vĩnh viễn giáo án!</Alert>}
          {deleteConfirm.type === "category" && <Alert severity="warning" sx={{ mt: 1 }}>Xóa mục này sẽ mất hết bài học con và tài nguyên!</Alert>}
        </DialogContent>
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