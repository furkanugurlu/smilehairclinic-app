import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../config/supabase';
import {
  pickImageFromGallery,
  uploadAvatarToSupabase,
  deleteAvatarFromSupabase,
} from '../../../utils/imageUpload';

interface ProfileEditScreenProps {
  navigation: any;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatar_url,
  );

  const ProfileSchema = Yup.object().shape({
    fullName: Yup.string()
      .min(2, t('profileEdit.fullNameMinLength'))
      .required(t('profileEdit.fullNameRequired')),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, t('profileEdit.phoneInvalid'))
      .required(t('profileEdit.phoneRequired')),
  });

  const handleSelectAvatar = async () => {
    try {
      setUploadingAvatar(true);

      console.log('🖼️ Galeri açılıyor...');
      // Galeriden resim seç
      const image = await pickImageFromGallery();
      if (!image) {
        console.log('📸 Resim seçimi iptal edildi');
        setUploadingAvatar(false);
        return;
      }

      console.log('✅ Resim seçildi:', {
        uri: image.uri,
        type: image.type,
        size: image.size,
      });

      if (!user?.id) {
        Alert.alert(t('profileEdit.avatarUpdateError'), t('profileEdit.userNotFound'));
        setUploadingAvatar(false);
        return;
      }

      // Eski avatarı sil (varsa)
      if (avatarUrl) {
        console.log('🗑️ Eski avatar siliniyor...');
        await deleteAvatarFromSupabase(avatarUrl);
      }

      // Yeni avatarı yükle
      console.log('⬆️ Avatar yükleniyor...');
      const publicUrl = await uploadAvatarToSupabase(user.id, image);
      console.log('✅ Avatar yüklendi:', publicUrl);

      // Profile tablosunu güncelle
      console.log('💾 Profil güncelleniyor...');
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profil güncelleme hatası:', error);
        throw error;
      }

      // State'i güncelle
      setAvatarUrl(publicUrl);

      // AuthStore'u güncelle
      console.log('🔄 AuthStore güncelleniyor...');
      const { initialize } = useAuthStore.getState();
      await initialize();

      console.log('✅ Avatar başarıyla güncellendi');
      Alert.alert(
        t('profileEdit.avatarUpdateSuccess'),
        t('profileEdit.avatarUpdateSuccessMessage'),
      );
    } catch (error: any) {
      console.error('❌ Avatar yükleme hatası:', error);

      // Daha detaylı hata mesajı
      let errorMessage = t('profileEdit.avatarUpdateErrorMessage');

      if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = t('profileEdit.avatarUpdateErrorMessage');
        } else if (error.message.includes('Storage')) {
          errorMessage = t('profileEdit.avatarUpdateErrorMessage');
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert(t('profileEdit.avatarUpdateError'), errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdate = async (values: { fullName: string; phone: string }) => {
    try {
      setLoading(true);
      console.log('💾 Profil güncelleniyor...');

      if (!user?.id) {
        Alert.alert(t('profileEdit.updateError'), t('profileEdit.userNotFound'));
        return;
      }

      // Profile tablosunu güncelle
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Profil güncellendi');

      // AuthStore'u güncelle (yeni profile bilgileriyle)
      if (data) {
        // Store'daki user state'ini manuel güncelle
        const { initialize } = useAuthStore.getState();
        await initialize();
      }

      Alert.alert(
        t('profileEdit.updateSuccess'),
        t('profileEdit.updateSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ Profil güncelleme hatası:', error);
      Alert.alert(
        t('profileEdit.updateError'),
        error.message || t('profileEdit.updateErrorMessage'),
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={28} color="#01213D" />
          </TouchableOpacity>
          <Text weight="bold" style={styles.title}>
            {t('profileEdit.title')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text weight="bold" style={styles.avatarPlaceholderText}>
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#FFFFFF" size="large" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={handleSelectAvatar}
            disabled={uploadingAvatar}
          >
            <Text weight="semibold" style={styles.changeAvatarText}>
              {uploadingAvatar
                ? t('profileEdit.uploading')
                : t('profileEdit.changePhoto')}
            </Text>
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={{
            fullName: user?.full_name || '',
            phone: user?.phone || '',
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleUpdate}
          enableReinitialize
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
                  {t('profileEdit.email')}
                </Text>
                <View style={styles.disabledInput}>
                  <Text weight="regular" style={styles.disabledText}>
                    {user?.email}
                  </Text>
                </View>
                <Text weight="regular" style={styles.hint}>
                  {t('profileEdit.emailCannotChange')}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text weight="semibold" style={styles.label}>
                  {t('profileEdit.fullName')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.fullName && errors.fullName && styles.inputError,
                  ]}
                  placeholder={t('profileEdit.fullNamePlaceholder')}
                  placeholderTextColor="#999"
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  value={values.fullName}
                  autoCapitalize="words"
                />
                {touched.fullName && errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text weight="semibold" style={styles.label}>
                  {t('profileEdit.phone')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.phone && errors.phone && styles.inputError,
                  ]}
                  placeholder={t('profileEdit.phonePlaceholder')}
                  placeholderTextColor="#999"
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
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
                    {t('profileEdit.update')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 56,
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#01213D',
  },
  changeAvatarText: {
    color: '#01213D',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
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
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  disabledText: {
    fontSize: 16,
    color: '#6B7280',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ProfileEditScreen;
