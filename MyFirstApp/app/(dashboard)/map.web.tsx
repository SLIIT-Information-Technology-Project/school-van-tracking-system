import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MapScreenWeb() {
  const router = useRouter();
  const { role: paramRole } = useLocalSearchParams();
  const [role, setRole] = useState<string | null>(paramRole as string || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (!role) {
          const storedRole = await AsyncStorage.getItem('userRole');
          setRole(storedRole || 'Unknown');
        }
        setLoading(false);
      } catch (err) {
        console.error('Init error:', err);
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color="#999" />
        <Text style={styles.mapPlaceholderText}>Live Map</Text>
        <Text style={styles.mapSubtext}>Available on mobile apps</Text>
        <Text style={styles.locationText}>
          📍 Real-time van tracking is available on iOS and Android applications only.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>Web version does not support live GPS tracking</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(dashboard)')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  mapPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0C4A6E',
    fontWeight: '500',
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
