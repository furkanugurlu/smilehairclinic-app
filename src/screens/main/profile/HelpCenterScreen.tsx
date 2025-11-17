import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components';

interface FAQItem {
  questionKey: string;
  answerKey: string;
  categoryKey: string;
}

interface HelpCenterScreenProps {
  navigation: any;
}

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      categoryKey: 'helpCenter.category.postOperation',
      questionKey: 'helpCenter.faqs.q1',
      answerKey: 'helpCenter.faqs.a1',
    },
    {
      categoryKey: 'helpCenter.category.postOperation',
      questionKey: 'helpCenter.faqs.q2',
      answerKey: 'helpCenter.faqs.a2',
    },
    {
      categoryKey: 'helpCenter.category.postOperation',
      questionKey: 'helpCenter.faqs.q3',
      answerKey: 'helpCenter.faqs.a3',
    },
    {
      categoryKey: 'helpCenter.category.care',
      questionKey: 'helpCenter.faqs.q4',
      answerKey: 'helpCenter.faqs.a4',
    },
    {
      categoryKey: 'helpCenter.category.postOperation',
      questionKey: 'helpCenter.faqs.q5',
      answerKey: 'helpCenter.faqs.a5',
    },
    {
      categoryKey: 'helpCenter.category.care',
      questionKey: 'helpCenter.faqs.q6',
      answerKey: 'helpCenter.faqs.a6',
    },
    {
      categoryKey: 'helpCenter.category.care',
      questionKey: 'helpCenter.faqs.q7',
      answerKey: 'helpCenter.faqs.a7',
    },
    {
      categoryKey: 'helpCenter.category.general',
      questionKey: 'helpCenter.faqs.q8',
      answerKey: 'helpCenter.faqs.a8',
    },
    {
      categoryKey: 'helpCenter.category.care',
      questionKey: 'helpCenter.faqs.q9',
      answerKey: 'helpCenter.faqs.a9',
    },
    {
      categoryKey: 'helpCenter.category.care',
      questionKey: 'helpCenter.faqs.q10',
      answerKey: 'helpCenter.faqs.a10',
    },
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.categoryKey)));

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
            {t('helpCenter.faqTitle')}
          </Text>
          <Text weight="regular" style={styles.heroDescription}>
            {t('helpCenter.faqDescription')}
          </Text>
        </View>

        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.section}>
            <Text weight="semibold" style={styles.categoryTitle}>
              {t(category).toUpperCase()}
            </Text>
            {faqs
              .filter(faq => faq.categoryKey === category)
              .map((faq, faqIndex) => {
                const globalIndex = faqs.findIndex(
                  f => f.questionKey === faq.questionKey,
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
                        {t(faq.questionKey)}
                      </Text>
                    </View>
                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text weight="regular" style={styles.faqAnswer}>
                          {t(faq.answerKey)}
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
                {t('helpCenter.contactCard.title')}
              </Text>
              <Text weight="regular" style={styles.contactDescription}>
                {t('helpCenter.contactCard.description')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Text weight="semibold" style={styles.contactButtonText}>
                {t('helpCenter.contactCard.button')}
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
