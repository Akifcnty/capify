# Web DataLayer Entegrasyon Rehberi - Meta CAPI Uyumlu

Bu rehber, web sitenizde Google Tag Manager (GTM) ile Meta Conversions API (CAPI) entegrasyonu için gerekli DataLayer event'lerini açıklar.

## 📋 Genel Bakış

DataLayer, web sitenizdeki kullanıcı etkileşimlerini GTM'e bildiren JavaScript objesidir. Bu event'ler Meta Conversions API formatında Facebook'a gönderilir.

## 🚀 Kurulum

### 1. DataLayer Başlatma
```html
<!-- Sayfanın <head> bölümüne ekleyin -->
<script>
window.dataLayer = window.dataLayer || [];
</script>
```

### 2. GTM Script Ekleme
```html
<!-- GTM Container ID'nizi buraya ekleyin -->
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>
```

### 3. Event ID Generator
```javascript
// Benzersiz event ID oluşturucu
function generateEventId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

## 🎯 Meta CAPI Uyumlu Event'ler

### 1. Sayfa Görüntüleme (PageView)
```javascript
// Sayfa yüklendiğinde otomatik olarak tetiklenir
window.dataLayer.push({
  'event': 'PageView',
  'event_name': 'PageView',
  'event_time': Math.floor(Date.now() / 1000),
  'event_id': generateEventId(),
  'event_source_url': window.location.href,
  'action_source': 'website',
  'user_data': {
    'client_ip_address': '', // GTM tarafından otomatik doldurulur
    'client_user_agent': navigator.userAgent
  },
  'custom_data': {
    'page_title': document.title,
    'page_referrer': document.referrer
  }
});
```

### 2. Buton Tıklama (Custom Event)
```javascript
// Buton tıklama event'i - Meta CAPI formatında
function trackButtonClick(buttonText, buttonId, eventName = 'ButtonClick') {
  window.dataLayer.push({
    'event': eventName,
    'event_name': eventName,
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '', // GTM tarafından otomatik doldurulur
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'button_text': buttonText,
      'button_id': buttonId,
      'content_name': buttonText,
      'content_category': 'button_click'
    }
  });
}

// Kullanım örneği
document.getElementById('contact-btn').addEventListener('click', function() {
  trackButtonClick('İletişim', 'contact-btn', 'ContactButtonClick');
});
```

### 3. Form Gönderimi (Lead)
```javascript
// İletişim formu gönderimi - Lead event'i
function trackFormSubmit(formName, formData) {
  window.dataLayer.push({
    'event': 'Lead',
    'event_name': 'Lead',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent,
      'em': [formData.email], // E-posta hash'lenmiş olmalı
      'ph': [formData.phone]  // Telefon hash'lenmiş olmalı
    },
    'custom_data': {
      'content_name': formName,
      'content_category': 'form_submit',
      'form_name': formName
    }
  });
}
```

### 4. Ürün Detay Görüntüleme (ViewContent)
```javascript
// Ürün sayfası açıldığında
function trackProductView(productId, productName, price, currency = 'TRY') {
  window.dataLayer.push({
    'event': 'ViewContent',
    'event_name': 'ViewContent',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': productName,
      'content_category': 'product',
      'content_ids': [productId],
      'value': parseFloat(price),
      'currency': currency
    }
  });
}
```

### 5. Sepete Ekleme (AddToCart)
```javascript
// Sepete ürün eklendiğinde
function trackAddToCart(productId, productName, price, quantity, currency = 'TRY') {
  window.dataLayer.push({
    'event': 'AddToCart',
    'event_name': 'AddToCart',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': productName,
      'content_category': 'product',
      'content_ids': [productId],
      'value': parseFloat(price) * quantity,
      'currency': currency,
      'quantity': quantity
    }
  });
}
```

### 6. Satın Alma (Purchase)
```javascript
// Satın alma tamamlandığında
function trackPurchase(orderId, total, products, currency = 'TRY') {
  window.dataLayer.push({
    'event': 'Purchase',
    'event_name': 'Purchase',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': 'Purchase',
      'content_category': 'ecommerce',
      'content_ids': products.map(p => p.id),
      'value': parseFloat(total),
      'currency': currency,
      'order_id': orderId
    }
  });
}
```

### 7. Arama (Search)
```javascript
// Arama yapıldığında
function trackSearch(searchTerm) {
  window.dataLayer.push({
    'event': 'Search',
    'event_name': 'Search',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': 'Search',
      'content_category': 'search',
      'search_string': searchTerm
    }
  });
}
```

### 8. Telefon Numarası Tıklama (Contact)
```javascript
// Telefon numarasına tıklandığında
function trackPhoneClick(phoneNumber, buttonLocation = 'header') {
  window.dataLayer.push({
    'event': 'Contact',
    'event_name': 'Contact',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent,
      'ph': [phoneNumber] // Telefon hash'lenmiş olmalı
    },
    'custom_data': {
      'content_name': 'Phone Contact',
      'content_category': 'contact',
      'contact_method': 'phone',
      'button_location': buttonLocation
    }
  });
}

