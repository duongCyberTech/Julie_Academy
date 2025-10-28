import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const ActionMenu = ({
  anchorEl,
  open,
  onClose,
  selectedItem,
  onEdit,
  onToggleStatus,
  onDelete, // onDelete giờ là tùy chọn
}) => {
  const isCurrentlyActive = selectedItem?.status === 'active';
  const toggleStatusLabel = isCurrentlyActive ? 'Vô hiệu hóa' : 'Kích hoạt';
  const ToggleStatusIcon = isCurrentlyActive ? BlockIcon : CheckCircleIcon;
  const toggleStatusColor = isCurrentlyActive ? 'error' : 'success';

  const handleEditClick = () => { onClose(); onEdit && onEdit(); }; // Thêm kiểm tra onEdit
  const handleToggleStatusClick = () => { onClose(); onToggleStatus && onToggleStatus(); }; // Thêm kiểm tra onToggleStatus
  const handleDeleteClick = () => { onClose(); onDelete && onDelete(); }; // Thêm kiểm tra onDelete

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* Chỉ hiển thị nếu có onEdit */}
      {onEdit && (
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
      )}

      {/* Chỉ hiển thị nếu có onToggleStatus và selectedItem có status */}
      {onToggleStatus && selectedItem?.status && (
         <MenuItem onClick={handleToggleStatusClick}>
           <ListItemIcon><ToggleStatusIcon fontSize="small" color={toggleStatusColor} /></ListItemIcon>
           <ListItemText>{toggleStatusLabel}</ListItemText>
         </MenuItem>
      )}

      {/* CHỈ HIỂN THỊ NẾU CÓ PROP onDelete */}
      {onDelete && (
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default ActionMenu;