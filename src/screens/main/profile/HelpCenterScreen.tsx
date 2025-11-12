import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../../../components';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface HelpCenterScreenProps {
  navigation: any;
}

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'Operasyon Sonrası',
      question: 'Ne kadar süre antibiyotik içeren krem kullanmam gerekir?',
      answer:
        'Operasyondan sonraki 5 gün içinde donör bölgeniz iyileştiyse antibiyotik içeren kremleri kullanmaya devam etmeniz gerekmez.',
    },
    {
      category: 'Operasyon Sonrası',
      question: 'Saç ekimi sonrasında ne kadar süre şapka kullanmalıyım?',
      answer:
        'Saç ekiminden sonra size verdiğimiz şapkayı 10 gün boyunca kullanmanızı öneririz.',
    },
    {
      category: 'Operasyon Sonrası',
      question: 'Ameliyattan sonra ne zaman spor yapabilirim?',
      answer:
        'Operasyondan sonra egzersiz yapmaya başlamak için en az 1 ay beklemelisiniz.',
    },
    {
      category: 'Bakım',
      question: 'Saç ekiminden sonra her gün başımı yıkamalı mıyım?',
      answer:
        'Saç ekiminden sonra 1 ay boyunca her gün başınızı yıkamalısınız.',
    },
    {
      category: 'Operasyon Sonrası',
      question: 'Saç ekimi sonrasında bandajımı ne zaman çıkarabilirim?',
      answer:
        'Operasyondan sonraki ikinci gün başınızı yıkamanız gerekir. Başınızı yıkamadan önce bandaj çıkartılır ve sonrasında tekrar kullanılması gerekmez.',
    },
    {
      category: 'Bakım',
      question: 'Ne kadar süre özel şampuan kullanmam gerekir?',
      answer:
        '1 ay boyunca size önerdiğimiz şampuanı kullanmalısınız. Saçlarınızın ve baş bölgenizin sağlığından emin olduktan sonra her zaman kullandığınız şampuanı kullanmaya devam edebilirsiniz.',
    },
    {
      category: 'Bakım',
      question: 'Ne kadar süre Panthenol sprey kullanmam gerekir?',
      answer:
        'Yaklaşık 15 gün boyunca, kabuklar deriden tamamen atılana kadar kullanmanız gerekir.',
    },
    {
      category: 'Genel',
      question: 'Saç ekimi sonrası ne zaman cinsel ilişkiye girebilirim?',
      answer:
        'Operasyon sonrası cinsel ilişki konusunda kısıtlama getirilmez, çok efor harcamamanız önerilir.',
    },
    {
      category: 'Bakım',
      question: 'Önerilen ürünler dışında farklı bir ürün kullanabilir miyim?',
      answer:
        'Kullanacağınız ürünlerin içeriğini dikkatle incelemeli, size zarar vermeyecek, paraben içermeyen, doğal ürünleri tercih etmelisiniz.',
    },
    {
      category: 'Bakım',
      question: 'Panthenol spreyi donör bölgede kullanabilir miyim?',
      answer:
        'Kullanabilirsiniz ancak bu spreyin çok hızlı tükenmesine sebep olacaktır.',
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
          Yardım Merkezi
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
            Sıkça Sorulan Sorular
          </Text>
          <Text weight="regular" style={styles.heroDescription}>
            Saç ekimi operasyonu öncesi ve sonrası hakkında merak ettikleriniz
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
                Başka bir sorunuz mu var?
              </Text>
              <Text weight="regular" style={styles.contactDescription}>
                Uzman ekibimiz size yardımcı olmak için hazır
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Text weight="semibold" style={styles.contactButtonText}>
                İletişime Geç
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