// HTML'de kullanım:
<a href="tel:+905551234567" onclick="trackPhoneClick('+905551234567')">
  📞 0555 123 45 67
</a>
```

### 9. E-posta Tıklama (Contact)
```javascript
// E-posta adresine tıklandığında
function trackEmailClick(emailAddress, buttonLocation = 'contact') {
  window.dataLayer.push({
    'event': 'Contact',
    'event_name': 'Contact',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent,
      'em': [emailAddress] // E-posta hash'lenmiş olmalı
    },
    'custom_data': {
      'content_name': 'Email Contact',
      'content_category': 'contact',
      'contact_method': 'email',
      'button_location': buttonLocation
    }
  });
}

// HTML'de kullanım:
<a href="mailto:info@example.com" onclick="trackEmailClick('info@example.com')">
  ✉️ info@example.com
</a>
```

### 10. Sosyal Medya Tıklama (Custom Event)
```javascript
// Sosyal medya linklerine tıklandığında
function trackSocialClick(platform) {
  window.dataLayer.push({
    'event': 'SocialClick',
    'event_name': 'SocialClick',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': 'Social Media Click',
      'content_category': 'social',
      'social_platform': platform
    }
  });
}

// HTML'de kullanım:
<a href="https://facebook.com/company" onclick="trackSocialClick('facebook')">
  Facebook
</a>
```

### 11. Video İzleme (Custom Event)
```javascript
// Video oynatıldığında
function trackVideoPlay(videoTitle) {
  window.dataLayer.push({
    'event': 'VideoPlay',
    'event_name': 'VideoPlay',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': videoTitle,
      'content_category': 'video',
      'video_title': videoTitle
    }
  });
}
```

### 12. İndirme (Custom Event)
```javascript
// Dosya indirildiğinde
function trackDownload(fileName, fileType) {
  window.dataLayer.push({
    'event': 'Download',
    'event_name': 'Download',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': fileName,
      'content_category': 'download',
      'file_name': fileName,
      'file_type': fileType
    }
  });
}
```

## 🎯 Özel İş Event'leri

### Hizmet Talep Etme (Lead)
```javascript
function trackServiceRequest(serviceType) {
  window.dataLayer.push({
    'event': 'Lead',
    'event_name': 'Lead',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': 'Service Request',
      'content_category': 'service',
      'service_type': serviceType
    }
  });
}
```

### Randevu Alma (Lead)
```javascript
function trackAppointment(appointmentType) {
  window.dataLayer.push({
    'event': 'Lead',
    'event_name': 'Lead',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent
    },
    'custom_data': {
      'content_name': 'Appointment Booking',
      'content_category': 'appointment',
      'appointment_type': appointmentType
    }
  });
}
```

### Newsletter Kayıt (Lead)
```javascript
function trackNewsletterSignup(email) {
  window.dataLayer.push({
    'event': 'Lead',
    'event_name': 'Lead',
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '',
      'client_user_agent': navigator.userAgent,
      'em': [email] // E-posta hash'lenmiş olmalı
    },
    'custom_data': {
      'content_name': 'Newsletter Signup',
      'content_category': 'newsletter'
    }
  });
}
```

## 🔧 Gelişmiş Kullanım

### Meta CAPI Helper Fonksiyonu
```javascript
// Tüm Meta CAPI event'leri için ortak helper fonksiyon
function pushMetaEvent(eventName, customData = {}, userData = {}) {
  const baseData = {
    'event': eventName,
    'event_name': eventName,
    'event_time': Math.floor(Date.now() / 1000),
    'event_id': generateEventId(),
    'event_source_url': window.location.href,
    'action_source': 'website',
    'user_data': {
      'client_ip_address': '', // GTM tarafından otomatik doldurulur
      'client_user_agent': navigator.userAgent,
      ...userData
    },
    'custom_data': {
      ...customData
    }
  };
  
  window.dataLayer.push(baseData);
}

