import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';

const INSTA_GRADIENT = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';

export const FollowToggleButton = ({ initialIsFollowing = false, onToggle }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing)
  }, [initialIsFollowing])
  const handleToggle = () => {
    const newState = !isFollowing;
    if (onToggle) onToggle(newState);
  };

    if (!isFollowing) {
    return (
        <Button
        variant="outlined"
        size="small"
        onClick={handleToggle}
        sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 700,
            px: 1.5,
            py: 0.2,
            color: '#e6683c',
            border: '2px solid #e6683c',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
            border: '2px solid #e6683c', 
            bgcolor: '#e6683c',
            color: '#fff',
            },
        }}
        >
        Theo dõi
        </Button>
    );
    }

  return (
    <Button
      variant="contained"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => handleToggle()}
      sx={{
        borderRadius: '20px',
        textTransform: 'none',
        fontWeight: 700,
        px: 1.5, 
        py: 0.3,
        background: INSTA_GRADIENT,
        color: '#fff',
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: '#ffebee',   
          color: '#d32f2f',   
          background: 'none',     
          border: '1px solid #d32f2f',
        },
      }}
    >
      {isHovering ? 'Hủy theo dõi' : 'Đang theo dõi'}
    </Button>
  );
};