import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Text,
} from 'react-native';

export interface TextInputProps extends RNTextInputProps {
  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;
  /**
   * Custom input style
   */
  inputStyle?: TextStyle;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Label text
   */
  label?: string;
  /**
   * Show error state styling (automatically set if error prop is provided)
   */
  hasError?: boolean;
}

/**
 * Reusable TextInput component with consistent styling
 * Supports error states, labels, and custom styling
 */
export const TextInput: React.FC<TextInputProps> = ({
  containerStyle,
  inputStyle,
  error,
  label,
  hasError,
  style,
  ...props
}) => {
  const showError = hasError !== undefined ? hasError : !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.defaultInput,
          showError && styles.errorInput,
          inputStyle,
          style,
        ]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  defaultInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  errorInput: {
    borderColor: '#D32F2F',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
});
