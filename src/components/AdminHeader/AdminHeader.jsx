import React, { useState } from "react";
import "./AdminHeader.css";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const btnLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("user_id");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const btnUrls = () => {
    navigate("/admin/url-list");
    handleCloseNavMenu();
  };

  const btnAllUrls = () => {
    navigate("/admin/all-url");
    handleCloseNavMenu();
  };

  const goToDashboard = () => {
    navigate("/admin/admin-dashboard");
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#d3c596 !important" }}>
      <Toolbar
        disableGutters
        sx={{ padding: "15px 30px !important", minHeight: "auto !important" }}
      >
        <Typography
          variant="h6"
          noWrap
          onClick={goToDashboard}
          className="project-name"
        >
          Bert Monitor
        </Typography>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: "10px",
            marginLeft: "auto",
          }}
        >
          <Typography
            variant="body1"
            onClick={btnUrls}
            className="header-button"
          >
            Urls List
          </Typography>
          <Typography
            variant="body1"
            onClick={btnAllUrls}
            className="header-button"
          >
            All urls
          </Typography>

          <Tooltip title="Admin Profile">
            <IconButton
              onClick={handleOpenUserMenu}
              className="profile-button"
              sx={{ p: 0 }}
            >
              <Avatar
                className="clean-avatar"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                A
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="menu"
            onClick={handleOpenNavMenu}
            className="hamburger"
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{ mt: "10px", display: { xs: "block", md: "none" } }}
        >
          <MenuItem onClick={btnUrls} className="mobile-menu-item">
            Urls List
          </MenuItem>
          <MenuItem onClick={btnAllUrls} className="mobile-menu-item">
            All urls
          </MenuItem>
        </Menu>

        <Menu
          id="profile-menu"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 150,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "12px",
            },
          }}
          className="professional-menu"
        >
          <MenuItem
            onClick={btnLogout}
            className="professional-logout"
            sx={{
              fontSize: "0.95rem",
              padding: "12px 20px",
              color: "red",
            }}
          >
            <LogoutIcon sx={{ mr: 1, color: "red" }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
