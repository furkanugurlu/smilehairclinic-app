# 💇‍♂️ Smile Hair Clinic App

Modern ve kullanıcı dostu saç kliniği mobil uygulaması. React Native, TypeScript, Supabase ve Zustand ile geliştirilmiştir.

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- 🎨 Modern ve kullanıcı dostu UI/UX
- 🔐 Güvenli authentication (Supabase)
- 📝 Form validasyonu (Formik + Yup)
- 🔑 Şifre sıfırlama ve değiştirme
- 🔗 Deep linking desteği (şifre sıfırlama linkleri)

### 📱 Kullanıcı Özellikleri
- 📱 Onboarding ekranları (3 sayfalık modern deneyim)
- 👤 Kullanıcı profil yönetimi ve düzenleme
- 📅 Randevu sistemi (oluşturma, görüntüleme, yönetim)
- 💬 Mesajlaşma sistemi (admin ile iletişim)
- 📸 Saç analizi (Hair Check) - Kamera ile fotoğraf çekme ve analiz
- 🌍 Çoklu dil desteği (Türkçe/İngilizce)
- 🎨 Lottie animasyonları

### 👨‍💼 Admin Özellikleri
- 📊 Admin dashboard
- 📅 Randevu yönetimi
- 💬 Mesaj yönetimi
- 📸 Saç analizi kontrolü ve yönetimi

### 🛠️ Teknik Özellikler
- 🗂️ State yönetimi (Zustand)
- 🧭 Navigation (React Navigation)
- 📦 TypeScript ile tip güvenliği
- 🔄 AsyncStorage ile lokal depolama

## 🚀 Hızlı Başlangıç

