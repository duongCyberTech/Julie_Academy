import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { getUserDetailsForTag } from '../../services/UserService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: 500,
  bgcolor: '#242526', 
  color: '#E4E6EB',  
  borderRadius: 2,
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '85vh',
  outline: 'none',
};

export default function ListUserModal({ class_id, open, setOpen, selectedIds, setSelectedIds }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const handleClose = () => {
    setOpen(false);
    if (setOpenList) setOpenList(false); 
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUserDetailsForTag(class_id, search);
        if (response.status === 200) {
          setUsers(response.data); 
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
      }
    };

    fetchUsers();
  }, [search, class_id]);

  const toggleSelect = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid]
    );
  };

  const handleConfirmSelection = () => {
    handleClose();
  };

  const handleCancel = () => {
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
    >
      <Box sx={modalStyle}>
        {/* --- HEADER --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, position: 'relative' }}>
          <IconButton onClick={handleClose} sx={{ color: '#B0B3B8', bgcolor: '#3A3B3C', '&:hover': { bgcolor: '#4E4F50' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography id="modal-modal-title" variant="h6" sx={{ fontWeight: 700, flexGrow: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
            Chọn người dùng
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#3E4042' }} />

        {/* --- BODY (Thanh tìm kiếm) --- */}
        <Box sx={{ p: 2, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#3A3B3C', borderRadius: '20px', px: 2, py: 0.5, mb: 2 }}>
            <SearchIcon sx={{ color: '#B0B3B8', mr: 1 }} />
            <InputBase
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ color: '#E4E6EB', flexGrow: 1 }}
            />
          </Box>
        </Box>

        {/* --- DANH SÁCH CUỘN --- */}
        <List sx={{ overflowY: 'auto', flexGrow: 1, px: 1, minHeight: 200, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#4E4F50', borderRadius: '4px' } }}>
          {users.length > 0 ? (
            users.map((user) => {
              const isSelected = selectedIds && selectedIds.length && selectedIds.includes(user.uid);

              return (
                <ListItem
                  key={user.uid}
                  button
                  onClick={() => toggleSelect(user.uid)}
                  sx={{ borderRadius: 1, mb: 0.5, '&:hover': { bgcolor: '#3A3B3C' } }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>{user.display.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.display} 
                    secondary={user.id}
                    primaryTypographyProps={{ fontWeight: 600 }} 
                    secondaryTypographyProps={{ color: '#B0B3B8', fontSize: '0.75rem' }}
                  />
                  {isSelected ? (
                    <CheckCircleOutlineIcon sx={{ color: '#2D88FF' }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: '#828282' }} />
                  )}
                </ListItem>
              );
            })
          ) : (
            <Typography sx={{ textAlign: 'center', color: '#B0B3B8', mt: 4 }}>
              Không tìm thấy kết quả nào.
            </Typography>
          )}
        </List>

        {/* --- FOOTER --- */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, gap: 2, borderTop: '1px solid #3E4042' }}>
          <Button onClick={handleCancel} sx={{ color: '#2D88FF', textTransform: 'none', fontWeight: 600 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!selectedIds?.length || selectedIds.length === 0}
            onClick={handleConfirmSelection}
            sx={{
              bgcolor: '#2D88FF',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-disabled': { bgcolor: '#505151', color: '#B0B3B8' }
            }}
          >
            Xong
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}