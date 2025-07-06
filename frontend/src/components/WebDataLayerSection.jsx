import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Tabs,
  Tab,
  Code,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  AddShoppingCart as AddShoppingCartIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  LocalOffer as LocalOfferIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  Report as ReportIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Close as CloseIcon
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function WebDataLayerSection({ showSnackbar }) {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showSnackbar(`${label} kopyalandı!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const ecommerceEvents = [
    {
      name: 'ViewContent',
      description: 'Ürün detay sayfası görüntüleme',
      icon: <VisibilityIcon />,
      code: `// Ürün detay sayfasında
DataLayerHelper.pushEvent('ViewContent', {
  content_name: 'Ürün Detay',
  content_category: 'E-ticaret',
  content_ids: ['PROD_123'],
  content_type: 'product',
  value: 299.99,
  currency: 'TRY'
});`
    },
    {
      name: 'AddToCart',
      description: 'Sepete ürün ekleme',
      icon: <AddShoppingCartIcon />,
      code: `// Sepete ekle butonuna tıklandığında
document.querySelector('.add-to-cart-btn').addEventListener('click', async function() {
  const productId = this.getAttribute('data-product-id');
  const productPrice = this.getAttribute('data-price');
  
  await DataLayerHelper.pushEvent('AddToCart', {
    content_name: 'Sepete Ekle',
    content_category: 'E-ticaret',
    content_ids: [productId],
    content_type: 'product',
    value: parseFloat(productPrice),
    currency: 'TRY'
  });
});`
    },
    {
      name: 'InitiateCheckout',
      description: 'Ödeme sürecini başlatma',
      icon: <PaymentIcon />,
      code: `// Ödeme sayfasına yönlendirme
document.querySelector('.checkout-btn').addEventListener('click', async function() {
  await DataLayerHelper.pushEvent('InitiateCheckout', {
    content_name: 'Ödeme Başlat',
    content_category: 'E-ticaret',
    content_ids: ['CART_ITEMS'],
    content_type: 'product_group',
    value: 599.98,
    currency: 'TRY',
    num_items: 2
  });
});`
    },
    {
      name: 'Purchase',
      description: 'Satın alma tamamlama',
      icon: <ShoppingCartIcon />,
      code: `// Satın alma tamamlandığında
DataLayerHelper.pushEvent('Purchase', {
  content_name: 'Satın Alma',
  content_category: 'E-ticaret',
  content_ids: ['ORDER_12345'],
  content_type: 'product_group',
  value: 599.98,
  currency: 'TRY',
  num_items: 2,
  order_id: 'ORDER_12345'
});`
    },
    {
      name: 'AddToWishlist',
      description: 'Favorilere ekleme',
      icon: <FavoriteIcon />,
      code: `// Favorilere ekle butonuna tıklandığında
document.querySelector('.wishlist-btn').addEventListener('click', async function() {
  const productId = this.getAttribute('data-product-id');
  
  await DataLayerHelper.pushEvent('AddToWishlist', {
    content_name: 'Favorilere Ekle',
    content_category: 'E-ticaret',
    content_ids: [productId],
    content_type: 'product',
    value: 299.99,
    currency: 'TRY'
  });
});`
    },
    {
      name: 'Search',
      description: 'Ürün arama',
      icon: <SearchIcon />,
      code: `// Arama yapıldığında
document.querySelector('.search-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const searchTerm = document.querySelector('.search-input').value;
  
  await DataLayerHelper.pushEvent('Search', {
    content_name: 'Ürün Arama',
    content_category: 'E-ticaret',
    search_string: searchTerm
  });
});`
    }
  ];

  const leadEvents = [
    {
      name: 'Lead',
      description: 'Form gönderimi (e-posta/telefon)',
      icon: <PersonIcon />,
      code: `// İletişim formu gönderildiğinde
document.querySelector('.contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.querySelector('.email-input').value;
  const phone = document.querySelector('.phone-input').value;
  
  // Meta CAPI uyumlu hash fonksiyonları
  const hashedEmail = email ? await DataLayerHelper.sha256(email.toLowerCase().trim()) : null;
  const hashedPhone = phone ? await DataLayerHelper.sha256(phone.replace(/[^0-9]/g, '')) : null;
  
  window.dataLayer.push({
    event: 'lead',
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: 'lead_' + Date.now(),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      em: hashedEmail ? [hashedEmail] : [],
      ph: hashedPhone ? [hashedPhone] : [],
      client_ip_address: '',
      client_user_agent: navigator.userAgent
    },
    custom_data: {
      content_name: 'İletişim Formu',
      content_category: 'Lead',
      value: 0,
      currency: 'TRY'
    }
  });
});`
    },
    {
      name: 'Lead',
      description: 'Telefon numarası tıklama',
      icon: <PhoneIcon />,
      code: `// Telefon numarasına tıklandığında
