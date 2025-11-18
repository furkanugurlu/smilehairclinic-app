import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components';

interface PhotoStep {
  id: string;
  label: string;
  icon: string;
}

interface HairCheckScreenProps {
  navigation: any;
}

const HairCheckScreen: React.FC<HairCheckScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const photoSteps: PhotoStep[] = [
    {
      id: 'front',
      label: t('hairCheck.photoTypes.front'),
      icon: 'happy-outline',
    },
    {
      id: 'right45',
      label: t('hairCheck.photoTypes.right45'),
      icon: 'arrow-redo-outline',
    },
    {
      id: 'left45',
      label: t('hairCheck.photoTypes.left45'),
      icon: 'arrow-undo-outline',
    },
    {
      id: 'top',
      label: t('hairCheck.photoTypes.top'),
      icon: 'arrow-up-outline',
    },
    {
      id: 'back',
      label: t('hairCheck.photoTypes.back'),
      icon: 'person-outline',
    },
  ];

  const handleStartCapture = () => {
    setShowInfoModal(true);
  };

  const handleConfirmAndStart = () => {
    setShowInfoModal(false);
    console.log('🔬 Fotoğraf çekimi başlatılıyor...');
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('HairCheckCamera');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text weight="bold" style={styles.title}>
              {t('hairCheck.expertEvaluation')}
            </Text>
          </View>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            <View style={styles.photoRow}>
              {photoSteps.slice(0, 2).map(photo => (
                <View key={photo.id} style={styles.photoCard}>
                  <Icon
                    name={photo.icon}
                    size={28}
                    color="#01213D"
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
                    size={28}
                    color="#01213D"
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
                  size={28}
                  color="#01213D"
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
            activeOpacity={0.9}
          >
            <Text weight="bold" style={styles.scanButtonText}>
              {t('hairCheck.startScan')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Icon name="bulb-outline" size={32} color="#F59E0B" />
              </View>
              <Text weight="bold" style={styles.modalTitle}>
                {t('hairCheck.modal.importantInfo')}
              </Text>
            </View>

            <View style={styles.modalContent}>
              <Text weight="regular" style={styles.modalText}>
                {t('hairCheck.helperText')}
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirmAndStart}
                activeOpacity={0.9}
              >
                <Text weight="bold" style={styles.modalButtonText}>
                  {t('common.ok')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 30,
  },
  photoGrid: {
    width: '100%',
    marginBottom: 32,
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
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 13,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  buttonSection: {
    width: '100%',
  },
  scanButton: {
    backgroundColor: '#01213D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: '#1A1A1A',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  modalButton: {
    backgroundColor: '#01213D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default HairCheckScreen;
