# Smile Hair Clinic App - Kurulum Rehberi

## 📋 Gereksinimler

- Node.js >= 20
- React Native CLI
- iOS: Xcode ve CocoaPods
- Android: Android Studio ve JDK

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. iOS için (macOS)

```bash
cd ios
pod install
cd ..
```

### 3. Supabase Kurulumu

#### 3.1. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından API URL ve Anon Key değerlerini alın

#### 3.2. Supabase Veritabanı Tablosu Oluşturun

Supabase SQL Editor'de aşağıdaki SQL komutlarını çalıştırın:

```sql
-- Profiller tablosu oluştur
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS (Row Level Security) politikalarını etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini ekleyebilir
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Profil güncellendiğinde updated_at alanını otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 3.3. Supabase Yapılandırması

`src/config/supabase.ts` dosyasını açın ve aşağıdaki değerleri kendi Supabase proje bilgilerinizle değiştirin:

```typescript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Örnek: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## 📱 Uygulamayı Çalıştırma

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

## 🏗️ Proje Yapısı

```
src/
├── config/          # Yapılandırma dosyaları (Supabase)
├── store/           # Zustand state yönetimi
├── screens/         # Ekranlar
│   ├── auth/        # Login, Register
│   ├── onboarding/  # Onboarding ekranları
│   └── main/        # Ana uygulama ekranları (Home, Appointments, Messages, Profile)
├── navigation/      # Navigation yapısı
├── components/      # Yeniden kullanılabilir componentler
├── types/           # TypeScript tipleri
└── utils/           # Yardımcı fonksiyonlar
```

## 🔑 Özellikler

### ✅ Tamamlanan

- ✅ Onboarding ekranları
- ✅ Login sayfası (Formik + Yup validasyon)
- ✅ Register sayfası (Formik + Yup validasyon)
- ✅ Supabase authentication entegrasyonu
- ✅ Zustand state yönetimi
- ✅ Bottom tab navigation (Ana Sayfa, Randevular, Mesajlar, Profil)
- ✅ Modern ve kullanıcı dostu UI/UX

### 🚧 Gelecek Özellikler

- 🔜 Randevu oluşturma ve yönetimi
- 🔜 Mesajlaşma sistemi
- 🔜 Profil düzenleme
- 🔜 Saç analizi
- 🔜 Fotoğraf galerisi
- 🔜 Bildirim sistemi
- 🔜 Çoklu dil desteği

## 📚 Kullanılan Teknolojiler

- **React Native 0.82.1** - Mobil uygulama framework'ü
- **TypeScript** - Tip güvenliği
- **Formik** - Form yönetimi
- **Yup** - Form validasyonu
- **Zustand** - State yönetimi
- **Supabase** - Backend ve authentication
- **React Navigation** - Navigasyon
- **React Native Gesture Handler** - Gesture yönetimi
- **React Native Safe Area Context** - Safe area yönetimi

## 🐛 Sorun Giderme

### iOS Pod Install Hatası

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Metro Bundler Cache Temizleme

```bash
npm start -- --reset-cache
```

### Android Gradle Temizleme

```bash
cd android
./gradlew clean
cd ..
```

## 📝 Notlar

- Supabase yapılandırmasını yapmadan uygulama çalışmayacaktır
- İlk çalıştırmada onboarding ekranları gösterilir
- Onboarding tamamlandıktan sonra bir daha gösterilmez
- Kullanıcı giriş yaptıktan sonra otomatik olarak ana sayfaya yönlendirilir

## 📞 Destek

Herhangi bir sorun yaşarsanız lütfen issue açın.

