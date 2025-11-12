import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, LoadingModal } from '../../components';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { ChatUser } from '../../types';

interface MessageListScreenProps {
  navigation: any;
}

const MessageListScreen: React.FC<MessageListScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.is_admin || false;
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChatUsers();

    // Gerçek zamanlı mesaj dinleme - INSERT ve UPDATE eventlerini dinle
    const channel = supabase
      .channel('messages-list-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          console.log('📨 Yeni mesaj geldi, liste güncelleniyor...');
          fetchChatUsers(false);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          console.log(
            '✏️ Mesaj güncellendi (okundu işaretlendi), liste güncelleniyor...',
          );
          // UPDATE olduğunda badge'leri yenilemek için
          fetchChatUsers(false);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAdmin]);

  // Ekran focus olduğunda listeyi yenile (chat'ten geri dönüldüğünde)
  useFocusEffect(
    useCallback(() => {
      console.log('📱 MessageList ekranı focus oldu, liste yenileniyor...');
      fetchChatUsers(false);
    }, [user?.id, isAdmin]),
  );

  const fetchChatUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      if (isAdmin) {
        // Admin: Tüm kullanıcıları listele
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_admin', false);

        if (usersError) throw usersError;

        // Her kullanıcı için son mesaj ve okunmamış sayısını bul
        const chatUsersWithMessages = await Promise.all(
          (users || []).map(async user => {
            // Son mesaj
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Okunmamış mesaj sayısı (kullanıcıdan gelen okunmamış mesajlar)
            const { count: unreadCount, error: countError } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('is_from_admin', false)
              .eq('is_read', false);

            if (countError) {
              console.error(
                '❌ Unread count error for user:',
                user.id,
                countError,
              );
            }

            console.log(
              `📊 Kullanıcı ${user.full_name} için okunmamış mesaj sayısı:`,
              unreadCount,
            );

            return {
              user_id: user.id,
              full_name: user.full_name || 'İsimsiz Kullanıcı',
              email: user.email,
              avatar_url: user.avatar_url,
              last_message: lastMessage?.message,
              last_message_time: lastMessage?.created_at,
              unread_count: unreadCount || 0,
            };
          }),
        );

        // Son mesaj zamanına göre sırala
        const sorted = chatUsersWithMessages.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return (
            new Date(b.last_message_time).getTime() -
            new Date(a.last_message_time).getTime()
          );
        });

        console.log(
          '📋 Admin chat listesi güncellendi. Kullanıcı sayısı:',
          sorted.length,
        );
        sorted.forEach(u => {
          if (u.unread_count > 0) {
            console.log(
              `  🔴 ${u.full_name}: ${u.unread_count} okunmamış mesaj`,
            );
          } else {
            console.log(`  ✅ ${u.full_name}: tüm mesajlar okundu`);
          }
        });

        setChatUsers(sorted);
      } else {
        // Normal kullanıcı: Sadece admin ile konuşmayı göster
        // Admin profili bul
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_admin', true)
          .limit(1)
          .maybeSingle();

        // Son mesaj
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Okunmamış mesaj sayısı (admin'den gelen okunmamış mesajlar)
        const { count: unreadCount, error: countError } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('is_from_admin', true)
          .eq('is_read', false);

        if (countError) {
          console.error('❌ Unread count error:', countError);
        }

        const finalUnreadCount = unreadCount || 0;
        console.log(
          '📊 Kullanıcı için admin mesajlarından okunmamış sayısı:',
          finalUnreadCount,
        );

        if (finalUnreadCount > 0) {
          console.log(`  🔴 Uzman Destek: ${finalUnreadCount} okunmamış mesaj`);
        } else {
          console.log('  ✅ Uzman Destek: tüm mesajlar okundu');
        }

        setChatUsers([
          {
            user_id: adminProfile?.id || 'admin',
            full_name: 'Uzman Destek',
            email: adminProfile?.email || '',
            avatar_url: adminProfile?.avatar_url,
            last_message: lastMessage?.message,
            last_message_time: lastMessage?.created_at,
            unread_count: finalUnreadCount,
          },
        ]);
      }
    } catch (error: any) {
      console.error('❌ Fetch chat users error:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChatUsers(false);
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
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      });
    } else if (diffDays > 0) {
      return `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      return `${diffHours} saat önce`;
    } else {
      return 'Az önce';
    }
  };

  const handleChatPress = (chatUser: ChatUser) => {
    navigation.navigate('Chat', { chatUser, isAdmin });
  };

  console.log('chatUsers', chatUsers);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>
          {isAdmin ? 'Mesajlar' : 'Destek'}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#01213D" />
        </View>
      ) : (
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
                {isAdmin ? 'Henüz Mesaj Yok' : 'Mesaj Bulunamadı'}
              </Text>
              <Text weight="regular" style={styles.emptyText}>
                {isAdmin
                  ? 'Kullanıcılar size mesaj gönderdiğinde burada görünecek'
                  : 'Henüz bir mesajınız bulunmuyor. Uzman ekibimizle iletişime geçmek için mesaj gönderebilirsiniz.'}
              </Text>
            </View>
          ) : (
            <View style={styles.chatList}>
              {chatUsers.map(chatUser => (
                <TouchableOpacity
                  key={chatUser.user_id}
                  style={styles.chatItem}
                  onPress={() => handleChatPress(chatUser)}
                >
                  <View style={styles.avatarContainer}>
                    {chatUser.avatar_url ? (
                      <Image
                        source={{ uri: chatUser.avatar_url }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
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
                      weight={
                        chatUser.unread_count > 0 ? 'semibold' : 'regular'
                      }
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 68,
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
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
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

export default MessageListScreen;
