import React, { useState } from "react";
import "./UserHeader.css";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";

const UserHeader = () => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);

  const username = localStorage.getItem("username") || "User";

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
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

  const avatarInitial = username?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <AppBar position="sticky" className="uh-appbar-root">
      <Toolbar disableGutters className="uh-toolbar-root">
        <Typography variant="h6" noWrap className="uh-project-name" onClick={() => navigate("/user/user-dashboard")}>
          Welcome, {username}
        </Typography>

        <Box sx={{ marginLeft: "auto" }}>
          <Tooltip title="User Profile">
            <IconButton
              onClick={handleOpenUserMenu}
              className="uh-profile-button"
              sx={{ p: 0 }}
            >
              <Avatar
                className="uh-clean-avatar"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {avatarInitial}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          id="uh-profile-menu"
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
          className="uh-professional-menu"
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 150,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "12px",
            },
          }}
        >
          <MenuItem
            onClick={btnLogout}
            className="uh-professional-logout"
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

export default UserHeader;
