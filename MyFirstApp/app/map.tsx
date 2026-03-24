import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
// MapView displays the map, Marker shows a specific point on the map
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Hook to access navigation parameters
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Importer for live GPS targeting
import api from '../services/api'; // Axios configured connection string

// Screen Component: Simple Map Screen
export default function MapScreen() {
  const { role, driverData } = useLocalSearchParams(); // Extract the 'role' and custom profile payload passed securely via navigation params
  const router = useRouter(); // Hook to navigate to other screens

  // Parse the injected payload to get the driverId dynamically 
  let profile: any = null;
  try { if (typeof driverData === 'string') profile = JSON.parse(driverData); } catch(error) { console.log("Missing profile payload mapping"); }

  // Local state for our active coordinate targeting (defaulting to Colombo)
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.05, 
    longitudeDelta: 0.05,
  });

  // Track the watcher instance so we can explicitly kill it when the map unmounts
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // Only automatically boot up live tracking if this was deliberately launched by a Driver
    if (role === 'Driver') {
       startLiveTracking();
    }

    // This specifically triggers when the component explicitly closes to stop memory ballooning
    return () => {
       if (locationSubscription) {
          locationSubscription.remove();
       }
    };
  }, [role]); // Runs immediately when the Map loads and reads the User Role

  const startLiveTracking = async () => {
     try {
        // 1. Physically prompt the iOS/Android operating system for Foreground Location Permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        // Ensure they didn't hit 'Deny'
        if (status !== 'granted') {
           Alert.alert('Permission Denied', 'Please enable location services to natively broadcast your route.');
           return;
        }

        // 2. Fetch their instantaneous starting point smoothly
        const initialLocation = await Location.getCurrentPositionAsync({});
        updateLocationState(initialLocation.coords.latitude, initialLocation.coords.longitude);

        // 3. Initiate the live GPS watcher natively. Uses 'Highest' accuracy natively pulling ~10m accuracy loops
        const sub = await Location.watchPositionAsync(
           {
              accuracy: Location.Accuracy.Highest, // Maximum standard GPS refresh
              distanceInterval: 10, // Only trigger a refresh if they logically move 10 meters physically
           },
           (newLocation) => {
              // Update local React UI natively to shift the physical map marker seamlessly
              updateLocationState(newLocation.coords.latitude, newLocation.coords.longitude);
           }
        );
        setLocationSubscription(sub);

     } catch (err) {
        console.error("Live Tracking Boot Error:", err);
     }
  };

  // Helper method to mutate state and ping the API cleanly
  const updateLocationState = (lat: number, lng: number) => {
     setCurrentLocation(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
     }));

     // Only attempt to transmit natively if we actually have a logged-in driver's Profile Object ID
     if (profile?.id) {
       api.post('/location/update', {
          driverId: profile.id,
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString()
       }).catch(error => {
          // If the backend drops offline mid-drive, fail silently instead of interrupting the user's mapping UI
          console.log("Live Sync Bypass:", error.message);
       });
     }
  };

  return (
    <View style={styles.container}>
      {/* Full screen MapView component pulling from Google Maps/Apple Maps */}
      <MapView 
        style={styles.map}
        // Force regional map focus explicitly back to the new dynamic physical coordinate
        region={currentLocation} 
      >
        {/* Dynamic location marker shifting in realtime */}
        <Marker
          coordinate={{ 
            latitude: currentLocation.latitude, 
            longitude: currentLocation.longitude 
          }}
          title={role === 'Driver' ? "You" : "School Vehicle"}
          description={role === 'Driver' ? "Broadcasting live route" : "Current estimated location"}
        />
      </MapView>

      {/* Floating Driver Profile Button on Top Right (Always overlayed above map) */}
      <TouchableOpacity 
        style={styles.profileButton} 
        // We forward the exact driverData profile directly into the Profile component
        onPress={() => router.push({ pathname: '/driver-profile', params: { driverData } })}
      >
        <Ionicons name="person" size={24} color="#334155" />
      </TouchableOpacity>

      {/* Floating UI Badge indicating current role (Reads from params) */}
      <View style={styles.floatingBadge}>
        <Text style={styles.badgeText}>Logged in as: {role || 'Unknown'}</Text>
      </View>
    </View>
  );
}

// Styling definitions
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes up the whole screen safely
  },
  map: {
    width: '100%',
    height: '100%', // Expands the map natively to fill the exact dimensions of the container
  },
  floatingBadge: {
    position: 'absolute', // Float over map
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight opacity for modern look
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Android drop shadow
  },
  badgeText: {
    color: '#0F172A', // Very dark slate color
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileButton: {
    position: 'absolute',
    top: 50, // Pushed down slightly from the top screen edge
    right: 20, // Hugs the right side of the screen
    width: 48,
    height: 48,
    borderRadius: 24, // Exact half of width/height makes it perfectly circular
    backgroundColor: '#FFFFFF', // Solid white background
    justifyContent: 'center', // Centers icon vertically
    alignItems: 'center', // Centers icon horizontally
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, // Subtle, modern drop shadow
    shadowRadius: 8,
    elevation: 5, // Android shadow rendering
  },
});
