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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../config/supabase';
import { Text } from '../../components';

interface ResetPasswordScreenProps {
  navigation: any;
}

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (values: { password: string }) => {
    setLoading(true);

    try {
      // Yeni şifreyi güncelle
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Başarılı',
        'Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert(
        'Hata',
        error.message || 'Şifre sıfırlama sırasında bir hata oluştu.',
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
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="key" size={48} color="#01213D" />
            </View>
            <Text weight="bold" style={styles.title}>
              Yeni Şifre Belirle
            </Text>
            <Text weight="regular" style={styles.subtitle}>
              Hesabınız için yeni bir şifre oluşturun
            </Text>
          </View>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleResetPassword}
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
                {/* New Password */}
                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>
                    Yeni Şifre
                  </Text>
                  <View style={styles.passwordContainer}>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="lock-closed-outline"
                        size={20}
                        color="#9CA3AF"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          touched.password &&
                            errors.password &&
                            styles.inputError,
                        ]}
                        placeholder="Yeni şifrenizi girin"
                        placeholderTextColor="#999"
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Icon
                          name={
                            showPassword ? 'eye-outline' : 'eye-off-outline'
                          }
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Text weight="semibold" style={styles.label}>
                    Yeni Şifre (Tekrar)
                  </Text>
                  <View style={styles.passwordContainer}>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="lock-closed-outline"
                        size={20}
                        color="#9CA3AF"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          touched.confirmPassword &&
                            errors.confirmPassword &&
                            styles.inputError,
                        ]}
                        placeholder="Şifrenizi tekrar girin"
                        placeholderTextColor="#999"
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        value={values.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                        editable={!loading}
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
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                {/* Password Requirements */}
                <View style={styles.requirementsCard}>
                  <Text weight="semibold" style={styles.requirementsTitle}>
                    Şifre Gereksinimleri:
                  </Text>
                  <View style={styles.requirement}>
                    <Icon
                      name={
                        values.password.length >= 6
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={20}
                      color={values.password.length >= 6 ? '#10B981' : '#9CA3AF'}
                    />
                    <Text
                      weight="regular"
                      style={[
                        styles.requirementText,
                        values.password.length >= 6 && styles.requirementMet,
                      ]}
                    >
                      En az 6 karakter
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Icon
                      name={
                        values.password === values.confirmPassword &&
                        values.password.length > 0
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={20}
                      color={
                        values.password === values.confirmPassword &&
                        values.password.length > 0
                          ? '#10B981'
                          : '#9CA3AF'
                      }
                    />
                    <Text
                      weight="regular"
                      style={[
                        styles.requirementText,
                        values.password === values.confirmPassword &&
                          values.password.length > 0 &&
                          styles.requirementMet,
                      ]}
                    >
                      Şifreler eşleşiyor
                    </Text>
                  </View>
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
                      Şifreyi Sıfırla
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text weight="regular" style={styles.cancelText}>
                    İptal
                  </Text>
                </TouchableOpacity>
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
    marginTop: 60,
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
  passwordContainer: {
    position: 'relative',
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
    paddingRight: 50,
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Poppins-Regular',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  requirementsCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#10B981',
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
  cancelButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 14,
  },
});

export default ResetPasswordScreen;

