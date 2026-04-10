import React, { useState, useEffect, useCallback, useMemo } from "react";
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

import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import { socket } from "../services/ApiClient";
import { countNotifications } from "../services/NotificationService";
import notificationSfx from "../assets/sounds/notifications/ting-2.mp3";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.85)"
      : alpha(theme.palette.background.paper, 0.85),
  backdropFilter: "blur(16px)",
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
}));

const HeaderIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  "&:active": {
    transform: "scale(0.92)",
  },
}));

const Header = React.memo(function Header({
  mode,
  toggleMode,
  onMobileSidebarToggle,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const notifyAudio = useMemo(() => new Audio(notificationSfx), []);

  const [userInfo, setUserInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cntUnRead, setCntUnRead] = useState(0);
  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const fetchCnt = async () => {
      try {
        const response = await countNotifications(-1);
        setCntUnRead(response || 0);
      } catch (e) {
        console.log(e);
      }
    };

    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      socket.emit("notify", decoded.sub);
      if (decoded.exp * 1000 > Date.now()) {
        setUserInfo({
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        });
        fetchCnt();
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }

    const handleUnreadCount = (newCount) => {
      setCntUnRead(newCount);
      notifyAudio.play().catch((err) => console.warn("Audio blocked:", err));
    };
    const handleLocalRead = () => {
      setCntUnRead((prev) => Math.max(0, prev - 1));
    };

    socket.on("cnt_unread", handleUnreadCount);
    window.addEventListener("notification_read", handleLocalRead);

    return () => {
      socket.off("cnt_unread", handleUnreadCount);
      window.removeEventListener("notification_read", handleLocalRead);
    };
  }, [token, notifyAudio]);

  const userMenuItems = useMemo(() => {
    let role = userInfo?.role ? userInfo.role.toLowerCase() : "";
    if (role === "parents") role = "parent";
    return [
      {
        text: "Hồ sơ",
        path: role ? `/${role}/profile` : "/login",
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
  }, [userInfo]);

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
    [navigate],
  );

  const isAuth = !!userInfo;

  return (
    <StyledAppBar position="sticky">
      <Toolbar sx={{ minHeight: "56px !important", px: { xs: 0.5, lg: 4 } }}>
        <HeaderIconButton
          edge="start"
          onClick={onMobileSidebarToggle}
          aria-label="Mở menu điều hướng"
          sx={{ mr: 1, display: { lg: "none" } }}
        >
          <MenuIcon />
        </HeaderIconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1.5 },
          }}
        >
          {isAuth && (
            <Tooltip title="Thông báo">
              <HeaderIconButton
                onClick={() => navigate("/settings/notifications")}
                aria-label="Xem thông báo"
              >
                <Badge
                  badgeContent={cntUnRead}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: 2,
                      top: 4,
                      fontWeight: "bold",
                    },
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </HeaderIconButton>
            </Tooltip>
          )}

          <Tooltip
            title={
              mode === "dark"
                ? "Chuyển sang chế độ Sáng"
                : "Chuyển sang chế độ Tối"
            }
          >
            <HeaderIconButton
              onClick={toggleMode}
              aria-label="Chuyển đổi chế độ hiển thị"
              sx={{
                transition: "transform 0.4s ease",
                "&:active": { transform: "rotate(180deg) scale(0.8)" },
              }}
            >
              {mode === "dark" ? (
                <DarkModeRoundedIcon
                  fontSize="small"
                  sx={{ color: theme.palette.primary.light }}
                />
              ) : (
                <LightModeRoundedIcon fontSize="small" color="warning" />
              )}
            </HeaderIconButton>
          </Tooltip>

          {isAuth ? (
            <>
              <Box
                sx={{
                  ml: 1,
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ color: "text.primary" }}
                >
                  {userInfo.name}
                </Typography>
              </Box>

              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Mở menu tài khoản"
                sx={{
                  p: 0,
                  ml: 1,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: "primary.main",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {userInfo.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{ borderRadius: 2, px: 3, ml: 1 }}
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Toolbar>

      {isAuth && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0px 10px 30px rgba(0,0,0,0.5)"
                  : "0px 10px 30px rgba(0,0,0,0.08)",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5, display: { xs: "block", sm: "none" } }}>
            <Typography fontWeight={700}>{userInfo.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {userInfo.email}
            </Typography>
          </Box>
          <Divider sx={{ display: { xs: "block", sm: "none" } }} />
          {userMenuItems.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => handleNav(item.path)}
              sx={{ py: 1.2, mx: 1, borderRadius: "8px", mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
              <Typography variant="body2" fontWeight={600}>
                {item.text}
              </Typography>
            </MenuItem>
          ))}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              mx: 1,
              borderRadius: "8px",
              color: "error.main",
              "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
            }}
          >
            <ListItemIcon sx={{ color: "error.main", minWidth: 32 }}>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={700}>
              Đăng xuất
            </Typography>
          </MenuItem>
        </Menu>
      )}
    </StyledAppBar>
  );
});

export default Header;