document.querySelector('.phone-link').addEventListener('click', async function() {
  const phone = this.getAttribute('href').replace('tel:', '');
  
  // Meta CAPI uyumlu hash
  const hashedPhone = await DataLayerHelper.sha256(phone.replace(/[^0-9]/g, ''));
  
  window.dataLayer.push({
    event: 'lead',
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: 'phone_' + Date.now(),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      ph: [hashedPhone],
      client_ip_address: '',
      client_user_agent: navigator.userAgent
    },
    custom_data: {
      content_name: 'Telefon Tıklama',
      content_category: 'Lead',
      value: 0,
      currency: 'TRY'
    }
  });
});`
    },
    {
      name: 'Lead',
      description: 'E-posta tıklama',
      icon: <EmailIcon />,
      code: `// E-posta adresine tıklandığında
document.querySelector('.email-link').addEventListener('click', async function() {
  const email = this.getAttribute('href').replace('mailto:', '');
  
  // Meta CAPI uyumlu hash
  const hashedEmail = await DataLayerHelper.sha256(email.toLowerCase().trim());
  
  window.dataLayer.push({
    event: 'lead',
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: 'email_' + Date.now(),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      em: [hashedEmail],
      client_ip_address: '',
      client_user_agent: navigator.userAgent
    },
    custom_data: {
      content_name: 'E-posta Tıklama',
      content_category: 'Lead',
      value: 0,
      currency: 'TRY'
    }
  });
});`
    }
  ];

  const setupCode = `<!-- 1. DataLayer Başlatma (HEAD bölümüne) -->
<script>
window.dataLayer = window.dataLayer || [];
</script>

<!-- 2. GTM Script Ekleme (HEAD bölümüne) -->
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>

<!-- 3. GTM Noscript (BODY başlangıcına) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<!-- 4. Sayfa Yüklendiğinde PageView Event -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  window.dataLayer.push({
    event: 'page_view',
    event_name: 'PageView',
    event_time: Math.floor(Date.now() / 1000),
    event_id: 'page_' + Date.now(),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      client_ip_address: '',
      client_user_agent: navigator.userAgent
    },
    custom_data: {
      content_name: document.title,
      content_category: 'Sayfa Görüntüleme'
    }
  });
});
</script>`;

  const helperFunctions = `// Helper Fonksiyonlar
