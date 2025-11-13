import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface HelpCenterScreenProps {
  navigation: any;
}

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: t('helpCenter.postOperation'),
      question: t('helpCenter.antibioticQuestion'),
      answer: t('helpCenter.antibioticAnswer'),
    },
    {
      category: t('helpCenter.postOperation'),
      question: t('helpCenter.hatQuestion'),
      answer: t('helpCenter.hatAnswer'),
    },
    {
      category: t('helpCenter.postOperation'),
      question: t('helpCenter.exerciseQuestion'),
      answer: t('helpCenter.exerciseAnswer'),
    },
    {
      category: t('helpCenter.postOperation'),
      question: t('helpCenter.bandageQuestion'),
      answer: t('helpCenter.bandageAnswer'),
    },
    {
      category: t('helpCenter.care'),
      question: t('helpCenter.washingQuestion'),
      answer: t('helpCenter.washingAnswer'),
    },
    {
      category: t('helpCenter.care'),
      question: t('helpCenter.specialShampooQuestion'),
      answer: t('helpCenter.specialShampooAnswer'),
    },
    {
      category: t('helpCenter.care'),
      question: t('helpCenter.panthenolDurationQuestion'),
      answer: t('helpCenter.panthenolDurationAnswer'),
    },
    {
      category: t('helpCenter.care'),
      question: t('helpCenter.differentProductQuestion'),
      answer: t('helpCenter.differentProductAnswer'),
    },
    {
      category: t('helpCenter.care'),
      question: t('helpCenter.panthenolDonorQuestion'),
      answer: t('helpCenter.panthenolDonorAnswer'),
    },
    {
      category: t('helpCenter.general'),
      question: t('helpCenter.sexualActivityQuestion'),
      answer: t('helpCenter.sexualActivityAnswer'),
    },
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleExpand = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
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
          {t('helpCenter.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Icon
            name="help-circle-outline"
            size={48}
            color="#01213D"
            style={styles.heroIcon}
          />
          <Text weight="bold" style={styles.heroTitle}>
            {t('helpCenter.heroTitle')}
          </Text>
          <Text weight="regular" style={styles.heroDescription}>
            {t('helpCenter.heroDescription')}
          </Text>
        </View>

        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.section}>
            <Text weight="semibold" style={styles.categoryTitle}>
              {category.toUpperCase()}
            </Text>
            {faqs
              .filter(faq => faq.category === category)
              .map((faq, faqIndex) => {
                const globalIndex = faqs.findIndex(
                  f => f.question === faq.question,
                );
                const isExpanded = expandedId === globalIndex;

                return (
                  <TouchableOpacity
                    key={faqIndex}
                    style={styles.faqCard}
                    onPress={() => toggleExpand(globalIndex)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <View style={styles.faqIconContainer}>
                        <Text style={styles.faqIcon}>
                          {isExpanded ? '−' : '+'}
                        </Text>
                      </View>
                      <Text weight="semibold" style={styles.faqQuestion}>
                        {faq.question}
                      </Text>
                    </View>
                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text weight="regular" style={styles.faqAnswer}>
                          {faq.answer}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
          </View>
        ))}

        <View style={styles.section}>
          <View style={styles.contactCard}>
            <Icon
              name="chatbubbles-outline"
              size={48}
              color="#FFFFFF"
              style={styles.contactIcon}
            />
            <View style={styles.contactContent}>
              <Text weight="bold" style={styles.contactTitle}>
                {t('helpCenter.contactTitle')}
              </Text>
              <Text weight="regular" style={styles.contactDescription}>
                {t('helpCenter.contactDescription')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Text weight="semibold" style={styles.contactButtonText}>
                {t('helpCenter.contactButton')}
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
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  categoryTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  faqCard: {
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
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faqIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  faqIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  faqAnswerContainer: {
    marginTop: 12,
    marginLeft: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#01213D',
    borderRadius: 16,
    padding: 24,
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
  contactIcon: {
    marginBottom: 16,
  },
  contactContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    color: '#01213D',
  },
});

export default HelpCenterScreen;
