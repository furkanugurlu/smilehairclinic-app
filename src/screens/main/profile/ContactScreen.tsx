import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../../../components';

interface ContactScreenProps {
  navigation: any;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ navigation }) => {
  const handleCall = () => {
    Linking.openURL('tel:+905491492400');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@smilehairclinic.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/905491492400');
  };

  const handleAddress = () => {
    const address =
      'Tatlısu, Alptekin Cd. No:15, 34774 Ümraniye/İstanbul, Türkiye';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          İletişim
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Icon name="medical-outline" size={40} color="#FFFFFF" />
          </View>
          <Text weight="bold" style={styles.clinicName}>
            Smile Hair Clinic
          </Text>
          <Text weight="regular" style={styles.clinicSubtitle}>
            Saç Ekimi ve Saç Sağlığı Uzmanı
          </Text>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            İLETİŞİM BİLGİLERİ
          </Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={styles.contactIconContainer}>
              <Icon name="call-outline" size={24} color="#01213D" />
            </View>
            <View style={styles.contactInfo}>
              <Text weight="semibold" style={styles.contactLabel}>
                Telefon
              </Text>
              <Text weight="regular" style={styles.contactValue}>
                +90 549 149 24 00
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIconContainer}>
              <Icon name="mail-outline" size={24} color="#01213D" />
            </View>
            <View style={styles.contactInfo}>
              <Text weight="semibold" style={styles.contactLabel}>
                E-Posta
              </Text>
              <Text weight="regular" style={styles.contactValue}>
                info@smilehairclinic.com
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
            <View style={styles.contactIconContainer}>
              <Icon name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text weight="semibold" style={styles.contactLabel}>
                WhatsApp
              </Text>
              <Text weight="regular" style={styles.contactValue}>
                +90 549 149 24 00
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleAddress}>
            <View style={styles.contactIconContainer}>
              <Icon name="location-outline" size={24} color="#01213D" />
            </View>
            <View style={styles.contactInfo}>
              <Text weight="semibold" style={styles.contactLabel}>
                Adres
              </Text>
              <Text weight="regular" style={styles.contactValue}>
                Tatlısu, Alptekin Cd. No:15, {'\n'}
                34774 Ümraniye/İstanbul, Türkiye
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            ÇALIŞMA SAATLERİ
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text weight="regular" style={styles.infoLabel}>
                Pazartesi - Cumartesi
              </Text>
              <Text weight="semibold" style={styles.infoValue}>
                09:00 - 18:00
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text weight="regular" style={styles.infoLabel}>
                Pazar
              </Text>
              <Text weight="semibold" style={styles.infoValue}>
                Kapalı
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            SOSYAL MEDYA
          </Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-facebook" size={20} color="#1877F2" />
              <Text weight="medium" style={styles.socialText}>
                Facebook
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-instagram" size={20} color="#E4405F" />
              <Text weight="medium" style={styles.socialText}>
                Instagram
              </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 56,
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clinicName: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  clinicSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
});

export default ContactScreen;
