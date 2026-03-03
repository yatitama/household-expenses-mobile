import { View, Text, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import { COLORS_SEMANTIC } from '../../constants/colors';

type AlertVariant = 'success' | 'danger' | 'warning' | 'info';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  showIcon?: boolean;
  className?: string;
  style?: ViewStyle;
}

const variantStyles: Record<AlertVariant, {
  bg: string;
  border: string;
  text: string;
  icon: (size: number) => ReactNode;
}> = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900',
    border: 'border-success-200 dark:border-success-700',
    text: 'text-success-700 dark:text-success-200',
    icon: (size) => <CheckCircle size={size} color={COLORS_SEMANTIC.success500} />,
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-900',
    border: 'border-danger-200 dark:border-danger-700',
    text: 'text-danger-700 dark:text-danger-200',
    icon: (size) => <AlertCircle size={size} color={COLORS_SEMANTIC.danger500} />,
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900',
    border: 'border-warning-200 dark:border-warning-700',
    text: 'text-warning-700 dark:text-warning-200',
    icon: (size) => <AlertTriangle size={size} color={COLORS_SEMANTIC.warning500} />,
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900',
    border: 'border-info-200 dark:border-info-700',
    text: 'text-info-700 dark:text-info-200',
    icon: (size) => <Info size={size} color={COLORS_SEMANTIC.accent500} />,
  },
};

export const Alert = ({
  children,
  variant = 'info',
  showIcon = true,
  className = '',
  style,
}: AlertProps) => {
  const styles = variantStyles[variant];

  return (
    <View
      className={`
        border rounded-md p-lg
        flex-row gap-md items-start
        ${styles.bg} ${styles.border}
        ${className}
      `}
      style={style}
    >
      {showIcon && (
        <View className="pt-xs">
          {styles.icon(16)}
        </View>
      )}
      <View className="flex-1">
        {typeof children === 'string' ? (
          <Text className={`text-sm ${styles.text}`}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
};
