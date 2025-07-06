import React from 'react';
import GtmScripts from './GtmScripts';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';

const GtmScriptsSection = ({ domain, tokens, showSnackbar }) => (
  <>
    <GtmScripts domain={domain} tokens={tokens} />
    {/* Entegrasyon Rehberi */}
    <Box sx={{ mt: 6, p: 3, bgcolor: '#f8fafc', borderRadius: 3, boxShadow: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        GTM ile Facebook Events Entegrasyonu: Adım Adım Kurulum
      </Typography>
      <Stepper orientation="vertical" activeStep={-1} sx={{ mb: 3 }}>
        <Step>
          <StepLabel>GTM Container'ınızı oluşturun ve sitenize ekleyin</StepLabel>
        </Step>
        <Step>
          <StepLabel>Panelden GTM Container ID'nizi girin</StepLabel>
        </Step>
        <Step>
          <StepLabel>GTM'de yeni bir Tag oluşturun ve size özel scripti ekleyin</StepLabel>
        </Step>
        <Step>
          <StepLabel>Test edin ve Facebook Events Manager'da doğrulayın</StepLabel>
        </Step>
      </Stepper>
      <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
        Kurulum adımlarında takılırsanız <a href="mailto:support@capify.com">destek ekibimize</a> ulaşabilirsiniz.
      </Alert>
    </Box>
  </>
);

export default GtmScriptsSection; 