import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Text } from '../../components';

const { width } = Dimensions.get('window');

interface HairCheckResult {
  id: string;
  date: string;
  status: 'good' | 'warning' | 'critical';
  score: number;
  notes: string;
}

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [lastCheck] = useState<HairCheckResult | null>(null); // Bu veriyi API'den alacağız

  const handleStartCheck = () => {
    console.log('🔬 Saç durumu kontrolü başlatılıyor...');
    // TODO: Saç kontrolü sayfasına yönlendir
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'İyi';
      case 'warning':
        return 'Dikkat';
      case 'critical':
        return 'Kritik';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text weight="regular" style={styles.greeting}>Merhaba,</Text>
            <Text weight="bold" style={styles.userName}>{user?.full_name || 'Kullanıcı'}</Text>
          </View>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text weight="bold" style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        {/* Hero Section - Saç Durumu Kontrolü */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroIcon}>🔬</Text>
            </View>
            <Text weight="bold" style={styles.heroTitle}>
              Saç Durumu Kontrolü
            </Text>
            <Text weight="regular" style={styles.heroDescription}>
              Yapay zeka destekli saç analizi ile saç sağlığınızı hemen kontrol edin
            </Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={handleStartCheck}
            >
              <Text weight="bold" style={styles.heroButtonText}>
                Kontrol Başlat
              </Text>
              <Text style={styles.heroButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Son Kontrol Sonucu */}
        {lastCheck ? (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>Son Kontrol Sonucu</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text weight="semibold" style={styles.resultDate}>
                    {lastCheck.date}
                  </Text>
                  <View style={styles.resultStatus}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(lastCheck.status) }
                      ]} 
                    />
                    <Text 
                      weight="semibold" 
                      style={[
                        styles.statusText,
                        { color: getStatusColor(lastCheck.status) }
                      ]}
                    >
                      {getStatusText(lastCheck.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreContainer}>
                  <Text weight="bold" style={styles.scoreNumber}>
                    {lastCheck.score}
                  </Text>
                  <Text weight="regular" style={styles.scoreLabel}>
                    /100
                  </Text>
                </View>
              </View>
              <Text weight="regular" style={styles.resultNotes}>
                {lastCheck.notes}
              </Text>
              <TouchableOpacity style={styles.resultButton}>
                <Text weight="semibold" style={styles.resultButtonText}>
                  Detayları Gör
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text weight="bold" style={styles.sectionTitle}>Kontrol Geçmişi</Text>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text weight="medium" style={styles.emptyTitle}>
                Henüz kontrol yapılmadı
              </Text>
              <Text weight="regular" style={styles.emptyDescription}>
                İlk saç durumu kontrolünüzü yaparak saç sağlığınızı takip etmeye başlayın
              </Text>
            </View>
          </View>
        )}

        {/* İstatistikler */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <Text weight="bold" style={styles.statNumber}>0</Text>
              <Text weight="regular" style={styles.statLabel}>Toplam Kontrol</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text weight="bold" style={styles.statNumber}>-</Text>
              <Text weight="regular" style={styles.statLabel}>İyileşme</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text weight="bold" style={styles.statNumber}>-</Text>
              <Text weight="regular" style={styles.statLabel}>Son Kontrol</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text weight="bold" style={styles.statNumber}>-</Text>
              <Text weight="regular" style={styles.statLabel}>Ortalama Skor</Text>
            </View>
          </View>
        </View>

        {/* Öneriler */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Öneriler</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text weight="semibold" style={styles.tipTitle}>
                Düzenli Kontrol
              </Text>
              <Text weight="regular" style={styles.tipDescription}>
                Saç sağlığınızı ayda bir kez kontrol ederek değişimleri takip edin
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🌞</Text>
            <View style={styles.tipContent}>
              <Text weight="semibold" style={styles.tipTitle}>
                Güneş Koruması
              </Text>
              <Text weight="regular" style={styles.tipDescription}>
                Saç derinizi güneşin zararlı etkilerinden koruyun
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💧</Text>
            <View style={styles.tipContent}>
              <Text weight="semibold" style={styles.tipTitle}>
                Yeterli Su Tüketimi
              </Text>
              <Text weight="regular" style={styles.tipDescription}>
                Günde en az 2 litre su tüketerek saç sağlığınızı destekleyin
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text weight="semibold" style={styles.actionText}>Randevu Al</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text weight="semibold" style={styles.actionText}>Uzman Desteği</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    color: '#1A1A1A',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  heroButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  heroButtonIcon: {
    fontSize: 18,
    color: '#3B82F6',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 32,
    color: '#1A1A1A',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  resultNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  resultButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
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
  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
  },
});

export default HomeScreen;

