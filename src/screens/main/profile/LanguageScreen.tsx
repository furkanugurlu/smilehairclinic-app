import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components';
import { changeLanguage, getCurrentLanguage } from '../../../i18n';

interface LanguageScreenProps {
  navigation: any;
}

type Language = {
  id: 'tr' | 'en';
  nameKey: string;
  nativeNameKey: string;
};

const languages: Language[] = [
  { id: 'tr', nameKey: 'language.turkishName', nativeNameKey: 'language.turkish' },
  { id: 'en', nameKey: 'language.englishName', nativeNameKey: 'language.english' },
];

const LanguageScreen: React.FC<LanguageScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(getCurrentLanguage());

  useEffect(() => {
    setSelectedLanguage(getCurrentLanguage());
  }, [i18n.language]);

  const handleLanguageSelect = async (languageId: 'tr' | 'en') => {
    // Eğer seçilen dil zaten mevcut dil ise, sadece geri dön
    if (selectedLanguage === languageId) {
      navigation.goBack();
      return;
    }
    
    setSelectedLanguage(languageId);
    await changeLanguage(languageId);
    // Dil değiştirildikten sonra otomatik geri dön
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('profile.languageTitle')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text weight="bold" style={styles.description}>
            {t('profile.selectLanguage')}
          </Text>

          {languages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <View style={styles.languageInfo}>
                <Text weight="semibold" style={styles.languageName}>
                  {t(language.nativeNameKey)}
                </Text>
                <Text weight="regular" style={styles.languageSubtitle}>
                  {t(language.nameKey)}
                </Text>
              </View>
              {selectedLanguage === language.id && (
                <Icon name="checkmark-circle" size={24} color="#01213D" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 56,
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  description: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 24,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#01213D',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  languageSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default LanguageScreen;
