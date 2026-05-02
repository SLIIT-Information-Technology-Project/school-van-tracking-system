import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Web-only Map Screen
export default function MapScreen() {
  const { role } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color="#999" />
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapSubtext}>Maps are available on mobile apps</Text>
        <Text style={styles.locationText}>📍 Colombo, Sri Lanka (6.9271°N, 79.8612°E)</Text>
      </View>
      <View style={styles.floatingBadge}>
        <Text style={styles.badgeText}>Logged in as: {role || 'Unknown'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => router.push('/driver-profile')}
      >
        <Ionicons name="person" size={24} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  },
  floatingBadge: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
