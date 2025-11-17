import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text, LoadingModal } from '../../../../components';
import { supabase } from '../../../../config/supabase';
import { useAuthStore } from '../../../../store/authStore';
import { Appointment, HairCheck } from '../../../../types';

interface AdminDashboardScreenProps {
  navigation: any;
}

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  totalHairChecks: number;
  pendingHairChecks: number;
  totalUsers: number;
  unreadMessages: number;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalHairChecks: 0,
    pendingHairChecks: 0,
    totalUsers: 0,
    unreadMessages: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    [],
  );
  const [recentHairChecks, setRecentHairChecks] = useState<HairCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sayfa focus olduğunda (geri dönüldüğünde) verileri yenile
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, []),
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Randevu istatistikleri
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const pendingAppointments =
        appointments?.filter(a => a.status === 'pending').length || 0;

      // Saç kontrol istatistikleri
      const { data: hairChecks, error: hairChecksError } = await supabase
        .from('hair_checks')
        .select('*')
        .order('created_at', { ascending: false });

      if (hairChecksError) throw hairChecksError;

      const pendingHairChecks =
        hairChecks?.filter(h => h.status === 'pending').length || 0;

      // Kullanıcı sayısı
      const { count: userCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false);

      if (usersError) throw usersError;

      // Okunmamış mesajlar
      const { count: unreadCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_from_admin', false)
        .eq('is_read', false);

      if (messagesError) throw messagesError;

      setStats({
        totalAppointments: appointments?.length || 0,
        pendingAppointments,
        totalHairChecks: hairChecks?.length || 0,
        pendingHairChecks,
        totalUsers: userCount || 0,
        unreadMessages: unreadCount || 0,
      });

      setRecentAppointments(appointments?.slice(0, 5) || []);
      setRecentHairChecks(hairChecks?.slice(0, 5) || []);
    } catch (error: any) {
      console.error('❌ Dashboard data fetch error:', error);
      Alert.alert(t('common.error'), t('adminDashboard.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text weight="regular" style={styles.greeting}>
            {t('adminDashboard.greeting')}
          </Text>
          <Text weight="bold" style={styles.userName}>
            {t('adminDashboard.welcome', { name: user?.full_name || 'Admin' })}
          </Text>
        </View>
      </View>

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
          {/* İstatistikler */}
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('adminDashboard.overview')}
            </Text>
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('AdminAppointments')}
              >
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: '#DBEAFE' },
                  ]}
                >
                  <Icon name="calendar-outline" size={24} color="#01213D" />
                </View>
                <Text weight="bold" style={styles.statNumber}>
                  {stats.pendingAppointments}
                </Text>
                <Text weight="regular" style={styles.statLabel}>
                  {t('adminDashboard.pendingAppointment')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('AdminHairChecks')}
              >
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: '#FCE7F3' },
                  ]}
                >
                  <Icon name="analytics-outline" size={24} color="#EC4899" />
                </View>
                <Text weight="bold" style={styles.statNumber}>
                  {stats.pendingHairChecks}
                </Text>
                <Text weight="regular" style={styles.statLabel}>
                  {t('adminDashboard.pendingCheck')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('AdminMessages')}
              >
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: '#FEF3C7' },
                  ]}
                >
                  <Icon name="chatbubbles-outline" size={24} color="#F59E0B" />
                </View>
                <Text weight="bold" style={styles.statNumber}>
                  {stats.unreadMessages}
                </Text>
                <Text weight="regular" style={styles.statLabel}>
                  {t('adminDashboard.unreadMessage')}
                </Text>
              </TouchableOpacity>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: '#D1FAE5' },
                  ]}
                >
                  <Icon name="people-outline" size={24} color="#10B981" />
                </View>
                <Text weight="bold" style={styles.statNumber}>
                  {stats.totalUsers}
                </Text>
                <Text weight="regular" style={styles.statLabel}>
                  {t('adminDashboard.totalUsers')}
                </Text>
              </View>
            </View>
          </View>

          {/* Son Randevular */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text weight="bold" style={styles.sectionTitle}>
                {t('adminDashboard.recentAppointments')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminAppointments')}
              >
                <Text weight="semibold" style={styles.seeAllText}>
                  {t('adminDashboard.seeAll')}
                </Text>
              </TouchableOpacity>
            </View>

            {recentAppointments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon
                  name="calendar-outline"
                  size={48}
                  color="#D1D5DB"
                  style={styles.emptyIcon}
                />
                <Text weight="medium" style={styles.emptyText}>
                  {t('adminDashboard.noAppointmentsYet')}
                </Text>
              </View>
            ) : (
              recentAppointments.map(appointment => (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.itemCard}
                  onPress={() => navigation.navigate('AdminAppointments')}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            appointment.status === 'pending'
                              ? '#F59E0B'
                              : appointment.status === 'confirmed'
                              ? '#10B981'
                              : '#6B7280',
                        },
                      ]}
                    />
                    <View>
                      <Text weight="semibold" style={styles.itemTitle}>
                        {appointment.appointment_date}
                      </Text>
                      <Text weight="regular" style={styles.itemSubtitle}>
                        {appointment.appointment_time}
                      </Text>
                    </View>
                  </View>
                  <Text weight="regular" style={styles.itemTime}>
                    {formatDate(appointment.created_at)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Son Kontroller */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text weight="bold" style={styles.sectionTitle}>
                {t('adminDashboard.recentChecks')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminHairChecks')}
              >
                <Text weight="semibold" style={styles.seeAllText}>
                  {t('adminDashboard.seeAll')}
                </Text>
              </TouchableOpacity>
            </View>

            {recentHairChecks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon
                  name="analytics-outline"
                  size={48}
                  color="#D1D5DB"
                  style={styles.emptyIcon}
                />
                <Text weight="medium" style={styles.emptyText}>
                  {t('adminDashboard.noChecksYet')}
                </Text>
              </View>
            ) : (
              recentHairChecks.map(check => (
                <TouchableOpacity
                  key={check.id}
                  style={styles.itemCard}
                  onPress={() => navigation.navigate('AdminHairChecks')}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            check.status === 'pending'
                              ? '#F59E0B'
                              : check.status === 'completed'
                              ? '#10B981'
                              : '#6B7280',
                        },
                      ]}
                    />
                    <View>
                      <Text weight="semibold" style={styles.itemTitle}>
                        {t('adminDashboard.hairCheck')}
                      </Text>
                      <Text weight="regular" style={styles.itemSubtitle}>
                        {check.status === 'pending'
                          ? t('adminHairChecks.status.pending')
                          : t('adminHairChecks.status.completed')}
                      </Text>
                    </View>
                  </View>
                  <Text weight="regular" style={styles.itemTime}>
                    {formatDate(check.created_at)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Hızlı Aksiyonlar */}
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>
              {t('adminDashboard.quickActions')}
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminAppointments')}
              >
                <Icon
                  name="calendar-outline"
                  size={32}
                  color="#01213D"
                  style={styles.actionIcon}
                />
                <Text weight="semibold" style={styles.actionText}>
                  {t('adminDashboard.appointments')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminHairChecks')}
              >
                <Icon
                  name="analytics-outline"
                  size={32}
                  color="#01213D"
                  style={styles.actionIcon}
                />
                <Text weight="semibold" style={styles.actionText}>
                  {t('adminDashboard.checks')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminMessages')}
              >
                <Icon
                  name="chatbubbles-outline"
                  size={32}
                  color="#01213D"
                  style={styles.actionIcon}
                />
                <Text weight="semibold" style={styles.actionText}>
                  {t('adminDashboard.messages')}
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    height: 68,
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
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#01213D',
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
    marginBottom: 12,
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  itemCard: {
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  itemTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginRight: 8,
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
    fontSize: 13,
    color: '#1A1A1A',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
