import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../theme';

const palette = {
  gold: { bg: 'rgba(245,189,26,0.2)', fg: colors.brand900, border: 'rgba(245,189,26,0.3)' },
  core: { bg: 'rgba(97,16,16,0.1)', fg: colors.brand900, border: 'rgba(97,16,16,0.2)' },
  released: { bg: colors.emerald100, fg: colors.emerald800, border: '#a7f3d0' },
  pending: { bg: colors.slate100, fg: colors.slate800, border: colors.slate200 },
  repeat: { bg: colors.yellow100, fg: colors.yellow800, border: colors.yellow300 },
  new: { bg: colors.emerald50, fg: colors.emerald600, border: '#d1fae5' },
};

export default function Badge({ label, tone = 'gold', children }) {
  const p = palette[tone] || palette.gold;
  return (
    <View style={[styles.badge, { backgroundColor: p.bg, borderColor: p.border }]}>
      {children}
      <Text style={[styles.text, { color: p.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  text: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
