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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text, LoadingModal, FilterTabs, FilterOption } from '../../../../components';
import { supabase } from '../../../../config/supabase';
import { HairCheck, HairCheckStatus } from '../../../../types';

interface AdminHairChecksScreenProps {
  navigation: any;
}

const AdminHairChecksScreen: React.FC<AdminHairChecksScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [hairChecks, setHairChecks] = useState<HairCheck[]>([]);
  const [filteredHairChecks, setFilteredHairChecks] = useState<HairCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | HairCheckStatus>('all');

  // Sayfa focus olduğunda (geri dönüldüğünde) verileri yenile
  useFocusEffect(
    useCallback(() => {
      fetchHairChecks();
    }, []),
  );

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
      Alert.alert(t('common.error'), t('adminHairChecks.loadError'));
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
    navigation.navigate('AdminHairCheckDetail', { check });
  };

  const getStatusColor = (status: HairCheckStatus) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'analyzing':
        return '#01213D';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: HairCheckStatus) => {
    return t(`adminHairChecks.status.${status}`);
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
      label: t('adminHairChecks.filters.all'),
      icon: 'apps',
      color: '#666',
      count: hairChecks.length,
    },
    {
      id: 'pending',
      label: t('adminHairChecks.filters.pending'),
      icon: 'time',
      color: '#F59E0B',
      count: hairChecks.filter(h => h.status === 'pending').length,
    },
    {
      id: 'analyzing',
      label: t('adminHairChecks.filters.analyzing'),
      icon: 'analytics',
      color: '#01213D',
      count: hairChecks.filter(h => h.status === 'analyzing').length,
    },
    {
      id: 'completed',
      label: t('adminHairChecks.filters.completed'),
      icon: 'checkmark-done',
      color: '#10B981',
      count: hairChecks.filter(h => h.status === 'completed').length,
    },
    {
      id: 'failed',
      label: t('adminHairChecks.filters.failed'),
      icon: 'close-circle',
      color: '#EF4444',
      count: hairChecks.filter(h => h.status === 'failed').length,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>
          {t('adminHairChecks.title')}
        </Text>
      </View>

      {/* Filter Tabs Component */}
      <FilterTabs
        options={filterOptions}
        selectedFilter={filter}
        onFilterChange={filterId =>
          setFilter(filterId as 'all' | HairCheckStatus)
        }
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#01213D" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredHairChecks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="analytics-outline"
                size={64}
                color="#D1D5DB"
                style={styles.emptyIcon}
              />
              <Text weight="semibold" style={styles.emptyTitle}>
                {t('adminHairChecks.noChecksFound')}
              </Text>
              <Text weight="regular" style={styles.emptyText}>
                {t('adminHairChecks.noChecksInFilter')}
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
                  {/* Header: Kullanıcı Bilgisi + Durum */}
                  <View style={styles.checkHeader}>
                    <View style={styles.checkLeft}>
                      <Image
                        source={{ uri: check.photo_front }}
                        style={styles.thumbnail}
                      />
                      <View style={styles.userInfo}>
                        <Text weight="semibold" style={styles.patientName}>
                          {check.profiles?.full_name ||
                            t('admin.hairChecks.unnamedUser')}
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
                        {
                          backgroundColor: getStatusColor(check.status) + '20',
                        },
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

                  {/* Analiz Detayları: Skor + Durum */}
                  {check.status === 'completed' &&
                    (check.analysis_score || check.analysis_status) && (
                      <View style={styles.analysisSection}>
                        {check.analysis_score && (
                          <View style={styles.scoreRow}>
                            <View style={styles.scoreCircle}>
                              <Text weight="bold" style={styles.scoreNumber}>
                                {check.analysis_score}
                              </Text>
                              <Text weight="regular" style={styles.scoreLabel}>
                                /100
                              </Text>
                            </View>
                            {check.analysis_status && (
                              <View style={styles.statusRow}>
                                <Icon
                                  name="analytics"
                                  size={14}
                                  color="#8B5CF6"
                                />
                                <Text
                                  weight="medium"
                                  style={styles.statusLabel}
                                >
                                  {check.analysis_status &&
                                    t(
                                      `adminHairChecks.analysisStatus.${check.analysis_status}`,
                                    )}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Notlar */}
                        {check.analysis_notes && (
                          <Text
                            weight="regular"
                            style={styles.notesText}
                            numberOfLines={2}
                          >
                            {check.analysis_notes}
                          </Text>
                        )}

                        {/* Öneriler */}
                        {check.recommendations && (
                          <View style={styles.recommendationsBadge}>
                            <Icon
                              name="bulb-outline"
                              size={12}
                              color="#F59E0B"
                            />
                            <Text
                              weight="regular"
                              style={styles.recommendationsBadgeText}
                              numberOfLines={2}
                            >
                              {check.recommendations}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                  {/* Arrow Icon */}
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                    style={styles.arrowIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 68,
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
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  checkDate: {
    fontSize: 11,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
  },
  analysisSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01213D',
  },
  scoreNumber: {
    fontSize: 18,
    color: '#01213D',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  recommendationsBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  recommendationsBadgeText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 14,
  },
  arrowIcon: {
    position: 'absolute',
    right: 14,
    bottom: 14,
  },
});

export default AdminHairChecksScreen;