> **Not**: Başlamadan önce [React Native ortamınızı kurduğunuzdan](https://reactnative.dev/docs/set-up-your-environment) emin olun.

### 📋 Gereksinimler

- Node.js >= 20
- React Native CLI
- iOS: Xcode ve CocoaPods
- Android: Android Studio ve JDK
- Supabase hesabı

### 📦 Kurulum

1. **Bağımlılıkları yükleyin:**

```bash
npm install
```

2. **iOS için CocoaPods yükleyin:**

```bash
cd ios
pod install
cd ..
```

3. **Supabase yapılandırması:**

Detaylı kurulum talimatları için [SETUP.md](./SETUP.md) dosyasına bakın.

## 🎯 Uygulamayı Çalıştırma

### 1. Metro Bundler'ı Başlatın

```bash
npm start
```

### 2. Uygulamayı Çalıştırın

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## 📱 Ekran Görüntüleri

### Onboarding
- 3 sayfalık modern onboarding deneyimi
- Swipe ile geçiş
- Atla butonu

### Authentication
- Login ekranı (Email + Şifre)
- Register ekranı (Ad Soyad + Email + Şifre)
- Form validasyonu

### Ana Uygulama
- **Ana Sayfa**: Hızlı işlemler, hizmetler ve saç analizi başlatma
- **Randevular**: Randevu oluşturma, görüntüleme ve yönetim
- **Saç Analizi**: Kamera ile fotoğraf çekme ve analiz sonuçları
- **Mesajlar**: Admin ile mesajlaşma
- **Profil**: Kullanıcı bilgileri, şifre değiştirme, dil seçimi, ayarlar

### Admin Paneli
- **Dashboard**: Genel istatistikler ve hızlı erişim
- **Randevu Yönetimi**: Tüm randevuları görüntüleme ve yönetme
- **Saç Analizi Kontrolü**: Kullanıcı analizlerini inceleme ve yanıt verme
- **Mesaj Yönetimi**: Kullanıcılarla iletişim

## 🏗️ Proje Yapısı

```
src/
├── assets/          # Statik dosyalar
│   ├── fonts/       # Poppins font ailesi
│   ├── icons/       # Uygulama ikonları
│   ├── images/      # Görseller
│   └── lottie/      # Lottie animasyon dosyaları
├── components/      # Yeniden kullanılabilir bileşenler
│   ├── BottomSheet.tsx
│   ├── DateTimeModal.tsx
│   ├── FilterTabs.tsx
│   ├── LoadingModal.tsx
│   └── Text.tsx
├── config/          # Yapılandırma dosyaları
│   └── supabase.ts  # Supabase client yapılandırması
├── i18n/            # Çoklu dil desteği
│   ├── index.ts
│   └── locales/     # Dil dosyaları (tr.json, en.json)
├── navigation/      # Navigation yapısı
│   ├── AuthStack.tsx
│   ├── MainTabs.tsx
│   ├── ProfileStack.tsx
│   └── RootNavigator.tsx
├── screens/         # Ekranlar
│   ├── auth/        # Kimlik doğrulama ekranları
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   └── ResetPasswordScreen.tsx
│   ├── onboarding/  # Onboarding ekranları
│   │   └── OnboardingScreen.tsx
│   ├── main/        # Ana uygulama ekranları
│   │   ├── home/    # Ana sayfa
│   │   ├── appointment/  # Randevu ekranları
│   │   ├── hair/    # Saç analizi ekranları
│   │   ├── messages/  # Mesajlaşma ekranları
│   │   └── profile/   # Profil ekranları
│   └── SplashScreen.tsx
├── store/           # Zustand state yönetimi
│   └── authStore.ts
├── theme/           # Tema yapılandırması
├── types/           # TypeScript tip tanımları
│   └── index.ts
└── utils/           # Yardımcı fonksiyonlar
    ├── constants.ts
    └── imageUpload.ts
```

## 🛠️ Kullanılan Teknolojiler

### Core Framework
- **React Native 0.82.1** - Mobil uygulama framework'ü
- **TypeScript** - Tip güvenliği
- **React 19.1.1** - UI kütüphanesi

### State & Navigation
- **Zustand** - Hafif ve güçlü state yönetimi
- **React Navigation** - Navigasyon çözümü
- **@react-native-async-storage/async-storage** - Lokal depolama

### Backend & Authentication
- **Supabase** - Backend, authentication ve veritabanı
- **@supabase/supabase-js** - Supabase JavaScript client

### Forms & Validation
- **Formik** - Form yönetimi
- **Yup** - Schema validasyonu

### UI & UX
- **Lottie React Native** - Animasyonlar
- **React Native Vector Icons** - İkon kütüphanesi
- **React Native Linear Gradient** - Gradient arka planlar
- **React Native Gesture Handler** - Gesture yönetimi
- **React Native Safe Area Context** - Safe area yönetimi

### Media & Camera
- **React Native Vision Camera** - Gelişmiş kamera özellikleri
- **React Native Image Picker** - Görsel seçme
- **React Native Image Resizer** - Görsel boyutlandırma
- **React Native Compressor** - Görsel sıkıştırma
- **React Native Blob Util** - Dosya işlemleri

### Internationalization
- **i18next** - Çoklu dil desteği
- **react-i18next** - React entegrasyonu
- **react-native-localize** - Lokal ayarlar

### Utilities
- **React Native TTS** - Text-to-speech
- **React Native Permissions** - İzin yönetimi
- **React Native DateTime Picker** - Tarih/saat seçici
- **base-64** - Base64 encoding/decoding

## 📚 Dokümantasyon

- [SETUP.md](./SETUP.md) - Detaylı kurulum rehberi
- [QUICK_START.md](./QUICK_START.md) - Hızlı başlangıç rehberi
- [PASSWORD_RESET_GUIDE.md](./PASSWORD_RESET_GUIDE.md) - Şifre sıfırlama rehberi
- [DEEPLINK_IMPLEMENTATION.md](./DEEPLINK_IMPLEMENTATION.md) - Deep linking implementasyonu
- [DEEPLINK_SETUP_SUMMARY.md](./DEEPLINK_SETUP_SUMMARY.md) - Deep linking kurulum özeti
- [DEEPLINK_TESTING.md](./DEEPLINK_TESTING.md) - Deep linking test rehberi

## 🐛 Sorun Giderme

### Metro Cache Temizleme
```bash
npm start -- --reset-cache
```

### iOS Pod Sorunları
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Temizleme
```bash
cd android
./gradlew clean
cd ..
```

### Kamera İzinleri
Uygulama ilk kez açıldığında kamera izni isteyecektir. İzin verilmezse saç analizi özelliği çalışmayacaktır.

### Deep Link Test Etme
Şifre sıfırlama linklerini test etmek için:
```bash
# iOS Simulator
xcrun simctl openurl booted "smilehairclinic://reset-password#access_token=TOKEN&refresh_token=TOKEN&type=recovery"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "smilehairclinic://reset-password#access_token=TOKEN&refresh_token=TOKEN&type=recovery"
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen bir issue açın veya pull request gönderin.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🔗 Faydalı Linkler

### Framework & Libraries
- [React Native Dokümantasyonu](https://reactnative.dev)
- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org)
- [Formik](https://formik.org)
- [Zustand](https://zustand-demo.pmnd.rs)
- [i18next](https://www.i18next.com)

### Tools & Utilities
- [React Native Vision Camera](https://react-native-vision-camera.com)
- [Lottie Files](https://lottiefiles.com)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)

## 📊 Veritabanı Migrasyonları

Proje Supabase migration dosyalarını içerir. Migration'ları uygulamak için:

```bash
# Supabase CLI ile migration uygulama
supabase db push
```

Migration dosyaları `supabase_migrations/` dizininde bulunmaktadır.

---

**Smile Hair Clinic** ile saç sağlığınız güvende! 💇‍♂️✨
