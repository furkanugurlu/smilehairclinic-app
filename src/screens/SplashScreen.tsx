import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const initializeApp = async () => {
      // Auth state'i initialize et
      console.log('🚀 Uygulama başlatılıyor...');
      await initialize();
      console.log('✅ Auth state yüklendi');
      
      // 2 saniye sonra splash'i kapat
      timer = setTimeout(() => {
        console.log('🎬 Splash ekranı tamamlandı');
        onFinish();
      }, 2000);
    };

    initializeApp();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [initialize, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01213D" />
      <View style={styles.content}>
        <Image
          source={require('../assets/icons/app-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default SplashScreen;

