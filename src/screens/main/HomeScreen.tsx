import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Text, LoadingModal } from '../../components';
import { supabase } from '../../config/supabase';
import { HairCheck, AnalysisStatus } from '../../types';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  route?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const [hairChecks, setHairChecks] = useState<HairCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalChecks: 0,
    averageScore: 0,
    lastCheckDate: '',
    improvement: 0,
  });

  useEffect(() => {
    fetchHairChecks();
  }, []);

  useEffect(() => {
    if (route?.params?.refresh) {
      fetchHairChecks();
    }
  }, [route?.params?.refresh]);

  const fetchHairChecks = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('hair_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Hair checks yükleme hatası:', error);
        throw error;
      }

      console.log('✅ Hair checks yüklendi:', data?.length);
      setHairChecks(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHairChecks();
    setRefreshing(false);
  }, [user?.id]);

  const calculateStats = (checks: HairCheck[]) => {
    const completedChecks = checks.filter(c => c.status === 'completed' && c.analysis_score);
    const totalChecks = checks.length;
    
    let averageScore = 0;
    if (completedChecks.length > 0) {
      const sum = completedChecks.reduce((acc, check) => acc + (check.analysis_score || 0), 0);
      averageScore = Math.round(sum / completedChecks.length);
    }

    let lastCheckDate = '';
    if (checks.length > 0) {
      const lastDate = new Date(checks[0].created_at);
      lastCheckDate = lastDate.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long' 
      });
    }

    // İyileşme hesaplama (son 2 kontrol karşılaştırması)
    let improvement = 0;
    if (completedChecks.length >= 2) {
      const latest = completedChecks[0].analysis_score || 0;
      const previous = completedChecks[1].analysis_score || 0;
      improvement = latest - previous;
    }

    setStats({
      totalChecks,
      averageScore,
      lastCheckDate,
      improvement,
    });
  };

  const handleStartCheck = () => {
    console.log('🔬 Saç durumu kontrolü başlatılıyor...');
    navigation.navigate('HairCheck');
  };

  const handleViewCheckDetail = (check: HairCheck) => {
    navigation.navigate('HairCheckDetail', { check });
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
        return 'İyi';
      case 'warning':
        return 'Dikkat';
      case 'critical':
        return 'Kritik';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const lastCheck = hairChecks.length > 0 ? hairChecks[0] : null;

  if (loading && !refreshing) {
    return <LoadingModal visible={true} message="Yükleniyor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text weight="regular" style={styles.greeting}>Merhaba,</Text>
            <Text weight="bold" style={styles.userName}>{user?.full_name || 'Kullanıcı'}</Text>
          </View>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text weight="bold" style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        {/* Hero Section - Saç Durumu Kontrolü */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroIcon}>🔬</Text>
            </View>
            <Text weight="bold" style={styles.heroTitle}>
              Saç Durumu Kontrolü
            </Text>
            <Text weight="regular" style={styles.heroDescription}>
              Yapay zeka destekli saç analizi ile saç sağlığınızı hemen kontrol edin
            </Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={handleStartCheck}
            >
              <Text weight="bold" style={styles.heroButtonText}>
                Kontrol Başlat
              </Text>
              <Text style={styles.heroButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Son Kontrol Sonucu veya Kontrol Listesi */}
        {lastCheck && lastCheck.status === 'completed' ? (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>Son Kontrol Sonucu</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text weight="semibold" style={styles.resultDate}>
                    {formatDate(lastCheck.created_at)}
                  </Text>
                  <View style={styles.resultStatus}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(lastCheck.analysis_status) }
                      ]} 
                    />
                    <Text 
                      weight="semibold" 
                      style={[
                        styles.statusText,
                        { color: getStatusColor(lastCheck.analysis_status) }
                      ]}
                    >
                      {getStatusText(lastCheck.analysis_status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreContainer}>
                  <Text weight="bold" style={styles.scoreNumber}>
                    {lastCheck.analysis_score || '-'}
                  </Text>
                  <Text weight="regular" style={styles.scoreLabel}>
                    /100
                  </Text>
                </View>
              </View>
              <Text weight="regular" style={styles.resultNotes}>
                {lastCheck.analysis_notes || 'Analiz notları bekleniyor...'}
              </Text>
              <TouchableOpacity 
                style={styles.resultButton}
                onPress={() => handleViewCheckDetail(lastCheck)}
              >
                <Text weight="semibold" style={styles.resultButtonText}>
                  Detayları Gör
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : hairChecks.length > 0 ? (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>Kontrollerim</Text>
            {hairChecks.map((check) => (
              <TouchableOpacity 
                key={check.id}
                style={styles.checkCard}
                onPress={() => handleViewCheckDetail(check)}
              >
                <View style={styles.checkCardLeft}>
                  <Image 
                    source={{ uri: check.photo_front }} 
                    style={styles.checkThumbnail}
                  />
                  <View style={styles.checkInfo}>
                    <Text weight="semibold" style={styles.checkDate}>
                      {formatDate(check.created_at)}
                    </Text>
                    <View style={styles.checkStatusBadge}>
                      {check.status === 'pending' && (
                        <>
                          <Text style={styles.checkStatusIcon}>⏳</Text>
                          <Text weight="medium" style={styles.checkStatusText}>
                            İnceleniyor
                          </Text>
                        </>
                      )}
                      {check.status === 'analyzing' && (
                        <>
                          <Text style={styles.checkStatusIcon}>🔬</Text>
                          <Text weight="medium" style={styles.checkStatusText}>
                            Analiz Ediliyor
                          </Text>
                        </>
                      )}
                      {check.status === 'completed' && (
                        <>
                          <View 
                            style={[
                              styles.statusDot, 
                              { backgroundColor: getStatusColor(check.analysis_status) }
                            ]} 
                          />
                          <Text 
                            weight="medium" 
                            style={[
                              styles.checkStatusText,
                              { color: getStatusColor(check.analysis_status) }
                            ]}
                          >
                            {getStatusText(check.analysis_status)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                {check.analysis_score && (
                  <View style={styles.checkScore}>
                    <Text weight="bold" style={styles.checkScoreNumber}>
                      {check.analysis_score}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>Kontrol Geçmişi</Text>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text weight="medium" style={styles.emptyTitle}>
                Henüz kontrol yapılmadı
              </Text>
              <Text weight="regular" style={styles.emptyDescription}>
                İlk saç durumu kontrolünüzü yaparak saç sağlığınızı takip etmeye başlayın
              </Text>
            </View>
          </View>
        )}

        {/* İstatistikler */}
        {hairChecks.length > 0 && (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>İstatistikler</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text weight="bold" style={styles.statNumber}>{stats.totalChecks}</Text>
                <Text weight="regular" style={styles.statLabel}>Toplam Kontrol</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>
                  {stats.improvement > 0 ? '📈' : stats.improvement < 0 ? '📉' : '➖'}
                </Text>
                <Text 
                  weight="bold" 
                  style={[
                    styles.statNumber,
                    { color: stats.improvement > 0 ? '#10B981' : stats.improvement < 0 ? '#EF4444' : '#666' }
                  ]}
                >
                  {stats.improvement !== 0 ? (stats.improvement > 0 ? '+' : '') + stats.improvement : '-'}
                </Text>
                <Text weight="regular" style={styles.statLabel}>İyileşme</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📅</Text>
                <Text weight="bold" style={styles.statNumber}>
                  {stats.lastCheckDate || '-'}
                </Text>
                <Text weight="regular" style={styles.statLabel}>Son Kontrol</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text weight="bold" style={styles.statNumber}>
                  {stats.averageScore || '-'}
                </Text>
                <Text weight="regular" style={styles.statLabel}>Ortalama Skor</Text>
              </View>
            </View>
          </View>
        )}

        {/* Öneriler */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Öneriler</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text weight="semibold" style={styles.tipTitle}>
                Düzenli Kontrol
              </Text>
              <Text weight="regular" style={styles.tipDescription}>
                Saç sağlığınızı ayda bir kez kontrol ederek değişimleri takip edin
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🌞</Text>
            <View style={styles.tipContent}>
              <Text weight="semibold" style={styles.tipTitle}>
                Güneş Koruması
              </Text>
              <Text weight="regular" style={styles.tipDescription}>
                Saç derinizi güneşin zararlı etkilerinden koruyun
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💧</Text>
            <View style={styles.tipContent}>
              <Text weight="semibold" style={styles.tipTitle}>
                Yeterli Su Tüketimi
              </Text>
              <Text weight="regular" style={styles.tipDescription}>
                Günde en az 2 litre su tüketerek saç sağlığınızı destekleyin
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AppointmentCreate')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text weight="semibold" style={styles.actionText}>Randevu Al</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Messages')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text weight="semibold" style={styles.actionText}>Uzman Desteği</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    color: '#1A1A1A',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  heroButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  heroButtonIcon: {
    fontSize: 18,
    color: '#3B82F6',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 32,
    color: '#1A1A1A',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  resultNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  resultButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 32,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  checkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  checkCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  checkInfo: {
    flex: 1,
  },
  checkDate: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  checkStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkStatusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  checkStatusText: {
    fontSize: 13,
    color: '#666',
  },
  checkScore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkScoreNumber: {
    fontSize: 18,
    color: '#3B82F6',
  },
});

export default HomeScreen;

