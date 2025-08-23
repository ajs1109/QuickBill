import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

const DEFAULT_PLACEHOLDER_COLOR = '#9ca3af'; // Tailwind gray-400

export function CustomTextInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={DEFAULT_PLACEHOLDER_COLOR}
      {...props}
      style={[styles.input, props.style]} // you can add default styles or merge passed styles
    />
  );
}

const styles = StyleSheet.create({
  input: {
    // Optional default styling here
  },
});
