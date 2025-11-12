import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text } from '../../components';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { Message, ChatUser } from '../../types';

interface ChatScreenProps {
  navigation?: any;
  route?: {
    params?: {
      chatUser?: ChatUser;
      isAdmin?: boolean;
    };
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const chatUser = route?.params?.chatUser;
  const isAdmin = route?.params?.isAdmin || false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!chatUser) {
    navigation?.goBack();
    return null;
  }

  // Mesaj dinleme user_id'sine göre ayarla
  const messageUserId = isAdmin ? chatUser.user_id : user?.id;

  // Mesajları okundu olarak işaretleme fonksiyonu
  const markMessagesAsRead = useCallback(async () => {
    try {
      if (isAdmin) {
        // Admin okunmamış kullanıcı mesajlarını işaretle
        const { data, error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('user_id', messageUserId)
          .eq('is_from_admin', false)
          .eq('is_read', false)
          .select();

        if (error) throw error;
        console.log(
          `✅ Admin: ${data?.length || 0} mesaj okundu olarak işaretlendi`,
        );
      } else {
        // Kullanıcı okunmamış admin mesajlarını işaretle
        const { data, error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('user_id', messageUserId)
          .eq('is_from_admin', true)
          .eq('is_read', false)
          .select();

        if (error) throw error;
        console.log(
          `✅ Kullanıcı: ${
            data?.length || 0
          } admin mesajı okundu olarak işaretlendi`,
        );
      }
    } catch (error) {
      console.error('❌ Mark as read error:', error);
    }
  }, [messageUserId, isAdmin]);

  useEffect(() => {
    fetchMessages();

    // Gerçek zamanlı mesaj dinleme
    const channel = supabase
      .channel(`chat-${messageUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${messageUserId}`,
        },
        payload => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();

          // Mesaj okundu olarak işaretle
          if (isAdmin && !(payload.new as Message).is_from_admin) {
            markMessageAsRead((payload.new as Message).id);
          } else if (!isAdmin && (payload.new as Message).is_from_admin) {
            markMessageAsRead((payload.new as Message).id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageUserId]);

  // Ekran focus olduğunda ve unmount olduğunda mesajları okundu işaretle
  useFocusEffect(
    useCallback(() => {
      console.log(
        '📱 Chat ekranı focus oldu, mesajlar okundu olarak işaretleniyor...',
      );
      // Focus olduğunda mesajları okundu işaretle
      markMessagesAsRead();

      // Cleanup: Ekrandan çıkılırken de okundu işaretle (son kez)
      return () => {
        console.log(
          '👋 Chat ekranından çıkılıyor, son kez mesajlar okundu işaretleniyor...',
        );
        // Ekrandan çıkarken de son kez işaretle
        markMessagesAsRead().catch(err =>
          console.error('❌ Cleanup mark as read error:', err),
        );
      };
    }, [markMessagesAsRead]),
  );

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', messageUserId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error('❌ Fetch messages error:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('❌ Mark single message as read error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            user_id: messageUserId,
            message: messageText,
            is_from_admin: isAdmin,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      scrollToBottom();
    } catch (error: any) {
      console.error('❌ Send message error:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
      });
    }
  };

  // Mesajları tarihe göre grupla
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  // Mesajın kimden olduğunu belirle
  const isMyMessage = (message: Message) => {
    if (isAdmin) {
      return message.is_from_admin;
    } else {
      return !message.is_from_admin;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {chatUser.avatar_url ? (
            <Image
              source={{ uri: chatUser.avatar_url }}
              style={styles.headerAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headerAvatar}>
              <Text weight="bold" style={styles.headerAvatarText}>
                {chatUser.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text weight="bold" style={styles.headerName}>
              {chatUser.full_name}
            </Text>
            {isAdmin && (
              <Text weight="regular" style={styles.headerEmail}>
                {chatUser.email}
              </Text>
            )}
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#01213D" />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          >
            {Object.keys(messageGroups).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text weight="medium" style={styles.emptyText}>
                  Henüz mesaj yok. İlk mesajı gönderin!
                </Text>
              </View>
            ) : (
              Object.keys(messageGroups).map(dateKey => (
                <View key={dateKey}>
                  <View style={styles.dateSeparator}>
                    <Text weight="medium" style={styles.dateText}>
                      {formatDate(messageGroups[dateKey][0].created_at)}
                    </Text>
                  </View>
                  {messageGroups[dateKey].map(message => {
                    const isMine = isMyMessage(message);
                    return (
                      <View
                        key={message.id}
                        style={[
                          styles.messageBubble,
                          isMine ? styles.myMessage : styles.theirMessage,
                        ]}
                      >
                        {!isMine && !isAdmin && (
                          <Text weight="semibold" style={styles.senderName}>
                            Uzman Destek
                          </Text>
                        )}
                        <Text
                          weight="regular"
                          style={[
                            styles.messageText,
                            isMine && styles.myMessageText,
                          ]}
                        >
                          {message.message}
                        </Text>
                        <Text
                          weight="regular"
                          style={[
                            styles.messageTime,
                            isMine && styles.myMessageTime,
                          ]}
                        >
                          {formatTime(message.created_at)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Text style={styles.sendIcon}>{sending ? '⏳' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  headerEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#01213D',
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: '#1A1A1A',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#01213D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});

export default ChatScreen;
