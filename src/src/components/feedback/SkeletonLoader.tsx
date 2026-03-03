import { View } from 'react-native';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <View className={`bg-primary-200 dark:bg-primary-700 rounded-md ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <View className="bg-white rounded-lg p-md gap-md">
    <View className="flex-row items-center gap-sm">
      <Skeleton className="w-10 h-10 rounded-full" />
      <View className="flex-1 gap-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </View>
    </View>
    <View className="gap-sm">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </View>
  </View>
);
