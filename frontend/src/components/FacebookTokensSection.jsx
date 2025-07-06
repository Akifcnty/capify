import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Switch,
  CardHeader,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Facebook as FacebookIcon,
  VerifiedUser as VerifiedUserIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { getApiBaseUrl, sendTestEvent } from '../services/api';

function FacebookTokensSection({
  user,
  tokens,
  setTokens,
  showSnackbar,
  copyToClipboard,
  handleAddToken,
  handleDeleteToken,
  handleToggleTokenStatus,
  tokenDialogOpen,
  setTokenDialogOpen,
  newToken,
  setNewToken,
  tokenLoading,
  editTokenDialogOpen,
  setEditTokenDialogOpen,
  editToken,
  setEditToken,
  verifiedDomains = [],
  api
}) {
  const [testEventCodes, setTestEventCodes] = useState({});
  const [testEventLoading, setTestEventLoading] = useState({});
  const [testEventResult, setTestEventResult] = useState({});

  // Debug için console.log ekle
  console.log('FacebookTokensSection - verifiedDomains:', verifiedDomains);
  console.log('FacebookTokensSection - tokens:', tokens);
  console.log('FacebookTokensSection - tokenDialogOpen:', tokenDialogOpen);

  const handleTestToken = async (token) => {
    setTestEventLoading(l => ({ ...l, [token.id]: true }));
    setTestEventResult(r => ({ ...r, [token.id]: null }));
    try {
      const jwtToken = localStorage.getItem('token');
      if (!jwtToken) {
        throw new Error('JWT token bulunamadı. Lütfen tekrar giriş yapın.');
      }
      const payload = {
        event_name: 'TestEvent',
        event_time: Math.floor(Date.now() / 1000),
        event_id: testEventCodes[token.id] || 'TEST1234',
        user_data: {
          em: ['test@example.com']
        },
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        gtm_container_id: token.gtm_container_id
      };
      if (testEventCodes[token.id]) {
        payload.test_event_code = testEventCodes[token.id];
      }
      await sendTestEvent({
        endpoint: '/facebook/events/custom',
        payload,
        jwtToken
      });
      setTestEventResult(r => ({ ...r, [token.id]: { success: true, message: 'Test event başarıyla gönderildi.' } }));
      showSnackbar('Test event başarıyla gönderildi.', 'success');
    } catch (error) {
      setTestEventResult(r => ({ ...r, [token.id]: { success: false, message: error.message || 'Test event gönderilemedi.' } }));
      showSnackbar('Test event gönderilemedi: ' + (error.message || ''), 'error');
    } finally {
      setTestEventLoading(l => ({ ...l, [token.id]: false }));
    }
  };

  return (
    <>
      {/* Modern Header Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 4, 
        p: 4, 
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Facebook Token Yönetimi
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            CAPI entegrasyonunuzu yönetin, token'larınızı organize edin ve performansınızı takip edin
          </Typography>
        </Box>
        {tokens.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setTokenDialogOpen(true)}
            sx={{ 
              borderRadius: 3, 
              fontWeight: 600,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease',
              height: 48,
              px: 4
            }}
          >
            Yeni Token Ekle
          </Button>
        )}
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }}>
          <FacebookIcon sx={{ fontSize: 120 }} />
        </Box>
      </Box>
      {!tokens || tokens.length === 0 ? (
        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e8f4fd 100%)', 
          borderRadius: 6, 
          p: 6, 
          textAlign: 'center',
          border: '2px dashed #cbd5e1',
          position: 'relative',
          overflow: 'hidden',
          mt: 4
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            opacity: 0.03,
            zIndex: 0
          }}>
            <FacebookIcon sx={{ fontSize: 200 }} />
          </Box>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              mb: 3
            }}>
              <FacebookIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
              İlk Token'ı Ekleyin
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#64748b', maxWidth: 400, mx: 'auto' }}>
              Facebook CAPI entegrasyonuna başlamak için ilk token'ınızı ekleyin. 
              Bu sayede e-ticaret event'lerinizi Facebook'a gönderebilirsiniz.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTokenDialogOpen(true)}
              sx={{ 
                borderRadius: 3, 
                fontWeight: 600,
                px: 6,
                py: 2,
                fontSize: 20,
                bgcolor: '#3b82f6',
                '&:hover': {
                  bgcolor: '#2563eb',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                },
                transition: 'all 0.3s ease',
                mt: 2
              }}
            >
              İlk Token'ı Ekle
            </Button>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(tokens) && tokens.filter(token => token && token.id).map((token) => (
            <Grid item xs={12} sm={6} md={4} key={token.id}>
              <Card sx={{ 
                height: '100%', 
                background: token.is_active 
                  ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' 
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                boxShadow: token.is_active 
                  ? '0 10px 25px rgba(34, 197, 94, 0.15)' 
                  : '0 4px 6px rgba(0, 0, 0, 0.05)', 
                border: token.is_active 
                  ? '1px solid rgba(34, 197, 94, 0.2)' 
                  : '1px solid rgba(0, 0, 0, 0.05)', 
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: token.is_active 
                    ? '0 20px 40px rgba(34, 197, 94, 0.2)' 
                    : '0 12px 24px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardHeader
                  sx={{ 
                    pb: 1,
                    '& .MuiCardHeader-content': {
                      minWidth: 0
                    }
                  }}
                  avatar={
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: token.is_active 
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                        : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                      boxShadow: token.is_active 
                        ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
                        : '0 2px 8px rgba(148, 163, 184, 0.2)'
                    }}>
                      <FacebookIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Switch
                        checked={token.is_active || false}
                        onChange={() => handleToggleTokenStatus(token.id, token.is_active)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#22c55e',
                            '&:hover': {
                              backgroundColor: 'rgba(34, 197, 94, 0.08)',
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#22c55e',
                          },
                        }}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => { 
                          setEditToken(token); 
                          setEditTokenDialogOpen(true); 
                        }}
                        sx={{ 
                          color: '#64748b',
                          '&:hover': { 
                            color: '#3b82f6',
                            bgcolor: 'rgba(59, 130, 246, 0.08)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteToken(token.id)} 
                        sx={{ 
                          color: '#64748b',
                          '&:hover': { 
                            color: '#ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.08)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  title={
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 700, 
                        color: token.is_active ? '#166534' : '#475569',
                        fontSize: '1.1rem',
                        mb: 0.5
                      }}
                    >
                      {token.token_name || `Token ${token.id}`}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: token.is_active ? '#22c55e' : '#94a3b8',
                        boxShadow: token.is_active ? '0 0 0 2px rgba(34, 197, 94, 0.2)' : 'none'
                      }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: token.is_active ? '#166534' : '#64748b',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {token.is_active ? 'Aktif - CAPI Veri Gönderiliyor' : 'Pasif - CAPI Veri Gönderilmiyor'}
                      </Typography>
                    </Box>
                  }
                />
                <CardContent sx={{ pt: 1, pb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2,
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: '#3b82f6' 
                      }} />
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                        <strong>Dataset ID:</strong> 
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                        {token.dataset_id}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: '#8b5cf6' 
                      }} />
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                        <strong>GTM Container ID:</strong> 
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                        {token.gtm_container_id}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      p: 1,
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: 1,
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                      <Box sx={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: '50%', 
                        bgcolor: '#8b5cf6' 
                      }} />
                      <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 600 }}>
                        Bu token sadece {token.gtm_container_id} GTM Container'ı için kullanılabilir
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: '#f59e42' 
                      }} />
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                        <strong>Access Token:</strong> 
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {token.access_token}
                      </Typography>
                    </Box>
                    <TextField
                      label="Test Event Code (Facebook Events Manager)"
                      value={testEventCodes[token.id] || ''}
                      onChange={e => setTestEventCodes(codes => ({ ...codes, [token.id]: e.target.value }))}
                      size="small"
                      sx={{ mr: 2, width: 220 }}
                      placeholder="TEST1234"
                      helperText="Facebook Test Events ekranındaki kodu girin"
                    />
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => handleTestToken(token)}
                      disabled={!!testEventLoading[token.id]}
                    >
                      {testEventLoading[token.id] ? 'Gönderiliyor...' : 'Token Test Et'}
                    </Button>
                    {testEventResult[token.id] && (
                      <Snackbar open autoHideDuration={6000} onClose={() => setTestEventResult(r => ({ ...r, [token.id]: null }))}>
                        <Alert severity={testEventResult[token.id].success ? 'success' : 'error'}>
                          {testEventResult[token.id].message}
                        </Alert>
                      </Snackbar>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Token Ekle Dialog */}
      <Dialog 
        open={tokenDialogOpen} 
        onClose={() => setTokenDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 600,
          color: '#1e293b'
        }}>
          Yeni Facebook Token Ekle
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {verifiedDomains.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                mb: 3
              }}>
                <ErrorIcon sx={{ fontSize: 40, color: '#ef4444' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                GTM Container Bulunamadı
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: '#64748b', maxWidth: 400, mx: 'auto' }}>
                Facebook token eklemek için önce bir GTM Container oluşturmanız gerekiyor. 
                GTM Doğrulama bölümünden yeni bir GTM Container ekleyin.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setTokenDialogOpen(false)}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Tamam
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                Facebook CAPI entegrasyonu için yeni bir token ekleyin. 
                Doğrulanmış ve doğrulanmamış GTM Container'ları seçebilirsiniz.
              </Typography>
              
              <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                <InputLabel id="select-verified-domain-label">GTM Container</InputLabel>
                <Select
                  labelId="select-verified-domain-label"
                  value={newToken.gtm_container_id || ''}
                  label="GTM Container"
                  onChange={e => {
                    const selected = verifiedDomains.find(v => v.gtm_container_id === e.target.value);
                    setNewToken({ ...newToken, gtm_container_id: e.target.value, domain_name: selected?.domain_name || '' });
                  }}
                >
                  {verifiedDomains
                    .filter(v => !tokens.some(token => token.gtm_container_id === v.gtm_container_id))
                    .map((verification) => (
                      <MenuItem key={verification.gtm_container_id} value={verification.gtm_container_id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {verification.gtm_container_id}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            ({verification.domain_name})
                          </Typography>
                          {!verification.is_verified && (
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: 'warning.light',
                              color: 'warning.contrastText',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              <ErrorIcon sx={{ fontSize: 14 }} />
                              Doğrulanmamış
                            </Box>
                          )}
                          {verification.is_verified && (
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: 'success.light',
                              color: 'success.contrastText',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                              Doğrulanmış
                            </Box>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              
              {/* Doğrulanmamış GTM seçildiğinde uyarı göster */}
              {newToken.gtm_container_id && verifiedDomains.find(v => v.gtm_container_id === newToken.gtm_container_id)?.is_verified === false && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    ⚠️ Doğrulanmamış GTM Container
                  </Typography>
                  <Typography variant="body2">
                    Bu GTM Container henüz doğrulanmamış. Facebook token ekleyebilirsiniz ancak CAPI entegrasyonu çalışmayabilir. 
                    GTM doğrulama işlemini tamamlamanızı öneririz.
                  </Typography>
                </Alert>
              )}
              
              <TextField
                label="Access Token"
                value={newToken.access_token}
                onChange={e => setNewToken({ ...newToken, access_token: e.target.value })}
                fullWidth
                margin="normal"
                helperText="Facebook Business Manager'dan aldığınız Access Token"
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Token Adı (Opsiyonel)"
                value={newToken.token_name}
                onChange={e => setNewToken({ ...newToken, token_name: e.target.value })}
                fullWidth
                margin="normal"
                helperText="Token'ınızı tanımlamak için bir isim verin"
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Dataset ID (Pixel ID)"
                value={newToken.dataset_id}
                onChange={e => setNewToken({ ...newToken, dataset_id: e.target.value })}
                fullWidth
                margin="normal"
                helperText="Facebook Events Manager'daki Pixel ID'niz"
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: '#f8fafc', 
          borderTop: '1px solid #e2e8f0' 
        }}>
          <Button 
            onClick={() => setTokenDialogOpen(false)} 
            color="secondary"
            variant="outlined"
          >
            İptal
          </Button>
          <Button 
            onClick={handleAddToken} 
            variant="contained" 
            color="primary" 
            disabled={
              tokenLoading || 
              verifiedDomains.filter(v => v.is_verified).length === 0 ||
              !newToken.access_token ||
              !newToken.dataset_id ||
              !newToken.gtm_container_id
            }
            sx={{ 
              minWidth: 100,
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' }
            }}
          >
            {tokenLoading ? <CircularProgress size={24} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Token Düzenle Dialog */}
      <Dialog 
        open={editTokenDialogOpen} 
        onClose={() => setEditTokenDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 600,
          color: '#1e293b'
        }}>
          Token Düzenle
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Token Adı"
            value={editToken?.token_name || ''}
            onChange={e => setEditToken({ ...editToken, token_name: e.target.value })}
            fullWidth
            margin="normal"
            helperText="Token'ınızı tanımlamak için bir isim verin"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: '#f8fafc', 
          borderTop: '1px solid #e2e8f0' 
        }}>
          <Button 
            onClick={() => setEditTokenDialogOpen(false)} 
            color="secondary"
            variant="outlined"
          >
            İptal
          </Button>
          <Button
            onClick={() => {
              setTokens(tokens.map(t => t.id === editToken.id ? { ...t, token_name: editToken.token_name } : t));
              setEditTokenDialogOpen(false);
              showSnackbar('Token adı güncellendi', 'success');
            }}
            variant="contained"
            color="primary"
            sx={{ 
              minWidth: 100,
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' }
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default FacebookTokensSection; 