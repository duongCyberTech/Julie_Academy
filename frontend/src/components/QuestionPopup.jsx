import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal, Box, Paper, Typography, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, styled, alpha
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';

const questionTypes = [
    {
      id: "single_choice",
      Icon: RadioButtonCheckedOutlinedIcon,
      title: "Chọn một đáp án",
      desc: "Câu hỏi trắc nghiệm với chỉ một lựa chọn đúng duy nhất.",
    },
    {
      id: "multiple_choice",
      Icon: CheckBoxOutlinedIcon,
      title: "Chọn nhiều đáp án",
      desc: "Cho phép người học chọn một hoặc nhiều phương án đúng.",
    },
    {
      id: "true_false",
      Icon: EditNoteOutlinedIcon,
      title: "Đúng hoặc sai",
      desc: "Học sinh phải trả lời xem phát biểu đúng hay sai.",
    },
    {
      id: "short_answer",
      Icon: SortOutlinedIcon,
      title: "Trả lời ngắn",
      desc: "Yêu cầu điền câu trả lời vào.",
    },
];

const StyledPopupPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    outline: 'none',
    width: '90%',
    maxWidth: '600px',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[10],
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    transition: theme.transitions.create('background-color'),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));



export default function QuestionPopup({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleOptionClick = (type) => {
    navigate(`/tutor/new?type=${type}`);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="question-title"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <StyledPopupPaper>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography id="question-title" variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Chọn loại câu hỏi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lựa chọn của bạn sẽ quyết định cách học sinh tương tác.
          </Typography>
        </Box>

        <List sx={{ width: '100%' }}>
          {questionTypes.map(({ id, Icon, title, desc }, index) => (
            <React.Fragment key={id}>
              <ListItem disablePadding>
                <StyledListItemButton onClick={() => handleOptionClick(id)}>
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 48 }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={title}
                    secondary={desc}
                    primaryTypographyProps={{ fontWeight: '600', variant: 'body1' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </StyledListItemButton>
              </ListItem>
              {index < questionTypes.length - 1 && <Divider component="li" variant="inset" />}
            </React.Fragment>
          ))}
        </List>
        
      </StyledPopupPaper>
    </Modal>
  );
}