import React, { useState } from 'react';
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
import { Text, LoadingModal } from '../../components';
import { PhotoStep, HairCheckPhotos } from '../../types';
import { pickImageFromGallery, uploadMultipleHairCheckPhotos, ImagePickerResult } from '../../utils/imageUpload';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';

interface HairCheckCaptureScreenProps {
  navigation: any;
}

const HairCheckCaptureScreen: React.FC<HairCheckCaptureScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [selectedPhotos, setSelectedPhotos] = useState<{ [key: string]: ImagePickerResult }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadingStep, setUploadingStep] = useState('');

  const photoSteps: PhotoStep[] = [
    { 
      id: 'front', 
      label: 'Ön Görünüm', 
      icon: '😊',
      description: 'Yüzünüzü kameraya bakacak şekilde'
    },
    { 
      id: 'right45', 
      label: 'Sağ 45°', 
      icon: '↻',
      description: 'Başınızı sağa 45 derece çevirin'
    },
    { 
      id: 'left45', 
      label: 'Sol 45°', 
      icon: '↺',
      description: 'Başınızı sola 45 derece çevirin'
    },
    { 
      id: 'top', 
      label: 'Üst Görünüm', 
      icon: '↑',
      description: 'Başınızı yukarıdan çekin'
    },
    { 
      id: 'back', 
      label: 'Arka Görünüm', 
      icon: '👤',
      description: 'Başınızın arka kısmını çekin'
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
        'Hata',
        'Fotoğraf seçilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    }
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
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!isAllPhotosSelected()) {
      Alert.alert('Uyarı', 'Lütfen tüm fotoğrafları seçin');
      return;
    }

    try {
      setUploading(true);
      setUploadingStep('Fotoğraflar yükleniyor...');

      // Fotoğrafları Supabase Storage'a yükle
      const photoUrls = await uploadMultipleHairCheckPhotos(user.id, selectedPhotos);

      setUploadingStep('Kontrol kaydediliyor...');

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
        'Başarılı',
        'Saç kontrolü başarıyla kaydedildi. Uzmanlarımız en kısa sürede değerlendirecek.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Ana sayfaya dön
              navigation.navigate('MainTabs', { 
                screen: 'Home',
                params: { refresh: true }
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Kontrol gönderme hatası:', error);
      Alert.alert(
        'Hata',
        error.message || 'Kontrol kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
                Fotoğraf Seç
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          Fotoğraf Çekimi
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text weight="medium" style={styles.progressText}>
          {completedCount} / {totalCount} Fotoğraf
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
              Önemli Notlar
            </Text>
            <Text weight="regular" style={styles.instructionText}>
              • İyi aydınlatılmış bir ortamda çekim yapın{'\n'}
              • Saçlarınızı arkaya doğru toplayın{'\n'}
              • Net ve odaklı fotoğraflar çekin{'\n'}
              • Her açıdan farklı fotoğraf gereklidir
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
            !isAllPhotosSelected() && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isAllPhotosSelected() || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text weight="bold" style={styles.submitButtonText}>
              Kontrolü Gönder
            </Text>
          )}
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
    fontSize: 28,
    color: '#1A1A1A',
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
    backgroundColor: '#3B82F6',
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
    borderColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
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
});

export default HairCheckCaptureScreen;

