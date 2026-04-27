import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
    Box, CircularProgress, Alert, Typography, Paper, Grid, 
    Breadcrumbs, Link as MuiLink, Stack, IconButton, Tooltip, 
    useTheme, alpha, Snackbar, useMediaQuery, Drawer, Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';

import { getClassDetails } from '../../services/ClassService';
import { getPlanDetail, getAllCategories } from "../../services/CategoryService";
import { getFoldersByClass, fetchPresignedUrl } from "../../services/ResourceService";

import FilePreviewDialog from "../../components/FilePreviewDialog";

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

const StudentResourceViewer = memo(({ classId, planId, token }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [loading, setLoading] = useState(true);
    const [loadingFileId, setLoadingFileId] = useState(null);
    
    const [planInfo, setPlanInfo] = useState(null);
    const [rawCategories, setRawCategories] = useState([]);
    const [folderTree, setFolderTree] = useState([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    
    const [previewFile, setPreviewFile] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        
        try {
            const planRes = await getPlanDetail(planId, token);
            setPlanInfo(planRes);
        } catch (e) {
            setPlanInfo({ title: "Giáo án lớp học" });
        }

        try {
            const catsRes = await getAllCategories({ plan_id: planId }, token);
            let nodes = [];
            if (Array.isArray(catsRes)) {
                if (catsRes.length === 2 && Array.isArray(catsRes[0])) nodes = catsRes[0];
                else nodes = catsRes.flat();
            } else if (catsRes?.data && Array.isArray(catsRes.data)) {
                nodes = catsRes.data;
            }
            setRawCategories(nodes);
        } catch (e) {
            setToastMessage("Không thể tải cấu trúc chương.");
        }

        try {
            const foldersRes = await getFoldersByClass(classId, token);
            setFolderTree(foldersRes || []);
        } catch (e) {}

        setLoading(false);
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
                        id: pid, category_id: pid, category_name: item.description || "Thư mục gốc", parent_id: null
                    });
                }
            }
        });

        const allNodes = [...Array.from(parentMap.values()), ...rawCategories];
        const buildTree = (items, targetParentId = null) => {
            return items
                .filter(item => getParentId(item) === targetParentId)
                .map(item => {
                    const itemId = getItemId(item);
                    return {
                        id: itemId,
                        label: String(item.name ?? item.category_name ?? "Chưa đặt tên"),
                        children: buildTree(items, itemId),
                    };
                });
        };
        return buildTree(allNodes, null);
    }, [rawCategories]);

    const handleTreeSelection = useCallback((event, selectedItems) => {
        const selectedId = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;
        if (selectedId) {
            setSelectedCategoryId(selectedId);
            setCurrentFolder(null);
            setBreadcrumbs([]);
            if (isMobile) setDrawerOpen(false);
        } else {
            setSelectedCategoryId(null);
        }
    }, [isMobile]);

    const handleEnterFolder = useCallback((folder) => {
        setBreadcrumbs(prev => [...prev, currentFolder].filter(Boolean));
        setCurrentFolder(folder);
    }, [currentFolder]);

    const handleBreadcrumbClick = useCallback((folder, index) => {
        if (!folder) {
            setCurrentFolder(null);
            setBreadcrumbs([]);
        } else {
            setCurrentFolder(folder);
            setBreadcrumbs(prev => prev.slice(0, index));
        }
    }, []);

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

    const handlePreviewClick = useCallback(async (e, file) => {
        e.stopPropagation();
        setLoadingFileId(file.did);
        try {
            const data = await fetchPresignedUrl(file.did, token);
            setPreviewFile({ ...file, secureViewUrl: data.signedUrl });
        } catch (error) {
            setToastMessage("Không thể mở tài liệu. Vui lòng thử lại!");
        } finally {
            setLoadingFileId(null);
        }
    }, [token]);

    const handleClosePreview = useCallback(() => {
        setPreviewFile(null);
    }, []);

    const handleDownload = useCallback(async (e, file) => {
        e.stopPropagation();
        setLoadingFileId(file.did);
        try {
            const data = await fetchPresignedUrl(file.did, token);
            const a = document.createElement('a');
            a.href = data.signedUrl;
            a.target = "_blank";
            a.download = file.title || 'Tai-lieu';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            setToastMessage("Không thể tải tài liệu. Vui lòng thử lại!");
        } finally {
            setLoadingFileId(null);
        }
    }, [token]);

    const TreeNavigationContent = useMemo(() => (
        <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: isMobile ? 0 : 3, border: isMobile ? 'none' : `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, overflow: 'hidden', bgcolor: 'background.paper' }}>
            <Box p={2.5} sx={{ borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, bgcolor: alpha(theme.palette.success.main, 0.05), flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box overflow="hidden">
                    <Typography variant="subtitle2" color="success.main" fontSize="0.75rem" fontWeight={700} textTransform="uppercase">GIÁO TRÌNH LỚP HỌC</Typography>
                    <Typography variant="h6" fontWeight={700} noWrap title={planInfo?.title} color="text.primary" mt={0.5}>{planInfo?.title || "Đang tải dữ liệu..."}</Typography>
                </Box>
                {isMobile && (
                    <IconButton onClick={() => setDrawerOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>
            <Box sx={{ 
                flexGrow: 1, 
                overflowY: "auto", 
                p: 1.5,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.divider, 0.3), borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { bgcolor: alpha(theme.palette.divider, 0.5) }
            }}>
                {categoryTreeData.length > 0 ? (
                    <RichTreeView 
                        items={categoryTreeData} 
                        slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }} 
                        onSelectedItemsChange={handleTreeSelection} 
                        selectedItems={selectedCategoryId ? [selectedCategoryId] : []} 
                        sx={{ 
                            "& .MuiTreeItem-root": { mb: 0.5 },
                            "& .MuiTreeItem-content": { 
                                py: 1, 
                                px: 1.5,
                                borderRadius: 2, 
                                border: `1px solid transparent`,
                                "&.Mui-selected": { 
                                    bgcolor: alpha(theme.palette.success.main, 0.08), 
                                    borderColor: alpha(theme.palette.success.main, 0.2),
                                    color: "success.main", 
                                }, 
                                "&.Mui-selected:hover": { 
                                    bgcolor: alpha(theme.palette.success.main, 0.12) 
                                } 
                            },
                            "& .MuiTreeItem-label": {
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            },
                            "& .MuiTreeItem-content.Mui-selected .MuiTreeItem-label": {
                                fontWeight: 700
                            }
                        }} 
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary" align="center" mt={4}>Thầy cô chưa thêm nội dung nào.</Typography>
                )}
            </Box>
        </Paper>
    ), [isMobile, isDark, theme, planInfo, categoryTreeData, handleTreeSelection, selectedCategoryId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={10} flexGrow={1}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Grid container spacing={3} sx={{ flexGrow: 1, alignItems: 'flex-start' }}>
                
                {!isMobile && (
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ position: 'sticky', top: 24, height: 'calc(100vh - 160px)' }}>
                        {TreeNavigationContent}
                    </Grid>
                )}

                <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column", height: isMobile ? 'auto' : 'calc(100vh - 160px)' }}>
                    <Paper elevation={0} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.background.paper, 0.6), overflow: "hidden" }}>
                        {selectedCategoryId ? (
                            <>
                                <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, bgcolor: "background.paper", flexShrink: 0 }}>
                                    <Breadcrumbs separator={<ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }}/>}>
                                        <MuiLink component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(null)} sx={{ display: "flex", alignItems: "center", fontWeight: !currentFolder ? 700 : 500, color: !currentFolder ? 'success.main' : 'text.secondary' }}>
                                            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />{currentCategoryName}
                                        </MuiLink>
                                        {breadcrumbs.map((folder, index) => (
                                            <MuiLink key={folder.folder_id} component="button" underline="hover" color="inherit" onClick={() => handleBreadcrumbClick(folder, index)} sx={{ fontWeight: 500, color: 'text.secondary' }}>{folder.folder_name}</MuiLink>
                                        ))}
                                        {currentFolder && <Typography color="text.primary" fontWeight={700}>{currentFolder.folder_name}</Typography>}
                                    </Breadcrumbs>
                                </Box>

                                <Box sx={{ 
                                    p: 4, 
                                    flexGrow: 1, 
                                    overflowY: "auto",
                                    '&::-webkit-scrollbar': { width: '8px' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.divider, 0.3), borderRadius: '4px' },
                                }}>
                                    {currentViewData.folders.length > 0 && (
                                        <Box mb={4}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700} sx={{ mb: 2 }}>THƯ MỤC LƯU TRỮ</Typography>
                                            <Grid container spacing={3}>
                                                {currentViewData.folders.map(folder => (
                                                    <Grid size={{ xs: 6, sm: 6, xl: 4 }} key={`folder-${folder.folder_id}`}>
                                                        <Paper elevation={0} onClick={() => handleEnterFolder(folder)} sx={{ p: 3, textAlign: "center", cursor: "pointer", borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, transition: "all 0.2s", "&:hover": { borderColor: "warning.main", boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.15)}`, transform: "translateY(-4px)" } }}>
                                                            <FolderIcon sx={{ fontSize: 48, color: "warning.main", mb: 1.5 }} />
                                                            <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>{folder.folder_name}</Typography>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}

                                    {currentViewData.files.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700} sx={{ mb: 2 }}>TÀI LIỆU ĐÍNH KÈM</Typography>
                                            <Grid container spacing={3}>
                                                {currentViewData.files.map(file => {
                                                    const isLoading = loadingFileId === file.did;
                                                    return (
                                                    <Grid size={{ xs: 12 }} key={`file-${file.did}`}>
                                                        <Paper elevation={0} onClick={(e) => handlePreviewClick(e, file)} sx={{ p: 2, display: "flex", alignItems: "center", cursor: "pointer", borderRadius: 3, position: "relative", bgcolor: "background.paper", border: `1px solid ${isLoading ? theme.palette.primary.main : (isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3))}`, transition: "all 0.2s", opacity: isLoading ? 0.7 : 1, "&:hover": { borderColor: "success.main", boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.15)}`, transform: "translateY(-2px)", "& .actions": { opacity: 1 } } }}>
                                                            <Stack className="actions" direction="row" spacing={0.5} sx={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", opacity: 0, bgcolor: alpha(theme.palette.background.paper, 0.9), borderRadius: 2, p: 0.5, boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}` }}>
                                                                {!isLoading && (
                                                                    <>
                                                                        <Tooltip title="Xem tài liệu"><IconButton size="small" color="primary" onClick={(e) => handlePreviewClick(e, file)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                                        <Tooltip title="Tải xuống"><IconButton size="small" color="success" onClick={(e) => handleDownload(e, file)}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                            <Box mr={2.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36 }}>
                                                                {isLoading ? <CircularProgress size={24} thickness={5} /> : <FileIcon mimeType={file.file_type} />}
                                                            </Box>
                                                            <Box overflow="hidden" sx={{ pr: 6 }}>
                                                                <Typography variant="body2" fontWeight={700} color={isLoading ? 'primary.main' : 'text.primary'} noWrap title={file.title}>{file.title}</Typography>
                                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>{isLoading ? "Đang xử lý..." : (file.description || `Phiên bản ${file.version}`)}</Typography>
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Box>
                                    )}

                                    {currentViewData.folders.length === 0 && currentViewData.files.length === 0 && (
                                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" minHeight={300} opacity={0.6}>
                                            <FolderOpenIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" fontWeight={700}>Mục này đang trống</Typography>
                                            <Typography variant="body2" color="text.secondary">Thầy cô chưa cập nhật tài liệu ở đây.</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%" minHeight={400} color="text.secondary" flexDirection="column" p={4} textAlign="center">
                                <AutoStoriesIcon sx={{ fontSize: 100, mb: 3, color: alpha(theme.palette.success.main, 0.3) }} />
                                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>Góc Học Tập</Typography>
                                <Typography variant="body1">Sử dụng bảng điều hướng để mở các chương và bài học nhé.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {isMobile && (
                <>
                    <Fab color="success" size="medium" onClick={() => setDrawerOpen(true)} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: theme.zIndex.speedDial }}>
                        <FormatListBulletedIcon />
                    </Fab>
                    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 320, p: 2, bgcolor: 'background.default' } }}>
                        {TreeNavigationContent}
                    </Drawer>
                </>
            )}
            
            <FilePreviewDialog open={!!previewFile} onClose={handleClosePreview} fileData={previewFile} />

            <Snackbar open={!!toastMessage} autoHideDuration={3000} onClose={() => setToastMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity="success" variant="filled" sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}>{toastMessage}</Alert>
            </Snackbar>
        </Box>
    );
});

