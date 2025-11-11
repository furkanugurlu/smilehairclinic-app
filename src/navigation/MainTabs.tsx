import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/main/HomeScreen';
import HairCheckStartScreen from '../screens/haircheck/HairCheckStartScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileStack from './ProfileStack';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export type MainTabsParamList = {
  Home: undefined;
  HairCheck: undefined;
  Appointments: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs: React.FC = () => {
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
        tabBarLabelStyle: styles. tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
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
         name="Appointments"
         component={AppointmentsScreen}
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
          name="HairCheck"
          component={HairCheckStartScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: () => (
              <View style={styles.fabContainer}>
                <View style={styles.fab}>
                  <Icon 
                    name="camera" 
                    size={30} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Messages"
          component={MessagesScreen}
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
          name="Profile"
          component={ProfileStack}
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});

export default MainTabs;

