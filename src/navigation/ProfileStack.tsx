import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ProfileEditScreen,
  ContactScreen,
  AboutScreen,
  HelpCenterScreen,
  LanguageScreen,
  ProfileScreen,
  ChangePasswordScreen,
} from '../screens/main/profile';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  ChangePassword: undefined;
  Contact: undefined;
  About: undefined;
  HelpCenter: undefined;
  Language: undefined;
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
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
