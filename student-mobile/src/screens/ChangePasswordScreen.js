import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, ShieldAlert } from 'lucide-react-native';
import { authApi, apiErrorMessage } from '../api';
import { toast } from '../toast';
import { colors, fontFamily } from '../theme';
import BrandInput from '../components/BrandInput';
import BrandButton from '../components/BrandButton';
import Card from '../components/Card';

export default function ChangePasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const res = await authApi.changePassword(newPassword);
      await AsyncStorage.setItem('studentToken', res.data.token);
      toast.success('Password changed successfully!');
      navigation.replace('Dashboard');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: 24 + insets.top, paddingBottom: 24 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoTile}>
          <ShieldAlert size={48} color={colors.brandGold} />
        </View>
        <Text style={styles.title}>Action Required</Text>
        <Text style={styles.subtitle}>
          Please set a new password for your account to continue.
        </Text>

        <Card style={styles.card}>
          <View style={styles.form}>
            <BrandInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={20} color="rgba(97,16,16,0.4)" />}
            />
            <BrandInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={20} color="rgba(97,16,16,0.4)" />}
            />
            <BrandButton
              title={loading ? 'Updating...' : 'Set New Password'}
              onPress={handleSubmit}
              loading={loading}
              disabled={!newPassword || !confirmPassword}
              style={{ paddingVertical: 16 }}
              textStyle={{ fontWeight: '800' }}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.brandWhite,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoTile: {
    backgroundColor: colors.brand900,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.brand800,
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: colors.brand900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontFamily,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: colors.brand900,
  },
  subtitle: {
    fontFamily,
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(97,16,16,0.6)',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    padding: 24,
    shadowColor: colors.brandGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  form: {
    gap: 24,
  },
});
