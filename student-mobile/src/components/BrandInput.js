import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../theme';

export default function BrandInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(97,16,16,0.35)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, icon ? styles.inputWithIcon : null]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontFamily,
    color: colors.brand900,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    fontFamily,
    backgroundColor: 'rgba(245,189,26,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245,189,26,0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.brand900,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
});
