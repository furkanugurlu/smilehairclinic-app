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
import Icon from 'react-native-vector-icons/Ionicons';
import { Text, LoadingModal, FilterTabs, FilterOption } from '../../components';
import { supabase } from '../../config/supabase';
import { Appointment, AppointmentStatus } from '../../types';

interface AdminAppointmentsScreenProps {
  navigation: any;
}

const AdminAppointmentsScreen: React.FC<AdminAppointmentsScreenProps> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filtre değiştiğinde client-side filtreleme yap
  useEffect(() => {
    if (filter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(a => a.status === filter));
    }
  }, [filter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Her zaman tüm randevuları getir, filtreleme client-side'da yapılacak
      const { data, error } = await supabase
        .from('appointments')
        .select('*, profiles!appointments_user_id_fkey(full_name, email)')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error: any) {
      console.error('❌ Fetch appointments error:', error);
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) throw error;

      Alert.alert('Başarılı', 'Randevu durumu güncellendi');
      fetchAppointments();
    } catch (error: any) {
      console.error('❌ Update appointment error:', error);
      Alert.alert('Hata', 'Randevu güncellenirken bir hata oluştu');
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'completed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı';
      case 'pending':
        return 'Beklemede';
      case 'cancelled':
        return 'İptal';
      case 'completed':
        return 'Tamamlandı';
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
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Filter options için data hazırla
  // Count değerleri her zaman tüm appointments'tan hesaplanır (filtreden bağımsız)
  const filterOptions: FilterOption[] = [
    {
      id: 'all',
      label: 'Tümü',
      icon: 'apps',
      color: '#666',
      count: appointments.length,
    },
    {
      id: 'pending',
      label: 'Bekleyen',
      icon: 'time',
      color: '#F59E0B',
      count: appointments.filter(a => a.status === 'pending').length,
    },
    {
      id: 'confirmed',
      label: 'Onaylı',
      icon: 'checkmark-circle',
      color: '#10B981',
      count: appointments.filter(a => a.status === 'confirmed').length,
    },
    {
      id: 'completed',
      label: 'Tamamlandı',
      icon: 'checkmark-done',
      color: '#6B7280',
      count: appointments.filter(a => a.status === 'completed').length,
    },
    {
      id: 'cancelled',
      label: 'İptal',
      icon: 'close-circle',
      color: '#EF4444',
      count: appointments.filter(a => a.status === 'cancelled').length,
    },
  ];

  console.log('appointments', appointments);
  console.log('filteredAppointments', filteredAppointments);
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>Randevular</Text>
      </View>

      {/* Filter Tabs Component */}
      <FilterTabs
        options={filterOptions}
        selectedFilter={filter}
        onFilterChange={(filterId) => setFilter(filterId as 'all' | AppointmentStatus)}
      />

      {loading && !refreshing ? <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#01213D" />
      </View> : <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text weight="semibold" style={styles.emptyTitle}>
              Randevu Bulunamadı
            </Text>
            <Text weight="regular" style={styles.emptyText}>
              Bu filtrede randevu bulunmuyor
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredAppointments.map((appointment: any) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View>
                    <Text weight="semibold" style={styles.patientName}>
                      {appointment.profiles?.full_name || 'İsimsiz Kullanıcı'}
                    </Text>
                    <Text weight="regular" style={styles.patientEmail}>
                      {appointment.profiles?.email}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(appointment.status) + '20' },
                    ]}
                  >
                    <Text
                      weight="semibold"
                      style={[
                        styles.statusText,
                        { color: getStatusColor(appointment.status) },
                      ]}
                    >
                      {getStatusText(appointment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.appointmentInfo}>
                  <Text weight="medium" style={styles.infoLabel}>
                    📅 {formatDate(appointment.appointment_date)}
                  </Text>
                  <Text weight="medium" style={styles.infoLabel}>
                    ⏰ {formatTime(appointment.appointment_time)}
                  </Text>
                </View>

                {appointment.patient_notes && (
                  <View style={styles.notesContainer}>
                    <Text weight="regular" style={styles.notesText}>
                      {appointment.patient_notes}
                    </Text>
                  </View>
                )}

                {appointment.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.confirmButton]}
                      onPress={() =>
                        Alert.alert(
                          'Randevuyu Onayla',
                          'Bu randevuyu onaylamak istediğinize emin misiniz?',
                          [
                            { text: 'İptal', style: 'cancel' },
                            {
                              text: 'Onayla',
                              onPress: () => handleStatusChange(appointment.id, 'confirmed'),
                            },
                          ]
                        )
                      }
                    >
                      <Text weight="semibold" style={styles.confirmButtonText}>
                        Onayla
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() =>
                        Alert.alert(
                          'Randevuyu İptal Et',
                          'Bu randevuyu iptal etmek istediğinize emin misiniz?',
                          [
                            { text: 'Hayır', style: 'cancel' },
                            {
                              text: 'İptal Et',
                              style: 'destructive',
                              onPress: () => handleStatusChange(appointment.id, 'cancelled'),
                            },
                          ]
                        )
                      }
                    >
                      <Text weight="semibold" style={styles.cancelButtonText}>
                        İptal Et
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {appointment.status === 'confirmed' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleStatusChange(appointment.id, 'completed')}
                  >
                    <Text weight="semibold" style={styles.completeButtonText}>
                      Tamamlandı Olarak İşaretle
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  appointmentInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#D1FAE5',
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#059669',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#DC2626',
  },
  completeButton: {
    backgroundColor: '#DBEAFE',
  },
  completeButtonText: {
    fontSize: 14,
    color: '#2563EB',
  },
});

export default AdminAppointmentsScreen;

