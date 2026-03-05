// Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/SideBar";
import Header from "../components/Header"; 
import { Background } from "../components/Background";

const SIDEBAR_WIDTH_DEFAULT = 260; 
const SIDEBAR_WIDTH_COLLAPSED = 88;

const Layout = ({ mode, toggleMode }) => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);

  const handleToggleCollapse = () => setCollapsed((prev) => !prev);
  const handleMobileToggle = () => setMobileOpen(!isMobileOpen);

  const currentSidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_DEFAULT;

  return (
    <Background>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          width={currentSidebarWidth}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            width: { xs: "100%", lg: `calc(100% - ${currentSidebarWidth}px)` },
            transition: "width 0.3s ease",
            minHeight: "100vh",
          }}
        >
          <Header mode={mode} toggleMode={toggleMode} onMobileSidebarToggle={handleMobileToggle} />

<<<<<<< HEAD
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, md: 3, lg: 4 },
              backgroundColor: "transparent",
              overflowX: "hidden",
            }}
          >
            <Outlet />
          </Box>
        </Box>
=======
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
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
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      </Box>
    </Background>
  );
};

export default Layout;