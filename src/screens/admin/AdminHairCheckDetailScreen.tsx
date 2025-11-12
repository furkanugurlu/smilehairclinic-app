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
import { Text, LoadingModal } from '../../components';
import { HairCheck, AnalysisStatus } from '../../types';
import { supabase } from '../../config/supabase';

const { width } = Dimensions.get('window');

interface AdminHairCheckDetailScreenProps {
  navigation: any;
  route: {
    params: {
      check: HairCheck;
    };
  };
}

const AdminHairCheckDetailScreen: React.FC<AdminHairCheckDetailScreenProps> = ({ navigation, route }) => {
  const { check } = route.params;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analysisScore, setAnalysisScore] = useState(check.analysis_score?.toString() || '');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | undefined>(check.analysis_status);
  const [analysisNotes, setAnalysisNotes] = useState(check.analysis_notes || '');
  const [recommendations, setRecommendations] = useState(check.recommendations || '');
  const [loading, setLoading] = useState(false);

  const photos = [
    { id: 'front', label: 'Ön Görünüm', icon: 'happy-outline', iconColor: '#01213D', url: check.photo_front },
    { id: 'right45', label: 'Sağ 45°', icon: 'arrow-redo-outline', iconColor: '#10B981', url: check.photo_right45 },
    { id: 'left45', label: 'Sol 45°', icon: 'arrow-undo-outline', iconColor: '#10B981', url: check.photo_left45 },
    { id: 'top', label: 'Üst Görünüm', icon: 'arrow-up-outline', iconColor: '#F59E0B', url: check.photo_top },
    { id: 'back', label: 'Arka Görünüm', icon: 'person-outline', iconColor: '#8B5CF6', url: check.photo_back },
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
    if (!analysisScore || parseFloat(analysisScore) < 0 || parseFloat(analysisScore) > 100) {
      Alert.alert('Hata', 'Lütfen 0-100 arasında geçerli bir skor giriniz');
      return;
    }

    if (!analysisStatus) {
      Alert.alert('Hata', 'Lütfen analiz durumunu seçiniz');
      return;
    }

    if (!analysisNotes.trim()) {
      Alert.alert('Hata', 'Lütfen analiz notlarını giriniz');
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
        'Başarılı',
        'Analiz sonucu başarıyla kaydedildi',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Save analysis error:', error);
      Alert.alert('Hata', 'Analiz kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingModal visible={loading} message="Analiz kaydediliyor..." />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          Kontrol İnceleme
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hasta Bilgileri */}
        <View style={styles.section}>
          <View style={styles.patientCard}>
            <Icon name="person-circle" size={48} color="#01213D" style={styles.patientIcon} />
            <View style={styles.patientInfo}>
              <Text weight="semibold" style={styles.patientName}>
                {check.profiles?.full_name || 'İsimsiz Kullanıcı'}
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

        {/* Fotoğraflar */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Fotoğraflar</Text>
          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoCard}
                onPress={() => setSelectedPhoto(photo.url)}
              >
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <Icon name={photo.icon} size={20} color="#FFFFFF" style={styles.photoIcon} />
                  <Text weight="semibold" style={styles.photoLabel}>
                    {photo.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analiz Formu */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Analiz Sonucu</Text>

          {/* Skor */}
          <View style={styles.formGroup}>
            <Text weight="semibold" style={styles.label}>
              Saç Sağlığı Skoru (0-100)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 75"
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
              Analiz Durumu
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
                  İyi
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
                  Dikkat
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
                  Kritik
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analiz Notları */}
          <View style={styles.formGroup}>
            <Text weight="semibold" style={styles.label}>
              Analiz Notları *
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Saç sağlığı hakkında detaylı açıklama..."
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
              Öneriler (Opsiyonel)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Hastaya özel önerileriniz..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={recommendations}
              onChangeText={setRecommendations}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Kaydet Butonu */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAnalysis}
          disabled={loading}
        >
          <Icon name="checkmark-circle" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
          <Text weight="bold" style={styles.saveButtonText}>
            Analizi Kaydet ve Gönder
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
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
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
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  patientIcon: {
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  statusOptionActive: {
    backgroundColor: '#F9FAFB',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  saveButtonIcon: {
    marginRight: 4,
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

export default AdminHairCheckDetailScreen;

