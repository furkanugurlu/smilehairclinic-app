import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminMessagesScreen from '../screens/admin/AdminMessagesScreen';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';
import AdminHairChecksScreen from '../screens/admin/AdminHairChecksScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  const insets = useSafeAreaInsets();
  
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
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminAppointments"
        component={AdminAppointmentsScreen}
        options={{
          tabBarLabel: 'Randevular',
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminHairChecks"
        component={AdminHairChecksScreen}
        options={{
          tabBarLabel: 'Kontroller',
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? 'flask' : 'flask-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminMessages"
        component={AdminMessagesScreen}
        options={{
          tabBarLabel: 'Mesajlar',
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
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
});

export default AdminTabs;

