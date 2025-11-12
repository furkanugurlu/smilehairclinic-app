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
import { Text, LoadingModal } from '../../components';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { Appointment, AppointmentStatus } from '../../types';

interface AppointmentsScreenProps {
  navigation: any;
}

const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sayfa focus olduğunda (geri dönüldüğünde) verileri yenile
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [user?.id])
  );

  const fetchAppointments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('❌ Randevular yükleme hatası:', error);
        throw error;
      }

      console.log('✅ Randevular yüklendi:', data?.length);
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
  }, [user?.id]);

  const handleCreateAppointment = () => {
    navigation.navigate('AppointmentCreate');
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    Alert.alert(
      'Randevu İptali',
      'Bu randevuyu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('appointments')
                .update({
                  status: 'cancelled',
                  cancelled_at: new Date().toISOString(),
                })
                .eq('id', appointment.id);

              if (error) throw error;

              Alert.alert('Başarılı', 'Randevunuz iptal edildi');
              fetchAppointments();
            } catch (error) {
              console.error('❌ Cancel appointment error:', error);
              Alert.alert('Hata', 'Randevu iptal edilirken bir hata oluştu');
            }
          },
        },
      ]
    );
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
        return 'İptal Edildi';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  const getStatusIconName = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done';
      default:
        return 'ellipse';
    }
  };

  const getServiceTitle = (serviceType: string) => {
    const serviceMap: Record<string, string> = {
      hair_transplant_consultation: 'Saç Ekimi Danışmanlığı',
      hair_analysis: 'Saç Analizi',
      hair_treatment: 'Saç Tedavisi',
      follow_up: 'Kontrol Randevusu',
      other: 'Diğer',
    };
    return serviceMap[serviceType] || serviceType;
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
    return timeString.substring(0, 5); // HH:MM
  };

  // Randevuları gelecek ve geçmiş olarak ayır
  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    return aptDate < now || apt.status === 'cancelled' || apt.status === 'completed';
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>Randevularım</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateAppointment}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

     {loading && !refreshing ? <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#01213D" />
      </View> : <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {appointments.length === 0 ? (
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={64} color="#D1D5DB" style={styles.emptyIcon} />
              <Text weight="semibold" style={styles.emptyTitle}>
                Randevu Bulunamadı
              </Text>
              <Text weight="regular" style={styles.emptyText}>
                Henüz bir randevunuz bulunmuyor. Yeni bir randevu oluşturmak için
                aşağıdaki butona tıklayın.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateAppointment}
              >
                <Text weight="semibold" style={styles.buttonText}>
                  Yeni Randevu Oluştur
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Gelecek Randevular */}
            {upcomingAppointments.length > 0 && (
              <View style={styles.section}>
                <Text weight="bold" style={styles.sectionTitle}>
                  Yaklaşan Randevular
                </Text>
                {upcomingAppointments.map((appointment) => (
                  <View key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentDateContainer}>
                        <Icon name="calendar" size={24} color="#01213D" style={styles.appointmentDateIcon} />
                        <View>
                          <Text weight="semibold" style={styles.appointmentDate}>
                            {formatDate(appointment.appointment_date)}
                          </Text>
                          <View style={styles.timeRow}>
                            <Icon name="time-outline" size={14} color="#666" />
                            <Text weight="semibold" style={styles.appointmentTime}>
                              {formatTime(appointment.appointment_time)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(appointment.status) + '20' },
                        ]}
                      >
                        <Icon 
                          name={getStatusIconName(appointment.status)} 
                          size={14} 
                          color={getStatusColor(appointment.status)} 
                          style={styles.statusIcon}
                        />
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

                    <View style={styles.appointmentBody}>
                      <Text weight="semibold" style={styles.serviceTitle}>
                        {getServiceTitle(appointment.service_type)}
                      </Text>
                      
                      {appointment.patient_notes && (
                        <View style={styles.notesContainer}>
                          <Text weight="regular" style={styles.notesLabel}>
                            Notlarınız:
                          </Text>
                          <Text weight="regular" style={styles.notesText}>
                            {appointment.patient_notes}
                          </Text>
                        </View>
                      )}

                      {appointment.doctor_notes && (
                        <View style={styles.notesContainer}>
                          <Text weight="regular" style={styles.notesLabel}>
                            Klinik Notları:
                          </Text>
                          <Text weight="regular" style={styles.notesText}>
                            {appointment.doctor_notes}
                          </Text>
                        </View>
                      )}

                      {appointment.estimated_price && (
                        <View style={styles.priceContainer}>
                          <Text weight="regular" style={styles.priceLabel}>
                            Tahmini Ücret:
                          </Text>
                          <Text weight="bold" style={styles.priceText}>
                            ₺{appointment.estimated_price}
                          </Text>
                        </View>
                      )}
                    </View>

                    {appointment.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelAppointment(appointment)}
                      >
                        <Text weight="semibold" style={styles.cancelButtonText}>
                          Randevuyu İptal Et
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Geçmiş Randevular */}
            {pastAppointments.length > 0 && (
              <View style={styles.section}>
                <Text weight="bold" style={styles.sectionTitle}>
                  Geçmiş Randevular
                </Text>
                {pastAppointments.map((appointment) => (
                  <View key={appointment.id} style={styles.appointmentCardPast}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentDateContainer}>
                        <Icon name="calendar" size={24} color="#999" style={styles.appointmentDateIcon} />
                        <View>
                          <Text weight="semibold" style={styles.appointmentDate}>
                            {formatDate(appointment.appointment_date)}
                          </Text>
                          <View style={styles.timeRow}>
                            <Icon name="time-outline" size={14} color="#666" />
                            <Text weight="semibold" style={styles.appointmentTime}>
                              {formatTime(appointment.appointment_time)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(appointment.status) + '20' },
                        ]}
                      >
                        <Icon 
                          name={getStatusIconName(appointment.status)} 
                          size={14} 
                          color={getStatusColor(appointment.status)} 
                          style={styles.statusIcon}
                        />
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

                    <Text weight="semibold" style={styles.serviceTitle}>
                      {getServiceTitle(appointment.service_type)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleCreateAppointment}
            >
              <Text weight="bold" style={styles.floatingButtonText}>
                + Yeni Randevu
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#01213D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
  appointmentCardPast: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    opacity: 0.7,
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
    marginBottom: 16,
  },
  appointmentDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appointmentDateIcon: {
    marginRight: 12,
  },
  appointmentDate: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
    gap: 4,
  },
  statusIcon: {
    marginTop: 1,
  },
  statusText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  appointmentBody: {
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: '#166534',
  },
  priceText: {
    fontSize: 16,
    color: '#166534',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#DC2626',
  },
  floatingButton: {
    backgroundColor: '#01213D',
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#01213D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default AppointmentsScreen;

