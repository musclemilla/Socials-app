import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface ButtonGroupProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function ButtonGroup({ onSubmit, onCancel }: ButtonGroupProps) {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={onSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 16, // Space between buttons
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#26a69a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    transitionDuration: '300ms',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    transitionDuration: '300ms',
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});