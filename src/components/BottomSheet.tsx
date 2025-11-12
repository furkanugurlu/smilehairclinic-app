import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Text from './Text';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: React.ReactNode;
  showConfirmButton?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  children,
  showConfirmButton = true,
  confirmText = 'Tamam',
  cancelText = 'İptal',
}) => {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.content}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text weight="semibold" style={styles.cancelText}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <Text weight="bold" style={styles.title}>
              {title}
            </Text>
            
            {showConfirmButton ? (
              <TouchableOpacity onPress={onConfirm || onClose}>
                <Text weight="semibold" style={styles.confirmText}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>

          {/* Content */}
          <View style={styles.body}>
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    minWidth: 60,
  },
  confirmText: {
    fontSize: 16,
    color: '#3B82F6',
    minWidth: 60,
    textAlign: 'right',
  },
  body: {
    paddingTop: 8,
  },
});

