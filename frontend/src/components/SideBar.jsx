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

// Import Icons
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
import HomeworkOutlined from "@mui/icons-material/HomeworkOutlined";

import Logo from "../assets/images/logo.png";

// Cấu hình Menu (Gọn gàng, dễ thêm/sửa)
const menuConfigByRole = {
  tutor: [
    { label: "Tổng quan", to: "/tutor/dashboard", Icon: DashboardIcon },
    { label: "Lớp học của tôi", to: "/tutor/classes", Icon: GroupOutlined },
    { label: "Thư viện câu hỏi", to: "/tutor/question", Icon: LibraryIcon },
    { label: "Quản lý đề thi", to: "/tutor/exam", Icon: ArticleOutlined },
    { label: "Giao bài", to: "/tutor/assignment", Icon: AssignmentTurnedInOutlined },
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
    { label: "Luyện tập", to: "/student/practice", Icon: LibraryIcon },
    { label: "Bài tập", to: "/student/assignment", Icon: HomeworkOutlined },
    { label: "Đăng ký lớp học", to: "/student/enroll", Icon: AccountBoxIcon },
  ],
  parent: [
    { label: "Tiến độ của con", to: "/parent/dashboard", Icon: DashboardIcon },
    { label: "Đăng kí lớp học", to: "/parent/enroll", Icon: AccountBoxIcon },
  ],
};

// --- STYLED COMPONENTS ---

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "width",
})(({ theme, width }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: width, 
    overflowX: "hidden",
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`, // Nối liền mạch với Header
    backgroundColor: alpha(theme.palette.background.default, 0.7),
    backdropFilter: "blur(10px)",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  },
}));

const NavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  margin: theme.spacing(0.5, 2),
  padding: theme.spacing(1.2, 2),
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: "all 0.2s ease-in-out",
  color: theme.palette.text.secondary,

  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
  },
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
    "& .MuiListItemText-primary": { fontWeight: 600 },
  }),

  "& .MuiListItemIcon-root": {
    minWidth: "auto",
    marginRight: theme.spacing(2),
    justifyContent: "center",
    color: "inherit",
    transition: theme.transitions.create("color"),
  },
}));

const BrandBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 3),
  minHeight: "72px", // Dóng ngang tuyệt đối với Header
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`, 
}));

// --- MAIN COMPONENT ---

const Sidebar = ({ width, isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const [token] = useState(() => localStorage.getItem("token"));

  // Tối ưu hóa việc lấy Role
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
        <Box component="img" src={Logo} alt="Logo" sx={{ width: 36, height: 36, flexShrink: 0 }} />
        {!isCollapsed && (
          <Typography
            variant="h6"
            noWrap
            sx={{
              ml: 1.5,
              fontWeight: 700,
              color: "primary.main",
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
          // Highlight chính xác root path
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

      {/* NÚT THU GỌN Ở ĐÁY */}
      <SidebarFooter>
        <IconButton 
          onClick={onToggleCollapse}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            transition: "all 0.2s ease",
            '&:hover': { 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: 'primary.main',
              transform: 'scale(1.05)'
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
        ModalProps={{ keepMounted: true }} // Cải thiện hiệu suất mở trên Mobile
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 260, // Cố định chiều rộng menu trên mobile
            boxSizing: "border-box",
            backgroundColor: alpha(theme.palette.background.default, 0.95),
            backdropFilter: "blur(10px)",
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