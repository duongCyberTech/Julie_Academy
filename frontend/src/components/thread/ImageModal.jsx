import { Modal, Button, Box } from '@mui/material';
import { ArrowBackIosRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import { useState } from 'react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: "90vw",
  maxHeight: "90vh",
  bgcolor: 'transparent', 
  outline: 'none',
  display: 'flex',
  justifyContent: 'center'
};

export function ListModal({ open, setOpen, images = [] }) {
  const [idxSelected, setIdxSelected] = useState(0)
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{ backdropFilter: 'blur(8px)' }} 
    >
      <Box sx={modalStyle}>
        {images && images.length && (
          <Box>
            <Button 
              sx={{
                display: "flex", position: "absolute", top: "50%", left: 2,
                '&:hover': {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  transform: "translateY(-50%) scale(1.1)",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
                },

                '&:active': {
                  transform: "translateY(-50%) scale(0.9)",
                }
              }}   
              onClick={() => setIdxSelected(idxSelected > 0 ? idxSelected - 1 : images.length - 1)}
              startIcon={<ArrowBackIosRounded />}
            >
            </Button>

            <Button 
              sx={{
                display: "flex", position: "absolute", top: "50%", right: 2,
                '&:hover': {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  transform: "translateY(-50%) scale(1.1)",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
                },

                '&:active': {
                  transform: "translateY(-50%) scale(0.9)",
                }
              }}    
              onClick={() => setIdxSelected(idxSelected < images.length - 1 ? idxSelected + 1 : 0)}
              endIcon={<ArrowForwardIosRounded />}
            >
            </Button>
            <img 
              src={images[idxSelected]} 
              alt="Preview" 
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: 'contain', 
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }} 
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default function BasicModal({ open, setOpen, image }) {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{ backdropFilter: 'blur(8px)' }} 
    >
      <Box sx={modalStyle}>
        {image && (
          <img 
            src={image} 
            alt="Preview" 
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: 'contain', 
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }} 
          />
        )}
      </Box>
    </Modal>
  );
}