// Kullanım örneği:
pushMetaEvent('ButtonClick', {
  'button_text': 'İletişim',
  'button_location': 'header',
  'content_name': 'Contact Button',
  'content_category': 'button_click'
});
```

### Otomatik Event Tracking
```javascript
// Tüm butonlara otomatik Meta CAPI event ekleme
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      pushMetaEvent('ButtonClick', {
        'button_text': this.textContent.trim(),
        'button_location': this.closest('section')?.className || 'unknown',
        'content_name': this.textContent.trim(),
        'content_category': 'button_click'
      });
    });
  });
});
```

## 📱 Mobil Uyumluluk

### Touch Event'ler
```javascript
// Mobil dokunma event'leri
function trackTouchEvent(elementType, elementId) {
  pushMetaEvent('TouchInteraction', {
    'element_type': elementType,
    'element_id': elementId,
    'content_name': 'Touch Interaction',
    'content_category': 'mobile_interaction',
    'device_type': 'mobile'
  });
}
```

## ✅ Test Etme

### GTM Preview Mode
1. GTM'de "Preview" modunu aktif edin
2. Web sitenizi ziyaret edin
3. Event'lerin doğru Meta CAPI formatında tetiklendiğini kontrol edin

### Console Test
```javascript
// Console'da test etmek için:
pushMetaEvent('TestEvent', {
  'test_data': 'test_value',
  'content_name': 'Test Event',
  'content_category': 'test'
});
```

### Meta CAPI Test Event
```javascript
// Test event kodu ile test etme
pushMetaEvent('TestEvent', {
  'test_event_code': 'TEST12345',
  'content_name': 'Test Event',
  'content_category': 'test'
});
```

## 🚨 Önemli Notlar

1. **Event Formatı**: Tüm event'ler Meta CAPI formatında olmalı
2. **User Data**: Hassas bilgiler (e-posta, telefon) hash'lenmiş olmalı
3. **Event Time**: Unix timestamp formatında (saniye cinsinden)
4. **Event ID**: Benzersiz olmalı
5. **Action Source**: Her zaman 'website' olmalı
6. **Content Name**: Event'in açıklayıcı adı
7. **Content Category**: Event'in kategorisi
8. **Test**: Canlıya almadan önce mutlaka test edin

## 📞 Destek

Event'lerin doğru çalışmadığını düşünüyorsanız:
1. Browser console'u kontrol edin
2. GTM Preview modunu kullanın
3. Meta CAPI test event'lerini kullanın
4. Backend loglarını kontrol edin

---

**Not**: Bu rehber Meta Conversions API standardına uygun event'leri içerir. Tüm event'ler backend'de Meta CAPI'ye gönderilir. 