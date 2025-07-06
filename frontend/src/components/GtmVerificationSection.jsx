import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { getGtmVerifications, addGtmVerification, deleteGtmVerification, verifyGtmVerification, getGtmVerificationScript } from '../services/api';

const GtmVerificationSection = ({ onVerificationDeleted, onVerificationCompleted }) => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newVerification, setNewVerification] = useState({
    gtm_container_id: '',
    domain_name: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [verifying, setVerifying] = useState({});
  const [scriptDialog, setScriptDialog] = useState({ open: false, verification: null, script: '' });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchVerifications = useCallback(async () => {
    try {
      const response = await getGtmVerifications();
      setVerifications(response.verifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      showSnackbar('Verifications yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddVerification = async () => {
    try {
      const response = await addGtmVerification(newVerification);
      setVerifications([...verifications, response]);
      setDialogOpen(false);
      setNewVerification({ gtm_container_id: '', domain_name: '' });
      showSnackbar('GTM verification başarıyla eklendi');
      
      // Yeni verification oluşturulduğunda otomatik olarak script'i al ve kopyala
      try {
        const scriptResponse = await getGtmVerificationScript(response.id);
        const script = scriptResponse.verification_script;
        
        // Script'i otomatik olarak panoya kopyala
        await navigator.clipboard.writeText(script);
        
        // Script dialog'unu aç
        setScriptDialog({
          open: true,
          verification: response,
          script: script
        });
        
        showSnackbar('Script otomatik olarak kopyalandı ve açıldı!', 'success');
      } catch (scriptError) {
        console.error('Script alınırken hata:', scriptError);
        showSnackbar('Verification eklendi fakat script alınamadı', 'warning');
      }
    } catch (error) {
      showSnackbar(error.message || 'GTM verification eklenirken hata oluştu', 'error');
    }
  };

  const handleDeleteVerification = async (verificationId) => {
    try {
      const response = await deleteGtmVerification(verificationId);
      const deletedVerification = verifications.find(v => v.id === verificationId);
      setVerifications(verifications.filter(v => v.id !== verificationId));
      
      // Eğer silinen verification'a ait Facebook token'lar varsa, callback ile bildir
      if (response.deleted_tokens_count > 0) {
        showSnackbar(`GTM verification ve ${response.deleted_tokens_count} adet Facebook token başarıyla silindi`);
        // Parent component'e bildir (Dashboard'da token'ları güncellemek için)
        if (onVerificationDeleted && deletedVerification) {
          onVerificationDeleted(deletedVerification.gtm_container_id, response.deleted_tokens_count);
        }
      } else {
        showSnackbar('GTM verification başarıyla silindi');
      }
    } catch (error) {
      showSnackbar('GTM verification silinirken hata oluştu', 'error');
    }
  };

  const handleVerifyVerification = async (verificationId) => {
    setVerifying({ ...verifying, [verificationId]: true });
    try {
      const response = await verifyGtmVerification(verificationId);
      const updatedVerification = response.verification;
      setVerifications(verifications.map(v => 
        v.id === verificationId ? updatedVerification : v
      ));
      showSnackbar('GTM verification başarılı!');
      
      // Doğrulama tamamlandığında parent component'e bildir
      if (onVerificationCompleted && updatedVerification.is_verified) {
        onVerificationCompleted(updatedVerification);
      }
    } catch (error) {
      if (error.response?.data?.verification_script) {
        setScriptDialog({
          open: true,
          verification: verifications.find(v => v.id === verificationId),
          script: error.response.data.verification_script
        });
      }
      showSnackbar(error.message || 'Doğrulama başarısız', 'error');
    } finally {
      setVerifying({ ...verifying, [verificationId]: false });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Kod panoya kopyalandı');
  };

  const getVerificationScript = async (verificationId) => {
    try {
      const response = await getGtmVerificationScript(verificationId);
      setScriptDialog({
        open: true,
        verification: verifications.find(v => v.id === verificationId),
        script: response.verification_script
      });
    } catch (error) {
      showSnackbar('Script alınırken hata oluştu', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            GTM Doğrulama Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Domain'lerinizi GTM ile doğrulayın ve Facebook CAPI entegrasyonunu aktifleştirin
          </Typography>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              🔗 Facebook Token Entegrasyonu
            </Typography>
            <Typography variant="body2">
              GTM doğrulaması tamamlandıktan sonra, <strong>Facebook Token Yönetimi</strong> sekmesinden 
              o GTM Container için Facebook token ekleyebilirsiniz. Her doğrulanmış GTM Container'a 
              sadece bir Facebook token eklenebilir.
            </Typography>
          </Alert>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Yeni Doğrulama Ekle
        </Button>
      </Box>

      {/* Verifications List */}
      {verifications.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <VerifiedUserIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Henüz GTM doğrulaması eklenmemiş
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            İlk GTM doğrulamanızı ekleyerek başlayın
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            İlk Doğrulamayı Ekle
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {verifications.map((verification) => (
            <Grid item xs={12} md={6} key={verification.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {verification.domain_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {verification.gtm_container_id}
                      </Typography>
                    </Box>
                    <Chip
                      icon={verification.is_verified ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={verification.is_verified ? 'Doğrulandı' : 'Doğrulanmadı'}
                      color={verification.is_verified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Oluşturulma: {new Date(verification.created_at).toLocaleDateString('tr-TR')}
                    </Typography>
                    {verification.verified_at && (
                      <Typography variant="body2" color="text.secondary">
                        Doğrulanma: {new Date(verification.verified_at).toLocaleDateString('tr-TR')}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {!verification.is_verified && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={verifying[verification.id] ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={() => handleVerifyVerification(verification.id)}
                        disabled={verifying[verification.id]}
                        sx={{ borderRadius: 1 }}
                      >
                        Doğrula
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CodeIcon />}
                      onClick={() => getVerificationScript(verification.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      Script Al
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteVerification(verification.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Verification Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni GTM Doğrulama Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="GTM Container ID"
              value={newVerification.gtm_container_id}
              onChange={(e) => setNewVerification({ ...newVerification, gtm_container_id: e.target.value })}
              placeholder="GTM-XXXXXX"
              sx={{ mb: 3 }}
              helperText="Örnek: GTM-ABC123"
            />
            <TextField
              fullWidth
              label="Domain Name"
              value={newVerification.domain_name}
              onChange={(e) => setNewVerification({ ...newVerification, domain_name: e.target.value })}
              placeholder="example.com"
              sx={{ mb: 2 }}
              helperText="Örnek: mysite.com (https:// olmadan)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleAddVerification} variant="contained">
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Script Dialog */}
      <Dialog 
        open={scriptDialog.open} 
        onClose={() => setScriptDialog({ open: false, verification: null, script: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          GTM Doğrulama Scripti
          {scriptDialog.verification && (
            <Typography variant="body2" color="text.secondary">
              {scriptDialog.verification.domain_name} - {scriptDialog.verification.gtm_container_id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Script otomatik olarak panoya kopyalandı! Bu scripti web sitenizin &lt;head&gt; bölümüne ekleyin. Doğrulama tamamlandıktan sonra scripti kaldırabilirsiniz.
          </Alert>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                bgcolor: '#1e293b',
                borderRadius: 2,
                p: 3,
                fontFamily: 'Fira Code, monospace',
                color: '#e2e8f0',
                fontSize: 14,
                overflowX: 'auto',
                position: 'relative'
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{scriptDialog.script}</pre>
              <IconButton
                onClick={() => copyToClipboard(scriptDialog.script)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: '#667eea',
                  color: 'white',
                  '&:hover': { bgcolor: '#5a67d8' }
                }}
                size="small"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScriptDialog({ open: false, verification: null, script: '' })}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GtmVerificationSection; 