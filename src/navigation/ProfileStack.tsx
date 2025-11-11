import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/main/ProfileScreen';
import { 
  ProfileEditScreen, 
  ContactScreen, 
  AboutScreen, 
  HelpCenterScreen 
} from '../screens/profile';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  Contact: undefined;
  About: undefined;
  HelpCenter: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;

