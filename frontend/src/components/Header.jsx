import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom"; 
import { jwtDecode } from "jwt-decode";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  useTheme,
  Badge,
  styled,
  alpha,
} from "@mui/material";

import {
  Menu as MenuIcon,
  ExitToApp as ExitToAppIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Notifications as NotificationsIcon,
  PersonOutline as PersonOutlineIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  Language as LanguageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import Logo from "../assets/images/logo.png"; 


const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) =>
    !["isSidebarExpanded", "isSidebarMounted"].includes(prop),
})(({ theme, isSidebarExpanded, isSidebarMounted }) => ({
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  backdropFilter: "blur(6px)",
  backgroundColor:
    theme.palette.mode === "light"
      ? alpha(theme.palette.accent?.light || theme.palette.primary.light, 0.85)
      : alpha(theme.palette.background.paper, 0.85),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
  [theme.breakpoints.up("lg")]: {
    width: isSidebarMounted
      ? `calc(100% - ${isSidebarExpanded ? 260 : 80}px)`
      : "100%",
    marginLeft: isSidebarMounted ? `${isSidebarExpanded ? 260 : 80}px` : "0px",
  },
}));

const HeaderIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.hover, 0.1),
  },
}));

const BrandBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
}));

const USER_MENU_CONFIG = [
  {
    text: "Hồ sơ",
    path: "/profile",
    icon: <PersonOutlineIcon fontSize="small" />,
  },
  {
    text: "Cài đặt",
    path: "/settings",
    icon: <SettingsOutlinedIcon fontSize="small" />,
  },
  {
    text: "Ngôn ngữ",
    path: "/language",
    icon: <LanguageIcon fontSize="small" />,
  },
];

const Header = React.memo(function Header({
  mode,
  toggleMode,
  isSidebarExpanded,
  onDesktopSidebarToggle,
  onMobileSidebarToggle,
  isSidebarMounted,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setUserInfo({ name: decoded.name, email: decoded.email });
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setUserInfo(null);
    setAnchorEl(null);
    navigate("/");
  }, [navigate]);

  const handleNav = useCallback(
    (path) => {
      navigate(path);
      setAnchorEl(null);
    },
    [navigate]
  );

  const isAuth = !!userInfo;

  return (
    <StyledAppBar
      position="fixed"
      isSidebarExpanded={isSidebarExpanded}
      isSidebarMounted={isSidebarMounted}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 1, sm: 2 } }}>
        {/* === Sidebar toggles (GIỮ NGUYÊN) === */}
        <HeaderIconButton
          edge="start"
          onClick={onMobileSidebarToggle}
          sx={{ mr: 1, display: { lg: "none" } }}
        >
          <MenuIcon />
        </HeaderIconButton>
        {isSidebarMounted && (
          <HeaderIconButton
            onClick={onDesktopSidebarToggle}
            sx={{ display: { xs: "none", lg: "flex" } }}
          >
            {isSidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </HeaderIconButton>
        )}

        <BrandBox
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, justifyContent: { xs: "center" }, ml: 20 }}
        >
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              filter: mode === "dark" 
                ? "drop-shadow(0 0 5px rgba(100, 181, 246, 0.6)) brightness(1.1)" 
                : "none",
              transition: "filter 0.3s ease",
            }}
          />
          <Typography
            variant="h6"
            noWrap
            sx={{
              ml: 1.5,
              fontWeight: 700,
              display: { xs: "none", sm: "block" },
              background: mode === "dark"
                ? `linear-gradient(45deg, #22d3ee 0%, #e879f9 100%)` 
                : `linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)`, 
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: mode === "dark" ? "drop-shadow(0 0 10px rgba(34, 211, 238, 0.3))" : "none",
              transition: "all 0.3s ease",
            }}
          >
            Julie Academy
          </Typography>
        </BrandBox>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Thông báo">
            <HeaderIconButton>
              <Badge badgeContent={0} color="primary">
                <NotificationsIcon />
              </Badge>
            </HeaderIconButton>
          </Tooltip>

          <Tooltip title={mode === "dark" ? "Chế độ sáng" : "Chế độ tối"}>
            <HeaderIconButton onClick={toggleMode}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </HeaderIconButton>
          </Tooltip>

          {isAuth ? (
            <Tooltip title="Tài khoản">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0, ml: 1 }}
              >
                <Avatar
                  sx={{ width: 36, height: 36, bgcolor: "secondary.main" }}
                >
                  {userInfo.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="secondary"
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* === Menu Avatar (GIỮ NGUYÊN) === */}
      {isAuth && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 2,
            sx: {
              mt: 1.2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(6px)",
            },
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {/* ... (Nội dung menu giữ nguyên) ... */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography fontWeight={600}>{userInfo.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {userInfo.email}
            </Typography>
          </Box>
          <Divider />
          {USER_MENU_CONFIG.map((item) => (
            <MenuItem key={item.text} onClick={() => handleNav(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.text}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            Đăng xuất
          </MenuItem>
        </Menu>
      )}
    </StyledAppBar>
  );
});

export default Header;
