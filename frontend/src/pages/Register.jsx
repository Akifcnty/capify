import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/api';
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
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  LockOutlined as LockOutlinedIcon
} from '@mui/icons-material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Tüm alanlar zorunludur.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(email, password);
      login(res.user, res.token);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError('Kayıt başarısız!');
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
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
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
              <PersonAddIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                CAPIFY
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Yeni Hesap Oluştur
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
                      Kayıt başarılı! Yönlendiriliyorsunuz...
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
                          borderColor: '#2e7d32',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2e7d32',
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
                          borderColor: '#2e7d32',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2e7d32',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Şifre Tekrar"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#2e7d32',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2e7d32',
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                    sx={{
                      mt: 4,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Zaten hesabınız var mı?{' '}
                      <Button
                        onClick={() => navigate('/login')}
                        sx={{
                          color: '#2e7d32',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: 'rgba(46, 125, 50, 0.1)',
                          },
                        }}
                      >
                        Giriş Yapın
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

export default Register; 