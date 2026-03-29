import React, { useState } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, IconButton, Tooltip, Divider } from '@mui/material';
import { Logout, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { role, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hide Navbar on Landing (/) and Login (/login) pages
    if (location.pathname === '/' || location.pathname === '/login' || !role) {
        return null;
    }

    const username = user?.username || "User";

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            px: 4, 
            py: 1.5, 
            bgcolor: '#111827', 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1100
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#06B6D4', letterSpacing: -0.5 }}>
                    ATTENDANCE<span style={{ color: '#fff' }}> SYSTEM</span>
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                        {username}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {role}
                    </Typography>
                </Box>
                
                <Tooltip title="Account settings">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 1 }}
                    >
                        <Avatar sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: '#312e81',
                            border: '2px solid rgba(255,255,255,0.1)'
                        }}>
                            <Person fontSize="small" />
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        bgcolor: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        width: 200,
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{username}</Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>{role}</Typography>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#f87171' }}>
                    <Logout fontSize="small" sx={{ mr: 1.5 }} />
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default Navbar;