const StudentResourceTab = memo(({ classId, token }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [loading, setLoading] = useState(true);
    const [planId, setPlanId] = useState(null); 
    const [error, setError] = useState(null);

    const checkClassStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const cls = await getClassDetails(classId, token);
            setPlanId(cls.plan_id || null);
        } catch (e) {
            setError("Không thể tải thông tin tài liệu. Bạn thử lại sau nhé!");
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        if (classId && token) checkClassStatus();
    }, [checkClassStatus]);

    if (loading) return (
        <PageWrapper>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress size={40} thickness={4} color="success" />
            </Box>
        </PageWrapper>
    );
    
    if (error) return (
        <PageWrapper>
            <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 600 }}>{error}</Alert>
        </PageWrapper>
    );

    return (
        <PageWrapper>
            {!planId ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 3, border: `2px dashed ${alpha(theme.palette.success.main, 0.3)}` }}>
                    <AutoStoriesIcon sx={{ fontSize: 80, color: 'success.main', mb: 3, opacity: 0.6 }} />
                    <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>Góc Tài Liệu Trống</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Thầy cô chưa tải lên tài liệu hay bài giảng nào cho lớp mình.
                        <br/>Bạn hãy quay lại kiểm tra sau nhé!
                    </Typography>
                </Box>
            ) : (
                <StudentResourceViewer classId={classId} planId={planId} token={token} />
            )}
        </PageWrapper>
    );
});

export default StudentResourceTab;