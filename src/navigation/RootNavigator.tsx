import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { LoadingModal } from '../components';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import AdminTabs from './AdminTabs';
import HairCheckCaptureScreen from '../screens/haircheck/HairCheckCaptureScreen';
import HairCheckDetailScreen from '../screens/haircheck/HairCheckDetailScreen';
import AppointmentCreateScreen from '../screens/appointments/AppointmentCreateScreen';
import AdminChatScreen from '../screens/admin/AdminChatScreen';

const Stack = createNativeStackNavigator();

const ONBOARDING_KEY = '@onboarding_completed';

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

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
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          ) : user ? (
            <>
              {/* Admin veya Normal Kullanıcı için farklı tabs */}
              {user.is_admin ? (
                <>
                  <Stack.Screen name="AdminTabs" component={AdminTabs} />
                  <Stack.Screen 
                    name="AdminChat" 
                    component={AdminChatScreen}
                  />
                  <Stack.Screen 
                    name="HairCheckDetail" 
                    component={HairCheckDetailScreen}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen name="MainTabs" component={MainTabs} />
                  <Stack.Screen 
                    name="HairCheckCapture" 
                    component={HairCheckCaptureScreen}
                  />
                  <Stack.Screen 
                    name="HairCheckDetail" 
                    component={HairCheckDetailScreen}
                  />
                  <Stack.Screen 
                    name="AppointmentCreate" 
                    component={AppointmentCreateScreen}
                  />
                </>
              )}
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      <LoadingModal 
        visible={isLoading} 
        message="Uygulama yükleniyor..." 
      />
    </>
  );
};

export default RootNavigator;

