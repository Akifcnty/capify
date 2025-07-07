import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Fade,
  Slide
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import './App.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Login ve Register sayfalarında navbar'ı gösterme
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo ve Başlık */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="white">
                  C
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/dashboard"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                CAPIFY
              </Typography>
              <Chip 
                label="Beta" 
                size="small" 
                sx={{ 
                  ml: 1, 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }} 
              />
            </Box>

            {/* Navigation Links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!user ? (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    startIcon={<LoginIcon />}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      px: 2,
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    Kayıt Ol
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/dashboard"
                    startIcon={<DashboardIcon />}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Dashboard
                  </Button>
                  
                  {/* User Menu */}
                  <IconButton
                    onClick={handleMenu}
                    sx={{
                      color: 'white',
                      background: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                      <PersonIcon />
                    </Avatar>
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                      <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        Ayarlar
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                      <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        Çıkış Yap
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Slide>
  );
};

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="*" element={<Login />} />
        </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
