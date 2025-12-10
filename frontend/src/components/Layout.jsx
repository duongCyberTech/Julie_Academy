import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, IconButton, CssBaseline } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/SideBar";
import Background from "../components/Background";

const SIDEBAR_WIDTH_DEFAULT = 220;
const SIDEBAR_WIDTH_COLLAPSED = 88;

const Layout = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleMobileToggle = () => {
    setMobileOpen(!isMobileOpen);
  };

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Background />
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleMobileToggle}
          sx={{
            mr: 2,
            display: { lg: "none" },
            color: "text.primary",
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Sidebar
        width={currentSidebarWidth}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { xs: "100%", lg: `calc(100% - ${currentSidebarWidth}px)` },
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
