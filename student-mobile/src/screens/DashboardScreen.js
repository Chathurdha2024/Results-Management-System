import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  Building2,
  Calendar,
  FileText,
  Activity,
  Clock,
  Bell,
  Menu,
} from 'lucide-react-native';
import { studentApi } from '../api';
import { toast } from '../toast';
import { colors, fontFamily } from '../theme';
import { timeAgo, nonPassingGrades } from '../utils';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BrandButton from '../components/BrandButton';
import SidebarDrawer from '../components/SidebarDrawer';

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const fetchDashboard = useCallback(async () => {
    const token = await AsyncStorage.getItem('studentToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    try {
      const [res, schRes] = await Promise.all([
        studentApi.dashboard(),
        studentApi.examSchedules(),
      ]);
      setData(res.data);
      setSchedules(schRes.data);

      const sems = Object.keys(res.data.resultsBySemester).sort((a, b) => Number(a) - Number(b));
      if (sems.length > 0) {
        setActiveSem((prev) => (prev ? prev : sems[0]));
      } else {
        setActiveSem(null);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        await AsyncStorage.removeItem('studentToken');
        navigation.replace('Login');
      } else {
        toast.error('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await studentApi.notifications();
      setNotifications(res.data);
    } catch (err) {
      // Silent failure, same as web portal.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
      fetchNotifications();
    }, [fetchDashboard, fetchNotifications])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('studentToken');
    navigation.replace('Login');
  };

  const handleEditProfile = () => {
    navigation.navigate('ChangePassword');
  };

  const handleOpenNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next && notifications.some((n) => !n.isRead)) {
      try {
        await studentApi.markNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        // Ignore
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.brandGold} />
      </View>
    );
  }

  if (!data) return null;

  const { student, resultsBySemester, sgpaBySemester, cgpa } = data;
  const semesters = Object.keys(resultsBySemester).sort((a, b) => Number(a) - Number(b));

  // Recently released results + completed credits (same logic as web portal)
  const allResults = [];
  let totalCompletedCredits = 0;

  Object.values(resultsBySemester).forEach((semResults) => {
    semResults.forEach((res) => {
      if (res.status === 'RELEASED' && res.releasedAt) {
        allResults.push(res);
        const rawGrade = res.grade.replace('*', '').trim().toUpperCase();
        if (!nonPassingGrades.includes(rawGrade)) {
          totalCompletedCredits += res.credits;
        }
      }
    });
  });

  const recentResults = allResults
    .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt))
    .slice(0, 5);

  const headerTitle =
    activeSem === 'OVERVIEW'
      ? 'Dashboard Overview'
      : activeSem === 'TIMETABLE'
        ? 'Exam Timetable'
        : `Semester ${activeSem} Results`;

  const renderOverview = () => (
    <View>
      {/* CGPA Summary Card */}
      <View style={styles.cgpaCard}>
        <View style={styles.cgpaClip} pointerEvents="none">
          <View style={styles.cgpaBlob} />
        </View>
        <View style={styles.cgpaRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cgpaLabel}>Cumulative GPA</Text>
            <View style={styles.cgpaValueRow}>
              <Text style={styles.cgpaValue}>{cgpa !== null ? cgpa : 'N/A'}</Text>
              <Text style={styles.cgpaScale}> / 4.00</Text>
            </View>
            <View style={styles.creditsRow}>
              <Text style={styles.creditsLabel}>Completed Credits</Text>
              <View style={styles.creditsValueRow}>
                <Text style={styles.creditsValue}>{totalCompletedCredits}</Text>
                <Text style={styles.creditsScale}> / 150</Text>
              </View>
            </View>
            <Text style={styles.cgpaNote}>
              Calculated using officially published results only.
            </Text>
          </View>
          <View style={styles.cgpaIconBox}>
            <Activity size={48} color="rgba(245,189,26,0.8)" />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recently Released Results</Text>
      <Text style={styles.sectionSubtitle}>
        Keep track of the newest grades published by your department.
      </Text>

      {recentResults.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Clock size={48} color="rgba(97,16,16,0.2)" />
          <Text style={styles.emptyTitle}>No Recent Results</Text>
          <Text style={styles.emptyText}>
            No results have been published for you yet.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 16 }}>
          {recentResults.map((res) => (
            <Card key={res.code} style={styles.resultCard}>
              <View style={styles.resultBadges}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{res.code}</Text>
                </View>
                <Badge
                  tone="new"
                  label="New"
                  children={<View style={styles.pulseDot} />}
                />
                {res.isRepeat && <Badge tone="repeat" label="Repeat" />}
              </View>
              <Text style={styles.resultName}>{res.name}</Text>
              <View style={styles.releasedRow}>
                <Clock size={12} color="rgba(97,16,16,0.5)" />
                <Text style={styles.releasedText}>
                  Released {timeAgo(res.releasedAt)}
                </Text>
              </View>

              <View style={styles.resultMetaRow}>
                <View style={styles.resultMetaItem}>
                  <Text style={styles.resultMetaLabel}>Credits</Text>
                  <Text style={styles.resultMetaValue}>{res.credits}</Text>
                </View>
                <View style={styles.resultMetaDivider} />
                <View style={styles.resultMetaItem}>
                  <Text style={styles.resultMetaLabel}>Grade</Text>
                  <View style={styles.gradeRow}>
                    {res.isRepeat && res.previousGrade && (
                      <Text style={styles.previousGrade}>{res.previousGrade}</Text>
                    )}
                    <Text style={styles.gradeValue}>{res.grade}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );

  const renderTimetable = () => (
    <View>
      <View style={styles.timetableHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Your Exam Timetable</Text>
          <Text style={styles.sectionSubtitle}>
            Schedules for your department modules and common modules.
          </Text>
        </View>
        <View style={styles.examCountPill}>
          <Calendar size={18} color={colors.brandGold} />
          <Text style={styles.examCountText}>{schedules.length} Exams</Text>
        </View>
      </View>

      {schedules.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Calendar size={48} color="rgba(97,16,16,0.2)" />
          <Text style={styles.emptyTitle}>No Exams Scheduled</Text>
          <Text style={styles.emptyText}>
            There are no upcoming exams scheduled for your modules.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 24 }}>
          {schedules.map((sch) => {
            const dateObj = new Date(sch.date);
            return (
              <Card key={sch.id}>
                <View style={styles.examClip}>
                  <View style={styles.examTopBar} />
                  <View style={styles.examHeader}>
                    <Badge tone="gold" label={sch.module.code} />
                    <Text style={styles.examName}>{sch.module.name}</Text>
                  </View>
                  <View style={styles.examBody}>
                    <View style={styles.examDetailRow}>
                      <View style={styles.examIconBox}>
                        <Calendar size={16} color="rgba(97,16,16,0.7)" />
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.examDetailLabel}>Date & Time</Text>
                        <Text style={styles.examDetailValue}>
                          {dateObj.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                        <Text style={styles.examDetailSub}>
                          {dateObj.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.examDetailRow}>
                      <View style={styles.examIconBox}>
                        <Building2 size={16} color="rgba(97,16,16,0.7)" />
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.examDetailLabel}>Venue</Text>
                        <Text style={styles.examDetailValue}>{sch.venue}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.examFooter}>
                    <Text style={styles.examFooterText}>
                      Semester {sch.module.semester}
                    </Text>
                    <Text style={styles.examFooterText}>{sch.module.type}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderSemester = () => {
    if (!activeSem) {
      return (
        <Card style={styles.emptyCard}>
          <FileText size={48} color="rgba(97,16,16,0.2)" />
          <Text style={styles.emptyTitle}>No Modules Found</Text>
          <Text style={styles.emptyText}>
            You don't have any modules assigned for your department yet.
          </Text>
        </Card>
      );
    }

    const sgpa = sgpaBySemester[activeSem];
    const sgpaColor =
      sgpa !== null
        ? parseFloat(sgpa) >= 3.0
          ? colors.emerald600
          : parseFloat(sgpa) < 2.0
            ? colors.red600
            : colors.brand900
        : 'rgba(97,16,16,0.3)';

    return (
      <View>
        {/* SGPA Compact Card */}
        <View style={styles.sgpaCard}>
          <View>
            <Text style={styles.sgpaLabel}>Semester {activeSem} GPA</Text>
            <Text style={[styles.sgpaValue, { color: sgpaColor }]}>
              {sgpa !== null ? sgpa : 'N/A'}
            </Text>
          </View>
          <View style={styles.sgpaDivider} />
          <View>
            <Text style={styles.sgpaLabel}>Total Credits</Text>
            <Text style={styles.sgpaCredits}>
              {resultsBySemester[activeSem].reduce((sum, res) => sum + res.credits, 0)}
            </Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          {resultsBySemester[activeSem].map((res) => (
            <Card key={res.code} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{res.code}</Text>
                </View>
                {res.isRepeat && <Badge tone="repeat" label="Repeat" />}
              </View>
              <Text style={styles.moduleName}>{res.name}</Text>

              <View style={styles.moduleMetaRow}>
                <View style={styles.moduleMetaItem}>
                  <Text style={styles.moduleMetaLabel}>Credits</Text>
                  <Text style={styles.moduleMetaValue}>{res.credits}</Text>
                </View>
                <View style={styles.moduleMetaItem}>
                  <Text style={styles.moduleMetaLabel}>Type</Text>
                  <Badge tone={res.type === 'CORE' ? 'core' : 'gold'} label={res.type} />
                </View>
                <View style={styles.moduleMetaItem}>
                  <Text style={styles.moduleMetaLabel}>Status</Text>
                  <Badge
                    tone={res.status === 'RELEASED' ? 'released' : 'pending'}
                    label={res.status === 'RELEASED' ? 'Released' : 'Pending'}
                  />
                </View>
              </View>

              <View style={styles.moduleGradeRow}>
                <View style={styles.gradeRow}>
                  {res.isRepeat && res.previousGrade && (
                    <Text style={styles.previousGrade}>{res.previousGrade}</Text>
                  )}
                  <Text style={[styles.moduleGrade, res.grade === '-' && { color: 'rgba(97,16,16,0.3)' }]}>
                    {res.grade}
                  </Text>
                </View>
                <Text style={styles.moduleReleased}>
                  {res.status === 'RELEASED' ? timeAgo(res.releasedAt) : '-'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => setDrawerOpen(true)}
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}
          >
            <Menu size={24} color="rgba(97,16,16,0.6)" />
          </Pressable>
          <BookOpen size={20} color={colors.brandGold} />
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>

        <Pressable
          onPress={handleOpenNotifications}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}
        >
          <Bell size={20} color="rgba(97,16,16,0.6)" />
          {notifications.some((n) => !n.isRead) && <View style={styles.unreadDot} />}
        </Pressable>
      </View>

      {/* Page Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom }}
      >
        {activeSem === 'OVERVIEW'
          ? renderOverview()
          : activeSem === 'TIMETABLE'
            ? renderTimetable()
            : renderSemester()}
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable style={styles.notifOverlay} onPress={() => setShowNotifications(false)}>
          <View style={styles.notifPanel}>
            <View style={styles.notifClip}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>Notifications</Text>
                <View style={styles.notifCount}>
                  <Text style={styles.notifCountText}>{notifications.length}</Text>
                </View>
              </View>
              <ScrollView style={{ maxHeight: Math.min(480, Math.round(windowHeight * 0.5)) }}>
                {notifications.length === 0 ? (
                  <Text style={styles.notifEmpty}>No notifications yet.</Text>
                ) : (
                  notifications.map((notif) => (
                    <View
                      key={notif.id}
                      style={[styles.notifItem, !notif.isRead && { backgroundColor: 'rgba(245,189,26,0.05)' }]}
                    >
                      <View style={styles.notifItemHeader}>
                        <Text style={styles.notifItemTitle}>{notif.title}</Text>
                        <Text style={styles.notifItemTime}>{timeAgo(notif.createdAt)}</Text>
                      </View>
                      <Text style={styles.notifItemMessage}>{notif.message}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Modal>

      <SidebarDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeSem={activeSem}
        onSelect={setActiveSem}
        semesters={semesters}
        student={student}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 64,
    backgroundColor: colors.brandWhite,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,189,26,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand900,
    flexShrink: 1,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red500,
    borderWidth: 2,
    borderColor: colors.brandWhite,
  },
  content: {
    flex: 1,
  },

  // CGPA card
  cgpaCard: {
    backgroundColor: colors.brand900,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  // Clip layer must be a separate non-elevated view: combining overflow:'hidden'
  // with elevation on the same view hides all children on some Android devices.
  cgpaClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cgpaBlob: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(245,189,26,0.1)',
  },
  cgpaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cgpaLabel: {
    fontFamily,
    color: 'rgba(254,254,254,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 4,
  },
  cgpaValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  cgpaValue: {
    fontFamily,
    color: colors.brandGold,
    fontSize: 48,
    fontWeight: '900',
    flexShrink: 1,
  },
  cgpaScale: {
    fontFamily,
    color: 'rgba(254,254,254,0.5)',
    fontWeight: '500',
  },
  creditsRow: {
    marginTop: 12,
  },
  creditsLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(254,254,254,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  creditsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  creditsValue: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: colors.brandWhite,
  },
  creditsScale: {
    fontFamily,
    fontSize: 14,
    color: 'rgba(254,254,254,0.5)',
  },
  cgpaNote: {
    fontFamily,
    fontSize: 12,
    color: 'rgba(254,254,254,0.6)',
    marginTop: 12,
  },
  cgpaIconBox: {
    backgroundColor: 'rgba(254,254,254,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(254,254,254,0.1)',
    borderRadius: 16,
    padding: 16,
  },

  // Sections
  sectionTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand900,
  },
  sectionSubtitle: {
    fontFamily,
    fontSize: 14,
    color: 'rgba(97,16,16,0.6)',
    marginTop: 4,
    marginBottom: 24,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: 48,
    gap: 8,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand900,
    marginTop: 16,
  },
  emptyText: {
    fontFamily,
    fontSize: 14,
    color: 'rgba(97,16,16,0.6)',
    textAlign: 'center',
  },

  // Recent results
  resultCard: {
    padding: 20,
  },
  resultBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: 'rgba(97,16,16,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '900',
    color: colors.brand900,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald500,
  },
  resultName: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand900,
  },
  releasedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  releasedText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.5)',
  },
  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,189,26,0.1)',
  },
  resultMetaItem: {
    alignItems: 'center',
  },
  resultMetaLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resultMetaValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
  },
  resultMetaDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(245,189,26,0.2)',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeValue: {
    fontFamily,
    fontSize: 24,
    fontWeight: '900',
    color: colors.brand900,
    lineHeight: 28,
  },
  previousGrade: {
    fontFamily,
    fontSize: 18,
    color: 'rgba(97,16,16,0.4)',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },

  // Timetable
  timetableHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  examCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,189,26,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,189,26,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  examCountText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
  },
  examClip: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  examTopBar: {
    height: 8,
    backgroundColor: colors.brand900,
  },
  examHeader: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    gap: 8,
  },
  examName: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand900,
    lineHeight: 24,
  },
  examBody: {
    padding: 20,
    gap: 16,
  },
  examDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  examIconBox: {
    backgroundColor: colors.slate100,
    padding: 8,
    borderRadius: 8,
  },
  examDetailLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  examDetailValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
  },
  examDetailSub: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.7)',
  },
  examFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
  },
  examFooterText: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.4)',
    textTransform: 'uppercase',
  },

  // Semester SGPA card
  sgpaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    alignSelf: 'flex-start',
    backgroundColor: colors.brandWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,189,26,0.2)',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sgpaLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sgpaValue: {
    fontFamily,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  sgpaDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(245,189,26,0.2)',
  },
  sgpaCredits: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand900,
    lineHeight: 28,
  },

  // Semester module cards
  moduleCard: {
    padding: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  moduleName: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(97,16,16,0.8)',
  },
  moduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  moduleMetaItem: {
    alignItems: 'flex-start',
    gap: 4,
  },
  moduleMetaLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moduleMetaValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.7)',
  },
  moduleGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,189,26,0.1)',
  },
  moduleGrade: {
    fontFamily,
    fontSize: 20,
    fontWeight: '900',
    color: colors.brand900,
  },
  moduleReleased: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.5)',
  },

  // Notifications modal
  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notifPanel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.brandWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,189,26,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  notifClip: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(245,189,26,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,189,26,0.1)',
  },
  notifTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
  },
  notifCount: {
    backgroundColor: 'rgba(245,189,26,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  notifCountText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.5)',
  },
  notifEmpty: {
    fontFamily,
    padding: 24,
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(97,16,16,0.5)',
    fontWeight: '500',
  },
  notifItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,189,26,0.05)',
  },
  notifItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  notifItemTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand900,
    flex: 1,
  },
  notifItemTime: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(97,16,16,0.4)',
    textTransform: 'uppercase',
  },
  notifItemMessage: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(97,16,16,0.7)',
    lineHeight: 18,
  },
});
