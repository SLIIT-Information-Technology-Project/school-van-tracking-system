import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
=======
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView, StatusBar, Dimensions
} from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
>>>>>>> origin/main
import * as Location from 'expo-location';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();

  const rawParam = useLocalSearchParams().systemId;
  const systemId: string = Array.isArray(rawParam) ? rawParam[0] : (rawParam ?? '');
  console.log('[Map] systemId from params:', systemId);

  const systemIdRef = useRef<string>(systemId);
  useEffect(() => {
    systemIdRef.current = systemId;
    console.log('[Map] systemId updated in ref:', systemIdRef.current);
  }, [systemId]);

  //  State variables 
  const [role, setRole] = useState<'Driver' | 'Parent' | 'Attendant' | null>(null);
  const [userId, setUserId] = useState('');
  const [system, setSystem] = useState<any>(null);
  const [vanLocation, setVanLocation] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Initializing Map...');

  // Pickup Location State (where the parent wants to be picked up)
  const [parentPickups, setParentPickups] = useState<any[]>([]);
  const [myPickup, setMyPickup] = useState<any>(null);
  const [tempPickup, setTempPickup] = useState<any>(null);
  const [isSettingLocation, setIsSettingLocation] = useState(false);
  const [savingPickup, setSavingPickup] = useState(false);
  const [routePath, setRoutePath] = useState<any[]>([]);

  //  Refs 
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<any>(null);
  const pollInterval = useRef<any>(null);

  //  Lifecycle 
  useEffect(() => {
    console.log('[Map] ── Component mounted. systemId:', systemId, '──────────────────');
    loadInitialData();

    return () => {
      // Clean up when navigating away
      stopDriverTracking();
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        console.log('[Map] Polling interval cleared on unmount');
      }
    };
  }, [systemId]);

  //  Load initial data 
  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('[Map] loadInitialData — systemId:', systemId);

      // Determine who is logged in by checking AsyncStorage
      const driverData = await AsyncStorage.getItem('driverData');
      const parentData = await AsyncStorage.getItem('parentData');
      const attendantData = await AsyncStorage.getItem('attendantData');

      let currentRole: 'Driver' | 'Parent' | 'Attendant' = 'Parent';
      let currentId = '';

      if (driverData) {
        currentRole = 'Driver';
        currentId = JSON.parse(driverData).id;
      } else if (parentData) {
        currentRole = 'Parent';
        currentId = JSON.parse(parentData).id;
      } else if (attendantData) {
        currentRole = 'Attendant';
        currentId = JSON.parse(attendantData).id;
      }

      console.log('[Map] Detected role:', currentRole, '| userId:', currentId);
      setRole(currentRole);
      setUserId(currentId);

      // Fetch the van system info from our backend
      const response = await api.get(`/system/${systemId}`);
      const systemData = response.data.system;
      setSystem(systemData);

      // Parse the planned route polyline if it exists
      if (systemData.route_polyline) {
        try {
          setRoutePath(JSON.parse(systemData.route_polyline));
        } catch (e) {
          console.error('[Map] Error parsing route polyline:', e);
        }
      }

      if (currentRole === 'Driver') {
        // Driver: show where parents are waiting; ask for location permission
        fetchParentPickups();
        setStatusText('Ready to Start Tracking');
        console.log('[Driver] systemId:', systemId);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          centerMap(pos.coords.latitude, pos.coords.longitude);
        }
      } else if (currentRole === 'Attendant') {
        fetchParentPickups();
        setStatusText('Tracking Van Location...');
        console.log('[Attendant] systemId:', systemId);
        startPolling();
      } else {
        // Parent: fetch own pickup pin and start polling for the van
        await fetchMyPickup(currentId);
        setStatusText('Connecting to Van...');
        console.log('[Parent] systemId:', systemId);
        startPolling();
      }
    } catch (error: any) {
      console.error('[Map] loadInitialData error:', error?.message ?? error);
      Alert.alert('Error', 'Could not load tracking data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchParentPickups = async () => {
    try {
      const response = await api.get(`/system/${systemId}/parents`);
      const list = response.data.parents || [];
      setParentPickups(list.filter((p: any) => p.pickup_lat && p.pickup_lng));
    } catch (err) { }
  };

  //  Fetch this parent's own saved pickup pin 
  const fetchMyPickup = async (pId: string) => {
    try {
      const response = await api.get(`/system/${systemId}/parents`);
      const parents = response.data.parents || [];
      const me = parents.find((p: any) => p.parent_id === pId);
      if (me?.pickup_lat) {
        setMyPickup({
          latitude: parseFloat(me.pickup_lat),
          longitude: parseFloat(me.pickup_lng),
        });
      }
    } catch (err) { }
  };

  //  Save pickup location 
  const savePickupLocation = async () => {
    if (!tempPickup) return;
    setSavingPickup(true);
    try {
      await api.put(`/system/${systemId}/parent/${userId}/pickup`, {
        lat: tempPickup.latitude,
        lng: tempPickup.longitude,
      });
      setMyPickup(tempPickup);
      setTempPickup(null);
      setIsSettingLocation(false);
      Alert.alert('Success', 'Pickup location updated successfully.');
      fetchParentPickups();
    } catch (error) {
      Alert.alert('Error', 'Failed to save pickup location');
    } finally {
      setSavingPickup(false);
    }
  };

  //  Map interaction 
  const onMapLongPress = (e: any) => {
    if (role === 'Parent' && isSettingLocation) {
      setTempPickup(e.nativeEvent.coordinate);
    }
  };

  const centerMap = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    });
  };

  // DRIVER: Start broadcasting location → Supabase 
  const startDriverTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to broadcast your position.');
        return;
      }

      setIsTracking(true);
      setStatusText('BROADCASTING LIVE');

      // Notify the backend that tracking has started (for push notifications etc.)
      try {
        await api.post(`/system/${systemId}/tracking/start`, {
          driverName: system?.driver?.name || 'The driver',
        });
      } catch (err) { }

      // Watch the device GPS and push every update to Supabase
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,   // update at most every 10 seconds
          distanceInterval: 10,  // or when moved 10 metres
        },
        async (newLoc) => {
          const { latitude, longitude } = newLoc.coords;

          // Update driver's own map marker immediately (no need to wait for DB)
          setVanLocation({ latitude, longitude });
          centerMap(latitude, longitude);

          // ── Push location to Supabase ──
          const payload = {
            current_lat: latitude,
            current_lng: longitude,
            updated_at: new Date().toISOString(),
          };

          const activeId = systemIdRef.current;
          console.log('[Driver] Updating:', activeId, latitude, longitude);
          console.log('[Driver] Updating Supabase');

          const { data: updateData, error: updateError } = await supabase
            .from('transportation_systems')
            .update(payload)
            .eq('id', activeId)
            .select();

          if (updateError) {
            console.error('[Driver] Failed:', updateError.message);
          } else {
            const rowsAffected = updateData?.length || 0;
            if (rowsAffected > 0) {
              console.log('[Driver] Success | Rows affected:', rowsAffected);
            } else {
              console.error('[Driver] Failed: No rows updated. Check if systemId exists.');
            }
          }
        }
      );
    } catch (error: any) {
      console.error('[Driver] startDriverTracking error:', error?.message ?? error);
      setIsTracking(false);
    }
  };

  //  DRIVER: Stop broadcasting 
  const stopDriverTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    setStatusText('Tracking Stopped');
    try {
      await api.post(`/system/${systemId}/tracking/stop`);
    } catch (err) { }
  };

  //  PARENT / ATTENDANT: Polling logic 


  const startPolling = () => {
    // Clear any previous interval to prevent duplicates
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      console.log('[Parent] Previous poll interval cleared');
    }

    console.log('[Parent] Starting polling every 10s for systemId:', systemIdRef.current);

    // Run once immediately so the parent doesn't wait 10s for first data
    fetchVanLocation();

    // Then repeat every 10 seconds
    pollInterval.current = setInterval(() => {
      fetchVanLocation();
    }, 10000);
  };

  const fetchVanLocation = async () => {
    // Always read from the ref so the interval callback uses the current ID
    const activeId = systemIdRef.current;

    if (!activeId) {
      console.warn('[Parent] systemId is empty');
      return;
    }

    console.log('[Parent] Fetching location');

    try {
      const { data, error } = await supabase
        .from('transportation_systems')       // table name
        .select('current_lat, current_lng, updated_at') // columns to fetch
        .eq('id', activeId)                   // match the specific van system row
        .single();                            // expect exactly one row

      // Handle Supabase errors 
      if (error) {
        console.error('[Parent] Failed:', error.message);
        setStatusText('Connection Error');
        return;
      }

      console.log('[Parent] Received data:', data);

      if (!data || data.current_lat == null || data.current_lng == null) {
        console.warn('[Parent] No location data found');
        setStatusText('Waiting for Driver...');
        return;
      }

      const lat = parseFloat(data.current_lat);
      const lng = parseFloat(data.current_lng);

      const lastUpdate = new Date(data.updated_at).getTime();
      const ageSeconds = Math.round((Date.now() - lastUpdate) / 1000);
      const isStale = ageSeconds > 60;

      if (isStale) {
        setStatusText('Van Offline');
      } else {
        setStatusText('Van is LIVE');
        setVanLocation({ latitude: lat, longitude: lng });
      }
    } catch (err: any) {
      console.error('[Parent] ❌ fetchVanLocation exception:', err?.message ?? err);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#0F172A' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const isDriver = role === 'Driver';
  const isParent = role === 'Parent';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── MAP ── */}
      <MapView
        ref={mapRef as any}
        style={styles.map}
        initialRegion={{
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onLongPress={onMapLongPress}
      >
        {/* VAN MARKER — moves whenever vanLocation state changes.
            The `key` prop forces React to re-render the Marker when position changes. */}
        {vanLocation && (
          <Marker
            key={`van-${vanLocation.latitude}-${vanLocation.longitude}`}
            coordinate={vanLocation}
            title="School Van"
            zIndex={100}
          >
            <View style={[styles.vanMarker, { borderColor: isDriver ? '#3B82F6' : '#8B5CF6' }]}>
              <MaterialCommunityIcons
                name="bus-school"
                size={26}
                color={isDriver ? '#3B82F6' : '#8B5CF6'}
              />
            </View>
          </Marker>
        )}

        {/* PARENT'S OWN PICKUP PIN */}
        {(myPickup || tempPickup) && isParent && (
          <Marker coordinate={tempPickup || myPickup} zIndex={50}>
            <View style={[styles.pickupMarker, { borderColor: '#10B981' }]}>
              <MaterialCommunityIcons name="map-marker-account" size={20} color="#10B981" />
            </View>
          </Marker>
        )}

        {/* DRIVER / ATTENDANT VIEW: All children's pickup spots */}
        {!isParent &&
          parentPickups.map((p: any) => (
            <Marker
              key={p.parent_id}
              coordinate={{
                latitude: parseFloat(p.pickup_lat),
                longitude: parseFloat(p.pickup_lng),
              }}
            >
              <View style={[styles.pickupMarker, { borderColor: '#F59E0B' }]}>
                <MaterialCommunityIcons name="account-child" size={20} color="#F59E0B" />
              </View>
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{p.users?.name || 'Parent'}</Text>
                  <Text style={styles.calloutSub}>{p.users?.email}</Text>
                </View>
              </Callout>
            </Marker>
          ))}

        {/* PLANNED ROUTE POLYLINE */}
        {routePath.length > 0 && (
          <>
            <Polyline
              coordinates={routePath}
              strokeWidth={3}
              strokeColor="rgba(59, 130, 246, 0.6)"
              lineDashPattern={[5, 5]}
            />
            {system?.start_lat && (
              <Marker
                coordinate={{
                  latitude: parseFloat(system.start_lat),
                  longitude: parseFloat(system.start_lng),
                }}
                title="Route Start"
              >
                <View style={[styles.routePoint, { backgroundColor: '#3B82F6' }]} />
              </Marker>
            )}
            {system?.end_lat && (
              <Marker
                coordinate={{
                  latitude: parseFloat(system.end_lat),
                  longitude: parseFloat(system.end_lng),
                }}
                title="Route End"
              >
                <View style={[styles.routePoint, { backgroundColor: '#EF4444' }]} />
              </Marker>
            )}
          </>
        )}
      </MapView>

      {/* ── HEADER OVERLAY ── */}
      <View style={styles.headerArea}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{system?.name || 'Live View'}</Text>
              <Text style={styles.headerSub}>{statusText}</Text>
            </View>
            {/* Version badge — bump this to confirm the latest build is running */}
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v1.5</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── FOOTER CONTROLS ── */}
      <View style={styles.footerArea}>
        {isDriver ? (
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: isTracking ? '#EF4444' : '#3B82F6' }]}
            onPress={isTracking ? stopDriverTracking : startDriverTracking}
          >
            <MaterialCommunityIcons
              name={isTracking ? 'stop-circle' : 'play-circle'}
              size={32}
              color="#fff"
            />
            <Text style={styles.mainBtnText}>
              {isTracking ? 'Stop Broadcasting' : 'Start Broadcasting'}
            </Text>
          </TouchableOpacity>
        ) : isParent ? (
          <View style={{ width: '100%' }}>
            {isSettingLocation ? (
              <View style={styles.selectionCard}>
                <Text style={styles.selectionPrompt}>
                  Long-press on map to place your pickup pin.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.flexBtn, { backgroundColor: '#475569' }]}
                    onPress={() => {
                      setIsSettingLocation(false);
                      setTempPickup(null);
                    }}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.flexBtn,
                      { backgroundColor: '#10B981', opacity: tempPickup ? 1 : 0.5 },
                    ]}
                    disabled={!tempPickup || savingPickup}
                    onPress={savePickupLocation}
                  >
                    {savingPickup ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.btnText}>Save Pin</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: '#10B981' }]}
                onPress={() => setIsSettingLocation(true)}
              >
                <MaterialCommunityIcons name="map-marker-radius" size={28} color="#fff" />
                <Text style={styles.mainBtnText}>
                  {myPickup ? 'Change My Pickup Spot' : 'Set My Pickup Spot'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="broadcast" size={24} color="#8B5CF6" />
            <Text style={styles.infoCardText}>Viewing van's live status</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerArea: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: '#94A3B8', fontSize: 12 },
  versionBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  footerArea: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  mainBtn: {
    height: 75,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  vanMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    elevation: 10,
  },
  pickupMarker: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    elevation: 5,
  },
  selectionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 20,
    borderRadius: 30,
  },
  selectionPrompt: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  flexBtn: {
    flex: 1,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  infoCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCardText: { fontWeight: 'bold', color: '#1E293B' },
  callout: { padding: 10, minWidth: 150 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutSub: { fontSize: 12, color: '#64748B' },
  routePoint: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
});
