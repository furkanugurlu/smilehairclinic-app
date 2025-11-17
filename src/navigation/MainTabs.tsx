import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

import {
  HomeScreen,
  AppointmentsScreen,
  MessageListScreen,
  HairCheckScreen,
  // admin screens
  AdminDashboardScreen,
  AdminAppointmentsScreen,
  AdminHairChecksScreen,
} from '../screens/main';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isAdmin = user?.is_admin || false;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#01213D',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      {/* Tab 1: Ana Sayfa / Dashboard */}
      <Tab.Screen
        name={isAdmin ? 'AdminDashboard' : 'Home'}
        component={isAdmin ? AdminDashboardScreen : HomeScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 2: Randevular */}
      <Tab.Screen
        name={isAdmin ? 'AdminAppointments' : 'Appointments'}
        component={isAdmin ? AdminAppointmentsScreen : AppointmentsScreen}
        options={{
          tabBarLabel: t('tabs.appointments'),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'calendar' : 'calendar-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 3: Orta Tab - Admin için Kontroller / Kullanıcı için Hair Check */}
      {isAdmin ? (
        <Tab.Screen
          name="AdminHairChecks"
          component={AdminHairChecksScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: ({ focused }) => (
              <View style={styles.fabContainer}>
                <View
                  style={[
                    styles.fab,
                    focused ? styles.fabActive : styles.fabInactive,
                  ]}
                >
                  <Icon
                    name={focused ? 'flask' : 'flask-outline'}
                    size={focused ? 32 : 28}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="HairCheck"
          component={HairCheckScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: ({ focused }) => (
              <View style={styles.fabContainer}>
                <View
                  style={[
                    styles.fab,
                    focused ? styles.fabActive : styles.fabInactive,
                  ]}
                >
                  <Icon
                    name={focused ? 'camera' : 'camera-outline'}
                    size={focused ? 32 : 28}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            ),
          }}
        />
      )}

      {/* Tab 4: Mesajlar / Destek */}
      <Tab.Screen
        name={isAdmin ? 'AdminMessages' : 'Messages'}
        component={MessageListScreen}
        options={{
          tabBarLabel: isAdmin ? t('tabs.adminMessages') : t('tabs.messages'),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 5: Profil */}
      <Tab.Screen
        name={isAdmin ? 'AdminProfile' : 'Profile'}
        component={ProfileStack}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabBarIcon: {
    marginTop: 4,
  },
  fabContainer: {
    position: 'absolute',
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  fabActive: {
    backgroundColor: '#01213D',
    shadowColor: '#01213D',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    transform: [{ scale: 1.05 }],
  },
  fabInactive: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
});

export default MainTabs;
