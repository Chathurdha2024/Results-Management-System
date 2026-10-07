import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GraduationCap, User, Lock } from 'lucide-react-native';
import { authApi, apiErrorMessage } from '../api';
import { toast } from '../toast';
import { colors, fontFamily } from '../theme';
import BrandInput from '../components/BrandInput';
import BrandButton from '../components/BrandButton';
import Card from '../components/Card';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      await AsyncStorage.setItem('studentToken', res.data.token);
      toast.success('Logged in securely as Student');

      if (res.data.isFirstLogin) {
        navigation.replace('ChangePassword');
      } else {
        navigation.replace('Dashboard');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Invalid credentials'));
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
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          /> 
        </View>
        <Text style={styles.title}>Ruhuna EngRMS</Text>
        <Text style={styles.subtitle}>Student Portal</Text>

        <Card style={styles.card}>
          <View style={styles.form}>
            <BrandInput
              label="Email Address / Registration No"
              value={email}
              onChangeText={setEmail}
              placeholder="EG/XXXX/XXXX"
              icon={<User size={20} color="rgba(97,16,16,0.4)" />}
            />
            <BrandInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={20} color="rgba(97,16,16,0.4)" />}
            />
            <BrandButton
              title={loading ? 'Authenticating...' : 'Sign in securely'}
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ</Text>
            <Text style={styles.infoText}>
              Sign in with the registration number and password issued by your
              department.
            </Text>
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
    alignSelf: 'center',
    marginBottom: 24,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245,189,26,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,189,26,0.2)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  infoIcon: {
    color: colors.brandGold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 18,
  },
  infoText: {
    fontFamily,
    flex: 1,
    fontSize: 12,
    color: 'rgba(97,16,16,0.6)',
    lineHeight: 18,
  },
  logo: {
  width: 120,
  height: 120,
  marginBottom: 16,
},
});
