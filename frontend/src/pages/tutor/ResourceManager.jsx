import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
<<<<<<< HEAD
=======
  useRef,
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
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
<<<<<<< HEAD
  Tooltip,
=======
  CircularProgress,
  Tooltip,
  LinearProgress,
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
<<<<<<< HEAD

// --- ICONS ---
=======
import { io } from "socket.io-client";

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
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
<<<<<<< HEAD
import VisibilityIcon from "@mui/icons-material/Visibility";
=======
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LinkOffIcon from "@mui/icons-material/LinkOff";
<<<<<<< HEAD
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

// --- SERVICES ---
import {
  getAllCategories,
  createCategory,
  deleteCategory,
=======

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateBook,
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
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

<<<<<<< HEAD
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
=======
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// --- Components Con (Helpers) ---

const FileIcon = ({ mimeType }) => {
  if (mimeType?.includes("pdf"))
    return <PictureAsPdfIcon color="error" fontSize="large" />;
  if (mimeType?.includes("image"))
    return <DescriptionIcon color="warning" fontSize="large" />;
  return <DescriptionIcon color="primary" fontSize="large" />;
};

const FilePreviewDialog = ({ open, onClose, fileData }) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const chunksRef = useRef([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (open && fileData) startStreaming();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      chunksRef.current = [];
      setProgress(0);
      setIsDownloading(false);
    };
  }, [open, fileData]);

  const startStreaming = () => {
    setIsDownloading(true);
    setProgress(0);
    setError(null);
    chunksRef.current = [];
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;
    socket.on("connect", () =>
      socket.emit("START_DOWNLOAD", { docsId: fileData.did, startByte: 0 })
    );
    socket.on("CHUNK", (payload) => {
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
      setBlobUrl(URL.createObjectURL(blob));
    });
    socket.on("ERROR", (err) => {
      setError(err.message);
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
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" noWrap sx={{ maxWidth: 400 }}>
            {fileData?.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ height: "70vh", p: 0, display: "flex", flexDirection: "column" }}
      >
        {isDownloading && (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              variant="determinate"
              value={progress}
              size={60}
            />
            <Typography mt={2}>Đang tải...</Typography>
            <Box sx={{ width: "50%", mx: "auto", mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          </Box>
        )}
        {!isDownloading && blobUrl && (
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "#eee",
              display: "flex",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {fileData.file_type?.includes("image") ? (
              <img
                src={blobUrl}
                style={{ maxWidth: "100%", objectFit: "contain" }}
                alt="preview"
              />
            ) : fileData.file_type?.includes("pdf") ? (
              <iframe
                src={blobUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="pdf-preview"
              />
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <Typography>Không hỗ trợ xem trước</Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isDownloading && blobUrl && (
          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            onClick={handleDownloadToDisk}
          >
            Tải về
          </Button>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

const NameInputDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  label,
  initialValue = "",
  loading,
}) => {
  const [name, setName] = useState(initialValue);
  useEffect(() => {
    if (open) setName(initialValue);
  }, [open, initialValue]);
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
<<<<<<< HEAD
        <TextField autoFocus margin="dense" label={label} fullWidth value={name} onChange={(e) => setName(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSubmit(name)} variant="contained" disabled={!name || loading}>{loading ? "Lưu..." : "Lưu"}</Button>
=======
        <TextField
          autoFocus
          margin="dense"
          label={label}
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={() => onSubmit(name)}
          variant="contained"
          disabled={!name || loading}
        >
          {loading ? "Lưu..." : "Lưu"}
        </Button>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
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
<<<<<<< HEAD
      setFile(null); setTitle(""); setDesc("");
=======
      setFile(null);
      setTitle("");
      setDesc("");
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tải lên tài liệu</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
<<<<<<< HEAD
          <Button variant="outlined" component="label" fullWidth sx={{ height: 80, borderStyle: "dashed" }}>
            {file ? file.name : "Chọn file từ máy tính"}
            <input type="file" hidden onChange={(e) => { const f = e.target.files[0]; if (f) { setFile(f); setTitle(f.name); } }} />
          </Button>
          <TextField label="Tên hiển thị" fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Mô tả (tùy chọn)" fullWidth size="small" value={desc} onChange={(e) => setDesc(e.target.value)} />
=======
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ height: 80, borderStyle: "dashed" }}
          >
            {file ? file.name : "Chọn file"}
            <input
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  setFile(f);
                  setTitle(f.name);
                }
              }}
            />
          </Button>
          <TextField
            label="Tên hiển thị"
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Mô tả"
            fullWidth
            size="small"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
<<<<<<< HEAD
        <Button onClick={handleSubmit} variant="contained" disabled={!file || !title || loading}>{loading ? "Đang tải..." : "Tải lên"}</Button>
=======
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!file || !title || loading}
        >
          {loading ? "..." : "Tải lên"}
        </Button>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      </DialogActions>
    </Dialog>
  );
};

<<<<<<< HEAD
// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ResourceManager = ({ classId, planId, token, onRemovePlan }) => {
  // --- STATE ---
=======
// --- Main Component ---

const ResourceManager = ({ classId, planId, tutorId, token, onRemovePlan }) => {
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  const [planInfo, setPlanInfo] = useState(null);
  const [rawCategories, setRawCategories] = useState([]);
  const [folderTree, setFolderTree] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);
<<<<<<< HEAD
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
=======

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [dialogs, setDialogs] = useState({
    upload: false,
    editPlanName: false,
    createCategory: false,
    editCategory: false,
    createFolder: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    item: null,
    type: null,
  });
  const [previewFile, setPreviewFile] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [contextTargetId, setContextTargetId] = useState(null);
  const [planMenuAnchor, setPlanMenuAnchor] = useState(null);

  const [tempData, setTempData] = useState({
    parentId: null,
    categoryId: null,
    initialName: "",
  });

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });
  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const loadData = useCallback(async () => {
    try {
      console.log("--- BẮT ĐẦU LOAD DATA ---");

      // 1. SỬA QUAN TRỌNG: Bỏ tham số mode: 'tree'.
      // Lấy dữ liệu phẳng an toàn hơn, để Frontend tự xử lý phân cấp.
      const [planRes, catsRes, folders] = await Promise.all([
        getPlanDetail(planId, token),
        getAllCategories({ plan_id: planId }, token), // <--- Đã xóa mode: 'tree'
        getFoldersByClass(classId, token),
      ]);

      console.log("Raw Response catsRes:", catsRes); // Log xem API trả về gì khi không có mode tree

      setPlanInfo(planRes);

      let nodes = [];
      // 2. Logic lấy dữ liệu linh hoạt hơn (Support cả mảng phẳng và phân trang)
      if (Array.isArray(catsRes)) {
        nodes = catsRes;
      } else if (catsRes && typeof catsRes === "object") {
        nodes = catsRes.data || catsRes.results || catsRes.items || [];
      }

      console.log("Nodes set vào State:", nodes); // Kiểm tra dữ liệu cuối cùng trước khi render

      setRawCategories(nodes);
      setFolderTree(folders || []);
    } catch (e) {
      console.error("Lỗi loadData:", e);
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      showToast("Lỗi tải dữ liệu", "error");
    }
  }, [planId, classId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

<<<<<<< HEAD
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
=======
  const categoryTreeData = useMemo(() => {
    let flattened = [];
    if (Array.isArray(rawCategories)) {
      rawCategories.forEach((item) => {
        if (Array.isArray(item)) flattened = flattened.concat(item);
        else if (item && (item.id || item.category_id)) flattened.push(item);
      });
    }
    if (flattened.length === 0) return [];
    const parentMap = new Map();
    flattened.forEach((item) => {
      const parentId =
        item.parent_id ?? item.parentId ?? item.parent_category_id;
      const description = item.description;
      if (parentId && !parentMap.has(parentId)) {
        const exists = flattened.some(
          (cat) => String(cat.id ?? cat.category_id) === String(parentId)
        );
        if (!exists) parentMap.set(parentId, description || "Danh mục cha");
      }
    });
    const parentNodes = Array.from(parentMap.entries()).map(([pid, desc]) => ({
      id: String(pid),
      category_id: String(pid),
      category_name: desc,
      parent_id: null,
      isParent: true,
    }));
    const allNodes = [...parentNodes, ...flattened];
    const buildTree = (items, parentId = null) => {
      return items
        .filter((item) => {
          const pid =
            item.parent_id ?? item.parentId ?? item.parent_category_id;
          return parentId === null
            ? pid === null || pid === undefined
            : String(pid) === String(parentId);
        })
        .map((item) => ({
          id: String(item.id ?? item.category_id),
          label: String(item.name ?? item.category_name ?? "No Name"),
          children: buildTree(items, item.id ?? item.category_id),
        }));
    };
    return buildTree(allNodes);
  }, [rawCategories]);

  const handleTreeSelection = (event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems)
      ? selectedItems[0]
      : selectedItems;
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    if (selectedId) {
      setSelectedCategoryId(selectedId);
      setCurrentFolder(null);
      setBreadcrumbs([]);
<<<<<<< HEAD
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
        await deleteCategory(planId, item.id, "FORCE", token);
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
=======
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
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

<<<<<<< HEAD
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
=======
  const currentViewData = useMemo(() => {
    if (!selectedCategoryId) return { folders: [], files: [] };
    const findFolderNode = (nodes, id) => {
      for (const node of nodes) {
        if (node.folder_id === id) return node;
        if (node.children) {
          const found = findFolderNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    if (currentFolder) {
      const activeNode = findFolderNode(folderTree, currentFolder.folder_id);
      if (activeNode) {
        return {
          folders: activeNode.children || [],
          files: activeNode.resources || [],
        };
      }
      return { folders: [], files: [] };
    } else {
      const rootFolders = folderTree.filter(
        (f) =>
          String(f.category_id) === String(selectedCategoryId) && !f.parent_id
      );
      return { folders: rootFolders, files: [] };
    }
  }, [selectedCategoryId, currentFolder, folderTree]);

  const handleEnterFolder = (folder) => {
    setBreadcrumbs((prev) => [...prev, currentFolder].filter(Boolean));
    setCurrentFolder(folder);
  };

  const handleBreadcrumbClick = (folder, index) => {
    if (!folder) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      setCurrentFolder(folder);
      setBreadcrumbs((prev) => prev.slice(0, index + 1));
    }
  };

  const handleBack = () => {
    if (breadcrumbs.length > 0) {
      const parent = breadcrumbs[breadcrumbs.length - 1];
      setCurrentFolder(parent);
      setBreadcrumbs((prev) => prev.slice(0, -1));
    } else {
      setCurrentFolder(null);
    }
  };

  const handleUpdatePlanName = async (newName) => {
    setActionLoading(true);
    try {
      await updateBook(planId, { title: newName }, token);
      setPlanInfo((prev) => ({ ...prev, title: newName }));
      setDialogs((p) => ({ ...p, editPlanName: false }));
      showToast("Đổi tên giáo án thành công");
    } catch (e) {
      showToast("Lỗi đổi tên", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkPlanAction = async () => {
    if (!window.confirm("Gỡ giáo án này khỏi lớp?")) return;
    try {
      await updateClass(classId, { plan_id: null }, token);
      onRemovePlan();
    } catch (e) {
      showToast("Lỗi gỡ giáo án", "error");
    }
  };

  const handleDeletePlanAction = async () => {
    setDeleteConfirm({
      open: true,
      item: { id: planId, name: planInfo?.title },
      type: "plan",
    });
    setPlanMenuAnchor(null);
  };

  const handleCreateCategory = async (name) => {
    setActionLoading(true);
    try {
      await createCategory(
        [
          {
            category_name: name,
            description: "Created by tutor",
            plan_id: planId,
            ...(tempData.parentId ? { parent_id: tempData.parentId } : {}),
          },
        ],
        token
      );
      setDialogs((p) => ({ ...p, createCategory: false }));
      loadData();
      showToast("Tạo mục lục thành công");
    } catch (e) {
      showToast("Lỗi tạo mục lục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (newName) => {
    setActionLoading(true);
    try {
      await updateCategory(
        tempData.categoryId,
        { category_name: newName },
        token
      );
      setDialogs((p) => ({ ...p, editCategory: false }));
      loadData();
      showToast("Cập nhật mục lục thành công");
    } catch (e) {
      showToast("Lỗi cập nhật", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm.item) return;
    setActionLoading(true);
    try {
      await deleteCategory(deleteConfirm.item.id, "FORCE", token);
      setDeleteConfirm({ open: false, item: null });
      loadData();
      showToast("Đã xóa mục lục");
    } catch (e) {
      showToast("Lỗi xóa mục lục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoryContextMenu = (event, itemId) => {
    event.preventDefault();
    event.stopPropagation();
    const targetId =
      itemId ||
      event.currentTarget.getAttribute("data-id") ||
      event.currentTarget.dataset.itemid;
    if (targetId) {
      setContextTargetId(targetId);
      setContextMenu(event.currentTarget);
    }
  };

  const handleCreateFolder = async (name) => {
    setActionLoading(true);
    try {
      await createFolder(
        classId,
        selectedCategoryId,
        {
          folder_name: name,
          parent_id: currentFolder?.folder_id,
        },
        token
      );
      setDialogs((p) => ({ ...p, createFolder: false }));
      loadData();
      showToast("Tạo thư mục thành công");
    } catch (e) {
      showToast("Lỗi tạo thư mục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpload = async (file, metaData) => {
    if (!currentFolder) return;
    setActionLoading(true);
    try {
      await uploadResource(currentFolder.folder_id, file, metaData, token);
      setDialogs((p) => ({ ...p, upload: false }));
      loadData();
      showToast("Upload thành công");
    } catch (e) {
      showToast("Lỗi upload", "error");
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
        showToast("Đã xóa thư mục");
        loadData();
      } else if (type === "category") {
        await handleDeleteCategory();
      } else if (type === "plan") {
        await deleteBook(item.id, "FORCE", token);
        showToast("Đã xóa giáo án");
        onRemovePlan();
      } else {
        showToast("Chức năng xóa file chưa hỗ trợ", "warning");
      }
      setDeleteConfirm({ open: false, item: null, type: null });
    } catch (e) {
      showToast("Lỗi khi xóa", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ height: "75vh", display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} sx={{ flexGrow: 1, height: "100%" }}>
        {/* --- LEFT SIDEBAR (CHAPTERS/LESSONS) --- */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            height: "100%", // Đảm bảo chiếm full chiều cao
            overflow: "hidden", // Ngăn grid item bị giãn theo nội dung
          }}
        >
          {/* Header Khu vực Giáo án */}
          <Box
            p={2}
            borderBottom="1px solid"
            borderColor="divider"
            bgcolor="background.default"
            sx={{ flexShrink: 0 }} // Header không bị co lại
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box sx={{ overflow: "hidden", mr: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontSize="0.75rem"
                >
                  GIÁO ÁN
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  noWrap
                  title={planInfo?.title}
                >
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                  {planInfo?.title || "Đang tải..."}
                </Typography>
              </Box>
              <Tooltip title="Cài đặt">
<<<<<<< HEAD
                <IconButton size="small" onClick={(e) => setPlanMenuAnchor(e.currentTarget)}>
=======
                <IconButton
                  size="small"
                  onClick={(e) => setPlanMenuAnchor(e.currentTarget)}
                >
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
<<<<<<< HEAD
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
=======
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<AddBoxIcon />}
                onClick={() => {
                  setTempData({ parentId: null });
                  setDialogs((p) => ({ ...p, createCategory: true }));
                }}
                sx={{ textTransform: "none", fontSize: "0.8rem" }}
              >
                + Chương
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<AddCircleIcon />}
                disabled={!selectedCategoryId}
                onClick={() => {
                  setTempData({ parentId: selectedCategoryId });
                  setDialogs((p) => ({ ...p, createCategory: true }));
                }}
                sx={{ textTransform: "none", fontSize: "0.8rem" }}
              >
                + Bài
              </Button>
            </Stack>
          </Box>

          {/* Danh sách cây thư mục (Có thanh cuộn) */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto", // Cho phép cuộn dọc
              p: 1,
              minHeight: 0, // QUAN TRỌNG: Giúp flex item co lại để hiện thanh cuộn
              // Tùy chỉnh thanh cuộn
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#bdbdbd",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#9e9e9e",
              },
            }}
          >
            {categoryTreeData.length > 0 ? (
              <RichTreeView
                items={categoryTreeData}
                slots={{
                  collapseIcon: ExpandMoreIcon,
                  expandIcon: ChevronRightIcon,
                }}
                onSelectedItemsChange={handleTreeSelection}
                selectedItems={selectedCategoryId ? [selectedCategoryId] : []}
                slotProps={{
                  item: (ownerState) => ({
                    "data-id": ownerState.itemId,
                    onContextMenu: (e) =>
                      handleCategoryContextMenu(e, ownerState.itemId),
                  }),
                }}
              />
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Chưa có mục lục.
                </Typography>
              </Box>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            )}
          </Box>
        </Grid>

<<<<<<< HEAD
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
=======
        {/* --- RIGHT CONTENT AREA --- */}
        <Grid
          size={{ xs: 12, md: 9 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f4f6f8",
            height: "100%", // Đảm bảo full chiều cao
            overflow: "hidden", // Ngăn cuộn ngoài
          }}
        >
          {selectedCategoryId ? (
            <>
              {/* Breadcrumbs & Actions Toolbar */}
              <Paper
                square
                elevation={0}
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0, // Không co lại
                }}
              >
                <Box display="flex" alignItems="center">
                  {currentFolder && (
                    <IconButton
                      size="small"
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  <Breadcrumbs aria-label="breadcrumb">
                    <MuiLink
                      component="button"
                      underline="hover"
                      color="inherit"
                      onClick={() => handleBreadcrumbClick(null)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: !currentFolder ? "bold" : "normal",
                      }}
                    >
                      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                      {currentCategoryName}
                    </MuiLink>
                    {breadcrumbs.map((folder, index) => (
                      <MuiLink
                        key={folder.folder_id}
                        component="button"
                        underline="hover"
                        color="inherit"
                        onClick={() => handleBreadcrumbClick(folder, index)}
                      >
                        {folder.folder_name}
                      </MuiLink>
                    ))}
                    {currentFolder && (
                      <Typography color="text.primary" fontWeight="bold">
                        {currentFolder.folder_name}
                      </Typography>
                    )}
                  </Breadcrumbs>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CreateNewFolderIcon />}
                    onClick={() =>
                      setDialogs((p) => ({ ...p, createFolder: true }))
                    }
                    size="small"
                  >
                    Tạo thư mục
                  </Button>
                  {currentFolder && (
                    <Button
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      onClick={() =>
                        setDialogs((p) => ({ ...p, upload: true }))
                      }
                      size="small"
                    >
                      Tải lên
                    </Button>
                  )}
                </Stack>
              </Paper>

              {/* Main Folder/File Content Area (Scrollable) */}
              <Box
                sx={{
                  p: 3,
                  flexGrow: 1,
                  overflowY: "auto", // Cho phép cuộn
                  minHeight: 0,
                }}
              >
                {currentViewData.folders.length > 0 && (
                  <Box mb={4}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      THƯ MỤC ({currentViewData.folders.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {currentViewData.folders.map((folder) => (
                        <Grid
                          size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                          key={`folder-${folder.folder_id}`}
                        >
                          <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                              p: 2,
                              textAlign: "center",
                              cursor: "pointer",
                              borderRadius: 2,
                              position: "relative",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: "#fff",
                                borderColor: "primary.main",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                transform: "translateY(-2px)",
                                "& .delete-btn": { opacity: 1 },
                              },
                            }}
                            onClick={() => handleEnterFolder(folder)}
                          >
                            <IconButton
                              className="delete-btn"
                              size="small"
                              color="error"
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                opacity: 0,
                                transition: "opacity 0.2s",
                                bgcolor: "rgba(255,255,255,0.8)",
                              }}
                              onClick={(e) =>
                                handleDeleteClick(e, folder, "folder")
                              }
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                            <FolderIcon
                              sx={{ fontSize: 48, color: "#FFC107", mb: 1 }}
                            />
                            <Typography variant="body2" fontWeight="500" noWrap>
                              {folder.folder_name}
                            </Typography>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
<<<<<<< HEAD
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
=======
                {currentViewData.files.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      TÀI LIỆU ({currentViewData.files.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {currentViewData.files.map((file) => (
                        <Grid
                          size={{ xs: 12, sm: 6, md: 4 }}
                          key={`file-${file.did}`}
                        >
                          <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                              p: 2,
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              borderRadius: 2,
                              position: "relative",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: "#fff",
                                borderColor: "primary.main",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                "& .action-btns": { opacity: 1 },
                              },
                            }}
                            onClick={() => setPreviewFile(file)}
                          >
                            <Stack
                              className="action-btns"
                              direction="row"
                              spacing={0}
                              sx={{
                                position: "absolute",
                                top: "50%",
                                right: 8,
                                transform: "translateY(-50%)",
                                opacity: 0,
                                transition: "opacity 0.2s",
                                bgcolor: "rgba(255,255,255,0.9)",
                                borderRadius: 1,
                              }}
                            >
                              <Tooltip title="Xem trước / Tải về">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewFile(file);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) =>
                                    handleDeleteClick(e, file, "file")
                                  }
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <Box mr={2}>
                              <FileIcon mimeType={file.file_type} />
                            </Box>
                            <Box overflow="hidden" sx={{ mr: 4 }}>
                              <Typography
                                variant="body2"
                                fontWeight="600"
                                noWrap
                                title={file.title}
                              >
                                {file.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                V{file.version} •{" "}
                                {file.num_pages
                                  ? (file.num_pages / 1024 / 1024).toFixed(2) +
                                    " MB"
                                  : "Unknown"}
                              </Typography>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
<<<<<<< HEAD
                {currentViewData.folders.length === 0 && currentViewData.files.length === 0 && (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60%" opacity={0.6}><FolderOpenIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} /><Typography variant="h6" color="text.secondary">Thư mục trống</Typography></Box>
                )}
              </Box>
            </>
          ) : (
             <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary" flexDirection="column"><Typography variant="h6">👋 Chào mừng!</Typography><Typography>Chọn Chương/Bài học bên trái.</Typography></Box>
=======
                {currentViewData.folders.length === 0 &&
                  currentViewData.files.length === 0 && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="60%"
                      opacity={0.6}
                    >
                      <FolderOpenIcon
                        sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        Thư mục trống
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        {currentFolder
                          ? "Tải lên tài liệu hoặc tạo thư mục con"
                          : "Hãy tạo thư mục mới"}
                      </Typography>
                    </Box>
                  )}
              </Box>
            </>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              color="text.secondary"
              flexDirection="column"
            >
              <Typography variant="h6" gutterBottom>
                👋 Chào mừng bạn!
              </Typography>
              <Typography>
                Chọn một <strong>Chương/Bài học</strong> từ danh sách bên trái
                để quản lý tài liệu.
              </Typography>
            </Box>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
          )}
        </Grid>
      </Grid>

<<<<<<< HEAD
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
=======
      {/* --- Context Menus & Dialogs --- */}
      <Menu
        open={Boolean(planMenuAnchor)}
        anchorEl={planMenuAnchor}
        onClose={() => setPlanMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setPlanMenuAnchor(null);
            setTempData({ initialName: planInfo?.title });
            setDialogs((p) => ({ ...p, editPlanName: true }));
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đổi tên giáo án</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPlanMenuAnchor(null);
            handleUnlinkPlanAction();
          }}
        >
          <ListItemIcon>
            <LinkOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gỡ khỏi lớp</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setPlanMenuAnchor(null);
            handleDeletePlanAction();
          }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>
            Xóa vĩnh viễn
          </ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        open={Boolean(contextMenu)}
        anchorEl={contextMenu}
        onClose={() => setContextMenu(null)}
      >
        <MenuItem
          onClick={() => {
            setTempData({ categoryId: contextTargetId, initialName: "..." });
            setDialogs((p) => ({ ...p, editCategory: true }));
            setContextMenu(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đổi tên</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteConfirm({
              open: true,
              item: { id: contextTargetId },
              type: "category",
            });
            setContextMenu(null);
          }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      <NameInputDialog
        open={dialogs.editPlanName}
        onClose={() => setDialogs((p) => ({ ...p, editPlanName: false }))}
        onSubmit={handleUpdatePlanName}
        title="Đổi tên giáo án"
        label="Tên giáo án mới"
        initialValue={tempData.initialName}
        loading={actionLoading}
      />
      <NameInputDialog
        open={dialogs.createCategory}
        onClose={() => setDialogs((p) => ({ ...p, createCategory: false }))}
        onSubmit={handleCreateCategory}
        title={tempData.parentId ? "Thêm bài học" : "Thêm chương mới"}
        label="Tên mục"
        loading={actionLoading}
      />
      <NameInputDialog
        open={dialogs.editCategory}
        onClose={() => setDialogs((p) => ({ ...p, editCategory: false }))}
        onSubmit={handleUpdateCategory}
        title="Đổi tên mục lục"
        label="Tên mới"
        initialValue={tempData.initialName}
        loading={actionLoading}
      />
      <NameInputDialog
        open={dialogs.createFolder}
        onClose={() => setDialogs((p) => ({ ...p, createFolder: false }))}
        onSubmit={handleCreateFolder}
        title="Tạo thư mục mới"
        label="Tên thư mục"
        loading={actionLoading}
      />

      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa?</Typography>
          {deleteConfirm.type === "folder" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Cảnh báo: Thư mục và file con sẽ mất!
            </Alert>
          )}
          {deleteConfirm.type === "category" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Cảnh báo: Toàn bộ bài học con và tài nguyên sẽ mất!
            </Alert>
          )}
          {deleteConfirm.type === "plan" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Cảnh báo: Giáo án này sẽ bị xóa vĩnh viễn khỏi hệ thống!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <UploadFileDialog
        open={dialogs.upload}
        onClose={() => setDialogs((p) => ({ ...p, upload: false }))}
        onSubmit={handleUpload}
        loading={actionLoading}
      />
      <FilePreviewDialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileData={previewFile}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      </Snackbar>
    </Box>
  );
};

export default ResourceManager;