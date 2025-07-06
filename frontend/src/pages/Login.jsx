import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Fade,
  Slide
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      login(res.user, res.token);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş başarısız! ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                padding: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: 'pulse 2s infinite'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: 'pulse 2s infinite 1s'
                }}
              />
              <PersonIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                CAPIFY
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Facebook Conversion API Yönetimi
              </Typography>
            </Box>

            {/* Form */}
            <CardContent sx={{ padding: 4 }}>
              <Fade in={true} timeout={800}>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      Giriş başarılı! Yönlendiriliyorsunuz...
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="E-posta Adresi"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Şifre"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                    sx={{
                      mt: 4,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hesabınız yok mu?{' '}
                      <Button
                        onClick={() => navigate('/register')}
                        sx={{
                          color: '#1976d2',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: 'rgba(25, 118, 210, 0.1)',
                          },
                        }}
                      >
                        Kayıt Olun
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </CardContent>
          </Paper>
        </Slide>
      </Container>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(1); opacity: 0.7; }
          }
        `}
      </style>
    </Box>
  );
};

export default Login; 