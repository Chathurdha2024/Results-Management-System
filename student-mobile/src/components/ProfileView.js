import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Lock, Bell, BellOff } from 'lucide-react-native';
import { authApi, studentApi, apiErrorMessage } from '../api';
import { toast } from '../toast';
import { colors, fontFamily } from '../theme';
import Card from './Card';
import BrandInput from './BrandInput';
import BrandButton from './BrandButton';

function SectionCard({ icon, title, children }) {
  return (
    <Card>
      <View style={styles.clip}>
        <View style={styles.sectionHeader}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionBody}>{children}</View>
      </View>
    </Card>
  );
}

export default function ProfileView({ onNotificationSettingChange }) {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSetting, setSavingSetting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentApi.profile();
        setProfile(res.data);
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Failed to load profile.'));
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error('New password and confirm password do not match!');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setSavingPassword(true);
    try {
      const res = await authApi.changePassword(newPassword, currentPassword);
      await AsyncStorage.setItem('studentToken', res.data.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to change password'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!profile) return;
    const enabled = !profile.notificationsEnabled;

    setSavingSetting(true);
    try {
      const res = await studentApi.updateNotificationSettings(enabled);
      setProfile({ ...profile, notificationsEnabled: res.data.notificationsEnabled });
      toast.success(enabled ? 'Result notifications enabled.' : 'Result notifications disabled.');
      onNotificationSettingChange?.(res.data.notificationsEnabled);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to update notification settings'));
    } finally {
      setSavingSetting(false);
    }
  };

  const details = profile
    ? [
        { label: 'Registration Number', value: profile.regNo },
        { label: 'Department', value: profile.department },
        { label: 'Batch', value: profile.batch },
      ]
    : [];

  return (
    <View style={styles.root}>
      <SectionCard icon={<User size={18} color={colors.brandGold} />} title="Student Details">
        {!profile ? (
          <Text style={styles.loadingText}>Loading profile...</Text>
        ) : (
          <View style={styles.detailsList}>
            {details.map((field) => (
              <View key={field.label}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>{field.value}</Text>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard icon={<Lock size={18} color={colors.brandGold} />} title="Change Password">
        <View style={styles.form}>
          <BrandInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            secureTextEntry
            showSecureToggle
            icon={<Lock size={20} color="rgba(97,16,16,0.4)" />}
          />
          <BrandInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
            showSecureToggle
            icon={<Lock size={20} color="rgba(97,16,16,0.4)" />}
          />
          <BrandInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            showSecureToggle
            icon={<Lock size={20} color="rgba(97,16,16,0.4)" />}
          />
          <BrandButton
            title={savingPassword ? 'Updating...' : 'Update Password'}
            onPress={handleChangePassword}
            loading={savingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            style={{ paddingVertical: 16 }}
            textStyle={{ fontWeight: '800' }}
          />
        </View>
      </SectionCard>

      <SectionCard icon={<Bell size={18} color={colors.brandGold} />} title="Notification Settings">
        <View style={styles.notifRow}>
          <View style={styles.notifLeft}>
            <View style={styles.notifIconBox}>
              {profile?.notificationsEnabled ? (
                <Bell size={16} color="rgba(97,16,16,0.7)" />
              ) : (
                <BellOff size={16} color="rgba(97,16,16,0.7)" />
              )}
            </View>
            <View style={styles.notifTextWrap}>
              <Text style={styles.notifTitle}>Enable result notifications</Text>
              <Text style={styles.notifDesc}>
                Get notified in the portal when new results are released.
              </Text>
            </View>
          </View>
          <Switch
            value={profile?.notificationsEnabled ?? false}
            onValueChange={handleToggleNotifications}
            disabled={!profile || savingSetting}
            trackColor={{ false: '#cbd5e1', true: colors.brand900 }}
            thumbColor="#ffffff"
            ios_backgroundColor="#cbd5e1"
          />
        </View>
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  // Clip layer must be a separate non-elevated view: combining overflow:'hidden'
  // with elevation on the same view hides all children on some Android devices.
  clip: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(245,189,26,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,189,26,0.1)',
  },
  sectionTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand900,
  },
  sectionBody: {
    padding: 20,
  },
  loadingText: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.5)',
    textAlign: 'center',
    paddingVertical: 24,
  },
  detailsList: {
    gap: 16,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
    flexShrink: 1,
  },
  form: {
    gap: 20,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  notifLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flexShrink: 1,
  },
  notifIconBox: {
    backgroundColor: colors.slate100,
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  notifTextWrap: {
    flexShrink: 1,
  },
  notifTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
  },
  notifDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.6)',
    marginTop: 2,
  },
});
