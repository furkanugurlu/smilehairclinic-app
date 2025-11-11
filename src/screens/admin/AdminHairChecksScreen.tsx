import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, LoadingModal, FilterTabs, FilterOption } from '../../components';
import { supabase } from '../../config/supabase';
import { HairCheck, HairCheckStatus } from '../../types';

interface AdminHairChecksScreenProps {
  navigation: any;
}

const AdminHairChecksScreen: React.FC<AdminHairChecksScreenProps> = ({ navigation }) => {
  const [hairChecks, setHairChecks] = useState<HairCheck[]>([]);
  const [filteredHairChecks, setFilteredHairChecks] = useState<HairCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | HairCheckStatus>('all');

  useEffect(() => {
    fetchHairChecks();
  }, []);

  // Filtre değiştiğinde client-side filtreleme yap
  useEffect(() => {
    if (filter === 'all') {
      setFilteredHairChecks(hairChecks);
    } else {
      setFilteredHairChecks(hairChecks.filter(h => h.status === filter));
    }
  }, [filter, hairChecks]);

  const fetchHairChecks = async () => {
    try {
      setLoading(true);

      // Her zaman tüm kontrolleri getir, filtreleme client-side'da yapılacak
      const { data, error } = await supabase
        .from('hair_checks')
        .select('*, profiles!hair_checks_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHairChecks(data || []);
    } catch (error: any) {
      console.error('❌ Fetch hair checks error:', error);
      Alert.alert('Hata', 'Kontroller yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHairChecks();
    setRefreshing(false);
  }, []);

  const handleViewDetail = (check: HairCheck) => {
    navigation.navigate('HairCheckDetail', { check });
  };

  const getStatusColor = (status: HairCheckStatus) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'analyzing':
        return '#3B82F6';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: HairCheckStatus) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Beklemede';
      case 'analyzing':
        return 'Analiz Ediliyor';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

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

  // Filter options için data hazırla
  // Count değerleri her zaman tüm hairChecks'ten hesaplanır (filtreden bağımsız)
  const filterOptions: FilterOption[] = [
    {
      id: 'all',
      label: 'Tümü',
      icon: 'apps',
      color: '#666',
      count: hairChecks.length,
    },
    {
      id: 'pending',
      label: 'Bekleyen',
      icon: 'time',
      color: '#F59E0B',
      count: hairChecks.filter(h => h.status === 'pending').length,
    },
    {
      id: 'analyzing',
      label: 'Analiz Ediliyor',
      icon: 'analytics',
      color: '#3B82F6',
      count: hairChecks.filter(h => h.status === 'analyzing').length,
    },
    {
      id: 'completed',
      label: 'Tamamlandı',
      icon: 'checkmark-done',
      color: '#10B981',
      count: hairChecks.filter(h => h.status === 'completed').length,
    },
    {
      id: 'failed',
      label: 'Başarısız',
      icon: 'close-circle',
      color: '#EF4444',
      count: hairChecks.filter(h => h.status === 'failed').length,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>Saç Kontrolleri</Text>
      </View>

      {/* Filter Tabs Component */}
      <FilterTabs
        options={filterOptions}
        selectedFilter={filter}
        onFilterChange={(filterId) => setFilter(filterId as 'all' | HairCheckStatus)}
      />

     {loading && !refreshing ? <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#01213D" />
      </View> : <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHairChecks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔬</Text>
            <Text weight="semibold" style={styles.emptyTitle}>
              Kontrol Bulunamadı
            </Text>
            <Text weight="regular" style={styles.emptyText}>
              Bu filtrede kontrol bulunmuyor
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredHairChecks.map((check: any) => (
              <TouchableOpacity
                key={check.id}
                style={styles.checkCard}
                onPress={() => handleViewDetail(check)}
              >
                <View style={styles.checkHeader}>
                  <View style={styles.checkLeft}>
                    <Image
                      source={{ uri: check.photo_front }}
                      style={styles.thumbnail}
                    />
                    <View>
                      <Text weight="semibold" style={styles.patientName}>
                        {check.profiles?.full_name || 'İsimsiz Kullanıcı'}
                      </Text>
                      <Text weight="regular" style={styles.patientEmail}>
                        {check.profiles?.email}
                      </Text>
                      <Text weight="regular" style={styles.checkDate}>
                        {formatDate(check.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(check.status) + '20' },
                    ]}
                  >
                    <Text
                      weight="semibold"
                      style={[
                        styles.statusText,
                        { color: getStatusColor(check.status) },
                      ]}
                    >
                      {getStatusText(check.status)}
                    </Text>
                  </View>
                </View>

                {check.status === 'completed' && check.analysis_score && (
                  <View style={styles.scoreContainer}>
                    <View style={styles.scoreCircle}>
                      <Text weight="bold" style={styles.scoreNumber}>
                        {check.analysis_score}
                      </Text>
                      <Text weight="regular" style={styles.scoreLabel}>
                        /100
                      </Text>
                    </View>
                    {check.analysis_notes && (
                      <Text
                        weight="regular"
                        style={styles.analysisNotes}
                        numberOfLines={2}
                      >
                        {check.analysis_notes}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.viewButton}>
                  <Text weight="semibold" style={styles.viewButtonText}>
                    Detayları Görüntüle →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  checkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  patientName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  checkDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  scoreNumber: {
    fontSize: 20,
    color: '#3B82F6',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  analysisNotes: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  viewButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#3B82F6',
  },
});

export default AdminHairChecksScreen;

