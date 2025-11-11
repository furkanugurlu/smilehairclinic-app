import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { AuthState, User } from '../types';
import { Alert } from 'react-native';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    console.log('initialize');
    try {
      // Mevcut session'ı kontrol et
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Aktif session bulundu, kullanıcı bilgileri yükleniyor...');
        
        // Profil bilgilerini çek
        const { data: userData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.warn('⚠️ Profil bulunamadı, temel bilgiler kullanılıyor:', profileError.message);
        }

        console.log('📊 userData:', userData);
        console.log('📊 is_admin değeri:', userData?.is_admin);
        
        // userData profiles'dan geliyor, is_admin orada!
        const user: User = {
          id: userData?.id || session.user.id,
          email: userData?.email || session.user.email || '',
          full_name: userData?.full_name || session.user.user_metadata?.full_name || '',
          phone: userData?.phone || session.user.user_metadata?.phone || '',
          created_at: userData?.created_at || session.user.created_at || '',
          updated_at: userData?.updated_at || session.user.updated_at || '',
          avatar_url: userData?.avatar_url || session.user.user_metadata?.avatar_url || '',
          is_admin: userData?.is_admin || false, // ← profiles'dan geliyor!
        };

        console.log('✅ Kullanıcı otomatik giriş yaptı:', user.email, '| is_admin:', user.is_admin);

        set({
          session,
          user,
          loading: false,
        });
      } else {
        console.log('ℹ️ Aktif session bulunamadı');
        set({ user: null, session: null, loading: false });
      }

      // Auth state değişikliklerini dinle
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state değişti:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Kullanıcı giriş yaptı
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('🔄 SIGNED_IN - userData:', userData);
          console.log('🔄 SIGNED_IN - is_admin:', userData?.is_admin);
            
          // userData profiles'dan geliyor, is_admin orada!
          const user: User = {
            id: userData?.id || session.user.id,
            email: userData?.email || session.user.email || '',
            full_name: userData?.full_name || session.user.user_metadata?.full_name || '',
            phone: userData?.phone || session.user.user_metadata?.phone || '',
            created_at: userData?.created_at || session.user.created_at || '',
            updated_at: userData?.updated_at || session.user.updated_at || '',
            avatar_url: userData?.avatar_url || session.user.user_metadata?.avatar_url || '',
            is_admin: userData?.is_admin || false, // ← profiles'dan geliyor!
          };

          console.log('✅ SIGNED_IN tamamlandı:', user.email, '| is_admin:', user.is_admin);

          set({
            session,
            user,
            loading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          // Kullanıcı çıkış yaptı
          set({ user: null, session: null, loading: false });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token yenilendi
          set({ session });
        }
      });
    } catch (error) {
      console.error('❌ Initialize error:', error);
      set({ user: null, session: null, loading: false });
    }
  },

  signUp: async (email: string, password: string, fullName: string, phone: string) => {
    try {
      set({ loading: true });
      console.log('📝 Kayıt işlemi başlatılıyor:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ Kullanıcı oluşturuldu, profil kaydediliyor...');
        
        // Profil oluştur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              phone: phone,
            },
          ]);

        if (profileError) {
          console.error('⚠️ Profil oluşturma hatası:', profileError);
        } else {
          console.log('✅ Profil kaydedildi');
        }

        
        // onAuthStateChange event'i user'ı set edecek
        // loading false burada değil orada yapılacak
      }
    } catch (error: any) {
      console.error('❌ Kayıt hatası:', error);
      set({ loading: false });
      Alert.alert('Hata', error.message || 'Kayıt sırasında bir hata oluştu');
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      console.log('🔐 Giriş işlemi başlatılıyor:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        console.log('✅ Giriş başarılı, session oluşturuldu');
        console.log('💾 Session AsyncStorage\'a kaydediliyor...');
        
        // onAuthStateChange event'i otomatik tetiklenecek ve user'ı set edecek
        // Bu yüzden burada manuel set yapmaya gerek yok
      }
    } catch (error: any) {
      console.error('❌ Giriş hatası:', error);
      set({ loading: false });
      Alert.alert('Hata', error.message || 'Giriş sırasında bir hata oluştu');
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      set({ loading: false });
      Alert.alert('Hata', error.message || 'Çıkış sırasında bir hata oluştu');
      throw error;
    }
  },
}));

