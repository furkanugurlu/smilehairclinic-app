import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';
import AdminHairChecksScreen from '../screens/admin/AdminHairChecksScreen';

// User Screens
import HomeScreen from '../screens/main/HomeScreen';
import HairCheckStartScreen from '../screens/haircheck/HairCheckStartScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Shared Screens
import MessageListScreen from '../screens/messages/MessageListScreen';
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
      {/* Tab 1: Home / Dashboard */}
      <Tab.Screen
        name={isAdmin ? 'AdminDashboard' : 'Home'}
        component={isAdmin ? AdminDashboardScreen : HomeScreen}
        options={{
          tabBarLabel: t('home.title'),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 2: Appointments */}
      <Tab.Screen
        name={isAdmin ? 'AdminAppointments' : 'Appointments'}
        component={isAdmin ? AdminAppointmentsScreen : AppointmentsScreen}
        options={{
          tabBarLabel: t('appointments.title'),
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
          component={HairCheckStartScreen}
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

      {/* Tab 4: Messages / Support */}
      <Tab.Screen
        name={isAdmin ? 'AdminMessages' : 'Messages'}
        component={MessageListScreen}
        options={{
          tabBarLabel: isAdmin ? t('messages.title') : t('profile.support'),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 5: Profile */}
      <Tab.Screen
        name={isAdmin ? 'AdminProfile' : 'Profile'}
        component={ProfileStack}
        options={{
          tabBarLabel: t('profile.title'),
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
