import { View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

const variantStyles: Record<string, string> = {
  default: 'bg-white dark:bg-primary-800 rounded-md p-lg border border-primary-200 dark:border-primary-700',
  elevated: 'bg-white dark:bg-primary-800 rounded-md p-lg shadow-md',
  outlined: 'bg-transparent rounded-md p-lg border border-primary-300 dark:border-primary-600',
};

export const Card = ({
  children,
  className = '',
  style,
  variant = 'default',
}: CardProps) => {
  return (
    <View
      className={`${variantStyles[variant]} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};
