import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import {
  markStudentPickup,
  markStudentDropoff,
  markStudentNotComing,
  getSystemAttendanceToday,
  getTodaysSummary,
  updateAttendanceNotes,
} from '../../services/attendanceService';

interface Student {
  id: string;
  name: string;
  school: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  morning_pickup?: boolean;
  morning_pickup_time?: string;
  morning_dropoff?: boolean;
  morning_dropoff_time?: string;
  morning_not_coming?: boolean;
  afternoon_pickup?: boolean;
  afternoon_pickup_time?: string;
  afternoon_dropoff?: boolean;
  afternoon_dropoff_time?: string;
  afternoon_not_coming?: boolean;
  notes?: string;
}

export default function AttendanceScreen() {
  const [systemId, setSystemId] = useState<string>('');
  const [attendantId, setAttendantId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('morning');
  const [notesModalVisible, setNotesModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const attendantDataStr = await AsyncStorage.getItem('attendantData');
      const driverDataStr = await AsyncStorage.getItem('driverData');

      if (attendantDataStr) {
        const data = JSON.parse(attendantDataStr);
        setAttendantId(data.id);
      } else if (driverDataStr) {
        const data = JSON.parse(driverDataStr);
        setAttendantId(data.id);
      }

      // Get system data
      const systemDataStr = await AsyncStorage.getItem('systemData');
      if (systemDataStr) {
        const systemData = JSON.parse(systemDataStr);
        const sysId = systemData.id || systemData.systemId;
        setSystemId(sysId);
        await fetchStudentsAndAttendance(sysId);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async (sysId: string) => {
    try {
      setLoading(true);

      // Get all students for this system
      const studentResponse = await api.get(`/students/system/${sysId}`);
      setStudents(studentResponse.data.students || []);

      // Get today's attendance
      const attendanceResponse = await getSystemAttendanceToday(sysId);
      const attendanceMap: Record<string, AttendanceRecord> = {};

      if (attendanceResponse.attendance && Array.isArray(attendanceResponse.attendance)) {
        attendanceResponse.attendance.forEach((record: AttendanceRecord) => {
          attendanceMap[record.student_id] = record;
        });
      }

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPickup = async (studentId: string) => {
    try {
      await markStudentPickup(studentId, systemId, selectedPeriod, attendantId);
      Alert.alert('Success', `Student marked as picked up (${selectedPeriod})`);
      await refreshAttendance();
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to mark pickup');
    }
  };

  const handleMarkDropoff = async (studentId: string) => {
    try {
      await markStudentDropoff(studentId, systemId, selectedPeriod, attendantId);
      Alert.alert('Success', `Student marked as dropped off (${selectedPeriod})`);
      await refreshAttendance();
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to mark dropoff');
    }
  };

  const handleMarkNotComing = async (studentId: string) => {
    try {
      await markStudentNotComing(studentId, systemId, selectedPeriod, attendantId);
      Alert.alert('Success', `Student marked as not coming (${selectedPeriod})`);
      await refreshAttendance();
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to mark not coming');
    }
  };

  const refreshAttendance = async () => {
    if (systemId) {
      await fetchStudentsAndAttendance(systemId);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAttendance();
    setRefreshing(false);
  };

  const handleAddNotes = async () => {
    if (!selectedStudent) return;

    try {
      const record = attendance[(selectedStudent as Student).id];
      if (!record) {
        Alert.alert('Error', 'No attendance record found for this student');
        return;
      }

      await updateAttendanceNotes(record.id, notes);
      Alert.alert('Success', 'Notes updated');
      setNotesModalVisible(false);
      setNotes('');
      await refreshAttendance();
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to update notes');
    }
  };

  const getAttendanceStatus = (student: Student) => {
    const record = attendance[student.id];
    if (!record) return { status: 'No record', color: '#999', cardBg: '#f9fafb', isNotComing: false };

    const isCurrentPeriodPickup = selectedPeriod === 'morning' 
      ? record.morning_pickup 
      : record.afternoon_pickup;
    const isCurrentPeriodDropoff = selectedPeriod === 'morning' 
      ? record.morning_dropoff 
      : record.afternoon_dropoff;
    const isCurrentPeriodNotComing = selectedPeriod === 'morning'
      ? record.morning_not_coming
      : record.afternoon_not_coming;

    // Check if NOT coming (blue)
    if (isCurrentPeriodNotComing) {
      return { status: '✓ Not Coming', color: '#8B5CF6', cardBg: '#EDE9FE', isNotComing: true };
    }

    // Green when picked up (on bus)
    if (isCurrentPeriodPickup && !isCurrentPeriodDropoff) {
      return { status: '✓ On Bus (Green)', color: '#10B981', cardBg: '#D1FAE5', isNotComing: false };
    }
    
    // Red when dropped off (off bus)
    if (isCurrentPeriodDropoff) {
      return { status: '✓ Dropped Off (Red)', color: '#EF4444', cardBg: '#FEE2E2', isNotComing: false };
    }

    // Gray if not picked up yet
    return { status: 'Pending (Gray)', color: '#6B7280', cardBg: '#F3F4F6', isNotComing: false };
  };

  const AttendanceStatusCard = ({ student }: { student: Student }) => {
    const { status, color, cardBg } = getAttendanceStatus(student);
    const record = attendance[student.id];

    return (
      <View style={[styles.studentCard, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentSchool}>{student.school}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.morningSection}>
          <Text style={styles.sectionTitle}>Morning</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                record?.morning_pickup && styles.buttonActive,
              ]}
              onPress={() => handleMarkPickup(student.id)}
            >
              <MaterialCommunityIcons
                name={record?.morning_pickup ? 'check-circle' : 'plus-circle'}
                size={20}
                color={record?.morning_pickup ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.buttonText,
                  record?.morning_pickup && styles.buttonTextActive,
                ]}
              >
                Pickup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                record?.morning_dropoff && styles.buttonActive,
              ]}
              onPress={() => handleMarkDropoff(student.id)}
            >
              <MaterialCommunityIcons
                name={record?.morning_dropoff ? 'check-circle' : 'plus-circle'}
                size={20}
                color={record?.morning_dropoff ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.buttonText,
                  record?.morning_dropoff && styles.buttonTextActive,
                ]}
              >
                Dropoff
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.afternoonSection}>
          <Text style={styles.sectionTitle}>Afternoon</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: selectedPeriod === 'morning' ? '#f0f0f0' : '#fff' },
              ]}
              onPress={() => setSelectedPeriod('afternoon')}
            >
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color="#666"
              />
              <Text style={styles.buttonText}>Switch to PM</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timeInfo}>
          {record?.morning_pickup_time && (
            <Text style={styles.timeText}>
              🚐 Pickup: {new Date(record.morning_pickup_time).toLocaleTimeString()}
            </Text>
          )}
          {record?.morning_dropoff_time && (
            <Text style={styles.timeText}>
              📍 Drop: {new Date(record.morning_dropoff_time).toLocaleTimeString()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.notComingButton,
            record && (selectedPeriod === 'morning' ? record.morning_not_coming : record.afternoon_not_coming) && styles.notComingButtonActive
          ]}
          onPress={() => handleMarkNotComing(student.id)}
        >
          <MaterialCommunityIcons 
            name={record && (selectedPeriod === 'morning' ? record.morning_not_coming : record.afternoon_not_coming) ? 'check-circle' : 'minus-circle'} 
            size={18} 
            color={record && (selectedPeriod === 'morning' ? record.morning_not_coming : record.afternoon_not_coming) ? '#fff' : '#666'} 
          />
          <Text style={[
            styles.notComingButtonText,
            record && (selectedPeriod === 'morning' ? record.morning_not_coming : record.afternoon_not_coming) && styles.notComingButtonTextActive
          ]}>
            Not Coming {selectedPeriod === 'morning' ? 'AM' : 'PM'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => {
            setSelectedStudent(student);
            setNotes(record?.notes || '');
            setNotesModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="note-edit" size={16} color="#3B82F6" />
          <Text style={styles.notesButtonText}>Add Notes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && students.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading attendance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Pickup & Drop Attendance</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'morning' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('morning')}
            >
              <MaterialCommunityIcons
                name="weather-sunny"
                size={18}
                color={selectedPeriod === 'morning' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'morning' && styles.periodButtonTextActive,
                ]}
              >
                Morning
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'afternoon' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('afternoon')}
            >
              <MaterialCommunityIcons
                name="weather-sunset"
                size={18}
                color={selectedPeriod === 'afternoon' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'afternoon' &&
                    styles.periodButtonTextActive,
                ]}
              >
                Afternoon
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Students</Text>
            <Text style={styles.statValue}>{students.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Marked Attended</Text>
            <Text style={styles.statValue}>{Object.keys(attendance).length}</Text>
          </View>
        </View>

        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bus"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyStateText}>No students assigned</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={({ item }) => (
              <AttendanceStatusCard student={item} />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>

      <Modal
        visible={notesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Notes - {selectedStudent?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setNotesModalVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Enter notes about student's attendance..."
              multiline
              numberOfLines={6}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setNotesModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddNotes}
              >
                <Text style={styles.saveButtonText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  headerSection: {
    backgroundColor: '#3B82F6',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    gap: 6,
  },
  periodButtonActive: {
    backgroundColor: '#fff',
  },
  periodButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#3B82F6',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentSchool: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  morningSection: {
    marginBottom: 12,
  },
  afternoonSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 6,
  },
  buttonActive: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextActive: {
    color: '#fff',
  },
  timeInfo: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  notesButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  notComingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  notComingButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  notComingButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  notComingButtonTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
