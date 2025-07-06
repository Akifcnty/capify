import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const SssSection = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
      Sıkça Sorulan Sorular (SSS)
    </Typography>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Facebook Access Token'ım güvende mi?</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Evet, Access Token'ınız sadece backend'de güvenli şekilde saklanır ve asla frontend veya GTM scriptlerinde gösterilmez.
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>GTM Container ID nedir ve nereden bulabilirim?</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          GTM Container ID, Google Tag Manager hesabınızda oluşturduğunuz container'ın kimliğidir. Genellikle "GTM-XXXXXXX" formatındadır.
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Event'lerim Facebook'a ne zaman iletilir?</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Event'leriniz, GTM scripti tetiklendiğinde backend'e iletilir ve oradan Facebook CAPI'ye gönderilir. Aktif token yoksa event gönderilmez.
        </Typography>
      </AccordionDetails>
    </Accordion>
    {/* Daha fazla SSS eklenebilir */}
  </Box>
);

export default SssSection; 