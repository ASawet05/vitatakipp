# VitaTakip

Vitamin, takviye, ilaç ve tahlil takibi için **tarayıcıda çalışan bir web sayfası**.

- **Kurulum yok:** Uygulama mağazası, APK veya "uygulamayı yükle" yoktur; sayfayı tarayıcıda açmanız yeterlidir.
- **Sunucu yok:** Hesaplar ve sağlık verileri yalnızca kullandığınız tarayıcıda (localStorage / IndexedDB) saklanır. Firebase, Google AI Studio / Gemini veya başka bir dış servis kullanılmaz; sayfa hiçbir dış adrese veri göndermez (`connect-src 'self'`).
- **Vita AI** yanıtları tarayıcıdaki yerel kurallarla üretilir.
- **Başka cihaza/tarayıcıya taşıma:** Ayarlar > "Yedek İndir" ile alınan dosyayı diğer tarafta "Yedekten Geri Yükle" ile içe aktarın. Tarayıcı verilerini temizlerseniz kayıtlar silinir; düzenli yedek alın.
- Tıbbi tanı koymaz; kararlar için hekiminize danışın.

## Yayın
Site GitHub Pages ile `main` dalının kökünden yayınlanır: https://asawet05.github.io/vitatakipp/ . `main` dalına gönderilen her değişiklik birkaç dakika içinde yayına çıkar.

## Yerelde çalıştırma
Depo kökünde basit bir sunucu başlatın, örneğin `npx serve -l 8080 .`, ardından http://localhost:8080 adresini açın.

## Testler
`tests/README.md` dosyasına bakın.
