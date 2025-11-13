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
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { Text } from '../../components';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { signUp, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    fullName: Yup.string()
      .min(2, t('auth.validation.fullNameMin'))
      .required(t('auth.validation.fullNameRequired')),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, t('auth.validation.phoneInvalid'))
      .required(t('auth.validation.phoneRequired')),
    email: Yup.string()
      .email(t('auth.validation.emailInvalid'))
      .required(t('auth.validation.emailRequired')),
    password: Yup.string()
      .min(6, t('auth.validation.passwordMin'))
      .required(t('auth.validation.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('auth.validation.passwordMatch'))
      .required(t('auth.validation.passwordConfirmRequired')),
  });

  const handleRegister = async (values: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    try {
      await signUp(
        values.email,
        values.password,
        values.fullName,
        values.phone,
      );
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
            <Text weight="bold" style={styles.title}>
              {t('auth.registerTitle')}
            </Text>
            <Text weight="regular" style={styles.subtitle}>
              {t('auth.registerSubtitle')}
            </Text>
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
                  <Text weight="semibold" style={styles.label}>
                    {t('auth.fullName')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.fullName && errors.fullName && styles.inputError,
                    ]}
                    placeholder={t('auth.fullNamePlaceholder')}
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
                  <Text weight="semibold" style={styles.label}>
                    {t('auth.phone')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.phone && errors.phone && styles.inputError,
                    ]}
                    placeholder={t('auth.phonePlaceholder')}
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
                  <Text weight="semibold" style={styles.label}>
                    {t('auth.email')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email && styles.inputError,
                    ]}
                    placeholder={t('auth.emailPlaceholder')}
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
                  <Text weight="semibold" style={styles.label}>
                    {t('auth.password')}
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        touched.password &&
                          errors.password &&
                          styles.inputError,
                      ]}
                      placeholder={t('auth.passwordPlaceholder')}
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
                  <Text weight="semibold" style={styles.label}>
                    {t('auth.passwordConfirm')}
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          styles.inputError,
                      ]}
                      placeholder={t('auth.passwordPlaceholder')}
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
                        name={
                          showConfirmPassword
                            ? 'eye-outline'
                            : 'eye-off-outline'
                        }
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
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
                    <Text weight="semibold" style={styles.buttonText}>
                      {t('auth.register')}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text weight="regular" style={styles.footerText}>
                    {t('auth.alreadyHaveAccount')}{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text weight="semibold" style={styles.footerLink}>
                      {t('auth.login')}
                    </Text>
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
    backgroundColor: '#01213D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#01213D',
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
    color: '#01213D',
  },
});

export default RegisterScreen;
