import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../../../components';
import { useAuthStore } from '../../../store/authStore';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text weight="bold" style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text weight="bold" style={styles.name}>
              {user?.full_name || 'Kullanıcı'}
            </Text>
            <Text weight="regular" style={styles.email}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            Hesap
          </Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <Icon
              name="person-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              Profil Bilgileri
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Icon
              name="lock-closed-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              Şifre Değiştir
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            Ayarlar
          </Text>
          {/* <TouchableOpacity style={styles.menuItem}>
            <Icon
              name="notifications-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              Bildirimler
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Language')}
          >
            <Icon
              name="language-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              Dil
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text weight="semibold" style={styles.sectionTitle}>
            Destek
          </Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <Icon
              name="help-circle-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              Yardım Merkezi
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Contact')}
          >
            <Icon
              name="mail-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              İletişim
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('About')}
          >
            <Icon
              name="information-circle-outline"
              size={24}
              color="#01213D"
              style={styles.menuIcon}
            />
            <Text weight="regular" style={styles.menuText}>
              Hakkında
            </Text>
            <Icon name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text weight="semibold" style={styles.signOutText}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 40,
  },
  signOutText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default ProfileScreen;
