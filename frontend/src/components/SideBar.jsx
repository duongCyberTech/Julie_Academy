import React, { useMemo, useState } from "react";
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
import Logo from "../assets/images/logo.png";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import AutoStoriesOutlined from "@mui/icons-material/AutoStoriesOutlined";

const COLLAPSED_WIDTH = 80;
const FULL_WIDTH_DEFAULT_FOR_MOBILE = 260;

// Cấu hình cho Tutor
const tutorMenuItems = [
  { label: "Trang tổng quan", to: "/tutor/dashboard", Icon: DashboardIcon },
  { label: "Thư viện câu hỏi", to: "/tutor/question", Icon: LibraryIcon },
  { label: "Hồ sơ", to: "/tutor/profile", Icon: AccountBoxIcon },
  { label: "Cài đặt", to: "/tutor/settings", Icon: SettingsIcon },
];

// Cấu hình cho Admin
const adminMenuItems = [
  { label: "Bảng điều khiển", to: "/admin/dashboard", Icon: DashboardIcon },
  { label: "Quản lý người dùng", to: "/admin/users", Icon: GroupOutlined },
  {
    label: "Quản lý tài nguyên",
    to: "/admin/resources",
    Icon: AutoStoriesOutlined,
  },
  { label: "Cài đặt", to: "/admin/settings", Icon: SettingsIcon },
];

// cấu hình cho Student
const studentMenuItems = [
  { label: "Bảng điều khiển", to: "/student/dashboard", Icon: DashboardIcon },
  { label: "Lớp học của tôi", to: "/student/myclass", Icon: GroupOutlined },
];
const menuConfigByRole = {
  tutor: tutorMenuItems,
  admin: adminMenuItems,
  student: studentMenuItems,
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    overflowX: "hidden",
    borderRight: "none",
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    backdropFilter: "blur(10px)",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

const NavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  margin: theme.spacing(0.5, 2),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  color: theme.palette.text.secondary,

  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
    "& .MuiListItemText-primary": {
      fontWeight: 600,
    },
  }),

  "& .MuiListItemIcon-root": {
    minWidth: "auto",
    marginRight: theme.spacing(2),
    justifyContent: "center",
    transition: theme.transitions.create("color"),
  },
}));

const BrandBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2.5, 3),
  height: "80px",
}));

const SidebarFooter = styled(Box)({
  marginTop: "auto",
  paddingBlock: "16px",
  position: "relative",
  display: "flex",
  justifyContent: "center",
});

const CollapseButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: "scale(1.1)",
    color: theme.palette.primary.main,
  },
}));

const Sidebar = ({ width, onToggleCollapse, isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const isCollapsed = width <= COLLAPSED_WIDTH;
  const [token] = useState(() => localStorage.getItem("token"));

  const userRole = useMemo(() => {
    try {
      if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken.role;
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
    return null;
  }, [token]);

  const menuItems = useMemo(() => {
    const roleKey = userRole?.toLowerCase();
    return menuConfigByRole[roleKey] || [];
  }, [userRole]);

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <BrandBox>
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          sx={{ width: 40, height: 40, flexShrink: 0 }}
        />
        <Typography
          variant="h6"
          noWrap
          sx={{
            ml: 1.5,
            fontWeight: 700,
            background: `linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: theme.transitions.create("opacity", {
              duration: theme.transitions.duration.shorter,
            }),
            opacity: isCollapsed ? 0 : 1,
          }}
        >
          Julie Academy
        </Typography>
      </BrandBox>

      <List component="nav" sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {menuItems.map(({ label, to, Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Tooltip
              title={isCollapsed ? label : ""}
              placement="right"
              key={to}
              arrow
            >
              <NavButton active={active} component={RouterLink} to={to}>
                <ListItemIcon>
                  <Icon sx={{ fontSize: 24 }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    noWrap: true,
                    variant: "body2",
                  }}
                  sx={{
                    transition: theme.transitions.create("opacity", {
                      duration: theme.transitions.duration.shorter,
                    }),
                    opacity: isCollapsed ? 0 : 1,
                  }}
                />
              </NavButton>
            </Tooltip>
          );
        })}
      </List>

      <SidebarFooter>
        <CollapseButton onClick={onToggleCollapse}>
          {isCollapsed ? (
            <ChevronRightIcon fontSize="small" />
          ) : (
            <ChevronLeftIcon fontSize="small" />
          )}
        </CollapseButton>
      </SidebarFooter>
    </Box>
  );

  const drawerForMobile = (
    <Drawer
      variant="temporary"
      open={isMobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", lg: "none" },
        "& .MuiDrawer-paper": {
          width: FULL_WIDTH_DEFAULT_FOR_MOBILE,
          boxSizing: "border-box",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );

  return (
    <Box component="nav" sx={{ width: { lg: width }, flexShrink: { lg: 0 } }}>
      {drawerForMobile}

      <StyledDrawer
        variant="permanent"
        sx={{ display: { xs: "none", lg: "block" } }}
        PaperProps={{ style: { width } }}
      >
        {drawerContent}
      </StyledDrawer>
    </Box>
  );
};

export default React.memo(Sidebar);
