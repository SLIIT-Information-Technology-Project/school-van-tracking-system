import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Screen Component: Driver Profile Screen
export default function DriverProfileScreen() {
  const router = useRouter();
  const { driverData } = useLocalSearchParams(); 

  let profile: any = null;

  // Unpack the JSON string securely passed from the MapScreen back into a JavaScript Object
  try {
     if (typeof driverData === 'string') {
        profile = JSON.parse(driverData);
     }
  } catch (error) {
     console.error("Failed to parse driver profile data", error);
  }

  // Fallback UI to satisfy the requirement if the database/memory has absolutely no user saved
  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <Ionicons name="warning-outline" size={48} color="#94A3B8" />
         <Text style={{ fontSize: 18, color: '#64748B', marginTop: 16 }}>No profile data available</Text>
         <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, padding: 14, backgroundColor: '#3B82F6', borderRadius: 12 }}>
           <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Go Back</Text>
         </TouchableOpacity>
      </View>
    );
  }

  // The actual layout utilizing injected profile params iteratively built from the backend
  return (
    <ScrollView style={styles.container}>
      
      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Profile</Text>
        <View style={{ width: 24 }} /> {/* Invisible spacer to perfectly center the text */}
      </View>

      {/* Driver Avatar Section */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={50} color="#3B82F6" />
        </View>
        <Text style={styles.driverName}>{profile.name}</Text>
        <Text style={styles.driverRole}>Username: @{profile.username}</Text>
      </View>

      {/* Contact Information Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.phone}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="medkit-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>Emergency: {profile.emergencyContact}</Text>
        </View>
      </View>

      {/* Vehicle Details Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle & Route Details</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.vehicleType} - {profile.vehicleNumber}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.seatCount} Passenger Seats</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="id-card-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>License: {profile.licenseNumber}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="map-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>Route: {profile.route}</Text>
        </View>
      </View>

    </ScrollView>
  );
}

// Visual Styling Rules
const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill available space
    backgroundColor: '#F8FAFC', // Very light gray/blue background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe padding for the notch on modern phones
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0', // Light separator line
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Nudge to the left to match alignment
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  avatarContainer: {
    alignItems: 'center', // Center everything inside
    marginTop: 30,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 100, // Size of the avatar circle
    height: 100,
    borderRadius: 50, // 50 is exactly half of 100, making a perfect circle
    backgroundColor: '#E0F2FE', // Light blue background for the icon
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A', // Deep blue slate
  },
  driverRole: {
    fontSize: 16,
    color: '#64748B', // Muted text for the role
    marginTop: 4, // Tiny gap below the name
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20, // Space from the edge of the screen
    marginBottom: 16, // Space between cards
    padding: 20, // Internal padding so text doesn't touch the edge
    borderRadius: 16, // Rounded corners on the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // Very soft, modern shadow
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16, // Spacing above the list
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Space between each detail row
  },
  infoText: {
    fontSize: 15,
    color: '#334155',
    marginLeft: 12, // Gap between the icon and the text
    flex: 1,
  },
});
