import React, { useMemo, useState, memo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Tooltip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  styled,
  alpha,
  IconButton,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";

import DashboardIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import LibraryIcon from "@mui/icons-material/MenuBookOutlined";
import AccountBoxIcon from "@mui/icons-material/AccountBoxOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import AutoStoriesOutlined from "@mui/icons-material/AutoStoriesOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';

import Logo from "../assets/images/logo.png";

const menuConfigByRole = {
  tutor: [
    { label: "Tổng quan", to: "/tutor/dashboard", Icon: DashboardIcon },
    { label: "Lớp học của tôi", to: "/tutor/classes", Icon: GroupOutlined },
    { label: "Thư viện câu hỏi", to: "/tutor/question", Icon: LibraryIcon },
    { label: "Quản lý đề thi", to: "/tutor/exam", Icon: ArticleOutlined },
    { label: "Giao bài", to: "/tutor/assignment", Icon: AssignmentTurnedInOutlined },
    { label: "Gửi email", to: "/tutor/email", Icon: EmailIcon },
  ],
  admin: [
    { label: "Tổng quan", to: "/admin/dashboard", Icon: DashboardIcon },
    { label: "Quản lý người dùng", to: "/admin/users", Icon: GroupOutlined },
    { label: "Quản lý học liệu", to: "/admin/resources", Icon: AutoStoriesOutlined },
    { label: "Cài đặt hệ thống", to: "/admin/settings", Icon: SettingsIcon },
  ],
  student: [
    { label: "Góc học tập", to: "/student/dashboard", Icon: DashboardIcon },
    { label: "Lớp học của tôi", to: "/student/classes", Icon: GroupOutlined },
    { label: "Luyện tập", to: "/student/adaptive", Icon: LibraryIcon },
    { label: "Bài tập", to: "/student/assignment", Icon: HomeWorkOutlinedIcon },
    { label: "Đăng ký lớp học", to: "/student/enroll", Icon: AccountBoxIcon },
  ],
  parent: [
    { label: "Tiến độ của con", to: "/parent/dashboard", Icon: DashboardIcon },
    { label: "Đăng kí lớp học", to: "/parent/enroll", Icon: AccountBoxIcon },
  ],
};


const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "width",
})(({ theme, width }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    "& .MuiDrawer-paper": {
      width: width, 
      overflowX: "hidden",
      borderRight: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.divider, 0.08)}`, 
      backgroundColor: theme.palette.background.paper,
      backgroundImage: 'none',
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
      }),
    },
  };
});

const NavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(0.5, 2),
    padding: theme.spacing(1.2, 2),
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: "all 0.2s ease-in-out",
    color: theme.palette.text.secondary,
    position: 'relative', 

    "&:hover": {
      backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
      color: isDark ? theme.palette.primary.light : theme.palette.primary.main,
      "& .MuiListItemIcon-root": { color: isDark ? theme.palette.primary.light : theme.palette.primary.main },
    },
    
    ...(active && {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
      "& .MuiListItemText-primary": { fontWeight: 700 },
      "&::before": {
        content: '""',
        position: 'absolute',
        left: theme.spacing(-1),
        top: '15%',
        bottom: '15%',
        width: '4px',
        borderRadius: '0 4px 4px 0',
        backgroundColor: theme.palette.primary.main,
        boxShadow: isDark ? `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}` : 'none'
      }
    }),

    "& .MuiListItemIcon-root": {
      minWidth: "auto",
      marginRight: theme.spacing(2),
      justifyContent: "center",
      color: "inherit",
      transition: theme.transitions.create("color"),
    },
  };
});

const BrandBox = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 3),
    minHeight: "80px", 
    borderBottom: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.divider, 0.06)}`,
    backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.01) : 'transparent',
  };
});

const SidebarFooter = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    marginTop: "auto",
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    borderTop: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.divider, 0.06)}`, 
  };
});


const Sidebar = ({ width, isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [token] = useState(() => localStorage.getItem("token"));

  const userRole = useMemo(() => {
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      let role = decodedToken.role.toLowerCase();
      return role === "parents" ? "parent" : role;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }, [token]);

  const menuItems = useMemo(() => menuConfigByRole[userRole] || [], [userRole]);

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      
      {/* KHU VỰC LOGO */}
      <BrandBox>
        <Box 
          component="img" 
          src={Logo} 
          alt="Logo" 
          sx={{ 
            width: 38, 
            height: 38, 
            flexShrink: 0,
            filter: isDark ? `drop-shadow(0 0 8px ${alpha(theme.palette.primary.main, 0.4)})` : 'none'
          }} 
        />
        {!isCollapsed && (
          <Typography
            variant="h6"
            noWrap
            sx={{
              ml: 1.5,
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.5px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "fadeIn 0.3s ease-in-out",
              "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } }
            }}
          >
            Julie Academy
          </Typography>
        )}
      </BrandBox>

      {/* DANH SÁCH MENU */}
      <List component="nav" sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 2 }}>
        {menuItems.map(({ label, to, Icon }) => {
          const active = location.pathname.startsWith(to); 
          
          return (
            <Tooltip title={isCollapsed ? label : ""} placement="right" key={to} arrow>
              <NavButton active={active} component={RouterLink} to={to}>
                <ListItemIcon>
                  <Icon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ noWrap: true, variant: "body2" }}
                  />
                )}
              </NavButton>
            </Tooltip>
          );
        })}
      </List>

      <SidebarFooter>
        <IconButton 
          onClick={onToggleCollapse}
          sx={{ 
            border: 'none',
            boxShadow: isDark 
                ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}` 
                : `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : theme.palette.background.paper,
            transition: "all 0.2s ease",
            '&:hover': { 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: 'primary.main',
              transform: 'translateY(-2px)' 
            }
          }}
        >
          {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </SidebarFooter>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { lg: width }, flexShrink: { lg: 0 }, transition: "width 0.3s ease" }}>
      
      {/* DRAWER CHO MOBILE */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }} 
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 260, 
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.divider, 0.08)}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DRAWER CHO DESKTOP */}
      <StyledDrawer 
        variant="permanent" 
        width={width} 
        sx={{ display: { xs: "none", lg: "block" } }}
      >
        {drawerContent}
      </StyledDrawer>
    </Box>
  );
};

export default memo(Sidebar);