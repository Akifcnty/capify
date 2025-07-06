# Capify - Google Tag Manager (GTM) Entegrasyon Rehberi

Bu rehber, Capify Facebook Conversion API entegrasyonunu e-ticaret sitenize Google Tag Manager (GTM) ile nasıl kuracağınızı adım adım açıklar.

## 1. Capify Panelinden Script Template Alın
- Dashboard > Facebook Token'larınız bölümünden ilgili token için "Script Template Al" butonuna tıklayın.
- Açılan penceredeki script kodunu kopyalayın.

## 2. Google Tag Manager'a Giriş Yapın
- [Google Tag Manager](https://tagmanager.google.com/) hesabınıza giriş yapın.
- İlgili konteyneri seçin.

## 3. Yeni Tag Ekleyin
- Sol menüden **Tags** > **New** > **Tag Configuration** > **Custom HTML** seçin.
- Kopyaladığınız Capify script kodunu HTML alanına yapıştırın.
- **Triggering** bölümünden "All Pages" veya istediğiniz sayfa/event tetikleyicisini seçin.

## 4. DataLayer Event'leri ile Otomatik Event Gönderimi
- Capify script'i, e-ticaret platformunuzun DataLayer'ına push edilen event'leri otomatik olarak algılar ve Facebook CAPI'ye iletir.
- Örnek DataLayer push:
```js
window.dataLayer.push({
  event: 'purchase',
  email: 'user@example.com',
  value: 199.99,
  currency: 'TRY',
  content_ids: ['SKU123'],
  ...
});
```
- Desteklenen event'ler: `lead`, `purchase`, `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `add_shipping_info`, `view_cart`, `search`, `contact`, `custom`

## 5. Script'in Doğru Çalıştığını Test Edin
- GTM Preview/Debug modunu kullanarak event'lerin Capify API'ye iletildiğini kontrol edin.
- Capify panelinizde event istatistiklerini ve logları görebilirsiniz.

## 6. Yayınlayın
- GTM'de değişiklikleri **Submit/Publish** ile canlıya alın.

---

> **Not:** Script template'inde API URL, Pixel ID ve Access Token alanlarını kendi bilgilerinizle doldurduğunuzdan emin olun.

# GTM Entegrasyon ve Test Event Gönderimi

## Test Event Gönderimi (Meta/Facebook CAPI)

Test event göndermek için, seçili Facebook token'ının hem `access_token` hem de `gtm_container_id` değerlerini kullanmalısınız. Örnek payload aşağıdaki gibi olmalıdır:

```json
{
  "event_name": "TestEvent",
  "event_time": 1720000000,
  "event_id": "TEST1234",
  "user_data": {
    "em": ["test@example.com"]
  },
  "action_source": "website",
  "event_source_url": "https://ornek.com",
  "gtm_container_id": "GTM-XXXXXXX"
}
```

API isteği şu şekilde yapılmalıdır:

```
POST /api/facebook/events/custom
Authorization: Bearer {access_token}
Content-Type: application/json
Body: yukarıdaki payload
```

> Not: `gtm_container_id` ve `access_token` seçili token'dan otomatik alınır. GTM scriptlerinde de bu değerlerin dinamik olarak eklenmesi gerekir.

Sorularınız için: [destek@capify.com](mailto:destek@capify.com) 