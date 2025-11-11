import { supabase } from '../config/supabase';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { decode as base64Decode } from 'base-64';

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
    console.log('📤 Avatar yükleniyor (react-native-blob-util)...', { 
      uri: imageData.uri,
      type: imageData.type,
      name: imageData.name,
    });

    // Dosya uzantısını al
    const fileExt = imageData.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Dosya path'ini temizle (file:// önekini kaldır)
    const cleanUri = imageData.uri.replace('file://', '');
    
    console.log('📥 Dosya base64\'e çevriliyor...', { cleanUri });
    
    // Dosyayı base64 olarak oku (Native module kullanarak - Android uyumlu)
    const base64Data = await ReactNativeBlobUtil.fs.readFile(cleanUri, 'base64');
    
    console.log('📦 Base64 hazırlandı, boyut:', base64Data.length);
    
    // Base64'ü ArrayBuffer'a çevir
    const binaryString = base64Decode(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;
    
    console.log('⬆️ Supabase Storage\'a yükleniyor...', {
      size: arrayBuffer.byteLength,
      type: imageData.type,
    });

    // Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: imageData.type || 'image/jpeg',
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

    console.log('🔗 Public URL alındı:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('❌ Avatar yükleme hatası detayı:', {
      message: error.message,
      name: error.name,
      uri: imageData.uri,
    });
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

// Hair Check Photo Upload Functions
export const uploadHairCheckPhoto = async (
  userId: string,
  imageData: ImagePickerResult,
  photoType: string
): Promise<string> => {
  try {
    console.log(`📤 Hair check ${photoType} fotoğrafı yükleniyor...`, {
      uri: imageData.uri,
      type: imageData.type,
      name: imageData.name,
    });

    // Dosya uzantısını al
    const fileExt = imageData.name.split('.').pop();
    const fileName = `${userId}_${photoType}_${Date.now()}.${fileExt}`;
    const filePath = `hair-checks/${fileName}`;

    // Dosya path'ini temizle (file:// önekini kaldır)
    const cleanUri = imageData.uri.replace('file://', '');

    console.log('📥 Dosya base64\'e çevriliyor...', { cleanUri });

    // Dosyayı base64 olarak oku
    const base64Data = await ReactNativeBlobUtil.fs.readFile(cleanUri, 'base64');

    console.log('📦 Base64 hazırlandı, boyut:', base64Data.length);

    // Base64'ü ArrayBuffer'a çevir
    const binaryString = base64Decode(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    console.log('⬆️ Supabase Storage\'a yükleniyor...', {
      size: arrayBuffer.byteLength,
      type: imageData.type,
    });

    // Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from('hair-check-photos')
      .upload(filePath, arrayBuffer, {
        contentType: imageData.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('❌ Storage yükleme hatası:', error);
      throw error;
    }

    console.log('✅ Hair check fotoğrafı yüklendi:', data.path);

    // Public URL'i al
    const { data: publicUrlData } = supabase.storage
      .from('hair-check-photos')
      .getPublicUrl(data.path);

    console.log('🔗 Public URL alındı:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('❌ Hair check fotoğraf yükleme hatası:', {
      message: error.message,
      name: error.name,
      uri: imageData.uri,
      photoType,
    });
    throw error;
  }
};

export const uploadMultipleHairCheckPhotos = async (
  userId: string,
  photos: { [key: string]: ImagePickerResult }
): Promise<{ [key: string]: string }> => {
  try {
    console.log('📤 Tüm hair check fotoğrafları yükleniyor...', Object.keys(photos));

    const uploadPromises = Object.entries(photos).map(async ([photoType, imageData]) => {
      const url = await uploadHairCheckPhoto(userId, imageData, photoType);
      return { photoType, url };
    });

    const results = await Promise.all(uploadPromises);

    const photoUrls: { [key: string]: string } = {};
    results.forEach(({ photoType, url }) => {
      photoUrls[photoType] = url;
    });

    console.log('✅ Tüm fotoğraflar yüklendi:', photoUrls);

    return photoUrls;
  } catch (error) {
    console.error('❌ Çoklu fotoğraf yükleme hatası:', error);
    throw error;
  }
};

export const deleteHairCheckPhotos = async (photoUrls: string[]): Promise<void> => {
  try {
    if (!photoUrls || photoUrls.length === 0) return;

    const filePaths = photoUrls
      .filter(url => url)
      .map(url => {
        const urlParts = url.split('/hair-checks/');
        if (urlParts.length < 2) return null;
        return `hair-checks/${urlParts[1]}`;
      })
      .filter(path => path !== null) as string[];

    if (filePaths.length === 0) return;

    const { error } = await supabase.storage.from('hair-check-photos').remove(filePaths);

    if (error) {
      console.error('⚠️ Hair check fotoğrafları silme hatası:', error);
    } else {
      console.log('🗑️ Hair check fotoğrafları silindi:', filePaths.length);
    }
  } catch (error) {
    console.error('❌ Hair check fotoğrafları silme hatası:', error);
  }
};

