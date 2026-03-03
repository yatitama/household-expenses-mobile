import { View, Text, ViewStyle } from 'react-native';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    text: 'text-success-700 dark:text-success-400',
    border: 'border-success-200 dark:border-success-700',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-900/30',
    text: 'text-danger-700 dark:text-danger-400',
    border: 'border-danger-200 dark:border-danger-700',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/30',
    text: 'text-warning-700 dark:text-warning-400',
    border: 'border-warning-200 dark:border-warning-700',
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900/30',
    text: 'text-info-700 dark:text-info-400',
    border: 'border-info-200 dark:border-info-700',
  },
  default: {
    bg: 'bg-primary-100 dark:bg-primary-800',
    text: 'text-primary-700 dark:text-primary-300',
    border: 'border-primary-300 dark:border-primary-600',
  },
};

const sizeStyles: Record<BadgeSize, { text: string; padding: string }> = {
  sm: {
    text: 'text-label',
    padding: 'px-sm py-xs',
  },
  md: {
    text: 'text-sm',
    padding: 'px-md py-sm',
  },
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style,
}: BadgeProps) => {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <View
      className={`${styles.bg} ${sizes.padding} rounded-sm border ${styles.border} ${className}`}
      style={style}
    >
      <Text className={`${sizes.text} font-medium ${styles.text}`}>
        {children}
      </Text>
    </View>
  );
};
