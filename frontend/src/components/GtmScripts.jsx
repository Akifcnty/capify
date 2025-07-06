import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle,
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
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
  Close as CloseIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService, getApiBaseUrl, sendTestEvent } from '../services/api';

const EVENTS = [
  { name: 'AddPaymentInfo', description: 'Kullanıcı ödeme bilgisi eklediğinde tetiklenir.', endpoint: '/facebook/events/add-payment-info', examplePayload: '{\n  "event_name": "AddPaymentInfo",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'AddToCart', description: 'Kullanıcı bir ürünü sepete eklediğinde tetiklenir.', endpoint: '/facebook/events/add-to-cart', examplePayload: '{\n  "event_name": "AddToCart",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'AddToWishlist', description: 'Kullanıcı ürünü istek listesine eklediğinde tetiklenir.', endpoint: '/facebook/events/add-to-wishlist', examplePayload: '{\n  "event_name": "AddToWishlist",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'CompleteRegistration', description: 'Kullanıcı kayıt işlemini tamamladığında tetiklenir.', endpoint: '/facebook/events/complete-registration', examplePayload: '{\n  "event_name": "CompleteRegistration",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Contact', description: 'Kullanıcı iletişim başlattığında tetiklenir.', endpoint: '/facebook/events/contact', examplePayload: '{\n  "event_name": "Contact",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'CustomizeProduct', description: 'Kullanıcı ürünü özelleştirdiğinde tetiklenir.', endpoint: '/facebook/events/customize-product', examplePayload: '{\n  "event_name": "CustomizeProduct",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Donate', description: 'Kullanıcı bağış yaptığında tetiklenir.', endpoint: '/facebook/events/donate', examplePayload: '{\n  "event_name": "Donate",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'FindLocation', description: 'Kullanıcı mağaza/lokasyon aradığında tetiklenir.', endpoint: '/facebook/events/find-location', examplePayload: '{\n  "event_name": "FindLocation",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'InitiateCheckout', description: 'Kullanıcı ödeme sürecini başlattığında tetiklenir.', endpoint: '/facebook/events/initiate-checkout', examplePayload: '{\n  "event_name": "InitiateCheckout",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Lead', description: 'Potansiyel müşteri (lead) oluşturulduğunda tetiklenir.', endpoint: '/facebook/events/lead', examplePayload: '{\n  "event_name": "Lead",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Purchase', description: 'Satın alma işlemi tamamlandığında tetiklenir.', endpoint: '/facebook/events/purchase', examplePayload: '{\n  "event_name": "Purchase",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Schedule', description: 'Kullanıcı randevu aldığında tetiklenir.', endpoint: '/facebook/events/schedule', examplePayload: '{\n  "event_name": "Schedule",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Search', description: 'Kullanıcı sitede arama yaptığında tetiklenir.', endpoint: '/facebook/events/search', examplePayload: '{\n  "event_name": "Search",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'StartTrial', description: 'Kullanıcı deneme süresi başlattığında tetiklenir.', endpoint: '/facebook/events/start-trial', examplePayload: '{\n  "event_name": "StartTrial",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'SubmitApplication', description: 'Kullanıcı başvuru gönderdiğinde tetiklenir.', endpoint: '/facebook/events/submit-application', examplePayload: '{\n  "event_name": "SubmitApplication",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'Subscribe', description: 'Kullanıcı ücretli abonelik başlattığında tetiklenir.', endpoint: '/facebook/events/subscribe', examplePayload: '{\n  "event_name": "Subscribe",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'ViewContent', description: 'Bir içerik veya ürün görüntülendiğinde tetiklenir.', endpoint: '/facebook/events/view-content', examplePayload: '{\n  "event_name": "ViewContent",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'PageView', description: 'Sayfa görüntülendiğinde tetiklenir.', endpoint: '/facebook/events/page-view', examplePayload: '{\n  "event_name": "PageView",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
  { name: 'CompletePayment', description: 'Kullanıcı ödeme işlemini tamamladığında tetiklenir.', endpoint: '/facebook/events/complete-payment', examplePayload: '{\n  "event_name": "CompletePayment",\n  "user_data": { ... },\n  "custom_data": { ... }\n}' },
];

// Event bazlı gerekli alanlar
const EVENT_FIELDS = {
  AddPaymentInfo: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  AddToCart: [
    'event_name', 'user_data', 'value', 'currency', 'content_ids', 'custom_data', 'event_time', 'event_source_url'
  ],
  AddToWishlist: [
    'event_name', 'user_data', 'content_ids', 'custom_data', 'event_time', 'event_source_url'
  ],
  CompleteRegistration: [
    'event_name', 'user_data', 'registration_method', 'custom_data', 'event_time', 'event_source_url'
  ],
  Contact: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  CustomizeProduct: [
    'event_name', 'user_data', 'content_ids', 'custom_data', 'event_time', 'event_source_url'
  ],
  Donate: [
    'event_name', 'user_data', 'value', 'currency', 'custom_data', 'event_time', 'event_source_url'
  ],
  FindLocation: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  InitiateCheckout: [
    'event_name', 'user_data', 'value', 'currency', 'content_ids', 'custom_data', 'event_time', 'event_source_url'
  ],
  Lead: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  Purchase: [
    'event_name', 'user_data', 'value', 'currency', 'content_ids', 'order_id', 'custom_data', 'event_time', 'event_source_url'
  ],
  Schedule: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  Search: [
    'event_name', 'user_data', 'search_string', 'custom_data', 'event_time', 'event_source_url'
  ],
  StartTrial: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  SubmitApplication: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  Subscribe: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  ViewContent: [
    'event_name', 'user_data', 'content_ids', 'value', 'currency', 'custom_data', 'event_time', 'event_source_url'
  ],
  PageView: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
  CompletePayment: [
    'event_name', 'user_data', 'custom_data', 'event_time', 'event_source_url'
  ],
};

// GTM Data Layer Variables - Meta CAPI Uyumlu
// Kullanım: GTM'de Data Layer Variable oluşturun ve bu değişkenleri kullanın
const variableMap = {
  // Zorunlu: GTM Container ID (Capify'de kayıtlı olmalı)
  gtm_container_id: "{{DLV - gtm_container_id}}",
  
  // Kullanıcı Bilgileri (Meta CAPI - SHA256 Hash'lenecek)
  email: "{{DLV - email}}",                    // Kullanıcı email adresi
  phone: "{{DLV - phone}}",                    // Kullanıcı telefon numarası
  fn: "{{DLV - fn}}",                          // Ad (First Name)
  ln: "{{DLV - ln}}",                          // Soyad (Last Name)
  ge: "{{DLV - ge}}",                          // Cinsiyet (Gender: m/f)
  db: "{{DLV - db}}",                          // Doğum tarihi (YYYYMMDD)
  ct: "{{DLV - ct}}",                          // Şehir (City)
  st: "{{DLV - st}}",                          // Eyalet/İl (State)
  zp: "{{DLV - zp}}",                          // Posta kodu (Zip Code)
  country: "{{DLV - country}}",                // Ülke (Country)
  external_id: "{{DLV - external_id}}",        // Harici kullanıcı ID'si
  
  // Sistem Bilgileri (Hash'lenmez)
  client_ip_address: "{{DLV - client_ip_address}}",    // Kullanıcı IP adresi
  client_user_agent: "{{DLV - client_user_agent}}",    // Tarayıcı bilgisi
  
  // Facebook Cookie Bilgileri (Hash'lenmez)
  fbc: "{{DLV - fbc}}",                        // Facebook Click ID
  fbp: "{{DLV - fbp}}",                        // Facebook Browser ID
  
  // Ürün/İçerik Bilgileri
  content_ids: "{{DLV - content_ids}}",        // Ürün ID'leri array
  contents: "{{DLV - contents}}",              // Ürün detayları array
  value: "{{DLV - value}}",                    // Değer (fiyat)
  currency: "{{DLV - currency}}",              // Para birimi (USD, EUR, TRY)
  order_id: "{{DLV - order_id}}",              // Sipariş ID'si
  
  // Event Bilgileri
  event_id: "{{DLV - event_id}}",              // Event ID'si
  registration_method: "{{DLV - registration_method}}", // Kayıt yöntemi
  search_string: "{{DLV - search_string}}",    // Arama terimi
  form_id: "{{DLV - form_id}}",                // Form ID'si
  lead_type: "{{DLV - lead_type}}",            // Lead türü
  contact_method: "{{DLV - contact_method}}",  // İletişim yöntemi
  
  // Ek Bilgiler
  predicted_ltv: "{{DLV - predicted_ltv}}",    // Tahmini yaşam boyu değer
  delivery_category: "{{DLV - delivery_category}}", // Teslimat kategorisi
  
  // Test Event Code (Facebook Events Manager'dan alınır)
  test_event_code: "{{DLV - test_event_code}}"
};

function getUserDataFields() {
  return [
    'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
    'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
  ];
}

const getGtmScript = (event, domain, selectedGtmContainerId = null) => {
  const apiUrl = process.env.REACT_APP_API_URL || `https://${domain}`;
  
  // Eğer seçili token varsa, onun GTM container ID'sini kullan, yoksa placeholder kullan
  const gtmContainerId = selectedGtmContainerId || '{{DLV - gtm_container_id}}';
  
  return `// Capify GTM Script - ${event.name} Event
// Meta/Facebook CAPI Compliant
// Generated for: ${domain}
${selectedGtmContainerId ? `// GTM Container ID: ${selectedGtmContainerId}` : ''}

(function() {
  'use strict';
  
  const CAPIFY_API_URL = '${apiUrl}/api/facebook';
  const GTM_CONTAINER_ID = '${gtmContainerId}';
  
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  async function getTokenInfo() {
    try {
      const response = await fetch(\`\${CAPIFY_API_URL}/token-info/\${GTM_CONTAINER_ID}\`);
      if (!response.ok) throw new Error('Token not found');
      return await response.json();
    } catch (error) {
      console.error('Capify: Token info fetch failed:', error);
      return null;
    }
  }
  
  async function prepareUserData(eventData) {
    const userData = {};
    
    // Meta CAPI uyumlu hash fonksiyonları
    if (eventData.email && eventData.email.trim()) {
      userData.em = [await sha256(eventData.email.toLowerCase().trim())];
    }
    if (eventData.phone && eventData.phone.trim()) {
      userData.ph = [await sha256(eventData.phone.replace(/[^0-9]/g, ''))];
    }
    if (eventData.fn && eventData.fn.trim()) {
      userData.fn = [await sha256(eventData.fn.toLowerCase().trim())];
    }
    if (eventData.ln && eventData.ln.trim()) {
      userData.ln = [await sha256(eventData.ln.toLowerCase().trim())];
    }
    if (eventData.ge && eventData.ge.trim()) {
      userData.ge = [await sha256(eventData.ge.toLowerCase().trim())];
    }
    if (eventData.db && eventData.db.trim()) {
      userData.db = [await sha256(eventData.db)];
    }
    if (eventData.ct && eventData.ct.trim()) {
      userData.ct = [await sha256(eventData.ct.toLowerCase().trim())];
    }
    if (eventData.st && eventData.st.trim()) {
      userData.st = [await sha256(eventData.st.toLowerCase().trim())];
    }
    if (eventData.zp && eventData.zp.trim()) {
      userData.zp = [await sha256(eventData.zp)];
    }
    if (eventData.country && eventData.country.trim()) {
      userData.country = [await sha256(eventData.country.toLowerCase().trim())];
    }
    if (eventData.external_id && eventData.external_id.toString().trim()) {
      userData.external_id = [await sha256(eventData.external_id.toString())];
    }
    
    // Hash'lenmeyen alanlar
    if (eventData.client_ip_address) {
      userData.client_ip_address = eventData.client_ip_address;
    }
    if (eventData.client_user_agent) {
      userData.client_user_agent = eventData.client_user_agent;
    }
    if (eventData.fbc) {
      userData.fbc = eventData.fbc;
    }
    if (eventData.fbp) {
      userData.fbp = eventData.fbp;
    }
    
    return userData;
  }
  
  async function sendEventToMeta(eventName, eventData) {
    try {
      const tokenInfo = await getTokenInfo();
      if (!tokenInfo) {
        console.error('Capify: Could not get token info');
        return;
      }
      
      const userData = await prepareUserData(eventData);
      
      // Meta CAPI uyumlu payload
      const payload = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: window.location.href.includes('www.') ? window.location.href : window.location.href.replace('://', '://www.'),
          user_data: userData,
          custom_data: eventData.custom_data || {}
        }],
        access_token: tokenInfo.access_token
      };
      
      // Test event code ekleme
      if (eventData.test_event_code && eventData.test_event_code.trim()) {
        payload.data[0].test_event_code = eventData.test_event_code;
      }
      
      // Meta Graph API'ye gönder
      const response = await fetch(\`https://graph.facebook.com/v18.0/\${tokenInfo.pixel_id}/events\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Capify: Event sent to Meta successfully:', result);
      } else {
        console.error('Capify: Meta API error:', result);
      }
      
    } catch (error) {
      console.error('Capify: Event send failed:', error);
    }
  }
  
  const eventData = {
    // Meta CAPI uyumlu user data (hash'lenecek)
    email: ${variableMap.email} || null,
    phone: ${variableMap.phone} || null,
    fn: ${variableMap.fn} || null,
    ln: ${variableMap.ln} || null,
    ge: ${variableMap.ge} || null,
    db: ${variableMap.db} || null,
    ct: ${variableMap.ct} || null,
    st: ${variableMap.st} || null,
    zp: ${variableMap.zp} || null,
    country: ${variableMap.country} || null,
    external_id: ${variableMap.external_id} || null,
    
    // Hash'lenmeyen sistem bilgileri
    client_ip_address: ${variableMap.client_ip_address} || null,
    client_user_agent: ${variableMap.client_user_agent} || null,
    fbc: ${variableMap.fbc} || null,
    fbp: ${variableMap.fbp} || null,
    
    // Test event code
    test_event_code: ${variableMap.test_event_code} || null,
    custom_data: {
      ${event.name === 'Purchase' ? `
      value: ${variableMap.value},
      currency: ${variableMap.currency},
      content_ids: ${variableMap.content_ids},
      contents: ${variableMap.contents || '[]'},
      order_id: ${variableMap.order_id || 'null'}
      ` : event.name === 'AddToCart' ? `
      value: ${variableMap.value},
      currency: ${variableMap.currency},
      content_ids: ${variableMap.content_ids},
      contents: ${variableMap.contents || '[]'}
      ` : event.name === 'ViewContent' ? `
      content_ids: ${variableMap.content_ids},
      contents: ${variableMap.contents || '[]'},
      value: ${variableMap.value || 'null'},
      currency: ${variableMap.currency || 'null'}
      ` : event.name === 'Lead' ? `
      form_id: ${variableMap.form_id || 'null'},
      lead_type: ${variableMap.lead_type || 'null'}
      ` : event.name === 'Contact' ? `
      contact_method: ${variableMap.contact_method || 'null'}
      ` : event.name === 'Search' ? `
      search_string: ${variableMap.search_string}
      ` : event.name === 'InitiateCheckout' ? `
      value: ${variableMap.value},
      currency: ${variableMap.currency},
      content_ids: ${variableMap.content_ids},
      contents: ${variableMap.contents || '[]'}
      ` : event.name === 'AddToWishlist' ? `
      content_ids: ${variableMap.content_ids},
      contents: ${variableMap.contents || '[]'}
      ` : event.name === 'CustomizeProduct' ? `
      content_ids: ${variableMap.content_ids},
      contents: ${variableMap.contents || '[]'}
      ` : event.name === 'Donate' ? `
      value: ${variableMap.value},
      currency: ${variableMap.currency}
      ` : event.name === 'CompleteRegistration' ? `
      registration_method: ${variableMap.registration_method || 'null'}
      ` : event.name === 'AddPaymentInfo' ? `
      value: ${variableMap.value || 'null'},
      currency: ${variableMap.currency || 'null'},
      content_ids: ${variableMap.content_ids || '[]'},
      contents: ${variableMap.contents || '[]'}
      ` : event.name === 'Subscribe' ? `
      value: ${variableMap.value || 'null'},
      currency: ${variableMap.currency || 'null'},
      predicted_ltv: ${variableMap.predicted_ltv || 'null'}
      ` : event.name === 'FindLocation' ? `
      content_ids: ${variableMap.content_ids || '[]'},
      contents: ${variableMap.contents || '[]'},
      search_string: ${variableMap.search_string || 'null'}
      ` : event.name === 'Schedule' ? `
      content_ids: ${variableMap.content_ids || '[]'},
      contents: ${variableMap.contents || '[]'},
      delivery_category: ${variableMap.delivery_category || 'null'}
      ` : event.name === 'StartTrial' ? `
      value: ${variableMap.value || 'null'},
      currency: ${variableMap.currency || 'null'},
      predicted_ltv: ${variableMap.predicted_ltv || 'null'}
      ` : event.name === 'SubmitApplication' ? `
      value: ${variableMap.value || 'null'},
      currency: ${variableMap.currency || 'null'},
      content_ids: ${variableMap.content_ids || '[]'},
      contents: ${variableMap.contents || '[]'}
      ` : event.name === 'PageView' ? `
      content_ids: ${variableMap.content_ids || '[]'},
      contents: ${variableMap.contents || '[]'}
      ` : `
      // No specific custom_data for this event
      `
    }
  };
  
  sendEventToMeta('${event.name}', eventData);
  
  window.capifySend${event.name}Event = sendEventToMeta;
  
  console.log('Capify: ${event.name} event script loaded - Meta CAPI compliant with SHA256 hash');
})();`;
};

const GtmScripts = ({ domain, tokens = [] }) => {
  // Güvenlik kontrolü - undefined token'ları filtrele
  const validTokens = tokens.filter(token => token && token.id && token.access_token);
  const [copied, setCopied] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const [checkedEvents, setCheckedEvents] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expanded, setExpanded] = useState(false);
  const [selectedToken, setSelectedToken] = useState('');
  const [testEventCodes, setTestEventCodes] = useState({});

  // Seçili token'ın GTM container ID'sini al
  const selectedTokenData = validTokens.find(token => token.access_token === selectedToken);
  const selectedGtmContainerId = selectedTokenData?.gtm_container_id;

  const handleEventToggle = (eventName) => {
    setCheckedEvents(prev => 
      prev.includes(eventName) 
        ? prev.filter(event => event !== eventName)
        : [...prev, eventName]
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Kod kopyalandı!', severity: 'success' });
  };

  const testEvent = (eventName) => {
    setSnackbar({ open: true, message: `${eventName} event'i test edildi!`, severity: 'info' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTestEvent = async (event, idx) => {
    if (!selectedToken) return;
    setLoading(l => ({ ...l, [idx]: true }));
    setTestResults(r => ({ ...r, [idx]: null }));
    try {
      // Seçilen token'ı bul
      const selectedTokenData = validTokens.find(token => token.access_token === selectedToken);
      if (!selectedTokenData) {
        throw new Error('Seçilen token bulunamadı');
      }
      
      // GTM'e custom event gönder (bizim sisteme değil)
      if (window.dataLayer) {
        const testEventData = {
          event: 'custom_event',
          event_name: event.name,
          email: 'test@example.com',
          test_event_code: testEventCodes[idx] || 'TEST9705',
          custom_data: {
            test_event: true,
            event_type: event.name
          },
          gtm_container_id: selectedTokenData.gtm_container_id
        };
        
        window.dataLayer.push(testEventData);
        setTestResults(r => ({ ...r, [idx]: { success: true, message: 'Başarılı: GTM\'e custom event gönderildi' } }));
      } else {
        throw new Error('DataLayer bulunamadı. GTM script yüklü değil.');
      }
    } catch (err) {
      setTestResults(r => ({ ...r, [idx]: { success: false, message: 'Hata: ' + (err.message) } }));
    } finally {
      setLoading(l => ({ ...l, [idx]: false }));
    }
  };

  const handleAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, p: 3 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1976d2', mb: 2 }}>
          🚀 GTM Entegrasyon Merkezi
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          Meta CAPI uyumlu SHA256 hash ile GTM scriptleri ve kullanım rehberi
        </Typography>
      </Box>

      {/* Quick Start Guide */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mr: 2 }}>
              ⚡ Hızlı Başlangıç Rehberi
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>1️⃣</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>GTM Değişkenleri</Typography>
                <Typography variant="body2">
                  Data Layer Variable'ları oluşturun
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>2️⃣</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Script Ekleme</Typography>
                <Typography variant="body2">
                  Custom HTML Tag olarak ekleyin
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>3️⃣</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Test Etme</Typography>
                <Typography variant="body2">
                  Meta CAPI uyumlu test event'leri gönderin
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* GTM Variables Guide */}
      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32', mr: 2 }}>
              🔧 GTM Data Layer Variables
            </Typography>
            <Chip label="Copy & Paste" color="success" size="small" />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2', mb: 2 }}>
                  🔑 Zorunlu Değişkenler
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    gtm_container_id
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Capify'de kayıtlı GTM Container ID
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>
                  👤 Kullanıcı Bilgileri
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>email, phone</Box>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>fn, ln, ge, db</Box>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>ct, st, zp, country</Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Meta CAPI uyumlu SHA256 ile otomatik hash'lenir
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#f57c00', mb: 2 }}>
                  🛍️ Ürün Bilgileri
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>value, currency</Box>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>content_ids, contents</Box>
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>order_id</Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Event'e özel custom data
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Token Selection */}
      <Card sx={{ mb: 4, boxShadow: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mr: 2 }}>
              🔑 Test Token Seçimi
            </Typography>
            <Chip label={`${validTokens.length} Token`} color="primary" size="small" />
            {selectedGtmContainerId && (
              <Chip 
                label={`GTM ID: ${selectedGtmContainerId}`} 
                color="success" 
                size="small" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <FormControl sx={{ minWidth: 300 }} size="small">
            <InputLabel id="select-token-label">Test için Token Seçin</InputLabel>
          <Select
            labelId="select-token-label"
            value={selectedToken}
              label="Test için Token Seçin"
            onChange={e => setSelectedToken(e.target.value)}
              sx={{ borderRadius: 2 }}
          >
            {validTokens.map(token => (
                <MenuItem key={token.id} value={token.access_token}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', mr: 2 }} />
                    {token.token_name || `Token ${token.id}`}
                    {token.gtm_container_id && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({token.gtm_container_id})
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
            ))}
          </Select>
        </FormControl>
          {selectedGtmContainerId && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                ✅ Seçili token'ın GTM Container ID'si: <strong>{selectedGtmContainerId}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Bu ID ile GTM scriptleri otomatik olarak güncellenir.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Events Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mr: 2 }}>
          📋 Meta Events
        </Typography>
        <Chip label={`${EVENTS.length} Event`} color="info" size="small" />
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            {checkedEvents.length} event seçildi
          </Typography>
        </Box>
      </Box>
      {EVENTS.map((event, idx) => {
        const script = getGtmScript(event, domain, selectedGtmContainerId);
        return (
          <Card key={event.name} sx={{ mb: 3, boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Accordion expanded={expanded === event.name} onChange={handleAccordion(event.name)} sx={{ boxShadow: 'none' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: expanded === event.name ? '#f5f5f5' : 'white',
                  '&:hover': { bgcolor: '#fafafa' }
                }}
              >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: '#e3f2fd', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                        {event.name.charAt(0)}
                      </Typography>
                    </Box>
                <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {event.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {event.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {EVENT_FIELDS[event.name]?.slice(0, 3).map(field => (
                          <Chip 
                            key={field} 
                            label={field} 
                            size="small" 
                            variant="outlined" 
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {EVENT_FIELDS[event.name]?.length > 3 && (
                          <Chip 
                            label={`+${EVENT_FIELDS[event.name].length - 3}`} 
                            size="small" 
                            variant="outlined" 
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>
                </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={checkedEvents.includes(event.name) ? "Kullanılıyor" : "Kullanmıyorum"}>
                  <Checkbox
                    checked={!!checkedEvents.includes(event.name)}
                    onChange={() => handleEventToggle(event.name)}
                    icon={<CheckCircleIcon sx={{ color: '#bdbdbd' }} />}
                        checkedIcon={<CheckCircleIcon sx={{ color: '#4caf50' }} />}
                        sx={{ p: 0 }}
                  />
                </Tooltip>
              </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, bgcolor: '#fafafa' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Box sx={{ 
                        bgcolor: '#1e1e1e', 
                        borderRadius: 3, 
                        p: 3, 
                        minHeight: 120, 
                        fontFamily: 'Fira Code, monospace', 
                        color: '#e3f2fd', 
                        fontSize: 13, 
                        overflowX: 'auto',
                        border: '1px solid #333'
                      }}>
                        {script}
                      </Box>
                      <Tooltip title={copied === idx ? '✅ Kopyalandı!' : '📋 Kopyala'}>
                  <IconButton
                    onClick={() => copyToClipboard(script)}
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            bgcolor: '#1976d2', 
                            color: '#fff', 
                            borderRadius: 2, 
                            '&:hover': { bgcolor: '#1565c0' },
                            boxShadow: 2
                          }}
                    size="small"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
              <TextField
                      label="Test Event Code"
                value={testEventCodes[idx] || ''}
                onChange={e => setTestEventCodes(codes => ({ ...codes, [idx]: e.target.value }))}
                size="small"
                      fullWidth
                placeholder="TEST1234"
                      helperText="Facebook Events Manager'dan alın"
                      sx={{ borderRadius: 2 }}
              />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                      size="large"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleTestEvent(event, idx)}
                disabled={loading[idx] || !selectedToken}
                      sx={{ 
                        borderRadius: 2, 
                        fontWeight: 600, 
                        bgcolor: '#4caf50', 
                        color: '#fff', 
                        '&:hover': { bgcolor: '#388e3c' },
                        height: 56,
                        width: '100%'
                      }}
                    >
                      {loading[idx] ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                          Gönderiliyor...
                        </Box>
                      ) : (
                        '🚀 Test Event Gönder'
                      )}
              </Button>
                  </Grid>
                </Grid>
                
              {testResults[idx] && (
                  <Box sx={{ mt: 2 }}>
                    <Alert 
                      severity={testResults[idx].success ? 'success' : 'error'}
                      sx={{ borderRadius: 2 }}
                    >
                    {testResults[idx].message}
                  </Alert>
                  </Box>
              )}
            </AccordionDetails>
          </Accordion>
          </Card>
        );
      })}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GtmScripts; 