import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';
import { LoadingModal } from '../components';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { AdminHairCheckDetailScreen, AppointmentCreateScreen, HairCheckCaptureScreen, HairCheckDetailScreen, HairCheckCameraScreen } from '../screens/main';


import { ChatScreen } from '../screens/main';


const Stack = createNativeStackNavigator();

const ONBOARDING_KEY = '@onboarding_completed';

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    checkOnboarding();
    setupDeepLinking();
  }, []);

  const setupDeepLinking = () => {
    // App açıkken gelen deep link'leri dinle
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // App kapalıyken gelen deep link'i kontrol et
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial deep link:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  };

  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log('🔗 Deep link alındı:', url);
    console.log('🔗 Current user:', user ? 'Logged in' : 'Not logged in');
    console.log('🔗 Show onboarding:', showOnboarding);
    console.log('🔗 Show splash:', showSplash);
    
    if (url.includes('reset-password')) {
      console.log('🔐 Şifre sıfırlama deep link\'i tespit edildi');
      
      try {
        // URL'den token'ları parse et
        const urlParts = url.split('#');
        if (urlParts.length > 1) {
          const hashParams = urlParts[1];
          const params: { [key: string]: string } = {};
          
          // Hash parametrelerini manuel parse et
          hashParams.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
              params[key] = decodeURIComponent(value);
            }
          });
          
          const accessToken = params['access_token'];
          const refreshToken = params['refresh_token'];
          const type = params['type'];
          
          console.log('🔑 Token bilgileri:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type: type
          });
          
          // Token'lar varsa Supabase session'a set et
          if (accessToken && refreshToken) {
            console.log('🔄 Session güncelleniyor...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('❌ Session set hatası:', error);
            } else {
              console.log('✅ Session başarıyla set edildi:', data?.user?.email);
            }
          }
        }
      } catch (error) {
        console.error('❌ Token parse hatası:', error);
      }
      
      // Navigation hazır olana kadar bekle
      const navigateToResetPassword = async () => {
        console.log('🧭 Navigation ref durumu:', !!navigationRef.current);
        
        if (navigationRef.current) {
          try {
            console.log('➡️ ResetPassword ekranına yönlendiriliyor...');
            
            // Eğer kullanıcı giriş yapmışsa (MainTabs'daysa), önce çıkış yap
            if (user) {
              console.log('⚠️ Kullanıcı giriş yapmış, önce çıkış yapılıyor...');
              await useAuthStore.getState().signOut();
            }
            
            navigationRef.current.navigate('Auth', {
              screen: 'ResetPassword',
            });
            console.log('✅ Navigation başarılı');
          } catch (error) {
            console.error('❌ Navigation hatası:', error);
          }
        } else {
          console.log('⏳ Navigation ref henüz hazır değil, tekrar deneniyor...');
          setTimeout(navigateToResetPassword, 500);
        }
      };
      
      // Splash ve onboarding tamamlanana kadar bekle
      setTimeout(navigateToResetPassword, showSplash ? 3000 : (showOnboarding ? 1000 : 500));
    }
  };

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      const shouldShow = value === null;
      console.log('📱 Onboarding durumu:', shouldShow ? 'Gösterilecek' : 'Tamamlanmış');
      setShowOnboarding(shouldShow);
    } catch (error) {
      console.error('❌ Onboarding kontrolü hatası:', error);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      console.log('✅ Onboarding tamamlandı');
      setShowOnboarding(false);
    } catch (error) {
      console.error('❌ Onboarding kayıt hatası:', error);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Splash ekranı gösteriliyorsa
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  const isLoading = loading || showOnboarding === null;
  

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          ) : user ? (
            <>
              {/* Tek MainTabs hem admin hem normal kullanıcı için */}
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen 
                name="Chat" 
                component={ChatScreen}
              />
              <Stack.Screen 
                name="HairCheckCamera" 
                component={HairCheckCameraScreen}
              />
              <Stack.Screen 
                name="HairCheckCapture" 
                component={HairCheckCaptureScreen}
              />
              <Stack.Screen 
                name="HairCheckDetail" 
                component={HairCheckDetailScreen}
              />
              <Stack.Screen 
                name="AdminHairCheckDetail" 
                component={AdminHairCheckDetailScreen}
              />
              <Stack.Screen 
                name="AppointmentCreate" 
                component={AppointmentCreateScreen}
              />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      <LoadingModal 
        visible={isLoading} 
      />
    </>
  );
};

export default RootNavigator;

