import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../../../components';

interface PhotoStep {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
}

interface HairCheckScreenProps {
  navigation: any;
}

const HairCheckScreen: React.FC<HairCheckScreenProps> = ({
  navigation,
}) => {
  const photoSteps: PhotoStep[] = [
    {
      id: 'front',
      label: 'Ön Görünüm',
      icon: 'happy-outline',
      iconColor: '#01213D',
    },
    {
      id: 'right45',
      label: 'Sağ 45°',
      icon: 'arrow-redo-outline',
      iconColor: '#10B981',
    },
    {
      id: 'left45',
      label: 'Sol 45°',
      icon: 'arrow-undo-outline',
      iconColor: '#10B981',
    },
    {
      id: 'top',
      label: 'Üst Görünüm',
      icon: 'arrow-up-outline',
      iconColor: '#F59E0B',
    },
    {
      id: 'back',
      label: 'Arka Görünüm',
      icon: 'person-outline',
      iconColor: '#8B5CF6',
    },
  ];

  const handleStartCapture = () => {
    console.log('🔬 Fotoğraf çekimi başlatılıyor...');
    // MainTabs'tan ana stack'e navigate etmek için getParent kullan
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('HairCheckCamera');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/app-icon-wb.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Centered Main Content */}
        <View style={styles.mainContent}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text weight="bold" style={styles.title}>
              Uzman değerlendirmesi{'\n'}için fotoğraflarınızı{'\n'}çekelim.
            </Text>
          </View>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            <View style={styles.photoRow}>
              {photoSteps.slice(0, 2).map(photo => (
                <View key={photo.id} style={styles.photoCard}>
                  <Icon
                    name={photo.icon}
                    size={32}
                    color={photo.iconColor}
                    style={styles.photoIcon}
                  />
                  <Text weight="semibold" style={styles.photoLabel}>
                    {photo.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.photoRow}>
              {photoSteps.slice(2, 4).map(photo => (
                <View key={photo.id} style={styles.photoCard}>
                  <Icon
                    name={photo.icon}
                    size={32}
                    color={photo.iconColor}
                    style={styles.photoIcon}
                  />
                  <Text weight="semibold" style={styles.photoLabel}>
                    {photo.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.photoRowCenter}>
              <View style={styles.photoCard}>
                <Icon
                  name={photoSteps[4].icon}
                  size={32}
                  color={photoSteps[4].iconColor}
                  style={styles.photoIcon}
                />
                <Text weight="semibold" style={styles.photoLabel}>
                  {photoSteps[4].label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Start Scan Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleStartCapture}
          >
            <Text weight="bold" style={styles.scanButtonText}>
              Taramayı Başlat
            </Text>
          </TouchableOpacity>
          <Text weight="regular" style={styles.helperText}>
            İyi aydınlatılmış bir ortamda olduğunuzdan emin olun.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 60,
    height: 60,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  mainContent: {
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#01213D',
    textAlign: 'center',
    lineHeight: 32,
  },
  photoGrid: {
    width: '100%',
    marginBottom: 24,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1.4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoIcon: {
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 12,
    color: '#01213D',
    textAlign: 'center',
  },
  buttonSection: {
    width: '100%',
  },
  scanButton: {
    backgroundColor: '#01213D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#01213D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HairCheckScreen;
