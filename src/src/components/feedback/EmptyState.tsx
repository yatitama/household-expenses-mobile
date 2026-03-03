import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <View className="flex flex-col items-center justify-center py-2xl px-md">
      <View className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-md">
        {icon}
      </View>
      <Text className="text-xl font-bold mb-sm text-primary-900 dark:text-primary-100">{title}</Text>
      <Text className="text-primary-600 dark:text-primary-400 text-center mb-lg">{description}</Text>
      {action && (
        <TouchableOpacity
          onPress={action.onClick}
          className="px-lg py-sm bg-primary-700 rounded-md"
        >
          <Text className="text-white font-medium">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
