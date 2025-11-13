import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components';
import { HairCheck, AnalysisStatus } from '../../types';

const { width } = Dimensions.get('window');

const HairCheckDetailScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { check } = route.params;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const photos = useMemo(
    () => [
      {
        id: 'front',
        label: t('hairCheck.frontView'),
        icon: 'happy-outline',
        iconColor: '#01213D',
        url: check.photo_front,
      },
      {
        id: 'right45',
        label: t('hairCheck.right45'),
        icon: 'arrow-redo-outline',
        iconColor: '#10B981',
        url: check.photo_right45,
      },
      {
        id: 'left45',
        label: t('hairCheck.left45'),
        icon: 'arrow-undo-outline',
        iconColor: '#10B981',
        url: check.photo_left45,
      },
      {
        id: 'top',
        label: t('hairCheck.topView'),
        icon: 'arrow-up-outline',
        iconColor: '#F59E0B',
        url: check.photo_top,
      },
      {
        id: 'back',
        label: t('hairCheck.backView'),
        icon: 'person-outline',
        iconColor: '#8B5CF6',
        url: check.photo_back,
      },
    ],
    [t, check],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = t('common.locale');
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status?: AnalysisStatus) => {
    switch (status) {
      case 'good':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status?: AnalysisStatus) => {
    switch (status) {
      case 'good':
        return t('hairCheck.statusGood');
      case 'warning':
        return t('hairCheck.statusWarning');
      case 'critical':
        return t('hairCheck.statusCritical');
      default:
        return t('hairCheck.statusUnknown');
    }
  };

  const getStatusIconName = () => {
    if (check.status === 'pending') return 'time';
    if (check.status === 'analyzing') return 'analytics';
    if (check.status === 'completed') {
      switch (check.analysis_status) {
        case 'good':
          return 'checkmark-circle';
        case 'warning':
          return 'warning';
        case 'critical':
          return 'alert-circle';
        default:
          return 'bar-chart';
      }
    }
    return 'bar-chart';
  };

  const getStatusIconColor = () => {
    if (check.status === 'pending') return '#F59E0B';
    if (check.status === 'analyzing') return '#01213D';
    if (check.status === 'completed') {
      return getStatusColor(check.analysis_status);
    }
    return '#6B7280';
  };

  const getStatusDescription = () => {
    if (check.status === 'pending') {
      return t('hairCheck.pendingDesc');
    }
    if (check.status === 'analyzing') {
      return t('hairCheck.analyzingDesc');
    }
    if (check.status === 'completed') {
      return check.analysis_notes || t('hairCheck.analysisComplete');
    }
    return t('hairCheck.statusUnknownDesc');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('hairCheck.detailTitle')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarih ve Durum */}
        <View style={styles.section}>
          <View style={styles.dateCard}>
            <View style={styles.dateLeft}>
              <Icon
                name="calendar"
                size={32}
                color="#01213D"
                style={styles.dateIcon}
              />
              <View>
                <Text weight="regular" style={styles.dateLabel}>
                  {t('hairCheck.checkDate')}
                </Text>
                <Text weight="semibold" style={styles.dateText}>
                  {formatDate(check.created_at)}
                </Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Icon
                name={getStatusIconName()}
                size={16}
                color={getStatusIconColor()}
                style={styles.statusIcon}
              />
              {check.status === 'completed' ? (
                <Text
                  weight="semibold"
                  style={[
                    styles.statusText,
                    { color: getStatusColor(check.analysis_status) },
                  ]}
                >
                  {getStatusText(check.analysis_status)}
                </Text>
              ) : (
                <Text weight="semibold" style={styles.statusText}>
                  {check.status === 'pending'
                    ? t('hairCheck.statusPending')
                    : t('hairCheck.statusAnalyzing')}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Analiz Sonucu */}
        {check.status === 'completed' && check.analysis_score && (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('hairCheck.analysisResult')}
            </Text>
            <View style={styles.scoreCard}>
              <View style={styles.scoreCircle}>
                <Text weight="bold" style={styles.scoreNumber}>
                  {check.analysis_score}
                </Text>
                <Text weight="regular" style={styles.scoreLabel}>
                  /100
                </Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text weight="semibold" style={styles.scoreTitle}>
                  {t('hairCheck.hairHealthScore')}
                </Text>
                <Text weight="regular" style={styles.scoreDescription}>
                  {getStatusDescription()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Açıklama */}
        {check.status !== 'completed' && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Icon
                name={getStatusIconName()}
                size={32}
                color="#92400E"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text weight="semibold" style={styles.infoTitle}>
                  {check.status === 'pending'
                    ? t('hairCheck.pendingTitle')
                    : t('hairCheck.analyzingTitle')}
                </Text>
                <Text weight="regular" style={styles.infoText}>
                  {getStatusDescription()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Fotoğraflar */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('hairCheck.photosTitle')}
          </Text>
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoCard}
                onPress={() => setSelectedPhoto(photo.url)}
              >
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <Icon
                    name={photo.icon}
                    size={20}
                    color="#FFFFFF"
                    style={styles.photoIcon}
                  />
                  <Text weight="semibold" style={styles.photoLabel}>
                    {photo.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Öneriler */}
        {check.status === 'completed' && check.recommendations && (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('hairCheck.recommendationsTitle')}
            </Text>
            <View style={styles.recommendationsCard}>
              <Icon
                name="bulb"
                size={32}
                color="#1E40AF"
                style={styles.recommendationsIcon}
              />
              <Text weight="regular" style={styles.recommendationsText}>
                {check.recommendations}
              </Text>
            </View>
          </View>
        )}

        {/* Varsayılan Öneriler (eğer analiz tamamlanmadıysa) */}
        {check.status !== 'completed' && (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              Genel Öneriler
            </Text>
            <View style={styles.tipCard}>
              <Icon
                name="water"
                size={32}
                color="#01213D"
                style={styles.tipIcon}
              />
              <View style={styles.tipContent}>
                <Text weight="semibold" style={styles.tipTitle}>
                  Yeterli Su Tüketimi
                </Text>
                <Text weight="regular" style={styles.tipDescription}>
                  Günde en az 2 litre su tüketerek saç sağlığınızı destekleyin
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <Icon
                name="nutrition"
                size={32}
                color="#10B981"
                style={styles.tipIcon}
              />
              <View style={styles.tipContent}>
                <Text weight="semibold" style={styles.tipTitle}>
                  Dengeli Beslenme
                </Text>
                <Text weight="regular" style={styles.tipDescription}>
                  Protein, vitamin ve mineral açısından zengin beslenerek
                  saçlarınızı güçlendirin
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <Icon
                name="sunny"
                size={32}
                color="#F59E0B"
                style={styles.tipIcon}
              />
              <View style={styles.tipContent}>
                <Text weight="semibold" style={styles.tipTitle}>
                  Güneş Koruması
                </Text>
                <Text weight="regular" style={styles.tipDescription}>
                  Saç derinizi güneşin zararlı etkilerinden koruyun
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fotoğraf Büyütme Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedPhoto(null)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPhoto(null)}
              >
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              {selectedPhoto && (
                <Image
                  source={{ uri: selectedPhoto }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
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
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreNumber: {
    fontSize: 36,
    color: '#01213D',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    alignItems: 'center',
  },
  photoIcon: {
    marginBottom: 2,
  },
  photoLabel: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  recommendationsCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
  },
  recommendationsIcon: {
    marginRight: 16,
  },
  recommendationsText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    height: width - 40,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default HairCheckDetailScreen;
