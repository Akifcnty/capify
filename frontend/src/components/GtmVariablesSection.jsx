import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  ContentCopy as ContentCopyIcon, 
  Code as CodeIcon
} from '@mui/icons-material';

const GtmVariablesSection = ({ showSnackbar }) => {
  const variableConfig = {
    email: { required: true },
    phone: { required: false },
    fn: { required: false },
    ln: { required: false },
    ge: { required: false },
    db: { required: false },
    ct: { required: false },
    st: { required: false },
    zp: { required: false },
    country: { required: false },
    external_id: { required: false },
    client_ip_address: { required: false },
    client_user_agent: { required: false },
    fbc: { required: false },
    fbp: { required: false },
    test_event_code: { required: false },
    value: { required: false },
    currency: { required: false },
    content_ids: { required: false },
    contents: { required: false },
    order_id: { required: false },
    search_string: { required: false },
    registration_method: { required: false },
    form_id: { required: false },
    lead_type: { required: false },
    contact_method: { required: false },
    predicted_ltv: { required: false },
    delivery_category: { required: false }
  };

  const copyAllVariables = () => {
    const allVariables = Object.keys(variableConfig)
      .map(variableName => {
        if (variableName === 'fbc' || variableName === 'fbp') {
          return `Cookie - _${variableName}`;
        }
        return `DLV - ${variableName}`;
      })
      .join('\n');
    
    navigator.clipboard.writeText(allVariables);
    showSnackbar('Tüm değişken isimleri kopyalandı!', 'success');
  };

  const copyVariableName = (variableName) => {
    let variableText;
    if (variableName === 'fbc' || variableName === 'fbp') {
      variableText = `Cookie - _${variableName}`;
    } else {
      variableText = `DLV - ${variableName}`;
    }
    navigator.clipboard.writeText(variableText);
    showSnackbar(`"${variableText}" kopyalandı!`, 'success');
  };

  const copyDataLayerExample = (variableName) => {
    const example = getDataLayerExample(variableName);
    navigator.clipboard.writeText(example);
    showSnackbar('DataLayer örneği kopyalandı!', 'success');
  };

  const getVariableDescription = (variableName) => {
    const descriptions = {
      email: "User email address (will be SHA256 hashed)",
      phone: "User phone number (will be SHA256 hashed)",
      fn: "User first name (will be SHA256 hashed)",
      ln: "User last name (will be SHA256 hashed)",
      ge: "User gender (will be SHA256 hashed)",
      db: "User date of birth (will be SHA256 hashed)",
      ct: "User city (will be SHA256 hashed)",
      st: "User state (will be SHA256 hashed)",
      zp: "User zip code (will be SHA256 hashed)",
      country: "User country (will be SHA256 hashed)",
      external_id: "External user ID (will be SHA256 hashed)",
      client_ip_address: "Client IP address (not hashed)",
      client_user_agent: "Client user agent (not hashed)",
      fbc: "Facebook click ID (not hashed)",
      fbp: "Facebook browser ID (not hashed)",
      test_event_code: "Test event code for Meta testing",
      value: "Event value (e.g., purchase amount)",
      currency: "Currency code (e.g., USD, EUR)",
      content_ids: "Content IDs array",
      contents: "Contents array with item details",
      order_id: "Order ID for purchase events",
      search_string: "Search query string",
      registration_method: "Registration method used",
      form_id: "Form ID for lead events",
      lead_type: "Type of lead generated",
      contact_method: "Contact method used",
      predicted_ltv: "Predicted lifetime value",
      delivery_category: "Delivery category"
    };
    return descriptions[variableName] || "Variable for GTM data layer";
  };

  const getVariableCategory = (variableName) => {
    if (['email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country', 'external_id'].includes(variableName)) {
      return "User Identifiers (Hashed)";
    } else if (['client_ip_address', 'client_user_agent', 'fbc', 'fbp'].includes(variableName)) {
      return "System Data (Not Hashed)";
    } else if (variableName === 'test_event_code') {
      return "Testing";
    } else {
      return "Custom Data";
    }
  };

  const getDataLayerExample = (variableName) => {
    const examples = {
      email: "dataLayer.push({email: 'user@example.com'})",
      phone: "dataLayer.push({phone: '+1234567890'})",
      fn: "dataLayer.push({fn: 'John'})",
      ln: "dataLayer.push({ln: 'Doe'})",
      value: "dataLayer.push({value: 99.99})",
      currency: "dataLayer.push({currency: 'USD'})",
      content_ids: "dataLayer.push({content_ids: ['prod_123', 'prod_456']})",
      test_event_code: "dataLayer.push({test_event_code: 'TEST123'})",
      fbc: "Cookie Variable - _fbc",
      fbp: "Cookie Variable - _fbp"
    };
    return examples[variableName] || `dataLayer.push({${variableName}: 'value'})`;
  };

  const variableCategories = [
    {
      title: "Kullanıcı Tanımlayıcıları (Hash'lenecek)",
      variables: ['email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country', 'external_id'],
      description: "Bu değişkenler SHA256 ile hash'lenir"
    },
    {
      title: "Sistem Verileri (Hash'lenmeyecek)",
      variables: ['client_ip_address', 'client_user_agent', 'fbc', 'fbp'],
      description: "Bu değişkenler hash'lenmez"
    },
    {
      title: "Test ve Özel Veriler",
      variables: ['test_event_code', 'value', 'currency', 'content_ids', 'contents', 'order_id', 'search_string', 'registration_method', 'form_id', 'lead_type', 'contact_method', 'predicted_ltv', 'delivery_category'],
      description: "Event'e özel veriler"
    }
  ];

  return (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    {/* Header Section */}
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderRadius: 4, 
      p: 4, 
      mb: 4,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        position: 'absolute', 
        top: -20, 
        right: -20, 
        opacity: 0.1,
        transform: 'rotate(15deg)'
      }}>
        <CodeIcon sx={{ fontSize: 120 }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          🎯 GTM Değişkenleri ve Mapping
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          GTM scriptlerinizle uyumlu değişken konfigürasyonları ve kopyalanabilir referans tabloları.
      </Typography>
      <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
        <Typography variant="body2">
          <strong>💡 İpucu:</strong> Bu tablodaki tüm variable'ları GTM'de oluşturduktan sonra, GTM Scriptlerinde kullanabilirsiniz. Variable adları tam olarak belirtildiği gibi olmalıdır!
        </Typography>
      </Alert>
    </Box>

      {/* Script Uyumlu Variable İsimleri */}
      <Accordion defaultExpanded sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CodeIcon color="primary" />
            <Typography variant="h6">Script Uyumlu Variable İsimleri</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={copyAllVariables}
              sx={{ mb: 2 }}
            >
              Tüm Variable İsimlerini Kopyala
            </Button>
          </Box>

          {variableCategories.map((category, index) => (
            <Card key={index} sx={{ mb: 3 }}>
              <CardHeader
                title={category.title}
                subheader={category.description}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {category.variables.map((variableName) => (
                    <Grid item xs={12} sm={6} md={4} key={variableName}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {variableName}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyVariableName(variableName)}
                            sx={{ color: 'primary.main' }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', background: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
                          {variableName === 'fbc' || variableName === 'fbp' ? `Cookie - _${variableName}` : `DLV - ${variableName}`}
                          </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          DataLayer Örneği:
                          </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', background: '#f0f0f0', p: 1, borderRadius: 1, flex: 1, mr: 1 }}>
                            {getDataLayerExample(variableName)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyDataLayerExample(variableName)}
                            sx={{ color: 'primary.main' }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
            </Card>
          </Grid>
                  ))}
          </Grid>
              </CardContent>
            </Card>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Variable Mapping Tablosu */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CodeIcon color="primary" />
            <Typography variant="h6">Variable Mapping Tablosu</Typography>
                          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Kullanım:</strong> Bu tabloyu kullanarak GTM'de Data Layer Variables oluşturun. 
            Variable Name sütunundaki isimleri GTM'de kullanın.
          </Alert>

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Variable Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>GTM Variable Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Data Layer Variable Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Açıklama</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Zorunlu</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(variableConfig).map(([variableName, settings], index) => (
                  <tr key={variableName} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {variableName}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {variableName === 'fbc' || variableName === 'fbp' ? 'Cookie' : 'Data Layer Variable'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontFamily: 'monospace' }}>
                      {variableName === 'fbc' || variableName === 'fbp' ? `Cookie - _${variableName}` : `DLV - ${variableName}`}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {getVariableDescription(variableName)}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {settings.required ? '✅ Evet' : '❌ Hayır'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>
);
};

export default GtmVariablesSection; 