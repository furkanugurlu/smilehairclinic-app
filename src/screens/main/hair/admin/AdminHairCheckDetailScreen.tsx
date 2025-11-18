import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text, LoadingModal } from '../../../../components';
import { HairCheck, AnalysisStatus } from '../../../../types';
import { supabase } from '../../../../config/supabase';

const { width } = Dimensions.get('window');

const AdminHairCheckDetailScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { check } = route.params;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analysisScore, setAnalysisScore] = useState(
    check.analysis_score?.toString() || '',
  );
  const [analysisStatus, setAnalysisStatus] = useState<
    AnalysisStatus | undefined
  >(check.analysis_status);
  const [analysisNotes, setAnalysisNotes] = useState(
    check.analysis_notes || '',
  );
  const [recommendations, setRecommendations] = useState(
    check.recommendations || '',
  );
  const [loading, setLoading] = useState(false);

  const photos = [
    {
      id: 'front',
      labelKey: 'adminHairCheckDetail.photoLabels.front',
      url: check.photo_front,
    },
    {
      id: 'right45',
      labelKey: 'adminHairCheckDetail.photoLabels.right45',
      url: check.photo_right45,
    },
    {
      id: 'left45',
      labelKey: 'adminHairCheckDetail.photoLabels.left45',
      url: check.photo_left45,
    },
    {
      id: 'top',
      labelKey: 'adminHairCheckDetail.photoLabels.top',
      url: check.photo_top,
    },
    {
      id: 'back',
      labelKey: 'adminHairCheckDetail.photoLabels.back',
      url: check.photo_back,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveAnalysis = async () => {
    // Validasyon
    if (
      !analysisScore ||
      parseFloat(analysisScore) < 0 ||
      parseFloat(analysisScore) > 100
    ) {
      Alert.alert(
        t('common.error'),
        t('adminHairCheckDetail.validation.scoreRequired'),
      );
      return;
    }

    if (!analysisStatus) {
      Alert.alert(
        t('common.error'),
        t('adminHairCheckDetail.validation.statusRequired'),
      );
      return;
    }

    if (!analysisNotes.trim()) {
      Alert.alert(
        t('common.error'),
        t('adminHairCheckDetail.validation.notesRequired'),
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('hair_checks')
        .update({
          status: 'completed',
          analysis_score: parseFloat(analysisScore),
          analysis_status: analysisStatus,
          analysis_notes: analysisNotes.trim(),
          recommendations: recommendations.trim() || null,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', check.id);

      if (error) throw error;

      Alert.alert(
        t('adminHairCheckDetail.saveSuccess'),
        t('adminHairCheckDetail.saveSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ Save analysis error:', error);
      Alert.alert(
        t('adminHairCheckDetail.saveError'),
        t('adminHairCheckDetail.saveErrorMessage'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingModal
        visible={loading}
        message={t('adminHairCheckDetail.saving')}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('adminHairCheckDetail.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Hasta Bilgileri */}
      <View style={styles.patientSection}>
        <View style={styles.patientCard}>
          <Icon
            name="person-circle"
            size={48}
            color="#666"
            style={styles.patientIcon}
          />
          <View style={styles.patientInfo}>
            <Text weight="semibold" style={styles.patientName}>
              {check.profiles?.full_name ||
                t('admin.hairChecks.unnamedUser')}
            </Text>
            <Text weight="regular" style={styles.patientEmail}>
              {check.profiles?.email}
            </Text>
            <Text weight="regular" style={styles.patientDate}>
              {formatDate(check.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Fotoğraflar */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('adminHairCheckDetail.photos')}
          </Text>
          <View style={styles.photosGrid}>
            {photos.map(photo => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoCard}
                onPress={() => setSelectedPhoto(photo.url)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <Text weight="semibold" style={styles.photoLabel}>
                    {t(photo.labelKey)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analiz Formu */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('adminHairCheckDetail.analysisResult')}
          </Text>

          {/* Skor */}
          <View style={styles.formGroup}>
            <Text weight="semibold" style={styles.label}>
              {t('adminHairCheckDetail.hairHealthScore')}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('adminHairCheckDetail.scorePlaceholder')}
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={analysisScore}
              onChangeText={setAnalysisScore}
              maxLength={3}
            />
          </View>

          {/* Durum Seçimi */}
          <View style={styles.formGroup}>
            <Text weight="semibold" style={styles.label}>
              {t('adminHairCheckDetail.analysisStatus')}
            </Text>
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  analysisStatus === 'good' && styles.statusOptionActive,
                  { borderColor: '#10B981' },
                ]}
                onPress={() => setAnalysisStatus('good')}
              >
                <Icon
                  name="checkmark-circle"
                  size={24}
                  color={analysisStatus === 'good' ? '#10B981' : '#999'}
                />
                <Text
                  weight="semibold"
                  style={[
                    styles.statusOptionText,
                    analysisStatus === 'good' && { color: '#10B981' },
                  ]}
                >
                  {t('adminHairCheckDetail.statusLabels.good')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  analysisStatus === 'warning' && styles.statusOptionActive,
                  { borderColor: '#F59E0B' },
                ]}
                onPress={() => setAnalysisStatus('warning')}
              >
                <Icon
                  name="warning"
                  size={24}
                  color={analysisStatus === 'warning' ? '#F59E0B' : '#999'}
                />
                <Text
                  weight="semibold"
                  style={[
                    styles.statusOptionText,
                    analysisStatus === 'warning' && { color: '#F59E0B' },
                  ]}
                >
                  {t('adminHairCheckDetail.statusLabels.warning')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  analysisStatus === 'critical' && styles.statusOptionActive,
                  { borderColor: '#EF4444' },
                ]}
                onPress={() => setAnalysisStatus('critical')}
              >
                <Icon
                  name="alert-circle"
                  size={24}
                  color={analysisStatus === 'critical' ? '#EF4444' : '#999'}
                />
                <Text
                  weight="semibold"
                  style={[
                    styles.statusOptionText,
                    analysisStatus === 'critical' && { color: '#EF4444' },
                  ]}
                >
                  {t('adminHairCheckDetail.statusLabels.critical')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analiz Notları */}
          <View style={styles.formGroup}>
            <Text weight="semibold" style={styles.label}>
              {t('adminHairCheckDetail.analysisNotes')} *
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('adminHairCheckDetail.analysisNotesPlaceholder')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={analysisNotes}
              onChangeText={setAnalysisNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Öneriler */}
          <View style={styles.formGroup}>
            <Text weight="semibold" style={styles.label}>
              {t('adminHairCheckDetail.recommendations')}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('adminHairCheckDetail.recommendationsPlaceholder')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={recommendations}
              onChangeText={setRecommendations}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Kaydet Butonu */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveAnalysis}
          disabled={loading}
        >
          <Text weight="bold" style={styles.saveButtonText}>
            {t('adminHairCheckDetail.saveAndSend')}
          </Text>
        </TouchableOpacity>
      </View>

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
  patientSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientIcon: {
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  patientDate: {
    fontSize: 13,
    color: '#999',
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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  photoLabel: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  statusOptionActive: {
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default AdminHairCheckDetailScreen;
