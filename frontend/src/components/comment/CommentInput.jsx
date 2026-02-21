import { MentionsInput, Mention } from 'react-mentions';
import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Avatar,
    Typography
} from '@mui/material'
import { jwtDecode } from 'jwt-decode'

import { getUserDetailsForTag } from '../../services/UserService';

const commentMarkup = "@[__display__](__id__)"; 

const mentionsInputStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    borderRadius: '8px',
    color: '#1976d2'
  },

  '&multiLine': {
    control: {
      minHeight: 63,
    },
    highlighter: {
      padding: 16,
      border: '1px solid transparent',
      borderRadius: '8px',
      boxSizing: 'border-box',
    },
    input: {
        padding: 16,
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: '8px',
        boxSizing: 'border-box',
        outline: 'none',
        '&:focus': {
            outline: '2px solid #1976d2',
            outlineOffset: '-1px',
        },
    },
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      borderRadius: '8px',
      boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    },
    item: {
      padding: '8px 16px',
      '&focused': {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
      },
    },
  },
};

const mentionStyle = {
  backgroundColor: 'rgba(24, 119, 242, 0.15)',
  color: '#1877F2',
  fontWeight: 'bold'
};

const renderText = (content) => {
  const regex = /@\[([^\]]+)\]\(([^\)]+)\)/g;
  const parts = content.split(regex);
  
  return parts.map((part, index) => {
    if (index % 3 === 1) {
      return (
        <Typography 
          key={index} 
          component="span" 
          sx={{ color: 'primary.main', fontWeight: 700 }}
        >
          @{part}
        </Typography>
      );
    }
    if (index % 3 === 2) return null;
    return part;
  });
};

// CommentContent.jsx
export const renderContentWithTags = (text) => {
  const regex = /@\[([^\]]+)\]\(([^\)]+)\)/g;
  const parts = text.split(regex);
  
  const result = [];
  for (let i = 0; i < parts.length; i += 3) {
    result.push(parts[i]); 
    
    if (parts[i + 1]) {
      const displayName = parts[i + 1];
      const email = parts[i + 2];
      
      result.push(
        <Typography
          key={i}
          component="span"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          @{displayName}
        </Typography>
      );
    }
  }
  return result;
};

export default function CommentInput({ class_id, value, setValue }) {
    const handleSearchUsers = async (query, callback) => {
        if (!query || query.length < 1) return;
        
        try {
            const response = await getUserDetailsForTag(class_id, query);
            const decoded = jwtDecode(localStorage.getItem('token'))
            if (response.status === 200) {
                callback(response.data?.filter(user => user.uid !== decoded.sub));
            }
        } catch (error) {
            console.error("Tagging search error:", error.message);
            callback([]); 
        }
    };

    return (
        <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: 2, flex: 1 }}>
            <MentionsInput
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={mentionsInputStyle}
                placeholder="Nhập nội dung, dùng @ để nhắc tên..."
                a11ySuggestionsListLabel={"Gợi ý nhắc tên"}
            >
                <Mention
                    trigger="@"
                    data={handleSearchUsers} 
                    markup={commentMarkup}
                    style={mentionStyle}
                    displayTransform={(id, display) => `@${display}`}
                    renderSuggestion={(suggestion, search, highlightedDisplay) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={suggestion.avatar} sx={{ width: 24, height: 24 }} />
                            <Typography variant="body2">{highlightedDisplay}</Typography>
                        </Box>
                    )}
                />
            </MentionsInput>
        </Box>
    );
}