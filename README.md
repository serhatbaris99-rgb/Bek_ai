# BEK AI — Yeni başlangıç

Bu proje eski Lovable/ZIP çalışmasından bağımsız olarak sıfırdan hazırlanmış BEK AI arayüzü ve Node.js sunucusudur.

## Başlatma
1. Node.js 20+ kurulu olmalı.
2. Terminalde bu klasöre gir.
3. `npm install`
4. `.env.example` dosyasını `.env` olarak kopyala.
5. `BEK_ADMIN_PASSWORD` için güçlü bir parola ve `JWT_SECRET` için 32+ karakter rastgele bir anahtar gir.
6. Sohbet için `OPENROUTER_API_KEY` ekle.
7. `npm start` komutunu çalıştır ve `http://localhost:8787` adresini aç.

## Mevcut kapsam
- Referans görseldeki koyu mor/neon dashboard düzeni
- Tek kullanıcı parola girişi
- OpenRouter üzerinden sohbet
- 20 uzmanlık profili ve model yönlendirme yapılandırması
- Yerel sunucu dosyasında kişisel not/hafıza kaydı
- Görsel API için OpenAI uyumlu sağlayıcı adaptörü
- Video stüdyosu arayüzü; gerçek video sağlayıcı entegrasyonu henüz yok

## Dürüst teknik not
Bu paket tüm 20 ayrı modeli veya sınırsız ücretsiz görsel/video üretimini kendi başına sağlamaz. Model profilleri gerçek sağlayıcı/model kimliklerine eşlenmelidir. Video servisleri farklı API akışları kullandığından seçilecek sağlayıcıya göre ayrıca entegrasyon gerekir. İnternete yayınlamadan önce HTTPS, rate limit, CSRF koruması, kalıcı veritabanı, yedekleme ve güvenlik testleri tamamlanmalıdır.
