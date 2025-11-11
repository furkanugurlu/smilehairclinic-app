import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, LoadingModal } from '../../components';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { Message, ChatUser } from '../../types';

interface AdminChatScreenProps {
  navigation?: any;
  route?: {
    params?: {
      chatUser?: ChatUser;
    };
  };
}

const AdminChatScreen: React.FC<AdminChatScreenProps> = ({ navigation, route }) => {
  const { user: adminUser } = useAuthStore();
  const chatUser = route?.params?.chatUser;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  if (!chatUser) {
    return <LoadingModal visible={true} message="Yükleniyor..." />;
  }

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();

    // Gerçek zamanlı mesaj dinleme
    const channel = supabase
      .channel(`chat-${chatUser.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${chatUser.user_id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatUser.user_id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', chatUser.user_id)
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

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('user_id', chatUser.user_id)
        .eq('is_from_admin', false)
        .eq('is_read', false);
    } catch (error) {
      console.error('❌ Mark as read error:', error);
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
            user_id: chatUser.user_id,
            message: messageText,
            is_from_admin: true,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
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
    
    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (loading) {
    return <LoadingModal visible={true} message="Mesajlar yükleniyor..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text weight="bold" style={styles.headerName}>
            {chatUser.full_name}
          </Text>
          <Text weight="regular" style={styles.headerEmail}>
            {chatUser.email}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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
            Object.keys(messageGroups).map((dateKey) => (
              <View key={dateKey}>
                <View style={styles.dateSeparator}>
                  <Text weight="medium" style={styles.dateText}>
                    {formatDate(messageGroups[dateKey][0].created_at)}
                  </Text>
                </View>
                {messageGroups[dateKey].map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.is_from_admin
                        ? styles.adminMessage
                        : styles.userMessage,
                    ]}
                  >
                    <Text
                      weight="regular"
                      style={[
                        styles.messageText,
                        message.is_from_admin && styles.adminMessageText,
                      ]}
                    >
                      {message.message}
                    </Text>
                    <Text
                      weight="regular"
                      style={[
                        styles.messageTime,
                        message.is_from_admin && styles.adminMessageTime,
                      ]}
                    >
                      {formatTime(message.created_at)}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.inputContainer}>
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
            <Text style={styles.sendIcon}>
              {sending ? '⏳' : '➤'}
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  adminMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 4,
  },
  adminMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  adminMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: '#3B82F6',
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

export default AdminChatScreen;

