import React, { useState, useEffect } from 'react';
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
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Container,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  CardHeader,
  CardActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Facebook as FacebookIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Domain as DomainIcon,
  CheckCircle as CheckCircleIcon,
  Tag as TagIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  VerifiedUser as VerifiedUserIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api, { addFacebookToken, getFacebookTokens, getGtmVerifications } from '../services/api';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useSpring, animated } from '@react-spring/web';
import GtmScripts from '../components/GtmScripts';
import GtmVerificationSection from '../components/GtmVerificationSection';
import FacebookTokensSection from '../components/FacebookTokensSection';
import GtmScriptsSection from '../components/GtmScriptsSection';
import SssSection from '../components/SssSection';
import WebDataLayerSection from '../components/WebDataLayerSection';
import GtmVariablesSection from '../components/GtmVariablesSection';
import GtmEventLogs from '../components/GtmEventLogs';

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
        <Box sx={{ 
          p: 4,
          backgroundColor: '#ffffff',
          minHeight: '400px'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Modern tema tanımı
const theme = createTheme({
  palette: {
    primary: { 
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8'
    },
    secondary: { 
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2'
    },
    background: { 
      default: '#f8fafc',
      paper: '#ffffff'
    },
    success: { 
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    warning: { 
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    info: { 
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    }
  },
  shape: { 
    borderRadius: 12 
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { 
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3
    },
    h6: { 
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4
    },
    body1: { 
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: { 
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      fontWeight: 600,
      textTransform: 'none'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          '& .MuiTabs-indicator': {
            backgroundColor: '#2563eb',
            height: 3
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 64,
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          color: '#64748b',
          '&.Mui-selected': {
            color: '#2563eb'
          },
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.04)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
});

// AnimatedNumber bileşeni
function AnimatedNumber({ value }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { mass: 1, tension: 210, friction: 20 },
  });
  return <animated.span>{number.to(n => Math.floor(n))}</animated.span>;
}

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Token states
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState({
    access_token: '',
    token_name: '',
    dataset_id: '',
    gtm_container_id: ''
  });
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  
  // Token ayarları için state
  const [editTokenDialogOpen, setEditTokenDialogOpen] = useState(false);
  const [editToken, setEditToken] = useState(null);
  
  // GTM Script states
  const [gtmScripts, setGtmScripts] = useState([
    {
      id: 'purchase',
      name: 'Purchase',
      description: 'Satın alma işlemi tamamlandığında tetiklenir',
      category: 'E-ticaret',
      script: `// Purchase Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/purchase';
  function sendPurchaseEvent({value, currency, content_ids, order_id, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        value: value || 0,
        currency: currency || 'TRY',
        content_ids: content_ids || [],
        order_id: order_id || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  // GTM Data Layer tetikleyici örneği:
  if (typeof dataLayer !== 'undefined') {
    // sendPurchaseEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'lead',
      name: 'Lead',
      description: 'Potansiyel müşteri formu doldurulduğunda tetiklenir',
      category: 'Form',
      script: `// Lead Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/lead';
  function sendLeadEvent({event_id, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: event_id || '',
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  // GTM Data Layer tetikleyici örneği:
  if (typeof dataLayer !== 'undefined') {
    // sendLeadEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'add_to_cart',
      name: 'AddToCart',
      description: 'Sepete ürün eklendiğinde tetiklenir',
      category: 'E-ticaret',
      script: `// AddToCart Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/add-to-cart';
  function sendAddToCartEvent({value, currency, content_ids, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        value: value || 0,
        currency: currency || 'TRY',
        content_ids: content_ids || []
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  // GTM Data Layer tetikleyici örneği:
  if (typeof dataLayer !== 'undefined') {
    // sendAddToCartEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'view_content',
      name: 'ViewContent',
      description: 'Bir ürün veya içerik görüntülendiğinde tetiklenir',
      category: 'E-ticaret',
      script: `// ViewContent Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/view-content';
  function sendViewContentEvent({content_ids, value, currency, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        content_ids: content_ids || [],
        value: value || 0,
        currency: currency || 'TRY'
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  // GTM Data Layer tetikleyici örneği:
  if (typeof dataLayer !== 'undefined') {
    // sendViewContentEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'complete_registration',
      name: 'CompleteRegistration',
      description: 'Kullanıcı kayıt işlemi tamamlandığında tetiklenir',
      category: 'User',
      script: `// CompleteRegistration Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/complete-registration';
  function sendCompleteRegistrationEvent({email, phone, client_ip, user_agent, registration_method}) {
    const payload = {
      event_name: 'CompleteRegistration',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        registration_method: registration_method || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendCompleteRegistrationEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'initiate_checkout',
      name: 'InitiateCheckout',
      description: 'Kullanıcı ödeme sürecini başlattığında tetiklenir',
      category: 'E-ticaret',
      script: `// InitiateCheckout Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/initiate-checkout';
  function sendInitiateCheckoutEvent({value, currency, content_ids, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
      value: value || 0,
        currency: currency || 'TRY',
        content_ids: content_ids || []
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendInitiateCheckoutEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Kullanıcı sitede arama yaptığında tetiklenir',
      category: 'User',
      script: `// Search Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/search';
  function sendSearchEvent({search_string, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Search',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        search_string: search_string || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendSearchEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'contact',
      name: 'Contact',
      description: 'Kullanıcı iletişim formunu doldurduğunda tetiklenir',
      category: 'User',
      script: `// Contact Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/contact';
  function sendContactEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Contact',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendContactEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'subscribe',
      name: 'Subscribe',
      description: 'Kullanıcı bültene abone olduğunda tetiklenir',
      category: 'User',
      script: `// Subscribe Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/subscribe';
  function sendSubscribeEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Subscribe',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendSubscribeEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'add_payment_info',
      name: 'AddPaymentInfo',
      description: 'Kullanıcı ödeme bilgisi eklediğinde tetiklenir',
      category: 'E-ticaret',
      script: `// AddPaymentInfo Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/add-payment-info';
  function sendAddPaymentInfoEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'AddPaymentInfo',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendAddPaymentInfoEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'add_to_wishlist',
      name: 'AddToWishlist',
      description: 'Kullanıcı ürünü istek listesine eklediğinde tetiklenir',
      category: 'E-ticaret',
      script: `// AddToWishlist Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/add-to-wishlist';
  function sendAddToWishlistEvent({content_ids, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'AddToWishlist',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        content_ids: content_ids || []
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendAddToWishlistEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'customize_product',
      name: 'CustomizeProduct',
      description: 'Kullanıcı ürünü özelleştirdiğinde tetiklenir',
      category: 'E-ticaret',
      script: `// CustomizeProduct Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/customize-product';
  function sendCustomizeProductEvent({content_ids, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'CustomizeProduct',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        content_ids: content_ids || []
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendCustomizeProductEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'donate',
      name: 'Donate',
      description: 'Kullanıcı bağış yaptığında tetiklenir',
      category: 'User',
      script: `// Donate Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/donate';
  function sendDonateEvent({value, currency, email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Donate',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      custom_data: {
        value: value || 0,
        currency: currency || 'TRY'
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendDonateEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'find_location',
      name: 'FindLocation',
      description: 'Kullanıcı mağaza/konum aradığında tetiklenir',
      category: 'User',
      script: `// FindLocation Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/find-location';
  function sendFindLocationEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'FindLocation',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendFindLocationEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'schedule',
      name: 'Schedule',
      description: 'Kullanıcı randevu aldığında tetiklenir',
      category: 'User',
      script: `// Schedule Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/schedule';
  function sendScheduleEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'Schedule',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendScheduleEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'start_trial',
      name: 'StartTrial',
      description: 'Kullanıcı deneme sürecini başlattığında tetiklenir',
      category: 'User',
      script: `// StartTrial Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/start-trial';
  function sendStartTrialEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'StartTrial',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendStartTrialEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'submit_application',
      name: 'SubmitApplication',
      description: 'Kullanıcı başvuru formu gönderdiğinde tetiklenir',
      category: 'User',
      script: `// SubmitApplication Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/submit-application';
  function sendSubmitApplicationEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'SubmitApplication',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendSubmitApplicationEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
    {
      id: 'page_view',
      name: 'PageView',
      description: 'Kullanıcı bir sayfa görüntülediğinde tetiklenir',
      category: 'User',
      script: `// PageView Event Script (Meta CAPI)
(function() {
  'use strict';
  const CAPIFY_API_URL = '{{API_URL}}/api/facebook/events/page-view';
  function sendPageViewEvent({email, phone, client_ip, user_agent}) {
    const payload = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: email ? [email] : [],
        ph: phone ? [phone] : [],
        client_ip_address: client_ip || '',
        client_user_agent: user_agent || ''
      },
      action_source: 'website',
      event_source_url: window.location.href.replace("://", "://www.")
    };
    fetch(CAPIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  if (typeof dataLayer !== 'undefined') {
    // sendPageViewEvent fonksiyonunu uygun data ile tetikle
  }
})();`
    },
  ]);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [showGtmGuide, setShowGtmGuide] = useState(true);

  const [gtmVerifications, setGtmVerifications] = useState([]);
  const [verifiedDomains, setVerifiedDomains] = useState([]);
  
  // Debug için console.log ekleyelim
  console.log('Dashboard - verifiedDomains state:', verifiedDomains);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tokens = await getFacebookTokens();
      console.log('Tokens:', tokens);
      setTokens(tokens.tokens || tokens || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Veri yüklenirken hata oluştu: ' + (error.message || ''), 'error');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchGtmVerifications = async () => {
      try {
        const response = await getGtmVerifications();
        console.log('Dashboard - API Response:', response);
        console.log('Dashboard - Response data type:', typeof response);
        console.log('Dashboard - Response data keys:', Object.keys(response || {}));
        
        const verifications = response?.verifications || [];
        console.log('Dashboard - Verifications array:', verifications);
        console.log('Dashboard - Verifications length:', verifications.length);
        
        setGtmVerifications(verifications);
        
        // Sadece doğrulanmış GTM'leri göster
        const verifiedOnly = verifications.filter(v => v.is_verified);
        console.log('Dashboard - Verified only:', verifiedOnly);
        console.log('Dashboard - Verified only length:', verifiedOnly.length);
        
        setVerifiedDomains(verifiedOnly);
        console.log('Dashboard - verifiedDomains set to:', verifiedOnly);
      } catch (err) {
        console.error('Dashboard - Error fetching GTM verifications:', err);
        setGtmVerifications([]);
        setVerifiedDomains([]);
      }
    };
    fetchGtmVerifications();
  }, []);

  // verifiedDomains state'inin değişimini izle
  useEffect(() => {
    console.log('Dashboard - verifiedDomains changed:', verifiedDomains);
  }, [verifiedDomains]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message: message || 'Bilinmeyen bir hata oluştu', severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // GTM doğrulama silindiğinde Facebook token'ları güncelle
  const handleVerificationDeleted = (gtmContainerId, deletedTokensCount) => {
    // Silinen GTM'ye ait token'ları state'den kaldır
    setTokens(prevTokens => 
      prevTokens.filter(token => token.gtm_container_id !== gtmContainerId)
    );
    
    // GTM verifications'ı da güncelle
    setGtmVerifications(prevVerifications => 
      prevVerifications.filter(v => v.gtm_container_id !== gtmContainerId)
    );
    
    // Verified domains'i güncelle
    setVerifiedDomains(prevDomains => 
      prevDomains.filter(v => v.gtm_container_id !== gtmContainerId)
    );
  };

  // GTM doğrulama tamamlandığında verified domains'i güncelle
  const handleVerificationCompleted = (verification) => {
    // Verified domains listesine ekle
    setVerifiedDomains(prevDomains => {
      const existing = prevDomains.find(v => v.gtm_container_id === verification.gtm_container_id);
      if (!existing) {
        return [...prevDomains, verification];
      }
      return prevDomains;
    });
    
    // GTM verifications'ı güncelle
    setGtmVerifications(prevVerifications => 
      prevVerifications.map(v => 
        v.id === verification.id ? verification : v
      )
    );
  };

  // Token functions
  const handleAddToken = async () => {
    const { access_token, token_name, dataset_id, gtm_container_id } = newToken;
    if (!access_token || !dataset_id || !gtm_container_id) {
      showSnackbar('Access Token, Dataset ID ve GTM Container ID gerekli', 'error');
      return;
    }
    setTokenLoading(true);
    try {
      const response = await addFacebookToken({
        access_token,
        token_name: token_name || `Token_${Date.now()}`,
        dataset_id,
        gtm_container_id
      });
      // Token eklendikten sonra tüm tokenleri tekrar çek
      await fetchData();
      setNewToken({
        access_token: '',
        token_name: '',
        dataset_id: '',
        gtm_container_id: ''
      });
      setTokenDialogOpen(false);
      showSnackbar('Facebook token başarıyla eklendi');
    } catch (error) {
      console.error('Error adding token:', error);
      showSnackbar(error.message || 'Token eklenirken hata oluştu', 'error');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleDeleteToken = async (tokenId) => {
    try {
      await api.delete(`/user/facebook-tokens/${tokenId}`);
      setTokens(tokens.filter(t => t.id !== tokenId));
      showSnackbar('Token başarıyla silindi');
    } catch (error) {
      console.error('Error deleting token:', error);
      showSnackbar('Token silinirken hata oluştu', 'error');
    }
  };

  const handleToggleTokenStatus = async (tokenId, currentStatus) => {
    try {
      await api.put(`/user/facebook-tokens/${tokenId}`, {
        is_active: !currentStatus
      });
      
      // Update token in state - güvenli şekilde
      setTokens(prevTokens => 
        prevTokens.map(t => 
          t && t.id === tokenId 
            ? { ...t, is_active: !currentStatus }
            : t
        ).filter(t => t && t.id) // Undefined token'ları filtrele
      );
      
      showSnackbar(`Token ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi`);
    } catch (error) {
      console.error('Error toggling token status:', error);
      showSnackbar('Token durumu değiştirilirken hata oluştu', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Panoya kopyalandı');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 3,
              p: 4
            }}>
              <CircularProgress 
                size={80} 
                sx={{ 
                  color: '#2563eb',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }} 
              />
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                textAlign: 'center'
              }}>
                Veriler yükleniyor...
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                textAlign: 'center'
              }}>
                Dashboard hazırlanıyor, lütfen bekleyin.
              </Typography>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: 3
      }}>
        <Container maxWidth="xl">
          {/* GTM Kurulum Rehberi - Modern UX */}
          {showGtmGuide && (
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3, 
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              position: 'relative',
              border: '1px solid #93c5fd'
            }}>
              <IconButton 
                onClick={() => setShowGtmGuide(false)} 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e40af' }}>
                  🚀 GTM Kurulum Rehberi
                </Typography>
                <Stepper activeStep={-1} orientation="vertical" sx={{ bgcolor: 'transparent' }}>
                  <Step>
                    <StepLabel>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>1.</strong> GTM Container'ınızı oluşturun ve sitenize ekleyin
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>2.</strong> Panelden GTM Container ID'nizi girin
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>3.</strong> GTM'de yeni bir Tag oluşturun ve size özel scripti ekleyin
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>4.</strong> Test edin ve Facebook Events Manager'da doğrulayın
                      </Typography>
                    </StepLabel>
                  </Step>
                </Stepper>
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  Kurulum adımlarında takılırsanız <strong>destek ekibimize</strong> ulaşabilirsiniz.
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <Box sx={{ 
            mb: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            gap: 2,
            textAlign: 'left'
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Hoş geldin, {user?.first_name || 'Kullanıcı'}! 👋
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 400,
                color: '#64748b',
                maxWidth: '600px'
              }}
            >
              Facebook CAPI entegrasyonunuzu yönetin, domain'lerinizi takip edin ve performansınızı optimize edin.
            </Typography>
          </Box>

      {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #93c5fd',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)'
                  }}>
                    <DomainIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: '#1e40af' }}>
                      <AnimatedNumber value={tokens?.length || 0} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      Toplam Token
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #c084fc',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 8px rgba(168, 85, 247, 0.3)'
                  }}>
                    <VerifiedUserIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                      <AnimatedNumber value={verifiedDomains?.length || 0} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      Doğrulanmış GTM
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #86efac',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 8px rgba(34, 197, 94, 0.3)'
                  }}>
                    <FacebookIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: '#15803d' }}>
                      <AnimatedNumber value={tokens?.filter(t => t.is_active)?.length || 0} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      Aktif Token
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #fbbf24',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'warning.main', 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)'
                  }}>
                    <TagIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: '#d97706' }}>
                      <AnimatedNumber value={gtmVerifications?.length || 0} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      Toplam GTM
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      {/* GTM Doğrulama Durumu */}
      {gtmVerifications.length > 0 && (
        <Card sx={{ 
          mb: 6, 
          borderRadius: 3, 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              🔗 GTM Doğrulama Durumu
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3, 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                    <CheckCircleIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803d' }}>
                      {verifiedDomains.length}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Doğrulanmış GTM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Facebook token eklenebilir
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3, 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                    <ErrorIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#d97706' }}>
                      {gtmVerifications.filter(v => !v.is_verified).length}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Doğrulanmamış GTM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Doğrulama bekliyor
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {verifiedDomains.length === 0 && (
              <Alert severity="warning" sx={{ mt: 3, borderRadius: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#d97706' }}>
                  Facebook Token Eklemek İçin GTM Doğrulaması Gerekli
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Facebook token ekleyebilmek için önce en az bir GTM Container'ınızı doğrulamanız gerekmektedir. 
                  <strong>GTM Doğrulama Yönetimi</strong> sekmesinden doğrulama işlemini tamamlayın.
                </Typography>
              </Alert>
            )}
            {verifiedDomains.length > 0 && tokens.length === 0 && (
              <Alert severity="success" sx={{ mt: 3, borderRadius: 2, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#15803d' }}>
                  🎉 GTM Doğrulaması Tamamlandı!
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Artık <strong>Facebook Token Yönetimi</strong> sekmesinden Facebook token ekleyebilirsiniz. 
                  Her doğrulanmış GTM Container'a bir token ekleyebilirsiniz.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-scrollButtons': {
                color: '#64748b'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <VerifiedUserIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}>GTM Doğrulama</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tokens?.length || 0} color="primary">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                    <FacebookIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 600 }}>Facebook Tokenler</Typography>
                  </Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <CodeIcon sx={{ color: '#f97316', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}>Web Sitesi DataLayer</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <CodeIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}>GTM Değişkenleri & Mapping</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={gtmScripts.length} color="success">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                    <TagIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 600 }}>GTM Scriptleri</Typography>
                  </Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <HelpIcon sx={{ color: '#059669', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}>SSS</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <RefreshIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}>Event Logları</Typography>
                </Box>
              } 
            />
          </Tabs>
        </Box>

          {/* Tokens Tab */}
        <TabPanel value={tabValue} index={0}>
          <GtmVerificationSection 
            onVerificationDeleted={handleVerificationDeleted}
            onVerificationCompleted={handleVerificationCompleted}
          />
        </TabPanel>

          {/* GTM Scriptleri Tab */}
        <TabPanel value={tabValue} index={1}>
          <FacebookTokensSection
            user={user}
            tokens={tokens}
            setTokens={setTokens}
            showSnackbar={showSnackbar}
            copyToClipboard={copyToClipboard}
            handleAddToken={handleAddToken}
            handleDeleteToken={handleDeleteToken}
            handleToggleTokenStatus={handleToggleTokenStatus}
            tokenDialogOpen={tokenDialogOpen}
            setTokenDialogOpen={setTokenDialogOpen}
            newToken={newToken}
            setNewToken={setNewToken}
            tokenLoading={tokenLoading}
            editTokenDialogOpen={editTokenDialogOpen}
            setEditTokenDialogOpen={setEditTokenDialogOpen}
            editToken={editToken}
            setEditToken={setEditToken}
            verifiedDomains={verifiedDomains}
            api={api}
          />
        </TabPanel>

          {/* GTM Değişkenleri ve Mapping Tab */}
          <TabPanel value={tabValue} index={2}>
            <WebDataLayerSection showSnackbar={showSnackbar} />
          </TabPanel>

          {/* GTM Mapping Tab */}
          <TabPanel value={tabValue} index={3}>
                            <GtmVariablesSection showSnackbar={showSnackbar} />
          </TabPanel>

          {/* GTM Scriptleri Tab */}
          <TabPanel value={tabValue} index={4}>
            <GtmScriptsSection domain={window.location.host} tokens={tokens} showSnackbar={showSnackbar} />
          </TabPanel>

          {/* SSS Tab */}
          <TabPanel value={tabValue} index={5}>
            <SssSection />
          </TabPanel>

          {/* GTM Event Logs Tab */}
          <TabPanel value={tabValue} index={6}>
            <GtmEventLogs />
          </TabPanel>
        </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-icon': {
              fontSize: 24
            },
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={fetchData}
      >
        <RefreshIcon />
      </Fab>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard; 