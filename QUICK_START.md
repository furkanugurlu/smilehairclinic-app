# 🚀 Hızlı Başlangıç Rehberi

## ⚡ 5 Dakikada Başla

### 1️⃣ Supabase Hesabı Oluştur (2 dakika)

1. [supabase.com](https://supabase.com) adresine git
2. "Start your project" butonuna tıkla
3. Yeni bir proje oluştur
4. Proje adı: `smile-hair-clinic`
5. Database şifresi belirle ve kaydet

### 2️⃣ Supabase Veritabanını Kur (1 dakika)

1. Supabase Dashboard'da **SQL Editor** sekmesine git
2. Aşağıdaki SQL kodunu kopyala ve çalıştır:

```sql
-- Profiller tablosu
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger
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

### 3️⃣ API Anahtarlarını Al (30 saniye)

1. Supabase Dashboard'da **Settings** > **API** sekmesine git
2. Şu değerleri kopyala:
   - **Project URL** (örnek: `https://xxxxx.supabase.co`)
   - **anon public** key

### 4️⃣ Uygulamayı Yapılandır (30 saniye)

`src/config/supabase.ts` dosyasını aç ve değerleri yapıştır:

```typescript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Buraya Project URL
const SUPABASE_ANON_KEY = 'eyJhbG...'; // Buraya anon key
```

### 5️⃣ Uygulamayı Çalıştır (1 dakika)

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## ✅ İlk Test

1. Uygulama açıldığında **Onboarding** ekranlarını gör
2. "Başla" butonuna tıkla
3. **Kayıt Ol** sekmesine git
4. Formu doldur:
   - Ad Soyad: `Test Kullanıcı`
   - E-posta: `test@example.com`
   - Şifre: `123456`
   - Şifre Tekrar: `123456`
5. **Kayıt Ol** butonuna tıkla
6. Ana sayfaya yönlendirilmelisin! 🎉

## 🎯 Ekran Akışı

```
Onboarding (3 sayfa)
    ↓
Login / Register
    ↓
Ana Sayfa (4 Tab)
├── Ana Sayfa (Hızlı İşlemler + Hizmetler)
├── Randevular
├── Mesajlar
└── Profil (Çıkış Yap)
```

## 🐛 Sorun mu Yaşıyorsun?

### Supabase Bağlantı Hatası
- ✅ URL ve Key'i doğru kopyaladığından emin ol
- ✅ URL'nin sonunda `/` olmamalı
- ✅ Key'in tamamını kopyaladığından emin ol

### Metro Bundler Hatası
```bash
npm start -- --reset-cache
```

### iOS Build Hatası
```bash
cd ios && pod install && cd ..
```

### Android Build Hatası
```bash
cd android && ./gradlew clean && cd ..
```

## 📱 Test Hesapları

Geliştirme için test hesapları oluşturabilirsin:

```
Email: test1@example.com
Şifre: 123456

Email: test2@example.com
Şifre: 123456
```

## 🎨 Özelleştirme

### Renkleri Değiştir
Ana renk: `#3B82F6` (Mavi)
- Tüm ekranlarda bu renk kullanılıyor
- Değiştirmek için tüm dosyalarda `#3B82F6` ara ve değiştir

### Logo Değiştir
- Şu an emoji kullanılıyor: `💇‍♂️`
- Gerçek logo için `src/assets/` klasörü oluştur
- `Image` component'i ile değiştir

## 🚀 Sonraki Adımlar

1. ✅ Profil düzenleme özelliği ekle
2. ✅ Şifremi unuttum özelliği ekle
3. ✅ Randevu oluşturma sistemi
4. ✅ Mesajlaşma sistemi
5. ✅ Push notification

## 📚 Daha Fazla Bilgi

- [SETUP.md](./SETUP.md) - Detaylı kurulum
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Proje özeti
- [README.md](./README.md) - Ana dokümantasyon

---

**Başarılar! 🎉** Herhangi bir sorun yaşarsan dokümantasyonlara göz at veya issue aç.

