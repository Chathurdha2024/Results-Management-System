import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, fontFamily } from '../theme';

export default function BrandInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  showSecureToggle = false,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) {
  const [secureVisible, setSecureVisible] = useState(false);
  const hidden = secureTextEntry && !secureVisible;

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
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            secureTextEntry && showSecureToggle ? styles.inputWithToggle : null,
          ]}
        />
        {secureTextEntry && showSecureToggle ? (
          <Pressable
            onPress={() => setSecureVisible((v) => !v)}
            style={styles.secureToggle}
            hitSlop={8}
          >
            {secureVisible ? (
              <EyeOff size={20} color="rgba(97,16,16,0.4)" />
            ) : (
              <Eye size={20} color="rgba(97,16,16,0.4)" />
            )}
          </Pressable>
        ) : null}
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
  secureToggle: {
    position: 'absolute',
    right: 12,
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
  inputWithToggle: {
    paddingRight: 40,
  },
});
