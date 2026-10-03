import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GraduationCap,
  Activity,
  Calendar,
  LayoutDashboard,
  ChevronRight,
  UserCircle,
  Settings,
  LogOut,
} from 'lucide-react-native';
import { colors, fontFamily } from '../theme';
import BrandButton from './BrandButton';

// Mobile equivalent of the fixed sidebar in the web StudentDashboard.
export default function SidebarDrawer({
  visible,
  onClose,
  activeSem,
  onSelect,
  semesters,
  student,
  onEditProfile,
  onLogout,
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(288, Math.round(width * 0.82));

  const renderNavItem = (key, label, Icon, extraStyle) => {
    const active = activeSem === key;
    return (
      <Pressable
        key={key}
        onPress={() => {
          onSelect(key);
          onClose();
        }}
        style={({ pressed }) => [
          styles.navItem,
          active ? styles.navItemActive : styles.navItemIdle,
          extraStyle,
          pressed && { backgroundColor: 'rgba(107,32,32,0.5)' },
        ]}
      >
        <View style={styles.navItemLeft}>
          <Icon size={18} color={active ? colors.brandGold : 'rgba(254,254,254,0.7)'} />
          <Text style={[styles.navLabel, active && { color: colors.brandGold, fontWeight: '700' }]}>
            {label}
          </Text>
        </View>
        {active && <ChevronRight size={16} color={colors.brandGold} />}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.drawer, { width: drawerWidth }]}>
          {/* Sidebar header */}
          <View style={[styles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
            <View style={styles.logoTile}>
              <GraduationCap size={20} color={colors.brandWhite} />
            </View>
            <Text style={styles.brandTitle}>Ruhuna EngRMS</Text>
          </View>

          <ScrollView style={styles.nav} contentContainerStyle={{ padding: 16 }}>
            {renderNavItem('OVERVIEW', 'Recent Updates', Activity, { marginBottom: 8 })}
            {renderNavItem('TIMETABLE', 'Exam Timetable', Calendar, { marginBottom: 24 })}

            <Text style={styles.sectionLabel}>Academic Semesters</Text>
            {semesters.length === 0 ? (
              <Text style={styles.emptyText}>No semesters available.</Text>
            ) : (
              semesters.map((sem) => renderNavItem(sem, `Semester ${sem}`, LayoutDashboard))
            )}
          </ScrollView>

          {/* Footer: profile + logout */}
          <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
            <View style={styles.profileRow}>
              <UserCircle size={36} color="rgba(254,254,254,0.5)" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.regNo} numberOfLines={1}>
                  {student?.regNo}
                </Text>
                <Text style={styles.department} numberOfLines={1}>
                  {student?.department}
                </Text>
              </View>
            </View>
            <View style={styles.footerButtons}>
              <BrandButton
                variant="ghostSidebar"
                title="Profile"
                icon={<Settings size={14} color={colors.brandWhite} style={{ marginRight: 6 }} />}
                onPress={() => {
                  onEditProfile();
                  onClose();
                }}
              />
              <BrandButton
                variant="danger"
                title="Logout"
                icon={<LogOut size={14} color={colors.red400} style={{ marginRight: 6 }} />}
                onPress={onLogout}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  drawer: {
    height: '100%',
    backgroundColor: colors.brand900,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand800,
  },
  logoTile: {
    backgroundColor: colors.brandGold,
    padding: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  brandTitle: {
    fontFamily,
    color: colors.brandWhite,
    fontSize: 18,
    fontWeight: '700',
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: colors.brand800,
    borderColor: colors.brand700,
  },
  navItemIdle: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLabel: {
    fontFamily,
    fontSize: 14,
    color: 'rgba(254,254,254,0.7)',
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(254,254,254,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: 'rgba(254,254,254,0.5)',
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.brand800,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  regNo: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandWhite,
  },
  department: {
    fontFamily,
    fontSize: 12,
    color: 'rgba(254,254,254,0.5)',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});
