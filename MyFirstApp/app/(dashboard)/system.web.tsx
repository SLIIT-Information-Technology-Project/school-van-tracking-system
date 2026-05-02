import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';

export default function SystemScreenWeb() {
  const router = useRouter();
  const { role: paramRole } = useLocalSearchParams();

  const [role, setRole] = useState<string | null>(paramRole as string || null);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!role) {
        const storedRole = await AsyncStorage.getItem('userRole');
        setRole(storedRole || 'Unknown');
      }

      // Load transportation systems
      try {
        const response = await api.get('/api/transportation-systems');
        setSystems(response.data.systems || []);
      } catch (err) {
        console.error('Error loading systems:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={{
        refreshing,
        onRefresh: handleRefresh,
      } as any}
    >
      {/* Web Notice */}
      <View style={styles.webNotice}>
        <Ionicons name="information-circle" size={24} color="#EF4444" />
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Live Tracking Unavailable</Text>
          <Text style={styles.noticeText}>
            Real-time van location tracking is only available in the mobile app
          </Text>
        </View>
      </View>

      {/* Systems List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transportation Systems</Text>
        {systems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="van-passenger" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No systems found</Text>
          </View>
        ) : (
          systems.map((system) => (
            <View key={system.id} style={styles.systemCard}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="van-passenger" size={32} color="#3B82F6" />
                <View style={styles.cardInfo}>
                  <Text style={styles.systemName}>{system.vehicle_name}</Text>
                  <Text style={styles.systemRoute}>Route: {system.route || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Capacity:</Text>
                  <Text style={styles.detailValue}>{system.capacity || 'N/A'} seats</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          system.status === 'active' ? '#DCFCE7' : '#F3E8FF',
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          system.status === 'active' ? '#22C55E' : '#A855F7',
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        color:
                          system.status === 'active' ? '#166534' : '#6B21A8',
                        fontSize: 12,
                        fontWeight: '500',
                      }}
                    >
                      {system.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Using Web Access</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>✓</Text>
          <Text style={styles.tipText}>View system details and information</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>✓</Text>
          <Text style={styles.tipText}>Check vehicle capacity and routes</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>✗</Text>
          <Text style={styles.tipText}>Live GPS tracking (use mobile app)</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(dashboard)')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  webNotice: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F1D1D',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  systemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  systemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  systemRoute: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  tipsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  tipText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
  },
  button: {
    marginHorizontal: 16,
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
