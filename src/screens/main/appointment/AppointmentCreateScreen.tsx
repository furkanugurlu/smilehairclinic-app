import React, { useState, useMemo } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { Text, LoadingModal, DateTimeModal } from '../../../components';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../../store/authStore';
import { ServiceType, ServiceOption } from '../../../types';

interface AppointmentCreateScreenProps {
  navigation: any;
}

const AppointmentCreateScreen: React.FC<AppointmentCreateScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const serviceOptions: ServiceOption[] = useMemo(() => [
    {
      id: 'hair_transplant_consultation',
      title: t('appointments.serviceTypes.hair_transplant_consultation'),
      description: t('appointments.create.serviceDescriptions.hair_transplant_consultation'),
      icon: 'analytics',
      estimatedDuration: t('appointments.create.estimatedDurations.hair_transplant_consultation'),
      estimatedPrice: t('appointments.create.estimatedPrices.hair_transplant_consultation'),
    },
    {
      id: 'hair_analysis',
      title: t('appointments.serviceTypes.hair_analysis'),
      description: t('appointments.create.serviceDescriptions.hair_analysis'),
      icon: 'stats-chart',
      estimatedDuration: t('appointments.create.estimatedDurations.hair_analysis'),
      estimatedPrice: t('appointments.create.estimatedPrices.hair_analysis'),
    },
    {
      id: 'hair_treatment',
      title: t('appointments.serviceTypes.hair_treatment'),
      description: t('appointments.create.serviceDescriptions.hair_treatment'),
      icon: 'medkit',
      estimatedDuration: t('appointments.create.estimatedDurations.hair_treatment'),
      estimatedPrice: t('appointments.create.estimatedPrices.hair_treatment'),
    },
    {
      id: 'follow_up',
      title: t('appointments.serviceTypes.follow_up'),
      description: t('appointments.create.serviceDescriptions.follow_up'),
      icon: 'checkmark-done-circle',
      estimatedDuration: t('appointments.create.estimatedDurations.follow_up'),
      estimatedPrice: t('appointments.create.estimatedPrices.follow_up'),
    },
    {
      id: 'other',
      title: t('appointments.serviceTypes.other'),
      description: t('appointments.create.serviceDescriptions.other'),
      icon: 'document-text',
      estimatedDuration: t('appointments.create.estimatedDurations.other'),
    },
  ], [t]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    // Android'de modal içinde gösterdiğimiz için burada kapatmıyoruz
    // Modal'ın onConfirm butonunda kapatacağız
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (time) {
      setSelectedTime(time);
    }
    // Android'de modal içinde gösterdiğimiz için burada kapatmıyoruz
    // Modal'ın onConfirm butonunda kapatacağız
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
  };

  const confirmTimeSelection = () => {
    setShowTimePicker(false);
  };

  const formatDate = (date: Date) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR';
    return time.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateAppointment = async () => {
    if (!selectedService) {
      Alert.alert(t('appointments.create.serviceRequired'), t('appointments.create.serviceRequiredMessage'));
      return;
    }

    if (!user?.id) {
      Alert.alert(t('appointments.create.userNotFound'), t('appointments.create.userNotFoundMessage'));
      return;
    }

    try {
      setLoading(true);

      // Tarih ve saat formatla
      const appointmentDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const appointmentTime = selectedTime
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5); // HH:MM

      const selectedServiceOption = serviceOptions.find(
        s => s.id === selectedService,
      );
      const estimatedPrice = selectedServiceOption?.estimatedPrice?.includes(
        '₺',
      )
        ? parseFloat(
            selectedServiceOption.estimatedPrice
              .replace('₺', '')
              .replace(',', '')
              .trim(),
          )
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
        t('appointments.create.createSuccess'),
        t('appointments.create.createSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Randevular ekranına dön ve refresh parametresi gönder
              navigation.navigate('MainTabs', {
                screen: 'Appointments',
                params: { refresh: true },
              });
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ Create appointment error:', error);
      Alert.alert(
        t('appointments.create.createError'),
        t('appointments.create.createErrorMessage'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingModal visible={loading} message={t('appointments.create.creating')} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('appointments.create.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hizmet Seçimi */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('appointments.create.selectService')}
          </Text>
          {serviceOptions.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.id && styles.serviceCardSelected,
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <View style={styles.serviceCardLeft}>
                <View style={styles.serviceIconContainer}>
                  <Icon
                    name={service.icon}
                    size={28}
                    color={selectedService === service.id ? '#01213D' : '#666'}
                  />
                </View>
                <View style={styles.serviceInfo}>
                  <Text
                    weight="semibold"
                    style={[
                      styles.serviceTitle,
                      selectedService === service.id &&
                        styles.serviceTextSelected,
                    ]}
                  >
                    {service.title}
                  </Text>
                  <Text
                    weight="regular"
                    style={[
                      styles.serviceDescription,
                      selectedService === service.id &&
                        styles.serviceTextSelected,
                    ]}
                  >
                    {service.description}
                  </Text>
                  <View style={styles.serviceDetails}>
                    <View style={styles.serviceDetailRow}>
                      <Icon
                        name="time-outline"
                        size={14}
                        color={
                          selectedService === service.id ? '#01213D' : '#666'
                        }
                      />
                      <Text
                        weight="regular"
                        style={[
                          styles.serviceDetailText,
                          selectedService === service.id &&
                            styles.serviceTextSelected,
                        ]}
                      >
                        {service.estimatedDuration}
                      </Text>
                    </View>
                    {service.estimatedPrice && (
                      <View style={styles.serviceDetailRow}>
                        <Icon
                          name="cash-outline"
                          size={14}
                          color={
                            selectedService === service.id ? '#01213D' : '#666'
                          }
                        />
                        <Text
                          weight="regular"
                          style={[
                            styles.serviceDetailText,
                            selectedService === service.id &&
                              styles.serviceTextSelected,
                          ]}
                        >
                          {service.estimatedPrice}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {selectedService === service.id && (
                <View style={styles.checkmark}>
                  <Icon name="checkmark" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tarih ve Saat Seçimi */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('appointments.create.dateAndTime')}
          </Text>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeCard}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon
                name="calendar"
                size={28}
                color="#01213D"
                style={styles.dateTimeIcon}
              />
              <View style={styles.dateTimeInfo}>
                <Text weight="regular" style={styles.dateTimeLabel}>
                  {t('appointments.date')}
                </Text>
                <Text weight="semibold" style={styles.dateTimeValue}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeCard}
              onPress={() => setShowTimePicker(true)}
            >
              <Icon
                name="time"
                size={28}
                color="#01213D"
                style={styles.dateTimeIcon}
              />
              <View style={styles.dateTimeInfo}>
                <Text weight="regular" style={styles.dateTimeLabel}>
                  {t('appointments.time')}
                </Text>
                <Text weight="semibold" style={styles.dateTimeValue}>
                  {formatTime(selectedTime)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <DateTimeModal
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onConfirm={confirmDateSelection}
            title={t('appointments.create.selectDate')}
            confirmText={t('common.ok')}
            cancelText={t('common.cancel')}
          >
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.datePicker}
              textColor={Platform.OS === 'ios' ? '#1A1A1A' : undefined}
              accentColor={Platform.OS === 'ios' ? '#01213D' : undefined}
              themeVariant="light"
            />
          </DateTimeModal>

          {/* Time Picker Modal */}
          <DateTimeModal
            visible={showTimePicker}
            onClose={() => setShowTimePicker(false)}
            onConfirm={confirmTimeSelection}
            title={t('appointments.create.selectTime')}
            confirmText={t('common.ok')}
            cancelText={t('common.cancel')}
          >
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              onChange={handleTimeChange}
              minuteInterval={15}
              style={styles.datePicker}
              textColor={Platform.OS === 'ios' ? '#1A1A1A' : undefined}
              accentColor={Platform.OS === 'ios' ? '#01213D' : undefined}
              themeVariant="light"
            />
          </DateTimeModal>
        </View>

        {/* Notlar */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            {t('appointments.create.notes')}
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder={t('appointments.create.notesPlaceholder')}
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
          <Icon
            name="information-circle"
            size={24}
            color="#92400E"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text weight="semibold" style={styles.infoTitle}>
              {t('appointments.create.importantInfo')}
            </Text>
            <Text weight="regular" style={styles.infoText}>
              {t('appointments.create.importantInfoText')}
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
            {t('appointments.create.createButton')}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#01213D',
    backgroundColor: '#EFF6FF',
  },
  serviceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 12,
    color: '#666',
  },
  serviceTextSelected: {
    color: '#01213D',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  datePicker: {
    height: 200,
  },
});

export default AppointmentCreateScreen;
