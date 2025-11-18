import React, { useState } from 'react';
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
import { Text } from '../../../components';
import { HairCheck, AnalysisStatus } from '../../../types';

const { width } = Dimensions.get('window');

const HairCheckDetailScreen = ({ navigation, route }: any) => {
  const { t, i18n } = useTranslation();
  const { check } = route.params;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const photos = [
    {
      id: 'front',
      label: t('hairCheck.photoTypes.front'),
      icon: 'happy-outline',
      url: check.photo_front,
    },
    {
      id: 'right45',
      label: t('hairCheck.photoTypes.right45'),
      icon: 'arrow-redo-outline',
      url: check.photo_right45,
    },
    {
      id: 'left45',
      label: t('hairCheck.photoTypes.left45'),
      icon: 'arrow-undo-outline',
      url: check.photo_left45,
    },
    {
      id: 'top',
      label: t('hairCheck.photoTypes.top'),
      icon: 'arrow-up-outline',
      url: check.photo_top,
    },
    {
      id: 'back',
      label: t('hairCheck.photoTypes.back'),
      icon: 'person-outline',
      url: check.photo_back,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR';
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

  const getStatusBgColor = (status?: AnalysisStatus) => {
    switch (status) {
      case 'good':
        return '#ECFDF5';
      case 'warning':
        return '#FFFBEB';
      case 'critical':
        return '#FEF2F2';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusText = (status?: AnalysisStatus) => {
    switch (status) {
      case 'good':
        return t('hairCheck.detail.status.good');
      case 'warning':
        return t('hairCheck.detail.status.warning');
      case 'critical':
        return t('hairCheck.detail.status.critical');
      default:
        return t('hairCheck.detail.status.unknown');
    }
  };

  const getStatusIconName = () => {
    if (check.status === 'pending') return 'time-outline';
    if (check.status === 'analyzing') return 'analytics-outline';
    if (check.status === 'completed') {
      switch (check.analysis_status) {
        case 'good':
          return 'checkmark-circle';
        case 'warning':
          return 'warning';
        case 'critical':
          return 'alert-circle';
        default:
          return 'bar-chart-outline';
      }
    }
    return 'bar-chart-outline';
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
      return t('hairCheck.detail.statusDescriptions.pending');
    }
    if (check.status === 'analyzing') {
      return t('hairCheck.detail.statusDescriptions.analyzing');
    }
    if (check.status === 'completed') {
      return check.analysis_notes || t('hairCheck.detail.statusDescriptions.completed');
    }
    return t('hairCheck.detail.statusDescriptions.unknown');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('hairCheck.detail.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tarih ve Durum */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text weight="regular" style={styles.infoLabel}>
                  {t('hairCheck.detail.date')}
                </Text>
                <Text weight="semibold" style={styles.infoValue}>
                  {formatDate(check.created_at)}
                </Text>
              </View>
            </View>
            {check.status === 'completed' && check.analysis_status ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBgColor(check.analysis_status) },
                ]}
              >
                <Icon
                  name={getStatusIconName()}
                  size={16}
                  color={getStatusColor(check.analysis_status)}
                />
                <Text
                  weight="semibold"
                  style={[
                    styles.statusText,
                    { color: getStatusColor(check.analysis_status) },
                  ]}
                >
                  {getStatusText(check.analysis_status)}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      check.status === 'pending' ? '#FFFBEB' : '#EFF6FF',
                  },
                ]}
              >
                <Icon
                  name={getStatusIconName()}
                  size={16}
                  color={getStatusIconColor()}
                />
                <Text
                  weight="semibold"
                  style={[
                    styles.statusText,
                    {
                      color:
                        check.status === 'pending' ? '#92400E' : '#1E40AF',
                    },
                  ]}
                >
                  {check.status === 'pending' 
                    ? t('hairCheck.detail.statusTitles.pendingShort')
                    : t('hairCheck.detail.statusTitles.analyzingShort')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Analiz Sonucu */}
        {check.status === 'completed' && check.analysis_score && (
          <View style={styles.section}>
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Text weight="bold" style={styles.scoreTitle}>
                  {t('hairCheck.detail.analysisResult')}
                </Text>
              </View>
              <View style={styles.scoreContent}>
                <View style={styles.scoreCircleContainer}>
                  <View
                    style={[
                      styles.scoreCircle,
                      { borderColor: getStatusColor(check.analysis_status) },
                    ]}
                  >
                    <Text weight="bold" style={styles.scoreNumber}>
                      {check.analysis_score}
                    </Text>
                    <Text weight="regular" style={styles.scoreLabel}>
                      /100
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreInfo}>
                  <Text weight="regular" style={styles.scoreDescription}>
                    {getStatusDescription()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Durum Açıklaması */}
        {check.status !== 'completed' && (
          <View style={styles.section}>
            <View style={styles.statusCard}>
              <View
                style={[
                  styles.statusIconContainer,
                  {
                    backgroundColor:
                      check.status === 'pending' ? '#FFFBEB' : '#EFF6FF',
                  },
                ]}
              >
                <Icon
                  name={getStatusIconName()}
                  size={24}
                  color={getStatusIconColor()}
                />
              </View>
              <View style={styles.statusContent}>
                <Text weight="semibold" style={styles.statusCardTitle}>
                  {check.status === 'pending'
                    ? t('hairCheck.detail.statusTitles.pending')
                    : t('hairCheck.detail.statusTitles.analyzing')}
                </Text>
                <Text weight="regular" style={styles.statusCardText}>
                  {getStatusDescription()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Fotoğraflar */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('hairCheck.detail.photos')}
          </Text>
          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoCard}
                onPress={() => setSelectedPhoto(photo.url)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <View style={styles.photoLabelContainer}>
                    <Icon name={photo.icon} size={16} color="#FFFFFF" />
                    <Text weight="semibold" style={styles.photoLabel}>
                      {photo.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Öneriler */}
        {check.status === 'completed' && check.recommendations && (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('hairCheck.detail.recommendations')}
            </Text>
            <View style={styles.recommendationsCard}>
              <Icon name="bulb-outline" size={24} color="#1E40AF" />
              <Text weight="regular" style={styles.recommendationsText}>
                {check.recommendations}
              </Text>
            </View>
          </View>
        )}

        {/* Genel Öneriler */}
        {check.status !== 'completed' && (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('hairCheck.detail.generalRecommendations')}
            </Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Icon name="water-outline" size={20} color="#01213D" />
                </View>
                <View style={styles.tipContent}>
                  <Text weight="semibold" style={styles.tipTitle}>
                    {t('hairCheck.detail.tips.water.title')}
                  </Text>
                  <Text weight="regular" style={styles.tipDescription}>
                    {t('hairCheck.detail.tips.water.description')}
                  </Text>
                </View>
              </View>
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Icon name="nutrition-outline" size={20} color="#10B981" />
                </View>
                <View style={styles.tipContent}>
                  <Text weight="semibold" style={styles.tipTitle}>
                    {t('hairCheck.detail.tips.nutrition.title')}
                  </Text>
                  <Text weight="regular" style={styles.tipDescription}>
                    {t('hairCheck.detail.tips.nutrition.description')}
                  </Text>
                </View>
              </View>
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Icon name="sunny-outline" size={20} color="#F59E0B" />
                </View>
                <View style={styles.tipContent}>
                  <Text weight="semibold" style={styles.tipTitle}>
                    {t('hairCheck.detail.tips.sun.title')}
                  </Text>
                  <Text weight="regular" style={styles.tipDescription}>
                    {t('hairCheck.detail.tips.sun.description')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fotoğraf Modal */}
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
                <View style={styles.closeButtonInner}>
                  <Icon name="close" size={20} color="#1A1A1A" />
                </View>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
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
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  scoreHeader: {
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreCircleContainer: {
    marginBottom: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  scoreNumber: {
    fontSize: 32,
    color: '#1A1A1A',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scoreInfo: {
    width: '100%',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContent: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  statusCardText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: (width - 52) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  photoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  recommendationsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  recommendationsText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    top: -50,
    right: 0,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
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
