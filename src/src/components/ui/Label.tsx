import { Text, TextStyle } from 'react-native';

interface LabelProps {
  children: string;
  required?: boolean;
  className?: string;
  style?: TextStyle;
}

export const Label = ({
  children,
  required = false,
  className = '',
  style,
}: LabelProps) => {
  return (
    <Text
      className={`text-label font-medium text-primary-700 dark:text-primary-200 ${className}`}
      style={style}
    >
      {children}
      {required && <Text className="text-danger-500"> *</Text>}
    </Text>
  );
};
