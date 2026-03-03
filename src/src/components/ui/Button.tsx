import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'ghost' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  success: 'bg-success-500 active:bg-success-600',
  danger: 'bg-danger-500 active:bg-danger-600',
  warning: 'bg-warning-500 active:bg-warning-600',
  ghost: 'bg-transparent border border-primary-300 active:bg-primary-50',
  secondary: 'bg-primary-200 active:bg-primary-300',
};

const textColorStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  success: 'text-white',
  danger: 'text-white',
  warning: 'text-white',
  ghost: 'text-primary-700',
  secondary: 'text-primary-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-sm py-xs rounded-sm',
  md: 'px-md py-sm rounded-md',
  lg: 'px-lg py-md rounded-lg',
};

export const Button = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) => {
  const baseStyles = 'items-center justify-center flex-row gap-sm';
  const disabledStyles = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {typeof children === 'string' ? (
        <Text className={`font-medium ${textColorStyles[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