const DataLayerHelper = {
  // Event gönderme fonksiyonu (Meta CAPI uyumlu)
  async pushEvent: function(eventName, customData = {}, userData = {}) {
    // User data'yı hash'le
    const hashedUserData = {};
    
    if (userData.email) {
      hashedUserData.em = [await this.hashEmail(userData.email)];
    }
    if (userData.phone) {
      hashedUserData.ph = [await this.hashPhone(userData.phone)];
    }
    if (userData.fn) {
      hashedUserData.fn = [await this.hashName(userData.fn)];
    }
    if (userData.ln) {
      hashedUserData.ln = [await this.hashName(userData.ln)];
    }
    if (userData.ge) {
      hashedUserData.ge = [await this.hashGender(userData.ge)];
    }
    if (userData.db) {
      hashedUserData.db = [await this.hashBirthday(userData.db)];
    }
    if (userData.ct) {
      hashedUserData.ct = [await this.hashCity(userData.ct)];
    }
    if (userData.st) {
      hashedUserData.st = [await this.hashState(userData.st)];
    }
    if (userData.zp) {
      hashedUserData.zp = [await this.hashZipcode(userData.zp)];
    }
    if (userData.country) {
      hashedUserData.country = [await this.hashCountry(userData.country)];
    }
    if (userData.external_id) {
      hashedUserData.external_id = [await this.hashExternalId(userData.external_id)];
    }
    
    // Non-hashed fields
    if (userData.client_ip_address) {
      hashedUserData.client_ip_address = userData.client_ip_address;
    }
    if (userData.client_user_agent) {
      hashedUserData.client_user_agent = userData.client_user_agent;
    }
    if (userData.fbc) {
      hashedUserData.fbc = userData.fbc;
    }
    if (userData.fbp) {
      hashedUserData.fbp = userData.fbp;
    }
    
    const event = {
      event: eventName.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase(),
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventName.toLowerCase() + '_' + Date.now(),
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: {
        client_ip_address: '',
        client_user_agent: navigator.userAgent,
        ...hashedUserData
      },
      custom_data: {
        content_name: eventName,
        content_category: 'E-ticaret',
        ...customData
      }
    };
    
    window.dataLayer.push(event);
    console.log('DataLayer Event (Meta CAPI):', event);
  },

  // SHA-256 hash fonksiyonu (Meta CAPI uyumlu)
  async sha256: function(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  // E-posta hash'leme (Meta CAPI standard)
  async hashEmail: function(email) {
    if (!email) return null;
    return await this.sha256(email.toLowerCase().trim());
  },

  // Telefon hash'leme (Meta CAPI standard)
  async hashPhone: function(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return null;
    return await this.sha256(cleanPhone);
  },

  // İsim hash'leme (Meta CAPI standard)
  async hashName: function(name) {
    if (!name) return null;
    return await this.sha256(name.toLowerCase().trim());
  },

  // Şehir hash'leme (Meta CAPI standard)
  async hashCity: function(city) {
    if (!city) return null;
    return await this.sha256(city.toLowerCase().trim());
  },

  // Eyalet hash'leme (Meta CAPI standard)
  async hashState: function(state) {
    if (!state) return null;
    return await this.sha256(state.toLowerCase().trim());
  },

  // Posta kodu hash'leme (Meta CAPI standard)
  async hashZipcode: function(zipcode) {
    if (!zipcode) return null;
    return await this.sha256(zipcode.toString());
  },

  // Ülke hash'leme (Meta CAPI standard)
  async hashCountry: function(country) {
    if (!country) return null;
    return await this.sha256(country.toLowerCase().trim());
  },

  // Cinsiyet hash'leme (Meta CAPI standard)
  async hashGender: function(gender) {
    if (!gender) return null;
    return await this.sha256(gender.toLowerCase().trim());
  },

  // Doğum tarihi hash'leme (Meta CAPI standard)
  async hashBirthday: function(birthday) {
    if (!birthday) return null;
    return await this.sha256(birthday.toString());
  },

  // External ID hash'leme (Meta CAPI standard)
  async hashExternalId: function(externalId) {
    if (!externalId) return null;
    return await this.sha256(externalId.toString());
  },

  // Buton event listener ekleme
  addButtonListener: function(selector, eventName, customData = {}) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.addEventListener('click', () => {
        this.pushEvent(eventName, customData);
      });
    });
  }
};

