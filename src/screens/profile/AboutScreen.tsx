import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../../components';

interface AboutScreenProps {
  navigation: any;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>Hakkımızda</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Icon name="happy-outline" size={40} color="#FFFFFF" />
          </View>
          <Text weight="bold" style={styles.clinicName}>Smile Hair Clinic</Text>
          <Text weight="regular" style={styles.clinicSubtitle}>
            Türkiye'nin Önde Gelen Saç Ekimi Kliniği
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text weight="semibold" style={styles.cardTitle}>
              Smile Hair Clinic, Türkiye'nin göz bebeği İstanbul'da, saç ekimi alanında hizmet veren önde gelen kliniklerden biridir.
            </Text>
            <Text weight="regular" style={styles.cardDescription}>
              Alanında uluslararası tanınırlığa sahip Dr. Gökay Bilgin ve Dr. Mehmet Erdoğan'ın liderliğinde faaliyet gösteren Smile Hair Clinic'te hasta memnuniyeti daima ön planda tutulur.
            </Text>
            <Text weight="regular" style={styles.cardDescription}>
              Tüm operasyon süreçleri bizzat doktorlar tarafından takip edilir ve ekipte yer alan her bir üye medikal eğitim almış profesyonellerden oluşur. Bugüne kadar dünyanın dört bir yanından gelen çok sayıda hastaya başarılı saç ekimi uygulamaları gerçekleştirilmiştir.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>DOKTORLARIMIZ</Text>
          
          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>GB</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>Dr. Gökay Bilgin</Text>
              <Text weight="regular" style={styles.doctorTitle}>Kurucu Doktor</Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>ME</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>Dr. Mehmet Erdoğan</Text>
              <Text weight="regular" style={styles.doctorTitle}>Kurucu Doktor</Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>FA</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>Dr. Firdavs Ahmedov</Text>
              <Text weight="regular" style={styles.doctorTitle}>Saç Ekimi Uzmanı</Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>AO</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>Dr. Ali Osman Soluk</Text>
              <Text weight="regular" style={styles.doctorTitle}>Saç Ekimi Uzmanı</Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>MR</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>Dr. M. Reşat Arpacı</Text>
              <Text weight="regular" style={styles.doctorTitle}>Saç Ekimi Uzmanı</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>FELSEFEMİZ</Text>
          
          <View style={styles.philosophyCard}>
            <Icon name="target-outline" size={32} color="#3B82F6" style={styles.philosophyIcon} />
            <Text weight="bold" style={styles.philosophyTitle}>True Philosophy</Text>
            <Text weight="regular" style={styles.philosophyDescription}>
              Her hastanın benzersiz olduğunu biliyoruz. Ekip çalışması ve detaylı planlama ile kişiye özel çözümler sunuyoruz. Saç çizgisi tasarımımız doğal görünüm ve estetik mükemmellik için her zaman açıları dikkate alır.
            </Text>
          </View>

          <View style={styles.philosophyCard}>
            <Icon name="flash-outline" size={32} color="#3B82F6" style={styles.philosophyIcon} />
            <Text weight="bold" style={styles.philosophyTitle}>True Execution</Text>
            <Text weight="regular" style={styles.philosophyDescription}>
              Operasyon günü, tüm dönüşüm sürecinde başarılı bir sonuç için kilit kilometre taşıdır. Yüksek seviyeli önlemlerimiz sayesinde hiçbir şeyin ters gitmesine izin vermeyiz. Başarılı operasyonlar ve sonuçlar elde etmek için tüm çabamızı ve kaynaklarımızı kullanırız.
            </Text>
          </View>

          <View style={styles.philosophyCard}>
            <Icon name="rocket-outline" size={32} color="#3B82F6" style={styles.philosophyIcon} />
            <Text weight="bold" style={styles.philosophyTitle}>True Innovation</Text>
            <Text weight="regular" style={styles.philosophyDescription}>
              Gelişimi tıbbın temeli olarak görüyoruz. Her zaman en etkili saç ekimi operasyonlarını gerçekleştirmenin daha iyi yollarını arıyoruz. Safir Nakil tekniği, inovasyon tutkumuzun en parlak örneklerinden biridir.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>TEDAVİLERİMİZ</Text>
          <View style={styles.card}>
            <Text weight="regular" style={styles.treatmentItem}>• Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Safir Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• DHI Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Manuel FUE Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Sakal Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Kaş Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Kadın Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Afro Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Tıraşsız Saç Ekimi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• İğnesiz Anestezi</Text>
            <Text weight="regular" style={styles.treatmentItem}>• Mezoterapi</Text>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  headerRight: {
    width: 36,
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
    backgroundColor: '#3B82F6',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  cardTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  doctorCard: {
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
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  doctorTitle: {
    fontSize: 14,
    color: '#666',
  },
  philosophyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
  philosophyIcon: {
    marginBottom: 12,
  },
  philosophyTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  philosophyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  treatmentItem: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 28,
  },
});

export default AboutScreen;

