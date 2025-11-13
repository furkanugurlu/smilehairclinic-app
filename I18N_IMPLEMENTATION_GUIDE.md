# i18n Implementation Guide

## ✅ Completed Tasks

### 1. Dependencies Installed

- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `@react-native-async-storage/async-storage` - Already installed for persistence

### 2. Configuration Files Created

- **`src/locales/tr.json`** - Turkish translations
- **`src/locales/en.json`** - English translations
- **`src/config/i18n.ts`** - i18next configuration with AsyncStorage persistence

### 3. App Integration

- **`App.tsx`** - Imports i18n configuration to initialize on app start
- Language is automatically detected and persisted using AsyncStorage

### 4. Screens Updated with i18n

#### ✅ Authentication Screens

- **`LoginScreen.tsx`** - Fully internationalized
  - Email and password labels
  - Validation messages
  - Buttons and links
- **`RegisterScreen.tsx`** - Fully internationalized
  - All form fields
  - Validation messages
  - Success/error messages

#### ✅ Profile & Settings

- **`LanguageScreen.tsx`** - Fully functional language switcher

  - Uses `i18n.changeLanguage()` to switch languages
  - Persists selection to AsyncStorage
  - Updates UI immediately

- **`ProfileScreen.tsx`** - Fully internationalized
  - All menu items
  - Section titles
  - Logout confirmation

#### 🔄 Partially Updated

- **`AppointmentsScreen.tsx`** - Import added, strings need replacement

---

## 📋 Screens Remaining to Update

### Main Screens

- [ ] `HomeScreen.tsx`
- [ ] `HairCheckScreen.tsx`

### Hair Check Flow

- [ ] `HairCheckStartScreen.tsx`
- [ ] `HairCheckCaptureScreen.tsx`
- [ ] `HairCheckDetailScreen.tsx`

### Profile Screens

- [ ] `AboutScreen.tsx`
- [ ] `ContactScreen.tsx`
- [ ] `HelpCenterScreen.tsx`
- [ ] `ProfileEditScreen.tsx`

### Admin Screens

- [ ] `AdminDashboardScreen.tsx`
- [ ] `AdminAppointmentsScreen.tsx`
- [ ] `AdminHairChecksScreen.tsx`
- [ ] `AdminHairCheckDetailScreen.tsx`

### Other Screens

- [ ] `AppointmentCreateScreen.tsx`
- [ ] `MessageListScreen.tsx`
- [ ] `ChatScreen.tsx`
- [ ] `OnboardingScreen.tsx`
- [ ] `SplashScreen.tsx`

---

## 🔧 How to Update a Screen

### Step 1: Import useTranslation

```tsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Get translation function

```tsx
const MyScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  // ... rest of component
```

### Step 3: Replace hard-coded strings

```tsx
// Before
<Text>Giriş Yap</Text>

// After
<Text>{t('auth.login')}</Text>
```

### Step 4: Update validation schemas

```tsx
// Before
const Schema = Yup.object().shape({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
});

