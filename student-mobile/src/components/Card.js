import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brandWhite,
    borderWidth: 1,
    borderColor: 'rgba(245,189,26,0.2)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
