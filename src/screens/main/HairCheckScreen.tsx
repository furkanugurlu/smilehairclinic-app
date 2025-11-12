import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text } from '../../components';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';

interface PhotoStep {
  id: string;
  label: string;
  instruction: string;
  icon: string;
}

interface CapturedPhoto {
  stepId: string;
  uri: string;
}

interface HairCheckScreenProps {
  navigation: any;
}

const HairCheckScreen: React.FC<HairCheckScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [showReview, setShowReview] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const photoSteps: PhotoStep[] = [
    {
      id: 'front',
      label: 'Ön Görünüm',
      instruction: 'Kameraya doğru bakın',
      icon: '😊',
    },
    {
      id: 'right45',
      label: 'Sağ 45°',
      instruction: 'Başınızı 45° sağa çevirin',
      icon: '↻',
    },
    {
      id: 'left45',
      label: 'Sol 45°',
      instruction: 'Başınızı 45° sola çevirin',
      icon: '↺',
    },
    {
      id: 'top',
      label: 'Üst Görünüm',
      instruction: 'Başınızı öne eğerek tepeyi gösterin',
      icon: '↑',
    },
    {
      id: 'back',
      label: 'Arka Görünüm',
      instruction: 'Arkanızı dönerek arka tarafı gösterin',
      icon: '👤',
    },
  ];

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Alert.alert(
          'Kamera İzni Gerekli',
          'Fotoğraf çekebilmek için kamera izni vermelisiniz.',
          [
            { text: 'İptal', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };


  const handleTakePhoto = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Hata', 'Kamera hazır değil');
        return;
      }

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const newPhoto: CapturedPhoto = {
        stepId: photoSteps[currentStep].id,
        uri: `file://${photo.path}`,
      };

      setCapturedPhotos(prev => [...prev, newPhoto]);
      console.log('✅ Fotoğraf çekildi:', newPhoto.uri);
    } catch (error: any) {
      console.error('❌ Kamera hatası:', error);
      Alert.alert('Hata', error.message || 'Fotoğraf çekilemedi');
    }
  };

  const handleNext = () => {
    if (currentStep < photoSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowReview(true);
    }
  };

  const handleRetake = (stepIndex: number) => {
    const stepId = photoSteps[stepIndex].id;
    setCapturedPhotos(prev => prev.filter(p => p.stepId !== stepId));
    setCurrentStep(stepIndex);
    setShowReview(false);
  };

  const handleSubmit = () => {
    console.log('📤 Fotoğraflar gönderiliyor:', capturedPhotos);
    Alert.alert(
      'Başarılı',
      'Fotoğraflarınız analiz için gönderildi!',
      [
             {
               text: 'Tamam',
               onPress: () => {
                 navigation.goBack();
               },
             },
      ]
    );
  };

  const isStepCaptured = (stepId: string) => {
    return capturedPhotos.some(p => p.stepId === stepId);
  };

  const getPhotoForStep = (stepId: string) => {
    return capturedPhotos.find(p => p.stepId === stepId);
  };

  // Review Screen
  if (showReview) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.reviewContainer}>
            {/* Header */}
            <View style={styles.reviewHeader}>
              <Icon name="checkmark-circle" size={48} color="#10B981" />
              <Text weight="bold" style={styles.reviewTitle}>
                Fotoğraflar Çekildi!
              </Text>
              <Text weight="regular" style={styles.reviewSubtitle}>
                Göndermeden önce fotoğraflarınızı kontrol edin
              </Text>
            </View>

            {/* Photo Grid */}
            {photoSteps.map((step, index) => {
              const photo = getPhotoForStep(step.id);
              return (
                <View key={step.id} style={styles.reviewItem}>
                  <View style={styles.reviewItemLeft}>
                    <View style={styles.reviewNumberBadge}>
                      <Text weight="bold" style={styles.reviewNumber}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.reviewItemInfo}>
                      <Text weight="semibold" style={styles.reviewItemLabel}>
                        {step.label}
                      </Text>
                      <Text weight="regular" style={styles.reviewItemDesc}>
                        {step.instruction}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewItemRight}>
                    {photo ? (
                      <>
                        <Image source={{ uri: photo.uri }} style={styles.reviewThumbnail} />
                        <TouchableOpacity
                          style={styles.retakeButton}
                          onPress={() => handleRetake(index)}
                        >
                          <Icon name="camera-outline" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.captureButton}
                        onPress={() => handleRetake(index)}
                      >
                        <Icon name="camera" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Submit Button */}
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  capturedPhotos.length !== photoSteps.length && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={capturedPhotos.length !== photoSteps.length}
              >
                <Text weight="bold" style={styles.submitButtonText}>
                  Analiz İçin Gönder
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                     onPress={() => {
                       navigation.goBack();
                     }}
              >
                <Text weight="semibold" style={styles.cancelButtonText}>
                  İptal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Capture Flow - direkt başlat
  const currentPhotoStep = photoSteps[currentStep];
  const isCaptured = isStepCaptured(currentPhotoStep.id);

  // Kamera yükleniyor veya izin yok
  if (!device || !hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text weight="regular" style={styles.loadingText}>
            {!hasPermission ? 'Kamera izni bekleniyor...' : 'Kamera hazırlanıyor...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.captureContainer}>
          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Alert.alert(
                  'Çekimi İptal Et',
                  'Çıkmak istediğinizden emin misiniz? Tüm fotoğraflar kaybolacak.',
                  [
                    { text: 'Hayır', style: 'cancel' },
                    {
                      text: 'Evet',
                      style: 'destructive',
                      onPress: () => {
                        navigation.goBack();
                      },
                    },
                  ]
                );
              }}
            >
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text weight="bold" style={styles.progressText}>
              {currentStep + 1} / {photoSteps.length}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            {photoSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBarSegment,
                  index <= currentStep && styles.progressBarSegmentActive,
                ]}
              />
            ))}
          </View>

          {/* Camera Preview Area */}
          <View style={styles.cameraPreview}>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={!showReview}
              photo={true}
            />
            <View style={styles.guidanceOverlay}>
              <Text style={styles.guideIcon}>{currentPhotoStep.icon}</Text>
              <Text weight="bold" style={styles.guideTitle}>
                {currentPhotoStep.label}
              </Text>
              <Text weight="regular" style={styles.guideInstruction}>
                {currentPhotoStep.instruction}
              </Text>
            </View>
          </View>

          {/* Capture Controls */}
          <View style={styles.captureControls}>
            {isCaptured ? (
              <>
                <View style={styles.capturedIndicator}>
                  <Icon name="checkmark-circle" size={32} color="#10B981" />
                  <Text weight="semibold" style={styles.capturedText}>
                    Fotoğraf Çekildi!
                  </Text>
                </View>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text weight="bold" style={styles.nextButtonText}>
                    {currentStep === photoSteps.length - 1 ? 'Fotoğrafları İncele' : 'Sonraki'}
                  </Text>
                  <Icon name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retakeTextButton}
                  onPress={() => {
                    setCapturedPhotos(prev =>
                      prev.filter(p => p.stepId !== currentPhotoStep.id)
                    );
                  }}
                >
                  <Text weight="semibold" style={styles.retakeTextButtonText}>
                    Tekrar Çek
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.captureButton2} onPress={handleTakePhoto}>
                  <View style={styles.captureButtonInner}>
                    <Icon name="camera" size={32} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text weight="regular" style={styles.captureHint}>
                  Fotoğraf çekmek için dokun
                </Text>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Capture Flow Styles
  captureContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    width: 44,
  },
  progressText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarSegmentActive: {
    backgroundColor: '#3B82F6',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceOverlay: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  guideIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  guideInstruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  captureControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  captureButton2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  capturedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  capturedText: {
    fontSize: 16,
    color: '#10B981',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  retakeTextButton: {
    marginTop: 12,
  },
  retakeTextButtonText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  // Review Screen Styles
  reviewContainer: {
    padding: 24,
  },
  reviewHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  reviewTitle: {
    fontSize: 24,
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  reviewItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewItemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  reviewNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewNumber: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  reviewItemInfo: {
    flex: 1,
  },
  reviewItemLabel: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  reviewItemDesc: {
    fontSize: 12,
    color: '#666',
  },
  reviewItemRight: {
    position: 'relative',
  },
  reviewThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  retakeButton: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  reviewActions: {
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
  },
});

export default HairCheckScreen;

