import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, LoadingModal } from '../../components';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { ServiceType, ServiceOption } from '../../types';

interface AppointmentCreateScreenProps {
  navigation: any;
}

const serviceOptions: ServiceOption[] = [
  {
    id: 'hair_transplant_consultation',
    title: 'Saç Ekimi Danışmanlığı',
    description: 'Saç ekimi için detaylı analiz ve planlama',
    icon: '🔬',
    estimatedDuration: '45 dakika',
    estimatedPrice: 'Ücretsiz',
  },
  {
    id: 'hair_analysis',
    title: 'Saç Analizi',
    description: 'Saç ve saç derisi sağlığının değerlendirilmesi',
    icon: '📊',
    estimatedDuration: '30 dakika',
    estimatedPrice: '₺500',
  },
  {
    id: 'hair_treatment',
    title: 'Saç Tedavisi',
    description: 'PRP, mezoterapi ve diğer tedaviler',
    icon: '💉',
    estimatedDuration: '60 dakika',
    estimatedPrice: '₺1,500',
  },
  {
    id: 'follow_up',
    title: 'Kontrol Randevusu',
    description: 'Tedavi sonrası kontrol',
    icon: '✅',
    estimatedDuration: '20 dakika',
    estimatedPrice: 'Ücretsiz',
  },
  {
    id: 'other',
    title: 'Diğer',
    description: 'Diğer hizmetler için randevu',
    icon: '📋',
    estimatedDuration: '30 dakika',
  },
];

const AppointmentCreateScreen: React.FC<AppointmentCreateScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateAppointment = async () => {
    if (!selectedService) {
      Alert.alert('Hata', 'Lütfen bir hizmet seçin');
      return;
    }

    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);

      // Tarih ve saat formatla
      const appointmentDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const appointmentTime = selectedTime.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

      const selectedServiceOption = serviceOptions.find(s => s.id === selectedService);
      const estimatedPrice = selectedServiceOption?.estimatedPrice?.includes('₺') 
        ? parseFloat(selectedServiceOption.estimatedPrice.replace('₺', '').replace(',', '').trim())
        : null;

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: user.id,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            service_type: selectedService,
            status: 'pending',
            patient_notes: patientNotes || null,
            estimated_price: estimatedPrice,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Randevu oluşturma hatası:', error);
        throw error;
      }

      console.log('✅ Randevu oluşturuldu:', data);
      
      Alert.alert(
        'Başarılı',
        'Randevunuz başarıyla oluşturuldu. En kısa sürede onaylanacaktır.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Create appointment error:', error);
      Alert.alert(
        'Hata',
        'Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingModal visible={loading} message="Randevu oluşturuluyor..." />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>Yeni Randevu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hizmet Seçimi */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Hizmet Seçin</Text>
          {serviceOptions.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.id && styles.serviceCardSelected,
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <View style={styles.serviceCardLeft}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <View style={styles.serviceInfo}>
                  <Text 
                    weight="semibold" 
                    style={[
                      styles.serviceTitle,
                      selectedService === service.id && styles.serviceTextSelected,
                    ]}
                  >
                    {service.title}
                  </Text>
                  <Text 
                    weight="regular" 
                    style={[
                      styles.serviceDescription,
                      selectedService === service.id && styles.serviceTextSelected,
                    ]}
                  >
                    {service.description}
                  </Text>
                  <View style={styles.serviceDetails}>
                    <Text 
                      weight="regular" 
                      style={[
                        styles.serviceDetailText,
                        selectedService === service.id && styles.serviceTextSelected,
                      ]}
                    >
                      ⏱ {service.estimatedDuration}
                    </Text>
                    {service.estimatedPrice && (
                      <Text 
                        weight="regular" 
                        style={[
                          styles.serviceDetailText,
                          selectedService === service.id && styles.serviceTextSelected,
                        ]}
                      >
                        💰 {service.estimatedPrice}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              {selectedService === service.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tarih ve Saat Seçimi */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Tarih ve Saat</Text>
          
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeCard}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>📅</Text>
              <View style={styles.dateTimeInfo}>
                <Text weight="regular" style={styles.dateTimeLabel}>Tarih</Text>
                <Text weight="semibold" style={styles.dateTimeValue}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeCard}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>⏰</Text>
              <View style={styles.dateTimeInfo}>
                <Text weight="regular" style={styles.dateTimeLabel}>Saat</Text>
                <Text weight="semibold" style={styles.dateTimeValue}>
                  {formatTime(selectedTime)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              minuteInterval={15}
            />
          )}
        </View>

        {/* Notlar */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Notlarınız (Opsiyonel)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Belirtmek istediğiniz özel bir durum varsa yazabilirsiniz..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={patientNotes}
            onChangeText={setPatientNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Bilgilendirme */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text weight="semibold" style={styles.infoTitle}>
              Önemli Bilgi
            </Text>
            <Text weight="regular" style={styles.infoText}>
              Randevunuz oluşturulduktan sonra klinik tarafından onaylanacaktır. 
              Onay durumu hakkında bilgilendirileceksiniz.
            </Text>
          </View>
        </View>

        {/* Oluştur Butonu */}
        <TouchableOpacity
          style={[
            styles.createButton,
            !selectedService && styles.createButtonDisabled,
          ]}
          onPress={handleCreateAppointment}
          disabled={!selectedService || loading}
        >
          <Text weight="bold" style={styles.createButtonText}>
            Randevu Oluştur
          </Text>
        </TouchableOpacity>

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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
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
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  serviceCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  serviceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceDetailText: {
    fontSize: 12,
    color: '#666',
  },
  serviceTextSelected: {
    color: '#3B82F6',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateTimeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default AppointmentCreateScreen;

