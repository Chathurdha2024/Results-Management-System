import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../theme';

export default function BrandButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary | danger | ghostSidebar | sidebarActive | sidebarIdle
  style,
  textStyle,
  icon,
}) {
  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'danger' && styles.danger,
    variant === 'ghostSidebar' && styles.ghostSidebar,
    variant === 'sidebarActive' && styles.sidebarActive,
    variant === 'sidebarIdle' && styles.sidebarIdle,
    (disabled || loading) && styles.disabled,
    style,
  ];
  const labelStyle = [
    styles.label,
    variant === 'primary' && styles.labelPrimary,
    variant === 'danger' && styles.labelDanger,
    variant === 'ghostSidebar' && styles.labelGhost,
    variant === 'sidebarActive' && styles.labelSidebarActive,
    variant === 'sidebarIdle' && styles.labelSidebarIdle,
    textStyle,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {icon}
      {loading ? (
        <ActivityIndicator color={colors.brandWhite} />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.brand900,
    width: '100%',
  },
  danger: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    flex: 1,
  },
  ghostSidebar: {
    backgroundColor: colors.brand800,
    borderWidth: 1,
    borderColor: colors.brand700,
    flex: 1,
    paddingVertical: 8,
  },
  sidebarActive: {
    backgroundColor: colors.brand800,
    borderWidth: 1,
    borderColor: colors.brand700,
  },
  sidebarIdle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  labelPrimary: {
    color: colors.brandWhite,
  },
  labelDanger: {
    color: colors.red400,
    fontSize: 12,
  },
  labelGhost: {
    color: colors.brandWhite,
    fontSize: 12,
  },
  labelSidebarActive: {
    color: colors.brandGold,
    fontWeight: '700',
  },
  labelSidebarIdle: {
    color: 'rgba(254,254,254,0.7)',
  },
});
