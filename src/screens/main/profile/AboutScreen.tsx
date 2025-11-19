import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components';

interface AboutScreenProps {
  navigation: any;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}  edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text weight="bold" style={styles.headerTitle}>
          {t('about.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Icon name="happy-outline" size={40} color="#FFFFFF" />
          </View>
          <Text weight="bold" style={styles.clinicName}>
            {t('about.clinicName')}
          </Text>
          <Text weight="regular" style={styles.clinicSubtitle}>
            {t('about.clinicSubtitle')}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text weight="semibold" style={styles.cardTitle}>
              {t('about.description1')}
            </Text>
            <Text weight="regular" style={styles.cardDescription}>
              {t('about.description2')}
            </Text>
            <Text weight="regular" style={styles.cardDescription}>
              {t('about.description3')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            {t('about.doctors')}
          </Text>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>GB</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>
                Dr. Gökay Bilgin
              </Text>
              <Text weight="regular" style={styles.doctorTitle}>
                {t('about.founderDoctor')}
              </Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>ME</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>
                Dr. Mehmet Erdoğan
              </Text>
              <Text weight="regular" style={styles.doctorTitle}>
                {t('about.founderDoctor')}
              </Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>FA</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>
                Dr. Firdavs Ahmedov
              </Text>
              <Text weight="regular" style={styles.doctorTitle}>
                {t('about.hairTransplantSpecialist')}
              </Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>AO</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>
                Dr. Ali Osman Soluk
              </Text>
              <Text weight="regular" style={styles.doctorTitle}>
                {t('about.hairTransplantSpecialist')}
              </Text>
            </View>
          </View>

          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>MR</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text weight="bold" style={styles.doctorName}>
                Dr. M. Reşat Arpacı
              </Text>
              <Text weight="regular" style={styles.doctorTitle}>
                {t('about.hairTransplantSpecialist')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            {t('about.philosophy')}
          </Text>

          <View style={styles.philosophyCard}>
            <Icon
              name="target-outline"
              size={32}
              color="#01213D"
              style={styles.philosophyIcon}
            />
            <Text weight="bold" style={styles.philosophyTitle}>
              {t('about.philosophy1Title')}
            </Text>
            <Text weight="regular" style={styles.philosophyDescription}>
              {t('about.philosophy1Description')}
            </Text>
          </View>

          <View style={styles.philosophyCard}>
            <Icon
              name="flash-outline"
              size={32}
              color="#01213D"
              style={styles.philosophyIcon}
            />
            <Text weight="bold" style={styles.philosophyTitle}>
              {t('about.philosophy2Title')}
            </Text>
            <Text weight="regular" style={styles.philosophyDescription}>
              {t('about.philosophy2Description')}
            </Text>
          </View>

          <View style={styles.philosophyCard}>
            <Icon
              name="rocket-outline"
              size={32}
              color="#01213D"
              style={styles.philosophyIcon}
            />
            <Text weight="bold" style={styles.philosophyTitle}>
              {t('about.philosophy3Title')}
            </Text>
            <Text weight="regular" style={styles.philosophyDescription}>
              {t('about.philosophy3Description')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            {t('about.treatments')}
          </Text>
          <View style={styles.card}>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment1')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment2')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment3')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment4')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment5')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment6')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment7')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment8')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment9')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment10')}
            </Text>
            <Text weight="regular" style={styles.treatmentItem}>
              • {t('about.treatment11')}
            </Text>
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
    backgroundColor: '#01213D',
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
