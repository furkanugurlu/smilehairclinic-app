import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, LoadingModal } from '../../components';
import { supabase } from '../../config/supabase';
import { ChatUser } from '../../types';

interface AdminMessagesScreenProps {
  navigation: any;
}

const AdminMessagesScreen: React.FC<AdminMessagesScreenProps> = ({ navigation }) => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChatUsers();
    
    // Gerçek zamanlı mesaj dinleme
    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchChatUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChatUsers = async () => {
    try {
      setLoading(true);

      // Tüm mesaj gönderen kullanıcıları bul
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false);

      if (usersError) throw usersError;

      // Her kullanıcı için son mesaj ve okunmamış sayısını bul
      const chatUsersWithMessages = await Promise.all(
        (users || []).map(async (user) => {
          // Son mesaj
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Okunmamış mesaj sayısı
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_from_admin', false)
            .eq('is_read', false);

          return {
            user_id: user.id,
            full_name: user.full_name || 'İsimsiz Kullanıcı',
            email: user.email,
            avatar_url: user.avatar_url,
            last_message: lastMessage?.message,
            last_message_time: lastMessage?.created_at,
            unread_count: unreadCount || 0,
          };
        })
      );

      // Son mesaj zamanına göre sırala
      const sorted = chatUsersWithMessages.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      setChatUsers(sorted);
    } catch (error: any) {
      console.error('❌ Fetch chat users error:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChatUsers();
    setRefreshing(false);
  }, []);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } else if (diffDays > 0) {
      return `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      return `${diffHours} saat önce`;
    } else {
      return 'Az önce';
    }
  };

  const handleChatPress = (chatUser: ChatUser) => {
    navigation.navigate('AdminChat', { chatUser });
  };

  if (loading && !refreshing) {
    return <LoadingModal visible={true} message="Yükleniyor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>Mesajlar</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {chatUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text weight="semibold" style={styles.emptyTitle}>
              Henüz Mesaj Yok
            </Text>
            <Text weight="regular" style={styles.emptyText}>
              Kullanıcılar size mesaj gönderdiğinde burada görünecek
            </Text>
          </View>
        ) : (
          <View style={styles.chatList}>
            {chatUsers.map((chatUser) => (
              <TouchableOpacity
                key={chatUser.user_id}
                style={styles.chatItem}
                onPress={() => handleChatPress(chatUser)}
              >
                <View style={styles.avatarContainer}>
                  {chatUser.avatar_url ? (
                    <View style={styles.avatar}>
                      {/* TODO: Image component */}
                    </View>
                  ) : (
                    <View style={styles.avatar}>
                      <Text weight="bold" style={styles.avatarText}>
                        {chatUser.full_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {chatUser.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text weight="bold" style={styles.unreadText}>
                        {chatUser.unread_count}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <Text weight="semibold" style={styles.userName}>
                      {chatUser.full_name}
                    </Text>
                    <Text weight="regular" style={styles.timeText}>
                      {formatTime(chatUser.last_message_time)}
                    </Text>
                  </View>
                  <Text
                    weight={chatUser.unread_count > 0 ? 'semibold' : 'regular'}
                    style={[
                      styles.lastMessage,
                      chatUser.unread_count > 0 && styles.unreadMessage,
                    ]}
                    numberOfLines={1}
                  >
                    {chatUser.last_message || 'Henüz mesaj yok'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  chatList: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    color: '#1A1A1A',
  },
});

export default AdminMessagesScreen;

