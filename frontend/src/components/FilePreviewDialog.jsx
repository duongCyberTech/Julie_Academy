import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FilePreviewDialog = ({ open, onClose, fileData }) => {
    if (!fileData || !open) return null;

    const { title, secureViewUrl, file_type } = fileData;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{ sx: { height: '90vh', borderRadius: 3, backgroundImage: 'none' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: '80%' }}>
                    {title}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                {secureViewUrl ? (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {file_type?.includes('pdf') ? (
                            <iframe 
                                src={secureViewUrl} 
                                title={title}
                                width="100%" 
                                height="100%" 
                                style={{ border: 'none' }} 
                            />
                        ) : file_type?.includes('image') ? (
                            <img 
                                src={secureViewUrl} 
                                alt={title} 
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                            />
                        ) : (
                            <Typography color="text.secondary">
                                Không thể xem trước định dạng file này. Vui lòng tải về.
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography>Đang tải dữ liệu...</Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilePreviewDialog;