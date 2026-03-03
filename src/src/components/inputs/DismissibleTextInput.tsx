import React, { useRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  InputAccessoryView,
  Keyboard,
  Platform,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { X } from 'lucide-react-native';
import { UI_COLORS } from '../../constants/colors';

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

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
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
            <View className="flex-row justify-end items-center bg-gray-100 dark:bg-slate-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
              <TouchableOpacity
                onPress={handleDismiss}
                className="p-2"
                accessibilityRole="button"
                accessibilityLabel="キーボードを閉じる"
              >
                <X size={18} color={UI_COLORS.placeholder} />
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
      </>
    );
  }
);

DismissibleTextInput.displayName = 'DismissibleTextInput';
