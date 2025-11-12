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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../config/supabase';
import { Text } from '../../components';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
});

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (values: { email: string }) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: 'smilehairclinic://reset-password', // Deep link için
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      Alert.alert(
        'Email Gönderildi',
        `${values.email} adresine şifre sıfırlama linki gönderildi. Lütfen e-postanızı kontrol edin.`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert(
        'Hata',
        error.message || 'Şifre sıfırlama linki gönderilemedi.',
      );
    } finally {
      setLoading(false);
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
          {/* Header with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#01213D" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="lock-closed" size={48} color="#01213D" />
            </View>
            <Text weight="bold" style={styles.title}>
              Şifremi Unuttum
            </Text>
            <Text weight="regular" style={styles.subtitle}>
              E-posta adresinizi girin, size şifre sıfırlama linki gönderelim
            </Text>
          </View>

          {!emailSent ? (
            <Formik
              initialValues={{ email: 'furkanugurlu5134@gmail.com' }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleForgotPassword}
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
                      E-posta Adresi
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="mail-outline"
                        size={20}
                        color="#9CA3AF"
                        style={styles.inputIcon}
                      />
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
                        editable={!loading}
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Info Card */}
                  <View style={styles.infoCard}>
                    <Icon
                      name="information-circle-outline"
                      size={20}
                      color="#3B82F6"
                    />
                    <Text weight="regular" style={styles.infoText}>
                      Kayıtlı e-posta adresinize şifre sıfırlama linki
                      göndereceğiz. Link 1 saat geçerli olacaktır.
                    </Text>
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
                        Sıfırlama Linki Gönder
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backToLoginButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Icon name="arrow-back" size={18} color="#01213D" />
                    <Text weight="semibold" style={styles.backToLoginText}>
                      Giriş Ekranına Dön
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="checkmark-circle" size={80} color="#10B981" />
              </View>
              <Text weight="bold" style={styles.successTitle}>
                Email Gönderildi!
              </Text>
              <Text weight="regular" style={styles.successText}>
                Şifre sıfırlama talimatları e-posta adresinize gönderildi.
                Lütfen gelen kutunuzu kontrol edin.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.goBack()}
              >
                <Text weight="semibold" style={styles.buttonText}>
                  Giriş Ekranına Dön
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  topBar: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Poppins-Regular',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#01213D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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
  backToLoginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#01213D',
    marginLeft: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
});

export default ForgotPasswordScreen;

