import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text, LoadingModal } from '../../../components';
import { PhotoStep } from '../../../types';

import ImageResizer from 'react-native-image-resizer';


const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.75, height * 0.5);


// Pozisyon kriterleri için açı toleransları
const ANGLE_TOLERANCE = 10; // ±10 derece tolerans
const POSITION_CHECK_INTERVAL = 200; // 200ms'de bir kontrol et
const STABLE_POSITION_DURATION = 1000; // 1 saniye stabil kalmalı

interface HairCheckCameraScreenProps {
  navigation: any;
  route: any;
}

const HairCheckCameraScreen: React.FC<HairCheckCameraScreenProps> = ({
  navigation,
  route,
}) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{
    [key: string]: { uri: string; type: string; name: string; size: number };
  }>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneAngle, setPhoneAngle] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const [isPositionValid, setIsPositionValid] = useState(false);
  const [positionStableTime, setPositionStableTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, size: 0 });
  
  const positionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stablePositionStartRef = useRef<number | null>(null);

  const photoSteps: PhotoStep[] = [
    {
      id: 'front',
      label: 'Ön Görünüm',
      icon: '😊',
      description: 'Kameraya doğru bakın',
      instruction: 'KAMERAYA DOĞRU BAKIN',
      targetAngle: { pitch: 0, roll: 0 }, // Telefon yere paralel (0 derece)
      requiresFace: true,
    },
    {
      id: 'right45',
      label: 'Sağ 45°',
      icon: '↻',
      description: 'Başınızı sağa 45 derece çevirin',
      instruction: 'BAŞINIZI SAĞA ÇEVİRİN',
      targetAngle: { pitch: 0, roll: 0 }, // Telefon açısı sabit
      requiresFace: true,
      faceRotation: 45, // Yüz sağa 45 derece
    },
    {
      id: 'left45',
      label: 'Sol 45°',
      icon: '↺',
      description: 'Başınızı sola 45 derece çevirin',
      instruction: 'BAŞINIZI SOLA ÇEVİRİN',
      targetAngle: { pitch: 0, roll: 0 }, // Telefon açısı sabit
      requiresFace: true,
      faceRotation: -45, // Yüz sola 45 derece
    },
    {
      id: 'top',
      label: 'Üst Görünüm',
      icon: '↑',
      description: 'Başınızı yukarıdan çekin',
      instruction: 'BAŞINIZI YUKARI KALDIRIN',
      targetAngle: { pitch: 90, roll: 0 }, // Telefon 90 derece eğimli (dikey)
      requiresFace: false,
    },
    {
      id: 'back',
      label: 'Arka Görünüm',
      icon: '👤',
      description: 'Başınızın arka kısmını çekin',
      instruction: 'ARKANIZI ÇEVİRİN',
      targetAngle: { pitch: 0, roll: 180 }, // Telefon arkaya dönük
      requiresFace: false,
    },
  ];

  const currentStep = photoSteps[currentStepIndex];
  const isLastStep = currentStepIndex === photoSteps.length - 1;
  const allPhotosCaptured = Object.keys(capturedPhotos).length === photoSteps.length;

  useEffect(() => {
    checkCameraPermission();
    startPositionMonitoring();
    return () => {
      stopPositionMonitoring();
      stopCountdown();
    };
  }, []);

  useEffect(() => {
    // Açı değiştiğinde pozisyon kontrolü yap
    checkPosition();
  }, [phoneAngle, currentStepIndex]);

  useEffect(() => {
    // Pozisyon geçerli ve stabil olduğunda otomatik çekim başlat
    const hasCurrentPhoto = !!capturedPhotos[currentStep.id];
    if (autoCaptureEnabled && isPositionValid && positionStableTime >= STABLE_POSITION_DURATION && !isCapturing && !hasCurrentPhoto) {
      startAutoCapture();
    }
  }, [isPositionValid, positionStableTime, autoCaptureEnabled, isCapturing, capturedPhotos, currentStep.id]);

  // Telefon açısını izle (simüle edilmiş - gerçek sensör entegrasyonu için react-native-sensors gerekli)
  const startPositionMonitoring = () => {
    // Şimdilik basit bir simülasyon - gerçek sensör verisi için react-native-sensors paketi gerekli
    // Bu özellik için: npm install react-native-sensors
    // Şimdilik otomatik çekim manuel buton ile çalışacak
    
    // Simüle edilmiş pozisyon kontrolü - her 200ms'de bir kontrol et
    positionCheckIntervalRef.current = setInterval(() => {
      // Gerçek implementasyon için:
      // import { accelerometer, gyroscope } from 'react-native-sensors';
      // accelerometer.subscribe(({ x, y, z }) => { ... });
      
      // Şimdilik varsayılan olarak pozisyon geçerli kabul ediliyor
      // Kullanıcı manuel olarak çekebilir veya otomatik çekim için
      // gerçek sensör entegrasyonu yapılabilir
      
      // Test için: Pozisyonu manuel olarak kontrol etmek için
      // kullanıcı butona basabilir
    }, POSITION_CHECK_INTERVAL);
  };

  const stopPositionMonitoring = () => {
    if (positionCheckIntervalRef.current) {
      clearInterval(positionCheckIntervalRef.current);
      positionCheckIntervalRef.current = null;
    }
  };

  // Pozisyon kontrolü
  const checkPosition = useCallback(() => {
    const currentStep = photoSteps[currentStepIndex];
    if (!currentStep || !currentStep.targetAngle) {
      setIsPositionValid(false);
      return;
    }

    const { targetAngle } = currentStep;
    const pitchDiff = Math.abs(phoneAngle.pitch - targetAngle.pitch);
    const rollDiff = Math.abs(phoneAngle.roll - targetAngle.roll);

    const isValid = pitchDiff <= ANGLE_TOLERANCE && rollDiff <= ANGLE_TOLERANCE;

    setIsPositionValid(isValid);

    if (isValid) {
      if (stablePositionStartRef.current === null) {
        stablePositionStartRef.current = Date.now();
      }
      const stableDuration = Date.now() - (stablePositionStartRef.current || 0);
      setPositionStableTime(stableDuration);
    } else {
      stablePositionStartRef.current = null;
      setPositionStableTime(0);
      stopCountdown();
    }
  }, [phoneAngle, currentStepIndex, photoSteps]);

  // Otomatik çekim başlat
  const startAutoCapture = () => {
    if (isCapturing || hasCurrentPhoto) return;
    
    setAutoCaptureEnabled(false);
    startCountdown();
  };

  // Geri sayım başlat
  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        // Ses çal (basit bip sesi simülasyonu)
        playBeepSound(count);
      } else {
        setCountdown(null);
        stopCountdown();
        // Otomatik çekim yap
        handleCapture();
        // 2 saniye sonra tekrar aktif et
        setTimeout(() => {
          setAutoCaptureEnabled(true);
          stablePositionStartRef.current = null;
          setPositionStableTime(0);
        }, 2000);
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Bip sesi çal (basit titreşim ile simüle edilmiş)
  const playBeepSound = (count: number) => {
    // React Native'de ses çalmak için react-native-sound veya expo-av gerekir
    // Şimdilik titreşim kullanıyoruz
    try {
      const { Vibration } = require('react-native');
      if (Vibration && Platform.OS === 'android') {
        // Android için izin kontrolü yapılmış olmalı
        Vibration.vibrate(100);
      } else if (Vibration && Platform.OS === 'ios') {
        // iOS için izin gerekmez
        Vibration.vibrate(100);
      }
    } catch (error) {
      console.log('⚠️ Titreşim hatası:', error);
      // Titreşim çalışmazsa sessizce devam et
    }
  };

  const checkCameraPermission = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Alert.alert(
          'Kamera İzni Gerekli',
          'Fotoğraf çekmek için kamera iznine ihtiyacımız var.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    }
  };

  const handleCapture = async () => {
    console.log('📸 Çekim başlatılıyor...', {
      hasCamera: !!camera.current,
      hasDevice: !!device,
      isCapturing,
      hasPermission,
    });

    if (!hasPermission) {
      Alert.alert('İzin Gerekli', 'Kamera izni verilmedi. Lütfen ayarlardan izin verin.');
      return;
    }

    if (!device) {
      Alert.alert('Hata', 'Kamera bulunamadı. Lütfen tekrar deneyin.');
      return;
    }

    if (!camera.current) {
      Alert.alert('Hata', 'Kamera hazır değil. Lütfen bekleyin ve tekrar deneyin.');
      return;
    }

    if (isCapturing) {
      console.log('⚠️ Zaten çekim yapılıyor...');
      return;
    }

    try {
      setIsCapturing(true);
      console.log('📸 Fotoğraf çekiliyor...');
      
      const photo = await camera.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      console.log('✅ Fotoğraf çekildi:', photo.path);
      console.log('📐 Fotoğraf metadata:', photo.metadata);

      console.log('photo',photo);
      

      // Fotoğrafı sıkıştır
      // photo.path zaten absolute path, file:// eklememize gerek yok
      // Eğer zaten file:// varsa, tekrar eklemeyelim
      const originalUri = photo.path.startsWith('file://') 
        ? photo.path 
        : `file://${photo.path}`;      
      // Orientation bilgisini korumak için compressionMethod: 'auto' kullanıyoruz
      // Bu, EXIF orientation bilgisini dikkate alır
      // Ancak Vision Camera'dan gelen fotoğraflar genellikle doğru orientation'a sahiptir
      // Bazı cihazlarda orientation hatası olmaması için sıkıştırmada maxWidth/maxHeight parametrelerini kullanmıyoruz,
      // ayrıca compressionMethod: 'auto' yerine 'manual' seçip explicitly orientation uygulamıyoruz
      // Sadece kaliteyi ayarlayarak sıkıştırıyoruz
      // Yansıma (mirror/flip) düzeltmek için resmi yatayda çevir (mirror: true)


      // Fotoğrafı ImagePickerResult formatına çevir
      const photoData = {
        uri: originalUri,
        type: 'image/jpeg',
        name: `${currentStep.id}_${Date.now()}.jpg`,
        size: 0, // Size bilgisi gerekirse daha sonra eklenebilir
      };

      console.log('📦 Fotoğraf verisi hazırlandı:', photoData);
      // Fotoğrafı state'e ekle

      setCapturedPhotos(prev => ({
        ...prev,
        [currentStep.id]: photoData,
      }));

      console.log('✅ Fotoğraf state\'e eklendi');
      
      // Otomatik çekim modunu sıfırla
      setAutoCaptureEnabled(false);
      stablePositionStartRef.current = null;
      setPositionStableTime(0);
    } catch (error: any) {
      console.error('❌ Fotoğraf çekme hatası:', error);
      console.error('❌ Hata detayları:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      Alert.alert(
        'Hata',
        error.message || 'Fotoğraf çekilirken bir hata oluştu. Lütfen tekrar deneyin.',
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAllPhotosCaptured = async () => {    
    // Fotoğrafları HairCheckCaptureScreen'e gönder
    navigation.navigate('HairCheckCapture', {
      capturedPhotos: capturedPhotos,
    });
  };

  const handleRetake = () => {
    const newPhotos = { ...capturedPhotos };
    delete newPhotos[currentStep.id];
    setCapturedPhotos(newPhotos);
    setAutoCaptureEnabled(true);
    stablePositionStartRef.current = null;
    setPositionStableTime(0);
    setCountdown(null);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text weight="semibold" style={styles.permissionText}>
            Kamera izni bekleniyor...
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={checkCameraPermission}
          >
            <Text weight="bold" style={styles.permissionButtonText}>
              İzin Ver
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text weight="semibold" style={styles.permissionText}>
            Kamera bulunamadı
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => navigation.goBack()}
          >
            <Text weight="bold" style={styles.permissionButtonText}>
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasCurrentPhoto = !!capturedPhotos[currentStep.id];

  const progressPercentage = ((currentStepIndex + 1) / photoSteps.length) * 100;
  const progressAngle = (progressPercentage / 100) * 360;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={{ width: 40 }} />
      </View>

      {/* Camera Preview with Circular Frame */}
      <View style={styles.cameraContainer}>
        {hasCurrentPhoto ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: capturedPhotos[currentStep.id].uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.circularMask} />
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <Camera
              ref={camera}
              style={styles.camera}
              device={device}
              isActive={hasPermission && !!device}
              photo={true}
            />
            {/* Circular Frame Overlay with Mask */}
            <View style={styles.maskContainer}>
              <View style={styles.maskTop} />
              <View style={styles.maskBottom} />
              <View style={styles.maskLeft} />
              <View style={styles.maskRight} />
            </View>
            {/* Circular Frame with Progress */}
            <View style={styles.circularFrameContainer}>
              <View style={styles.circularFrame}>
                {/* Progress Arc on Frame */}
                <View
                  style={[
                    styles.frameProgressArc,
                    {
                      transform: [{ rotate: `${progressAngle - 90}deg` }],
                    },
                  ]}
                />
              </View>
            </View>
            {/* Instruction Text */}
            <View style={styles.instructionContainer}>
              <Text weight="bold" style={styles.instructionText}>
                {currentStep.instruction || currentStep.description.toUpperCase()}
              </Text>
              
              {/* Position Feedback */}
              {!hasCurrentPhoto && (
                <View style={styles.positionFeedback}>
                  {isPositionValid ? (
                    <View style={styles.feedbackRow}>
                      <Icon name="checkmark-circle" size={20} color="#4ADE80" />
                      <Text weight="medium" style={styles.feedbackText}>
                        Pozisyon doğru! {countdown !== null ? `${countdown}...` : 'Bekleniyor...'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.feedbackRow}>
                      <Icon name="alert-circle" size={20} color="#F59E0B" />
                      <Text weight="medium" style={styles.feedbackText}>
                        Telefonu doğru açıya getirin
                      </Text>
                    </View>
                  )}
                  
                  {/* Progress Bar */}
                  {isPositionValid && (
                    <View style={styles.stabilityBar}>
                      <View
                        style={[
                          styles.stabilityFill,
                          {
                            width: `${Math.min((positionStableTime / STABLE_POSITION_DURATION) * 100, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              )}
              
              {/* Countdown Display */}
              {countdown !== null && countdown > 0 && (
                <View style={styles.countdownContainer}>
                  <Text weight="bold" style={styles.countdownText}>
                    {countdown}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {hasCurrentPhoto ? (
          <View style={styles.reviewControls}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <Icon name="refresh" size={24} color="#01213D" />
              <Text weight="semibold" style={styles.retakeButtonText}>
                Yeniden Çek
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                if (!isLastStep) {
                  setCurrentStepIndex(prev => prev + 1);
                } else {
                  handleAllPhotosCaptured();
                }
              }}
            >
              <Text weight="bold" style={styles.continueButtonText}>
                {isLastStep ? 'Tamamla' : 'Devam Et'}
              </Text>
              <Icon name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureControls}>
            {/* Auto Capture Toggle */}
            <TouchableOpacity
              style={[styles.autoToggleButton, autoCaptureEnabled && styles.autoToggleButtonActive]}
              onPress={() => {
                setAutoCaptureEnabled(!autoCaptureEnabled);
                if (!autoCaptureEnabled) {
                  // Manuel test için pozisyonu geçerli yap
                  setIsPositionValid(true);
                  setPositionStableTime(STABLE_POSITION_DURATION);
                } else {
                  setIsPositionValid(false);
                  setPositionStableTime(0);
                }
              }}
            >
              <Icon
                name={autoCaptureEnabled ? 'flash' : 'flash-off'}
                size={20}
                color={autoCaptureEnabled ? '#FFFFFF' : '#666'}
              />
              <Text
                weight="medium"
                style={[
                  styles.autoToggleText,
                  autoCaptureEnabled && styles.autoToggleTextActive,
                ]}
              >
                {autoCaptureEnabled ? 'Otomatik' : 'Manuel'}
              </Text>
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={() => {
                console.log('📸 Capture button tıklandı');
                if (autoCaptureEnabled) {
                  // Otomatik mod: Pozisyon kontrolü yap
                  setIsPositionValid(true);
                  setPositionStableTime(STABLE_POSITION_DURATION);
                } else {
                  // Manuel mod: Direkt çek
                  handleCapture();
                }
              }}
              disabled={isCapturing || !hasPermission || !device}
              activeOpacity={0.8}
            >
              {isCapturing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Processing Modal */}
      <LoadingModal
        visible={isProcessing}
        message="Fotoğraflar işleniyor..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B', // Dark blue/indigo background
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#01213D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  cameraWrapper: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  camera: {
    width: width,
    height: height,
    position: 'absolute',
  },
  circularFrameContainer: {
    position: 'absolute',
    top: (height - CIRCLE_SIZE) / 2,
    left: (width - CIRCLE_SIZE) / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    zIndex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // Tıklamaları geçir
  },
  maskContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 1,
    pointerEvents: 'none', // Tıklamaları geçir
  },
  maskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (height - CIRCLE_SIZE) / 2,
    backgroundColor: '#1E293B',
    opacity: 0.85,
  },
  maskBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: (height - CIRCLE_SIZE) / 2,
    backgroundColor: '#1E293B',
    opacity: 0.85,
  },
  maskLeft: {
    position: 'absolute',
    top: (height - CIRCLE_SIZE) / 2,
    left: 0,
    width: (width - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    backgroundColor: '#1E293B',
    opacity: 0.85,
  },
  maskRight: {
    position: 'absolute',
    top: (height - CIRCLE_SIZE) / 2,
    right: 0,
    width: (width - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    backgroundColor: '#1E293B',
    opacity: 0.85,
  },
  circularFrame: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  frameProgressArc: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: CIRCLE_SIZE + 6,
    height: CIRCLE_SIZE + 6,
    borderRadius: (CIRCLE_SIZE + 6) / 2,
    borderWidth: 4,
    borderColor: '#4ADE80',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: height * 0.3,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
    paddingHorizontal: 24,
    pointerEvents: 'none', // Tıklamaları geçir
  },
  instructionText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  previewContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  circularMask: {
    width: width,
    height: height,
    position: 'absolute',
    backgroundColor: '#1E293B',
    opacity: 0.7,
  },
  bottomControls: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
    position: 'relative',
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  autoToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  autoToggleButtonActive: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  autoToggleText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  autoToggleTextActive: {
    color: '#FFFFFF',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#01213D',
  },
  reviewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retakeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#01213D',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#01213D',
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
  continueButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  positionFeedback: {
    marginTop: 16,
    alignItems: 'center',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
  },
  stabilityBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  stabilityFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 2,
  },
  countdownContainer: {
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4ADE80',
  },
  countdownText: {
    fontSize: 48,
    color: '#FFFFFF',
  },
});

export default HairCheckCameraScreen;