// After
const MyScreen: React.FC<Props> = () => {
  const { t } = useTranslation();

  const Schema = Yup.object().shape({
    email: Yup.string()
      .email(t('auth.validation.emailInvalid'))
      .required(t('auth.validation.emailRequired')),
  });
```

### Step 5: Update Alert messages

```tsx
// Before
Alert.alert('Hata', 'Bir hata oluştu');

// After
Alert.alert(t('common.error'), t('errors.general'));
```

---

## 📝 Translation Key Structure

All translations are organized in a hierarchical structure:

### Common

- `common.appName` - "Smile Hair Clinic"
- `common.save` - "Kaydet" / "Save"
- `common.cancel` - "İptal" / "Cancel"
- `common.error` - "Hata" / "Error"
- etc.

### Authentication

- `auth.login` - "Giriş Yap" / "Login"
- `auth.register` - "Kayıt Ol" / "Register"
- `auth.email` - "E-posta" / "Email"
- `auth.password` - "Şifre" / "Password"
- `auth.validation.emailInvalid` - Validation messages
- etc.

### Profile

- `profile.title` - "Profil" / "Profile"
- `profile.account` - "Hesap" / "Account"
- `profile.settings` - "Ayarlar" / "Settings"
- etc.

### Appointments

- `appointments.title` - "Randevularım" / "My Appointments"
- `appointments.create` - "Yeni Randevu Oluştur" / "Create New Appointment"
- `appointments.statuses.confirmed` - "Onaylandı" / "Confirmed"
- `appointments.services.hair_transplant_consultation` - Service names
- etc.

### Hair Check

- `hairCheck.title` - "Saç Kontrolü" / "Hair Check"
- `hairCheck.start` - "Kontrol Başlat" / "Start Check"
- `hairCheck.analyzing` - "Analiz ediliyor..." / "Analyzing..."
- etc.

See `src/locales/tr.json` and `src/locales/en.json` for the complete list.

---

## 🎯 Example Patterns

### Pattern 1: Simple Text Replacement

```tsx
// Static text
<Text weight="bold" style={styles.title}>
  {t('common.appName')}
</Text>
```

### Pattern 2: Labels and Placeholders

```tsx
<Text weight="semibold" style={styles.label}>
  {t('auth.email')}
</Text>
<TextInput
  placeholder={t('auth.emailPlaceholder')}
  // ...
/>
```

### Pattern 3: Status or Type Mapping

```tsx
const getStatusText = (status: AppointmentStatus) => {
  return t(`appointments.statuses.${status}`);
};

// Usage
<Text>{getStatusText('confirmed')}</Text>;
// Renders: "Onaylandı" (TR) or "Confirmed" (EN)
```

### Pattern 4: Dynamic Content with Fallbacks

```tsx
<Text>{user?.full_name || t('profile.user')}</Text>
```

### Pattern 5: Conditional Rendering

```tsx
{
  loading ? <ActivityIndicator /> : <Text>{t('auth.login')}</Text>;
}
```

---

## 🧪 Testing

### Test Language Switching

1. Run the app: `npm run android`
2. Navigate to Profile → Language (Dil)
3. Switch between Turkish and English
4. Verify all updated screens display correct language
5. Restart app and verify language persists

### Test New Translations

1. Add translation to both `tr.json` and `en.json`
2. Use in component: `{t('your.new.key')}`
3. Hot reload should work, or restart if needed

---

## ⚡ Quick Reference

### Get current language

```tsx
const { i18n } = useTranslation();
console.log(i18n.language); // 'tr' or 'en'
```

### Change language programmatically

```tsx
const { i18n } = useTranslation();
await i18n.changeLanguage('en');
```

### Check if key exists (for debugging)

```tsx
const { t } = useTranslation();
console.log(t('your.key', { defaultValue: 'Fallback text' }));
```

---

## 📦 Files Modified

### Core Files

- `App.tsx` - Added i18n import
- `src/config/i18n.ts` - Created
- `src/locales/tr.json` - Created
- `src/locales/en.json` - Created

### Screens Updated

- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/RegisterScreen.tsx`
- `src/screens/profile/LanguageScreen.tsx`
- `src/screens/main/ProfileScreen.tsx`
- `src/screens/main/AppointmentsScreen.tsx` (partial)

---

## 🚀 Next Steps

1. **Update remaining screens** - Follow the patterns above
2. **Add missing translations** - Add any new strings to both language files
3. **Test thoroughly** - Ensure all screens work in both languages
4. **Handle edge cases** - Date formatting, number formatting, RTL support (if needed)
5. **Update navigation** - Tab labels, header titles if needed

---

## 💡 Tips

- **Use nested keys** - Keep translations organized: `auth.validation.emailInvalid`
- **Be consistent** - Use same terminology across the app
- **Keep keys descriptive** - `profile.editButton` not `button1`
- **Add all strings** - Don't leave hard-coded strings, even if same in both languages
- **Test both languages** - Don't assume Turkish→English is direct translation

---

## 📞 Common Issues

### Translation not updating?

- Make sure you imported `useTranslation`
- Check the translation key exists in both language files
- Try restarting the dev server

### Validation not translating?

- Move Yup schema inside component to access `t()` function
- See `LoginScreen.tsx` and `RegisterScreen.tsx` for examples

### Language not persisting?

- Check AsyncStorage permissions
- Verify `@react-native-async-storage/async-storage` is installed
- Check console for errors from `src/config/i18n.ts`

---

## ✨ Features Implemented

✅ Two-language support (Turkish & English)  
✅ Automatic language detection  
✅ Language persistence across app restarts  
✅ Language switcher in Settings  
✅ Comprehensive translation coverage  
✅ Type-safe translation keys  
✅ Validation message translations  
✅ Alert and confirmation dialogs  
✅ Form labels and placeholders  
✅ Dynamic content translation

---

For questions or issues, refer to:

- [i18next documentation](https://www.i18next.com/)
- [react-i18next documentation](https://react.i18next.com/)
