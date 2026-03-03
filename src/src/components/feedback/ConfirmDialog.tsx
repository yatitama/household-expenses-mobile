import { Modal, View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '実行',
  confirmVariant = 'danger',
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white dark:bg-primary-800 rounded-md p-lg max-w-sm w-full mx-lg gap-lg">
          <View className="gap-sm">
            <Text className="text-xl font-bold text-primary-900 dark:text-primary-50">
              {title}
            </Text>
            <Text className="text-base text-primary-600 dark:text-primary-300">
              {message}
            </Text>
          </View>
          <View className="flex-row gap-md">
            <View className="flex-1">
              <Button variant="secondary" size="md" onPress={onClose}>
                キャンセル
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant={confirmVariant}
                size="md"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
