import { View, TextInput, Text, ViewStyle, TextInputProps } from 'react-native';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import { Label } from './Label';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  containerStyle?: ViewStyle;
  helperText?: string;
}

export const FormField = ({
  label,
  error,
  required = false,
  containerClassName = '',
  containerStyle,
  helperText,
  className = '',
  ...inputProps
}: FormFieldProps) => {
  const hasError = !!error;

  return (
    <View className={`gap-sm ${containerClassName}`} style={containerStyle}>
      <Label required={required}>{label}</Label>
      <TextInput
        {...inputProps}
        className={`
          border rounded-md p-md text-base
          bg-white dark:bg-primary-700
          text-primary-900 dark:text-primary-50
          placeholder-primary-400 dark:placeholder-primary-500
          ${
            hasError
              ? 'border-danger-300 dark:border-danger-400'
              : 'border-primary-300 dark:border-primary-600'
          }
          ${className}
        `}
        placeholderTextColor={hasError ? COLORS_SEMANTIC.danger400 : COLORS_GRAY[400]}
      />
      {error && (
        <Text className="text-sm text-danger-600 dark:text-danger-400">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="text-xs text-primary-500 dark:text-primary-400">
          {helperText}
        </Text>
      )}
    </View>
  );
};
