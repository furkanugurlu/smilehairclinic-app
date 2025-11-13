import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  // Sayfa focus olduğunda (geri dönüldüğünde veya refresh parametresi ile) verileri yenile
  useFocusEffect(
    useCallback(() => {
      fetchHairChecks();
    }, [user?.id]),
  );

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
    const completedChecks = checks.filter(
      c => c.status === 'completed' && c.analysis_score,
    );
    const totalChecks = checks.length;

    let averageScore = 0;
    if (completedChecks.length > 0) {
      const sum = completedChecks.reduce(
        (acc, check) => acc + (check.analysis_score || 0),
        0,
      );
      averageScore = Math.round(sum / completedChecks.length);
    }

    let lastCheckDate = '';
    if (checks.length > 0) {
      const lastDate = new Date(checks[0].created_at);
      lastCheckDate = lastDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
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

  const handleProfilePress = () => {
    navigation.navigate('Profile');
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
        return t('home.status.good');
      case 'warning':
        return t('home.status.warning');
      case 'critical':
        return t('home.status.critical');
      default:
        return t('home.status.pending');
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

  return (
    <SafeAreaView style={styles.container}>
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text weight="regular" style={styles.greeting}>
                {t('common.hello')},
              </Text>
              <Text weight="bold" style={styles.userName}>
                {user?.full_name || t('common.user')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text weight="bold" style={styles.avatarText}>
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Hero Section - Hair Check */}
          <View style={styles.heroSection}>
            <View style={styles.heroCard}>
              <View style={styles.heroIconContainer}>
                <Icon name="analytics-outline" size={40} color="#FFFFFF" />
              </View>
              <Text weight="bold" style={styles.heroTitle}>
                {t('hairCheck.title')}
              </Text>
              <Text weight="regular" style={styles.heroDescription}>
                {t('hairCheck.startDescription')}
              </Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={handleStartCheck}
              >
                <Text weight="bold" style={styles.heroButtonText}>
                  {t('hairCheck.start')}
                </Text>
                <Icon name="arrow-forward" size={18} color="#01213D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Last Check Result or Check List */}
          {lastCheck && lastCheck.status === 'completed' ? (
            <View style={styles.section}>
              <Text weight="bold" style={styles.sectionTitle}>
                {t('home.recentChecks')}
              </Text>
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
                          {
                            backgroundColor: getStatusColor(
                              lastCheck.analysis_status,
                            ),
                          },
                        ]}
                      />
                      <Text
                        weight="semibold"
                        style={[
                          styles.statusText,
                          { color: getStatusColor(lastCheck.analysis_status) },
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
                  {lastCheck.analysis_notes || t('hairCheck.analyzing')}
                </Text>
                <TouchableOpacity
                  style={styles.resultButton}
                  onPress={() => handleViewCheckDetail(lastCheck)}
                >
                  <Text weight="semibold" style={styles.resultButtonText}>
                    {t('hairCheck.viewDetail')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : hairChecks.length > 0 ? (
            <View style={styles.section}>
              <Text weight="bold" style={styles.sectionTitle}>
                {t('hairCheck.history')}
              </Text>
              {hairChecks.map(check => (
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
                            <Icon
                              name="time-outline"
                              size={14}
                              color="#F59E0B"
                              style={styles.checkStatusIcon}
                            />
                            <Text
                              weight="medium"
                              style={styles.checkStatusText}
                            >
                              {t('common.analyzing')}
                            </Text>
                          </>
                        )}
                        {check.status === 'analyzing' && (
                          <>
                            <Icon
                              name="analytics-outline"
                              size={14}
                              color="#01213D"
                              style={styles.checkStatusIcon}
                            />
                            <Text
                              weight="medium"
                              style={styles.checkStatusText}
                            >
                              {t('hairCheck.analyzing')}
                            </Text>
                          </>
                        )}
                        {check.status === 'completed' && (
                          <>
                            <View
                              style={[
                                styles.statusDot,
                                {
                                  backgroundColor: getStatusColor(
                                    check.analysis_status,
                                  ),
                                },
                              ]}
                            />
                            <Text
                              weight="medium"
                              style={[
                                styles.checkStatusText,
                                {
                                  color: getStatusColor(check.analysis_status),
                                },
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
                  {check.recommendations && (
                    <View style={styles.checkRecommendations}>
                      <Icon
                        name="bulb"
                        size={14}
                        color="#F59E0B"
                        style={styles.checkRecommendationsIcon}
                      />
                      <Text
                        weight="regular"
                        style={styles.checkRecommendationsText}
                        numberOfLines={2}
                      >
                        {check.recommendations}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <Text weight="bold" style={styles.sectionTitle}>
                {t('hairCheck.history')}
              </Text>
              <View style={styles.emptyCard}>
                <Icon
                  name="bar-chart-outline"
                  size={64}
                  color="#D1D5DB"
                  style={styles.emptyIcon}
                />
                <Text weight="medium" style={styles.emptyTitle}>
                  {t('home.noChecks')}
                </Text>
                <Text weight="regular" style={styles.emptyDescription}>
                  {t('hairCheck.startDescription')}
                </Text>
              </View>
            </View>
          )}

          {/* Statistics */}
          {hairChecks.length > 0 && (
            <View style={styles.section}>
              <Text weight="bold" style={styles.sectionTitle}>
                {t('home.stats.totalChecks')}
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Icon
                    name="bar-chart-outline"
                    size={28}
                    color="#01213D"
                    style={styles.statIcon}
                  />
                  <Text weight="bold" style={styles.statNumber}>
                    {stats.totalChecks}
                  </Text>
                  <Text weight="regular" style={styles.statLabel}>
                    {t('home.totalChecks')}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Icon
                    name={
                      stats.improvement > 0
                        ? 'trending-up-outline'
                        : stats.improvement < 0
                        ? 'trending-down-outline'
                        : 'remove-outline'
                    }
                    size={28}
                    color={
                      stats.improvement > 0
                        ? '#10B981'
                        : stats.improvement < 0
                        ? '#EF4444'
                        : '#666'
                    }
                    style={styles.statIcon}
                  />
                  <Text
                    weight="bold"
                    style={[
                      styles.statNumber,
                      {
                        color:
                          stats.improvement > 0
                            ? '#10B981'
                            : stats.improvement < 0
                            ? '#EF4444'
                            : '#666',
                      },
                    ]}
                  >
                    {stats.improvement !== 0
                      ? (stats.improvement > 0 ? '+' : '') + stats.improvement
                      : '-'}
                  </Text>
                  <Text weight="regular" style={styles.statLabel}>
                    {t('home.improvement')}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Icon
                    name="calendar-outline"
                    size={28}
                    color="#01213D"
                    style={styles.statIcon}
                  />
                  <Text weight="bold" style={styles.statNumber}>
                    {stats.lastCheckDate || '-'}
                  </Text>
                  <Text weight="regular" style={styles.statLabel}>
                    {t('home.lastCheckDate')}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Icon
                    name="star-outline"
                    size={28}
                    color="#01213D"
                    style={styles.statIcon}
                  />
                  <Text weight="bold" style={styles.statNumber}>
                    {stats.averageScore || '-'}
                  </Text>
                  <Text weight="regular" style={styles.statLabel}>
                    {t('home.averageScore')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Öneriler */}
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('home.recommendations')}
            </Text>
            <View style={styles.tipCard}>
              <Icon
                name="bulb-outline"
                size={32}
                color="#01213D"
                style={styles.tipIcon}
              />
              <View style={styles.tipContent}>
                <Text weight="semibold" style={styles.tipTitle}>
                  {t('home.regularCheckTitle')}
                </Text>
                <Text weight="regular" style={styles.tipDescription}>
                  {t('home.regularCheckDesc')}
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <Icon
                name="sunny-outline"
                size={32}
                color="#01213D"
                style={styles.tipIcon}
              />
              <View style={styles.tipContent}>
                <Text weight="semibold" style={styles.tipTitle}>
                  {t('home.sunProtectionTitle')}
                </Text>
                <Text weight="regular" style={styles.tipDescription}>
                  {t('home.sunProtectionDesc')}
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <Icon
                name="water-outline"
                size={32}
                color="#01213D"
                style={styles.tipIcon}
              />
              <View style={styles.tipContent}>
                <Text weight="semibold" style={styles.tipTitle}>
                  {t('home.waterIntakeTitle')}
                </Text>
                <Text weight="regular" style={styles.tipDescription}>
                  {t('home.waterIntakeDesc')}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('home.quickActions')}
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('AppointmentCreate')}
              >
                <Icon
                  name="calendar-outline"
                  size={32}
                  color="#01213D"
                  style={styles.actionIcon}
                />
                <Text weight="semibold" style={styles.actionText}>
                  {t('home.makeAppointment')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Messages')}
              >
                <Icon
                  name="chatbubbles-outline"
                  size={32}
                  color="#01213D"
                  style={styles.actionIcon}
                />
                <Text weight="semibold" style={styles.actionText}>
                  {t('common.expertSupport')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    minHeight: 76,
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
    backgroundColor: '#01213D',
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
    backgroundColor: '#01213D',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#01213D',
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
    color: '#01213D',
    fontSize: 16,
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
    color: '#01213D',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
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
    color: '#01213D',
  },
  checkRecommendations: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  checkRecommendationsIcon: {
    marginTop: 2,
  },
  checkRecommendationsText: {
    flex: 1,
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
});

export default HomeScreen;
