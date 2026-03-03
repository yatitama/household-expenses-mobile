import React, { useRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  InputAccessoryView,
  Keyboard,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';

interface DismissibleTextInputProps extends TextInputProps {
  // Allow passing through all TextInput props
}

export const DismissibleTextInput = React.forwardRef<
  RNTextInput,
  DismissibleTextInputProps
>(
  (props, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputAccessoryViewID = useRef(`input-accessory-${Math.random()}`).current;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleDismiss = () => {
      Keyboard.dismiss();
    };

    return (
      <>
        <RNTextInput
          ref={ref}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
        />

        {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View className="flex-row justify-end items-center bg-primary-100 dark:bg-primary-700 px-lg py-sm border-t border-primary-200 dark:border-primary-600">
              <TouchableOpacity onPress={handleDismiss} className="p-sm">
                <X size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
      </>
    );
  }
);

DismissibleTextInput.displayName = 'DismissibleTextInput';
