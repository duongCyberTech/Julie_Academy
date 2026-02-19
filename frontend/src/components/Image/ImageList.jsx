import React, { useState } from 'react';
import { 
  Box, 
  ImageList, 
  ImageListItem, 
} from '@mui/material';

import BasicModal, { ListModal } from '../Image/ImageModal';

export function CommentImageList({images = []}) {
  const [open, setOpen] = React.useState(false);
  const [openRemain, setOpenRemain] = useState(false)
  const [selectedImg, setSelectedImg] = React.useState(null);

  const handleOpen = (img) => {
    setSelectedImg(img);
    setOpen(true);
  };

  return (
    <Box sx={{ width: "45%" }}>
      <ImageList
        sx={{ width: "100%", mb: 0, borderRadius: 1 }}
        variant="quilted"
        cols={3}
        rowHeight={120}
        gap={1}
      >
        {images.slice(0, 3).map((item, index) => {
          const cols = 1;
          const rows = 1;
          const isLastVisible = index === 2;
          const remainingCount = images.length - 3;

          return (
            <ImageListItem 
              key={index} 
              cols={cols} 
              rows={rows}
              sx={{ position: 'relative', cursor: 'pointer' }}
              onClick={(images.length <= 3 || (images.length > 3 && index < 2)) ?
                () => handleOpen(item) :
                () => setOpenRemain(true)
              }
            >
              <img
                src={item}
                alt="Post content"
                loading="lazy"
                style={{ objectFit: 'cover', width: '100px', height: '100px', display: "block" }}
              />
              {isLastVisible && remainingCount > 0 && (
                <Box sx={{
                  position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.5rem', fontWeight: 'bold', pointerEvents: "none",
                  height: "100%"
                }}>
                  +{remainingCount}
                </Box>
              )}
            </ImageListItem>
          );
        })}
      </ImageList>

      {/* Đưa Modal ra ngoài vòng lặp */}
      <BasicModal 
        image={selectedImg} 
        open={open} 
        setOpen={setOpen} 
      />
      <ListModal 
        images={images.slice(2)} 
        open={openRemain} 
        setOpen={setOpenRemain} 
      />
    </Box>
  );
}

export default function QuiltedImageList({ images = [] }) {
  const [open, setOpen] = React.useState(false);
  const [openRemain, setOpenRemain] = useState(false)
  const [selectedImg, setSelectedImg] = React.useState(null);

  const handleOpen = (img) => {
    setSelectedImg(img);
    setOpen(true);
  };

  const getGridConfig = (index, total) => {
    if (total === 1) return { cols: 4, rows: 4 };
    if (total === 2) return { cols: 2, rows: 4 };
    if (total === 3) return index === 0 ? { cols: 2, rows: 4 } : { cols: 2, rows: 2 };
    if (total === 4) return { cols: 2, rows: 2 } 
    if (total > 4) {
      if (index === 0) return { cols: 2, rows: 2 };
      if (index <= 3) return { cols: 2, rows: 2 }; 
    }
    return { cols: 2, rows: 2 };
  };

  return (
    <Box sx={{ width: "100%" }}>
      <ImageList
        sx={{ width: "100%", mb: 0 }}
        variant="quilted"
        cols={4}
        rowHeight={100}
      >
        {images.slice(0, 4).map((item, index) => {
          const { cols, rows } = getGridConfig(index, images.length);
          const isLastVisible = index === 3;
          const remainingCount = images.length - 4;

          return (
            <ImageListItem 
              key={index} 
              cols={cols} 
              rows={rows}
              sx={{ position: 'relative', cursor: 'pointer' }}
              onClick={(images.length <= 4 || (images.length > 4 && index < 3)) ?
                () => handleOpen(item) :
                () => setOpenRemain(true)
              }
            >
              <img
                src={item}
                alt="Post content"
                loading="lazy"
                style={{ objectFit: 'cover', width: '100%', height: '100%', display: "block" }}
              />
              {isLastVisible && remainingCount > 0 && (
                <Box sx={{
                  position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.5rem', fontWeight: 'bold', pointerEvents: "none"
                }}>
                  +{remainingCount}
                </Box>
              )}
            </ImageListItem>
          );
        })}
      </ImageList>

      {/* Đưa Modal ra ngoài vòng lặp */}
      <BasicModal 
        image={selectedImg} 
        open={open} 
        setOpen={setOpen} 
      />
      <ListModal 
        images={images.slice(3)} 
        open={openRemain} 
        setOpen={setOpenRemain} 
      />
    </Box>
  );
}