import { ActivityIndicator, Modal, View, Text } from 'react-native';
import { UI_COLORS } from '../../constants/colors';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const rnSize = size === 'sm' ? 'small' : 'large';
  return (
    <ActivityIndicator
      size={rnSize}
      color={UI_COLORS.iconActive}
      accessibilityLabel="読み込み中..."
      accessible
    />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      accessibilityViewIsModal
      accessible
      accessibilityLabel={message ? `${message} - 読み込み中` : '読み込み中'}
    >
      <View
        className="flex-1 bg-black/40 items-center justify-center"
        accessible
        accessibilityLabel="ローディングオーバーレイ"
      >
        <View className="bg-white rounded-xl p-8 items-center">
          <ActivityIndicator size="large" color={UI_COLORS.iconActive} />
          {message && (
            <Text className="mt-4 text-gray-900 font-semibold text-center">{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
