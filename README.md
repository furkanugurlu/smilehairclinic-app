# 💇‍♂️ Smile Hair Clinic App

Modern ve kullanıcı dostu saç kliniği mobil uygulaması. React Native, TypeScript, Supabase ve Zustand ile geliştirilmiştir.

## ✨ Özellikler

- 🎨 Modern ve kullanıcı dostu UI/UX
- 🔐 Güvenli authentication (Supabase)
- 📝 Form validasyonu (Formik + Yup)
- 🗂️ State yönetimi (Zustand)
- 🧭 Navigation (React Navigation)
- 📱 Onboarding ekranları
- 👤 Kullanıcı profil yönetimi
- 📅 Randevu sistemi (yakında)
- 💬 Mesajlaşma (yakında)

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
- Ana Sayfa (Hızlı işlemler, Hizmetler)
- Randevular
- Mesajlar
- Profil (Kullanıcı bilgileri, Ayarlar)

## 🏗️ Proje Yapısı

```
src/
├── config/          # Yapılandırma (Supabase)
├── store/           # Zustand stores
├── screens/         # Ekranlar
│   ├── auth/        # Login, Register
│   ├── onboarding/  # Onboarding
│   └── main/        # Ana uygulama ekranları
├── navigation/      # Navigation yapısı
├── components/      # Reusable components
├── types/           # TypeScript types
└── utils/           # Yardımcı fonksiyonlar
```

## 🛠️ Kullanılan Teknolojiler

- **React Native 0.82.1** - Mobil framework
- **TypeScript** - Tip güvenliği
- **Formik** - Form yönetimi
- **Yup** - Validasyon
- **Zustand** - State yönetimi
- **Supabase** - Backend & Auth
- **React Navigation** - Navigasyon
- **AsyncStorage** - Local storage

## 📚 Dokümantasyon

- [SETUP.md](./SETUP.md) - Detaylı kurulum rehberi
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Proje özeti ve durum

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

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen bir issue açın veya pull request gönderin.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🔗 Faydalı Linkler

- [React Native Dokümantasyonu](https://reactnative.dev)
- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org)
- [Formik](https://formik.org)
- [Zustand](https://zustand-demo.pmnd.rs)

---

**Smile Hair Clinic** ile saç sağlığınız güvende! 💇‍♂️✨
