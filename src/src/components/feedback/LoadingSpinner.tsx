import { ActivityIndicator, Modal, View, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const rnSize = size === 'sm' ? 'small' : 'large';
  return <ActivityIndicator size={rnSize} color="#1f2937" />;
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center">
        <View className="bg-white rounded-lg p-lg items-center">
          <ActivityIndicator size="large" color="#1f2937" />
          {message && (
            <Text className="mt-md text-primary-900 font-semibold text-center">{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
