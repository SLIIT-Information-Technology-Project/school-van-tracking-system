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
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import {
  getSystemPayments,
  getStudentPayments,
  createOrUpdatePayment,
  updatePaymentStatus,
  deletePayment,
  getSystemPaymentSummary,
} from '../../services/paymentService';

interface Student {
  id: string;
  name: string;
  school: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  morning_pickup?: boolean;
  morning_dropoff?: boolean;
  morning_not_coming?: boolean;
  afternoon_pickup?: boolean;
  afternoon_dropoff?: boolean;
  afternoon_not_coming?: boolean;
}

interface Payment {
  id: string;
  student_id: string;
  full_payment: number;
  attendance_percentage: number;
  calculated_payment: number;
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  student?: Student;
  month: string;
}

export default function PaymentScreen() {
  const [systemId, setSystemId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7)); // YYYY-MM
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (systemId) {
      loadPayments();
      loadStudentsAndAttendance();
    }
  }, [selectedMonth]);

  const initializeData = async () => {
    try {
      setLoading(true);
      const systemDataStr = await AsyncStorage.getItem('systemData');
      
      if (systemDataStr) {
        const systemData = JSON.parse(systemDataStr);
        const sysId = systemData.id || systemData.systemId;
        setSystemId(sysId);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsAndAttendance = async () => {
    try {
      // Get students
      const studentResponse = await api.get(`/students/system/${systemId}`);
      setStudents(studentResponse.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getSystemPayments(systemId, selectedMonth);
      setPayments(response.payments || []);
      
      // Load summary
      const summaryResponse = await getSystemPaymentSummary(systemId, selectedMonth);
      setSummary(summaryResponse.summary);
    } catch (error) {
      console.error('Error fetching payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = async (studentId: string) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}`);
      const attendanceRecords = response.data.attendance || [];
      
      if (attendanceRecords.length === 0) return 0;

      const markedCount = attendanceRecords.filter((record: AttendanceRecord) => 
        record.morning_pickup || record.morning_dropoff || 
        record.afternoon_pickup || record.afternoon_dropoff
      ).length;

      return Math.round((markedCount / attendanceRecords.length) * 100);
    } catch (error) {
      console.error('Error calculating attendance:', error);
      return 0;
    }
  };

  const handleCreatePayment = async (student: Student) => {
    try {
      setLoading(true);
      
      // Calculate attendance percentage
      const attendancePercentage = await calculateAttendancePercentage(student.id);
      
      await createOrUpdatePayment(
        student.id,
        systemId,
        '', // Will be fetched from student's parent
        selectedMonth,
        8000, // Full payment
        attendancePercentage
      );
      
      Alert.alert('Success', `Payment calculated for ${student.name}`);
      await loadPayments();
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedPayment) return;

    try {
      await updatePaymentStatus(selectedPayment.id, paymentStatus as any, notes);
      Alert.alert('Success', 'Payment status updated');
      setPaymentModalVisible(false);
      await loadPayments();
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to update payment');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    Alert.alert('Delete Payment', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deletePayment(paymentId);
            Alert.alert('Success', 'Payment deleted');
            await loadPayments();
          } catch (error) {
            Alert.alert('Error', (error as any).message || 'Failed to delete payment');
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#3B82F6';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage <= 50) return '#EF4444';
    if (percentage <= 75) return '#F59E0B';
    return '#10B981';
  };

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.studentName}>{payment.student?.name}</Text>
          <Text style={styles.studentSchool}>{payment.student?.school}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(payment.payment_status) }]}>
          <Text style={styles.statusText}>{payment.payment_status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Attendance:</Text>
          <View style={[styles.attendanceBadge, { backgroundColor: getAttendanceColor(payment.attendance_percentage) }]}>
            <Text style={styles.attendanceText}>{payment.attendance_percentage}%</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Full Payment:</Text>
          <Text style={styles.detailValue}>Rs. {payment.full_payment.toLocaleString()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Due:</Text>
          <Text style={[styles.detailValue, { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' }]}>
            Rs. {payment.calculated_payment.toLocaleString()}
          </Text>
        </View>

        {payment.attendance_percentage <= 50 && (
          <View style={[styles.discountAlert, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.discountText}>50% OFF - Attendance ≤ 50%</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setSelectedPayment(payment);
            setPaymentStatus(payment.payment_status);
            setNotes('');
            setPaymentModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#3B82F6" />
          <Text style={styles.editButtonText}>Update Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePayment(payment.id)}
        >
          <MaterialCommunityIcons name="trash-can" size={16} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && payments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>💳 Payment Management</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{selectedMonth}</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {summary && (
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>Rs. {summary.total_revenue?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>Rs. {summary.paid?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>Rs. {summary.pending?.toLocaleString()}</Text>
          </View>
        </View>
      )}

      {payments.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.calculateButton}>
            <MaterialCommunityIcons name="calculator" size={16} color="#fff" />
            <Text style={styles.calculateButtonText}>Calculate All Payments</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={payments}
        renderItem={({ item }) => <PaymentCard payment={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="credit-card-off" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No payments yet</Text>
            <Text style={styles.emptyStateSubtext}>Calculate payments based on attendance</Text>
          </View>
        }
      />

      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Payment Status</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.statusOptions}>
              {['pending', 'paid', 'overdue', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    paymentStatus === status && styles.statusOptionActive,
                  ]}
                  onPress={() => setPaymentStatus(status)}
                >
                  <Text style={[
                    styles.statusOptionText,
                    paymentStatus === status && styles.statusOptionTextActive,
                  ]}>
                    {status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdatePaymentStatus}
              >
                <Text style={styles.saveButtonText}>Update</Text>
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  monthText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  summarySection: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  summaryCard: {
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
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  paymentCard: {
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
    fontSize: 11,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  attendanceBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  attendanceText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  discountAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  discountText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    gap: 6,
  },
  calculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#bbb',
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
    minHeight: 400,
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
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statusOptionTextActive: {
    color: '#fff',
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