// Kullanım örnekleri:
// DataLayerHelper.pushEvent('AddToCart', { content_ids: ['PROD_123'], value: 299.99 });
// DataLayerHelper.addButtonListener('.add-to-cart', 'AddToCart', { content_ids: ['PROD_123'] });`;

  const testCode = `// Test Fonksiyonları
const DataLayerTest = {
  // Tüm event'leri test et
  testAllEvents: async function() {
    console.log('DataLayer Test Başlıyor...');
    
    // PageView Test
    await this.testPageView();
    
    // E-ticaret Event Testleri
    setTimeout(async () => await this.testViewContent(), 1000);
    setTimeout(async () => await this.testAddToCart(), 2000);
    setTimeout(async () => await this.testInitiateCheckout(), 3000);
    setTimeout(async () => await this.testPurchase(), 4000);
    setTimeout(async () => await this.testAddToWishlist(), 5000);
    setTimeout(async () => await this.testSearch(), 6000);
    
    // Lead Event Testleri
    setTimeout(async () => await this.testLead(), 7000);
    setTimeout(async () => await this.testPhoneClick(), 8000);
    setTimeout(async () => await this.testEmailClick(), 9000);
  },

  testPageView: function() {
    console.log('PageView Test...');
    DataLayerHelper.pushEvent('PageView', {
      content_name: 'Test Sayfası',
      content_category: 'Test'
    });
  },

  testViewContent: function() {
    console.log('ViewContent Test...');
    DataLayerHelper.pushEvent('ViewContent', {
      content_ids: ['TEST_PROD_123'],
      content_type: 'product',
      value: 299.99,
      currency: 'TRY'
    });
  },

  testAddToCart: function() {
    console.log('AddToCart Test...');
    DataLayerHelper.pushEvent('AddToCart', {
      content_ids: ['TEST_PROD_123'],
      content_type: 'product',
      value: 299.99,
      currency: 'TRY'
    });
  },

  testInitiateCheckout: function() {
    console.log('InitiateCheckout Test...');
    DataLayerHelper.pushEvent('InitiateCheckout', {
      content_ids: ['TEST_CART'],
      content_type: 'product_group',
      value: 599.98,
      currency: 'TRY',
      num_items: 2
    });
  },

  testPurchase: function() {
    console.log('Purchase Test...');
    DataLayerHelper.pushEvent('Purchase', {
      content_ids: ['TEST_ORDER_123'],
      content_type: 'product_group',
      value: 599.98,
      currency: 'TRY',
      num_items: 2,
      order_id: 'TEST_ORDER_123'
    });
  },

  testAddToWishlist: function() {
    console.log('AddToWishlist Test...');
    DataLayerHelper.pushEvent('AddToWishlist', {
      content_ids: ['TEST_PROD_123'],
      content_type: 'product',
      value: 299.99,
      currency: 'TRY'
    });
  },

  testSearch: function() {
    console.log('Search Test...');
    DataLayerHelper.pushEvent('Search', {
      search_string: 'test ürün'
    });
  },

  testLead: async function() {
    console.log('Lead Test...');
    await DataLayerHelper.pushEvent('Lead', {
      content_name: 'Test Form',
      content_category: 'Lead',
      value: 0,
      currency: 'TRY'
    }, {
      email: 'test@example.com',
      phone: '+905551234567',
      fn: 'Test',
      ln: 'User'
    });
  },

  testPhoneClick: async function() {
    console.log('Phone Click Test...');
    await DataLayerHelper.pushEvent('Lead', {
      content_name: 'Test Telefon',
      content_category: 'Lead',
      value: 0,
      currency: 'TRY'
    }, {
      phone: '+905551234567'
    });
  },

  testEmailClick: async function() {
    console.log('Email Click Test...');
    await DataLayerHelper.pushEvent('Lead', {
      content_name: 'Test E-posta',
      content_category: 'Lead',
      value: 0,
      currency: 'TRY'
    }, {
      email: 'test@example.com'
    });
  }
};

// Test başlatma
// DataLayerTest.testAllEvents();`;

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 700, 
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <CodeIcon sx={{ color: '#2563eb' }} />
          Web DataLayer Entegrasyon Rehberi
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Meta Conversions API (CAPI) uyumlu Web DataLayer entegrasyonu için kapsamlı rehber
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Önemli Bilgi</AlertTitle>
          Bu rehber, web sitenizde Google Tag Manager (GTM) ile Meta Conversions API entegrasyonu için gerekli DataLayer event'lerini açıklar. 
          Tüm event'ler Meta CAPI formatında Facebook'a gönderilir.
        </Alert>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 600
            }
          }}
        >
          <Tab label="Kurulum" />
          <Tab label="E-ticaret Event'leri" />
          <Tab label="Lead Event'leri" />
          <Tab label="Helper Fonksiyonlar" />
          <Tab label="Test Etme" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  <CodeIcon sx={{ mr: 1 }} />
                  Kurulum Kodu
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <strong>GTM-XXXXXXX</strong> yerine kendi GTM Container ID'nizi yazın!
                </Alert>
                <Box sx={{ position: 'relative' }}>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '14px'
                  }}>
                    {setupCode}
                  </pre>
                  <IconButton
                    onClick={() => copyToClipboard(setupCode, 'Kurulum kodu')}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {ecommerceEvents.map((event, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: '#1976d2', mr: 1 }}>
                      {event.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#1976d2' }}>
                      {event.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '12px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px',
                      maxHeight: '300px'
                    }}>
                      {event.code}
                    </pre>
                    <IconButton
                      onClick={() => copyToClipboard(event.code, `${event.name} kodu`)}
                      sx={{ position: 'absolute', top: 4, right: 4 }}
                      size="small"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {leadEvents.map((event, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: '#1976d2', mr: 1 }}>
                      {event.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#1976d2' }}>
                      {event.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '12px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px',
                      maxHeight: '300px'
                    }}>
                      {event.code}
                    </pre>
                    <IconButton
                      onClick={() => copyToClipboard(event.code, `${event.name} kodu`)}
                      sx={{ position: 'absolute', top: 4, right: 4 }}
                      size="small"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  <CodeIcon sx={{ mr: 1 }} />
                  Helper Fonksiyonlar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bu fonksiyonlar event göndermeyi kolaylaştırır ve kod tekrarını önler.
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '14px',
                    maxHeight: '400px'
                  }}>
                    {helperFunctions}
                  </pre>
                  <IconButton
                    onClick={() => copyToClipboard(helperFunctions, 'Helper fonksiyonlar')}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  <CodeIcon sx={{ mr: 1 }} />
                  Test Fonksiyonları
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bu fonksiyonlar tüm event'leri test etmenizi sağlar. Console'da sonuçları görebilirsiniz.
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '14px',
                    maxHeight: '400px'
                  }}>
                    {testCode}
                  </pre>
                  <IconButton
                    onClick={() => copyToClipboard(testCode, 'Test fonksiyonu')}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
} 