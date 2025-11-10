import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

interface CustomTextProps extends TextProps {
  weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
}

const Text: React.FC<CustomTextProps> = ({ 
  style, 
  weight = 'regular', 
  children, 
  ...props 
}) => {
  const fontFamily = getFontFamily(weight);
  
  return (
    <RNText style={[styles.defaultText, { fontFamily }, style]} {...props}>
      {children}
    </RNText>
  );
};

const getFontFamily = (weight: string): string => {
  const fontMap: { [key: string]: string } = {
    thin: 'Poppins-Thin',
    extralight: 'Poppins-ExtraLight',
    light: 'Poppins-Light',
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extrabold: 'Poppins-ExtraBold',
    black: 'Poppins-Black',
  };
  
  return fontMap[weight] || 'Poppins-Regular';
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'Poppins-Regular',
  },
});

export default Text;

