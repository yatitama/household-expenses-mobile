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
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  danger: {
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    border: 'border-danger-200',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  info: {
    bg: 'bg-info-50',
    text: 'text-info-700',
    border: 'border-info-200',
  },
  default: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    border: 'border-primary-300',
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
