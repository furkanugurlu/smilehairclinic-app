import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text, LoadingModal } from '../../../components';
import { PhotoStep, HairCheckPhotos } from '../../../types';
import {
  pickImageFromGallery,
  uploadMultipleHairCheckPhotos,
  ImagePickerResult,
} from '../../../utils/imageUpload';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../config/supabase';

interface HairCheckCaptureScreenProps {
  navigation: any;
  route?: any;
}

const HairCheckCaptureScreen: React.FC<HairCheckCaptureScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const capturedPhotosFromCamera = route?.params?.capturedPhotos;
  
  const [selectedPhotos, setSelectedPhotos] = useState<{
    [key: string]: ImagePickerResult;
  }>(capturedPhotosFromCamera || {});
  const [uploading, setUploading] = useState(false);
  const [uploadingStep, setUploadingStep] = useState('');

  // Route params'tan gelen fotoğrafları güncelle
  useEffect(() => {
    if (capturedPhotosFromCamera) {
      setSelectedPhotos(capturedPhotosFromCamera);
    }
  }, [capturedPhotosFromCamera]);

  const photoSteps: PhotoStep[] = [
    {
      id: 'front',
      label: t('hairCheck.photoTypes.front'),
      icon: '😊',
      description: t('hairCheck.capture.photoDescriptions.front'),
    },
    {
      id: 'right45',
      label: t('hairCheck.photoTypes.right45'),
      icon: '↻',
      description: t('hairCheck.capture.photoDescriptions.right45'),
    },
    {
      id: 'left45',
      label: t('hairCheck.photoTypes.left45'),
      icon: '↺',
      description: t('hairCheck.capture.photoDescriptions.left45'),
    },
    {
      id: 'top',
      label: t('hairCheck.photoTypes.top'),
      icon: '↑',
      description: t('hairCheck.capture.photoDescriptions.top'),
    },
    {
      id: 'back',
      label: t('hairCheck.photoTypes.back'),
      icon: '👤',
      description: t('hairCheck.capture.photoDescriptions.back'),
    },
  ];

  const handleSelectPhoto = async (photoId: string) => {
    try {
      const result = await pickImageFromGallery();

      if (result) {
        setSelectedPhotos(prev => ({
          ...prev,
          [photoId]: result,
        }));
        console.log(`✅ ${photoId} fotoğrafı seçildi`);
      }
    } catch (error: any) {
      console.error('❌ Fotoğraf seçme hatası:', error);
      Alert.alert(
        t('common.error'),
        t('hairCheck.capture.photoSelectError'),
      );
    }
  };

  const handleStartCamera = () => {
    navigation.navigate('HairCheckCamera');
  };

  const handleRemovePhoto = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[photoId];
      return newPhotos;
    });
  };

  const isAllPhotosSelected = (): boolean => {
    return photoSteps.every(step => selectedPhotos[step.id]);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert(t('common.error'), t('hairCheck.capture.userNotFound'));
      return;
    }

    if (!isAllPhotosSelected()) {
      Alert.alert(t('hairCheck.capture.warning'), t('hairCheck.capture.selectAllPhotos'));
      return;
    }

    try {
      setUploading(true);
      setUploadingStep(t('hairCheck.capture.uploadingPhotos'));

      // Fotoğrafları Supabase Storage'a yükle
      const photoUrls = await uploadMultipleHairCheckPhotos(
        user.id,
        selectedPhotos,
      );

      setUploadingStep(t('hairCheck.capture.savingCheck'));

      // Veritabanına kaydet
      const { data, error } = await supabase
        .from('hair_checks')
        .insert([
          {
            user_id: user.id,
            photo_front: photoUrls.front,
            photo_right45: photoUrls.right45,
            photo_left45: photoUrls.left45,
            photo_top: photoUrls.top,
            photo_back: photoUrls.back,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Veritabanı kayıt hatası:', error);
        throw error;
      }

      console.log('✅ Hair check kaydedildi:', data);

      Alert.alert(
        t('hairCheck.capture.saveSuccess'),
        t('hairCheck.capture.saveSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Ana sayfaya dön
              navigation.navigate('MainTabs', {
                screen: 'Home',
                params: { refresh: true },
              });
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ Kontrol gönderme hatası:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('hairCheck.capture.saveErrorGeneric'),
      );
    } finally {
      setUploading(false);
      setUploadingStep('');
    }
  };

  const renderPhotoCard = (step: PhotoStep) => {
    const hasPhoto = !!selectedPhotos[step.id];

    return (
      <View key={step.id} style={styles.photoCard}>
        <View style={styles.photoCardHeader}>
          <Text weight="semibold" style={styles.photoLabel}>
            {step.label}
          </Text>
          {hasPhoto && (
            <TouchableOpacity onPress={() => handleRemovePhoto(step.id)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text weight="regular" style={styles.photoDescription}>
          {step.description}
        </Text>

        <TouchableOpacity
          style={[styles.photoButton, hasPhoto && styles.photoButtonFilled]}
          onPress={() => handleSelectPhoto(step.id)}
        >
          {hasPhoto ? (
            <Image
              source={{ uri: selectedPhotos[step.id].uri }}
              style={styles.photoPreview}
            />
          ) : (
            <>
              <Text style={styles.photoIcon}>{step.icon}</Text>
              <Text weight="medium" style={styles.photoButtonText}>
                {t('hairCheck.capture.selectPhoto')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const completedCount = Object.keys(selectedPhotos).length;
  const totalCount = photoSteps.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('hairCheck.capture.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Start Camera Button - Only show if no photos captured */}
      {!capturedPhotosFromCamera && (
        <View style={styles.cameraButtonSection}>
          <TouchableOpacity
            style={styles.startCameraButton}
            onPress={handleStartCamera}
          >
            <Icon name="camera" size={24} color="#FFFFFF" />
            <Text weight="bold" style={styles.startCameraButtonText}>
              {t('hairCheck.capture.startScan')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text weight="medium" style={styles.progressText}>
          {completedCount} / {totalCount} {t('hairCheck.capture.photo')}
        </Text>
      </View>

      {/* Photo List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionCard}>
          <Text style={styles.instructionIcon}>💡</Text>
          <View style={styles.instructionContent}>
            <Text weight="semibold" style={styles.instructionTitle}>
              {t('hairCheck.capture.importantNotes')}
            </Text>
            <Text weight="regular" style={styles.instructionText}>
              {t('hairCheck.capture.instructionText')}
            </Text>
          </View>
        </View>

        {photoSteps.map(renderPhotoCard)}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isAllPhotosSelected() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isAllPhotosSelected() || uploading}
        >
            <Text weight="bold" style={styles.submitButtonText}>
              {t('hairCheck.capture.submitCheck')}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <LoadingModal visible={uploading} message={uploadingStep} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#01213D',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 15,
    color: '#92400E',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  removeText: {
    fontSize: 20,
    color: '#EF4444',
  },
  photoDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  photoButton: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonFilled: {
    borderStyle: 'solid',
    borderColor: '#01213D',
    backgroundColor: '#FFFFFF',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#666',
  },
  bottomSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#01213D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#01213D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  cameraButtonSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  startCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#01213D',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#01213D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startCameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HairCheckCaptureScreen;
