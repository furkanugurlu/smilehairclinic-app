import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../store/authStore';
import { Text } from '../../components';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
    .required('Ad Soyad zorunludur'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz (10 haneli)')
    .required('Telefon numarası zorunludur'),
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { signUp, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (values: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    try {
      await signUp(values.email, values.password, values.fullName, values.phone);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/app-icon-wb.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text weight="bold" style={styles.title}>Hesap Oluştur</Text>
            <Text weight="regular" style={styles.subtitle}>Smile Hair Clinic'e katılın</Text>
          </View>

          <Formik
            initialValues={{
              fullName: 'Furkan Çelik',
              phone: '5321234567',
              email: 'furkancelik@gmail.com',
              password: '123456',
              confirmPassword: '123456',
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>Ad Soyad</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.fullName && errors.fullName && styles.inputError,
                    ]}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                    value={values.fullName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                  {touched.fullName && errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>Telefon</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.phone && errors.phone && styles.inputError,
                    ]}
                    placeholder="5XXXXXXXXX"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    value={values.phone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoComplete="tel"
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>E-posta</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email && styles.inputError,
                    ]}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>Şifre</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        touched.password && errors.password && styles.inputError,
                      ]}
                      placeholder="••••••••"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Icon 
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                        size={22} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>Şifre Tekrar</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          styles.inputError,
                      ]}
                      placeholder="••••••••"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Icon 
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                        size={22} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text weight="semibold" style={styles.buttonText}>Kayıt Ol</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text weight="regular" style={styles.footerText}>Zaten hesabınız var mı? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text weight="semibold" style={styles.footerLink}>Giriş Yap</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#3B82F6',
  },
});

export default RegisterScreen;

