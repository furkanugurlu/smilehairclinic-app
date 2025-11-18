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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text, LoadingModal } from '../../../components';
import { PhotoStep } from '../../../types';

import ImageResizer from 'react-native-image-resizer';


const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.75, height * 0.5);
const CIRCLE_CENTER_X = width / 2;
const CIRCLE_CENTER_Y = height / 2;

// Pozisyon kriterleri için açı toleransları
const ANGLE_TOLERANCE = 10; // ±10 derece tolerans
const POSITION_CHECK_INTERVAL = 200; // 200ms'de bir kontrol et
const STABLE_POSITION_DURATION = 1000; // 1 saniye stabil kalmalı

// Yüz algılama kriterleri
const FACE_SIZE_MIN = CIRCLE_SIZE * 0.4; // Yüz en az çemberin %40'ı kadar olmalı
const FACE_SIZE_MAX = CIRCLE_SIZE * 0.9; // Yüz en fazla çemberin %90'ı kadar olmalı
const FACE_POSITION_TOLERANCE = CIRCLE_SIZE * 0.15; // Yüz merkezden ±15% sapma toleransı

interface HairCheckCameraScreenProps {
  navigation: any;
  route: any;
}

const HairCheckCameraScreen: React.FC<HairCheckCameraScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
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
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [faceInFrame, setFaceInFrame] = useState(false);
  const [faceWarning, setFaceWarning] = useState<string | null>(null);
  const [faceStableTime, setFaceStableTime] = useState(0);
  
  const positionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stablePositionStartRef = useRef<number | null>(null);
  const faceCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stableFaceStartRef = useRef<number | null>(null);
  const faceDetectionAnimation = useRef(new Animated.Value(0)).current;

  const photoSteps: PhotoStep[] = [
    {
      id: 'front',
      label: t('hairCheck.camera.instructions.front.label'),
      icon: '😊',
      description: t('hairCheck.camera.instructions.front.description'),
      instruction: t('hairCheck.camera.instructions.front.instruction'),
      subInstruction: t('hairCheck.camera.instructions.front.subInstruction'),
      targetAngle: { pitch: 0, roll: 0 },
      requiresFace: true,
    },
    {
      id: 'right45',
      label: t('hairCheck.camera.instructions.right45.label'),
      icon: '↻',
      description: t('hairCheck.camera.instructions.right45.description'),
      instruction: t('hairCheck.camera.instructions.right45.instruction'),
      subInstruction: t('hairCheck.camera.instructions.right45.subInstruction'),
      targetAngle: { pitch: 0, roll: 0 },
      requiresFace: true,
      faceRotation: 45,
    },
    {
      id: 'left45',
      label: t('hairCheck.camera.instructions.left45.label'),
      icon: '↺',
      description: t('hairCheck.camera.instructions.left45.description'),
      instruction: t('hairCheck.camera.instructions.left45.instruction'),
      subInstruction: t('hairCheck.camera.instructions.left45.subInstruction'),
      targetAngle: { pitch: 0, roll: 0 },
      requiresFace: true,
      faceRotation: -45,
    },
    {
      id: 'top',
      label: t('hairCheck.camera.instructions.top.label'),
      icon: '↑',
      description: t('hairCheck.camera.instructions.top.description'),
      instruction: t('hairCheck.camera.instructions.top.instruction'),
      subInstruction: t('hairCheck.camera.instructions.top.subInstruction'),
      targetAngle: { pitch: 90, roll: 0 },
      requiresFace: false,
    },
    {
      id: 'back',
      label: t('hairCheck.camera.instructions.back.label'),
      icon: '👤',
      description: t('hairCheck.camera.instructions.back.description'),
      instruction: t('hairCheck.camera.instructions.back.instruction'),
      subInstruction: t('hairCheck.camera.instructions.back.subInstruction'),
      targetAngle: { pitch: 0, roll: 180 },
      requiresFace: false,
    },
  ];

  const currentStep = photoSteps[currentStepIndex];
  const isLastStep = currentStepIndex === photoSteps.length - 1;
  const allPhotosCaptured = Object.keys(capturedPhotos).length === photoSteps.length;

  useEffect(() => {
    checkCameraPermission();
    startPositionMonitoring();
    startFaceDetection();
    return () => {
      stopPositionMonitoring();
      stopCountdown();
      stopFaceDetection();
    };
  }, []);

  useEffect(() => {
    // Yüz pozisyonu değiştiğinde kontrol et
    checkFacePosition();
  }, [facePosition, faceDetected, currentStepIndex]);

  useEffect(() => {
    // Açı değiştiğinde pozisyon kontrolü yap
    checkPosition();
  }, [phoneAngle, currentStepIndex]);

  // Adım değiştiğinde state'leri sıfırla
  useEffect(() => {
    console.log('🔄 Adım değişti:', {
      currentStepIndex,
      currentStepId: currentStep?.id,
      hasCurrentPhoto: !!capturedPhotos[currentStep?.id],
      allCapturedPhotos: Object.keys(capturedPhotos),
    });
    setIsPositionValid(false);
    setPositionStableTime(0);
    setFaceDetected(false);
    setFaceInFrame(false);
    setFaceStableTime(0);
    setCountdown(null);
    setAutoCaptureEnabled(true);
    stablePositionStartRef.current = null;
    stableFaceStartRef.current = null;
    stopCountdown();
  }, [currentStepIndex]);

  // Otomatik çekim kaldırıldı - sadece manuel çekim

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

  // Yüz algılama başlat (simüle edilmiş - gerçek implementasyon için frame processor gerekli)
  const startFaceDetection = () => {
    // Gerçek yüz algılama için react-native-vision-camera'nın frame processor'ı kullanılmalı
    // Şimdilik simüle edilmiş bir algılama yapıyoruz
    // Kullanıcı kameraya baktığında yüz algılandığını varsayıyoruz
    
    faceCheckIntervalRef.current = setInterval(() => {
      // Simüle edilmiş yüz algılama - gerçek implementasyon için frame processor gerekli
      // Bu kısım gerçek yüz algılama ile değiştirilecek
      const simulatedFaceDetected = true; // Test için her zaman true
      
      if (simulatedFaceDetected) {
        // Yüz pozisyonunu simüle et (merkeze yakın)
        const simulatedX = CIRCLE_CENTER_X + (Math.random() - 0.5) * CIRCLE_SIZE * 0.3;
        const simulatedY = CIRCLE_CENTER_Y + (Math.random() - 0.5) * CIRCLE_SIZE * 0.3;
        const simulatedSize = CIRCLE_SIZE * (0.5 + Math.random() * 0.2);
        
        setFaceDetected(true);
        setFacePosition({
          x: simulatedX,
          y: simulatedY,
          width: simulatedSize,
          height: simulatedSize,
        });
      } else {
        setFaceDetected(false);
        setFaceInFrame(false);
        setFaceWarning('Yüz algılanamadı. Lütfen kameraya bakın.');
      }
    }, 500); // Her 500ms'de bir kontrol et
  };

  const stopFaceDetection = () => {
    if (faceCheckIntervalRef.current) {
      clearInterval(faceCheckIntervalRef.current);
      faceCheckIntervalRef.current = null;
    }
  };

  // Yüz pozisyonunu kontrol et
  const checkFacePosition = useCallback(() => {
    if (!faceDetected || !currentStep.requiresFace) {
      setFaceInFrame(false);
      setFaceWarning(null);
      stableFaceStartRef.current = null;
      setFaceStableTime(0);
      return;
    }

    const faceCenterX = facePosition.x;
    const faceCenterY = facePosition.y;
    const faceSize = Math.max(facePosition.width, facePosition.height);

    // Yüzün çember içinde olup olmadığını kontrol et
    const distanceFromCenterX = Math.abs(faceCenterX - CIRCLE_CENTER_X);
    const distanceFromCenterY = Math.abs(faceCenterY - CIRCLE_CENTER_Y);
    const distanceFromCenter = Math.sqrt(
      distanceFromCenterX * distanceFromCenterX + 
      distanceFromCenterY * distanceFromCenterY
    );

    // Yüz boyutu kontrolü
    const isSizeValid = faceSize >= FACE_SIZE_MIN && faceSize <= FACE_SIZE_MAX;
    
    // Yüz pozisyonu kontrolü (çember merkezinden uzaklık)
    const maxDistance = CIRCLE_SIZE / 2 - faceSize / 2 - FACE_POSITION_TOLERANCE;
    const isPositionValid = distanceFromCenter <= maxDistance;

    const isValid = isSizeValid && isPositionValid;
    setFaceInFrame(isValid);

    // Uyarı mesajları
    if (!isValid) {
      let warning = '';
      if (!isSizeValid) {
        if (faceSize < FACE_SIZE_MIN) {
          warning = 'Daha yakına gelin';
        } else {
          warning = 'Biraz uzaklaşın';
        }
      } else if (!isPositionValid) {
        if (distanceFromCenterX > distanceFromCenterY) {
          warning = faceCenterX < CIRCLE_CENTER_X ? 'Sağa kayın' : 'Sola kayın';
        } else {
          warning = faceCenterY < CIRCLE_CENTER_Y ? 'Aşağı kayın' : 'Yukarı kayın';
        }
      }
      setFaceWarning(warning);
      stableFaceStartRef.current = null;
      setFaceStableTime(0);
    } else {
      setFaceWarning(null);
      if (stableFaceStartRef.current === null) {
        stableFaceStartRef.current = Date.now();
      }
      const stableDuration = Date.now() - (stableFaceStartRef.current || 0);
      setFaceStableTime(stableDuration);
    }

    // Animasyon
    Animated.sequence([
      Animated.timing(faceDetectionAnimation, {
        toValue: isValid ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [faceDetected, facePosition, currentStep]);

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
          t('hairCheck.camera.cameraPermission'),
          t('hairCheck.camera.cameraPermission'),
          [
            {
              text: t('common.ok'),
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
      Alert.alert(t('hairCheck.camera.cameraPermission'), t('hairCheck.camera.cameraPermission'));
      return;
    }

    if (!device) {
      Alert.alert(t('common.error'), t('hairCheck.camera.cameraNotFound'));
      return;
    }

    if (!camera.current) {
      Alert.alert(t('common.error'), t('hairCheck.camera.cameraNotReady'));
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
        t('common.error'),
        error.message || t('hairCheck.camera.photoError'),
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
  const progressSteps = photoSteps.length;
  const currentProgress = currentStepIndex + 1;

  // Debug: hasCurrentPhoto kontrolü
  useEffect(() => {
    console.log('📷 hasCurrentPhoto kontrolü:', {
      currentStepIndex,
      currentStepId: currentStep.id,
      hasCurrentPhoto,
      capturedPhotosKeys: Object.keys(capturedPhotos),
      capturedPhotoForCurrentStep: capturedPhotos[currentStep.id],
    });
  }, [currentStepIndex, capturedPhotos, currentStep.id]);

  const handleClose = () => {
    Alert.alert(
      t('hairCheck.camera.exit'),
      t('hairCheck.camera.exitConfirm'),
      [
        {
          text: t('hairCheck.camera.exitCancel'),
          style: 'cancel',
        },
        {
          text: t('hairCheck.camera.exitConfirmButton'),
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Step Info Card */}
        <View style={styles.stepInfoCard}>
          <Text weight="bold" style={styles.stepInfoText}>
            {currentStep.label}
          </Text>
          <Text weight="regular" style={styles.stepInfoNumber}>
            {currentProgress}/{progressSteps}
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        {photoSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < currentProgress && styles.progressSegmentFilled,
              index === currentStepIndex && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      {/* Main Instruction */}
      <View style={styles.instructionHeader}>
        <Text weight="bold" style={styles.mainInstruction}>
          {currentStep.instruction || currentStep.description.toUpperCase()}
        </Text>
        {currentStep.subInstruction && (
          <Text weight="regular" style={styles.subInstruction}>
            {currentStep.subInstruction}
          </Text>
        )}
      </View>

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {hasCurrentPhoto ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: capturedPhotos[currentStep.id].uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewOverlay} />
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
            
            {/* Dark Overlay with Circular Cutout */}
            <View style={styles.overlayContainer}>
              <View style={styles.overlayTop} />
              <View style={styles.overlayBottom} />
              <View style={styles.overlayLeft} />
              <View style={styles.overlayRight} />
            </View>

            {/* Circular Frame Guide */}
            <View style={styles.circularFrame} />

            {/* Face Detection Indicator */}
            {currentStep.requiresFace && !hasCurrentPhoto && faceDetected && (
              <Animated.View
                style={[
                  styles.faceIndicator,
                  {
                    opacity: faceDetectionAnimation,
                    left: facePosition.x - facePosition.width / 2,
                    top: facePosition.y - facePosition.height / 2,
                    width: facePosition.width,
                    height: facePosition.height,
                  },
                ]}
              >
                <View
                  style={[
                    styles.faceIndicatorBox,
                    {
                      borderColor: faceInFrame ? '#10B981' : '#F59E0B',
                    },
                  ]}
                />
              </Animated.View>
            )}
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
              <Text weight="semibold" style={styles.retakeButtonText}>
                {t('hairCheck.camera.retake')}
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
                {isLastStep ? t('hairCheck.camera.finish') : t('hairCheck.camera.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureControls}>
            {/* Capture Button */}
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isCapturing || !hasPermission || !device}
              activeOpacity={0.8}
            >
              {isCapturing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Icon name="camera" size={28} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Processing Modal */}
      <LoadingModal
        visible={isProcessing}
        message={t('hairCheck.camera.processing')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#00FF88',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepInfoText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  stepInfoNumber: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  headerSpacer: {
    width: 40,
  },
  // Progress Bar
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 6,
    zIndex: 10,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressSegmentFilled: {
    backgroundColor: '#10B981',
  },
  progressSegmentActive: {
    backgroundColor: '#10B981',
    height: 4,
  },
  // Instruction Header
  instructionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  mainInstruction: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subInstruction: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.85,
  },
  // Camera Container
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
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
  // Circular Overlay with Cutout
  overlayContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 2,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (height - CIRCLE_SIZE) / 2,
    backgroundColor: '#000000',
    opacity: 0.7,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: (height - CIRCLE_SIZE) / 2,
    backgroundColor: '#000000',
    opacity: 0.7,
  },
  overlayLeft: {
    position: 'absolute',
    top: (height - CIRCLE_SIZE) / 2,
    left: 0,
    width: (width - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    backgroundColor: '#000000',
    opacity: 0.7,
  },
  overlayRight: {
    position: 'absolute',
    top: (height - CIRCLE_SIZE) / 2,
    right: 0,
    width: (width - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    backgroundColor: '#000000',
    opacity: 0.7,
  },
  circularFrame: {
    position: 'absolute',
    top: (height - CIRCLE_SIZE) / 2,
    left: (width - CIRCLE_SIZE) / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    zIndex: 3,
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Face Detection
  faceIndicator: {
    position: 'absolute',
    zIndex: 5,
    pointerEvents: 'none',
  },
  faceIndicatorBox: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderRadius: 8,
    backgroundColor: 'transparent',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  // Preview
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
  previewOverlay: {
    width: width,
    height: height,
    position: 'absolute',
    backgroundColor: '#000000',
    opacity: 0.7,
  },
  // Status Message
  statusContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Bottom Controls
  bottomControls: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    zIndex: 10,
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  // Review Controls
  reviewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  retakeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retakeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  continueButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#01213D',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default HairCheckCameraScreen;

