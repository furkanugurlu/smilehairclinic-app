import { supabase } from '../config/supabase';
import { launchImageLibrary } from 'react-native-image-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export const pickImageFromGallery = async (): Promise<ImagePickerResult | null> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (result.didCancel) {
      console.log('📸 Kullanıcı resim seçimini iptal etti');
      return null;
    }

    if (result.errorCode) {
      console.error('❌ Resim seçme hatası:', result.errorMessage);
      throw new Error(result.errorMessage);
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      throw new Error('Resim seçilemedi');
    }

    return {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      size: asset.fileSize || 0,
    };
  } catch (error) {
    console.error('❌ Resim seçme hatası:', error);
    throw error;
  }
};

export const uploadAvatarToSupabase = async (
  userId: string,
  imageData: ImagePickerResult
): Promise<string> => {
  try {
    console.log('📤 Avatar yükleniyor...');

    // Dosya uzantısını al
    const fileExt = imageData.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // XMLHttpRequest ile dosyayı ArrayBuffer olarak oku
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', imageData.uri, true);
      xhr.responseType = 'arraybuffer';
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Failed to load image: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send();
    });

    console.log('📦 Dosya hazırlandı:', {
      size: arrayBuffer.byteLength,
      type: imageData.type,
    });

    // Supabase Storage'a yükle (ArrayBuffer olarak)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: imageData.type,
        upsert: false,
      });

    if (error) {
      console.error('❌ Storage yükleme hatası:', error);
      throw error;
    }

    console.log('✅ Avatar yüklendi:', data.path);

    // Public URL'i al
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('❌ Avatar yükleme hatası:', error);
    throw error;
  }
};

export const deleteAvatarFromSupabase = async (avatarUrl: string): Promise<void> => {
  try {
    if (!avatarUrl) return;

    // URL'den dosya yolunu çıkar
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length < 2) return;

    const filePath = `avatars/${urlParts[1]}`;

    const { error } = await supabase.storage.from('avatars').remove([filePath]);

    if (error) {
      console.error('⚠️ Eski avatar silme hatası:', error);
    } else {
      console.log('🗑️ Eski avatar silindi');
    }
  } catch (error) {
    console.error('❌ Avatar silme hatası:', error);
  }
};

