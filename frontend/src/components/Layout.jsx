import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/SideBar";
import Header from "../components/Header"; 
import { Background } from "../components/Background";

const SIDEBAR_WIDTH_DEFAULT = 254; 
const SIDEBAR_WIDTH_COLLAPSED = 80;

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

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 0.5, md: 0.5, lg: 0.5 },
              backgroundColor: "transparent",
              overflowX: "hidden",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Background>
  );
};

export default Layout;