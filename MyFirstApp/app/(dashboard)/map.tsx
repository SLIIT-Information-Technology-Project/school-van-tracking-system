// ============================================================
// Map Tracking Screen — Redesigned UI
// Modern tracking dashboard with floating UI, gradients,
// and clear status indicators for Driver and Parent.
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView, StatusBar, Dimensions, Animated, Image
} from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');
const MAP_HERO = require('../../assets/images/van_hero.png');

export default function MapScreen() {
  const router = useRouter();
  const rawParam = useLocalSearchParams().systemId;
  const systemId: string = Array.isArray(rawParam) ? rawParam[0] : (rawParam ?? '');
  const systemIdRef = useRef<string>(systemId);

  useEffect(() => {
    systemIdRef.current = systemId;
  }, [systemId]);

  //  State 
  const [role, setRole] = useState<'Driver' | 'Parent' | 'Attendant' | null>(null);
  const [userId, setUserId] = useState('');
  const [system, setSystem] = useState<any>(null);
  const [vanLocation, setVanLocation] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Checking Status...');
  const [isLive, setIsLive] = useState(false);

  // Pickup Location State
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  //  Lifecycle 
  useEffect(() => {
    loadInitialData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    return () => {
      stopDriverTracking();
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [systemId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
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

      setRole(currentRole);
      setUserId(currentId);

      const response = await api.get(`/system/${systemId}`);
      const systemData = response.data.system;
      setSystem(systemData);

      if (systemData.route_polyline) {
        try { setRoutePath(JSON.parse(systemData.route_polyline)); } catch (e) {}
      }

      if (currentRole === 'Driver') {
        fetchParentPickups();
        setStatusText('Ready to Start');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          centerMap(pos.coords.latitude, pos.coords.longitude);
        }
      } else {
        if (currentRole === 'Parent') await fetchMyPickup(currentId);
        startPolling();
      }
    } catch (error: any) {
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

  const fetchMyPickup = async (pId: string) => {
    try {
      const response = await api.get(`/system/${systemId}/parents`);
      const me = (response.data.parents || []).find((p: any) => p.parent_id === pId);
      if (me?.pickup_lat) {
        setMyPickup({ latitude: parseFloat(me.pickup_lat), longitude: parseFloat(me.pickup_lng) });
      }
    } catch (err) { }
  };

  const savePickupLocation = async () => {
    if (!tempPickup) return;
    setSavingPickup(true);
    try {
      await api.put(`/system/${systemId}/parent/${userId}/pickup`, { lat: tempPickup.latitude, lng: tempPickup.longitude });
      setMyPickup(tempPickup);
      setTempPickup(null);
      setIsSettingLocation(false);
      Alert.alert('Success', 'Pickup location updated!');
      fetchParentPickups();
    } catch (error) {
      Alert.alert('Error', 'Failed to save location');
    } finally {
      setSavingPickup(false);
    }
  };

  const centerMap = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({
      latitude: lat, longitude: lng,
      latitudeDelta: 0.012, longitudeDelta: 0.012,
    });
  };

  const startDriverTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      setIsTracking(true);
      setIsLive(true);
      setStatusText('LIVE BROADCAST');

      try { await api.post(`/system/${systemId}/tracking/start`, { driverName: system?.driver?.name }); } catch (err) {}

      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 8000, distanceInterval: 10 },
        async (newLoc) => {
          const { latitude, longitude } = newLoc.coords;
          setVanLocation({ latitude, longitude });
          await supabase.from('transportation_systems').update({ current_lat: latitude, current_lng: longitude, updated_at: new Date().toISOString() }).eq('id', systemIdRef.current);
        }
      );
    } catch (error) { setIsTracking(false); }
  };

  const stopDriverTracking = async () => {
    if (locationSubscription.current) { locationSubscription.current.remove(); locationSubscription.current = null; }
    setIsTracking(false);
    setIsLive(false);
    setStatusText('Offline');
    try { await api.post(`/system/${systemId}/tracking/stop`); } catch (err) {}
  };

  const startPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    fetchVanLocation();
    pollInterval.current = setInterval(fetchVanLocation, 10000);
  };

  const fetchVanLocation = async () => {
    const activeId = systemIdRef.current;
    if (!activeId) return;
    try {
      const { data, error } = await supabase.from('transportation_systems').select('current_lat, current_lng, updated_at').eq('id', activeId).single();
      if (error || !data || data.current_lat == null) { setStatusText('Offline'); setIsLive(false); return; }

      const lat = parseFloat(data.current_lat);
      const lng = parseFloat(data.current_lng);
      const ageSeconds = Math.round((Date.now() - new Date(data.updated_at).getTime()) / 1000);
      
      if (ageSeconds > 60) {
          setStatusText('Offline');
          setIsLive(false);
      } else {
          setStatusText('LIVE');
          setIsLive(true);
          setVanLocation({ latitude: lat, longitude: lng });
      }
    } catch (err) {}
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#3B82F6" /></View>;

  const isDriver = role === 'Driver';
  const isParent = role === 'Parent';
  const themeColor = isLive ? '#10B981' : '#64748B';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background Image Header (for Parents) ── */}
      {isParent && (
          <View style={styles.parentHeaderBg}>
              <Image source={MAP_HERO} style={styles.headerHeroImg} blurRadius={Platform.OS === 'ios' ? 10 : 5} />
              <LinearGradient colors={['rgba(15,23,42,0.1)', '#0F172A']} style={StyleSheet.absoluteFillObject} />
          </View>
      )}

      {/* ── MAP CONTAINER ── */}
      <View style={[styles.mapWrapper, isParent && styles.mapWrapperRounded]}>
        <MapView
          ref={mapRef as any}
          style={styles.map}
          initialRegion={{ latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
          onLongPress={(e) => isParent && isSettingLocation && setTempPickup(e.nativeEvent.coordinate)}
        >
          {vanLocation && (
            <Marker coordinate={vanLocation} zIndex={100}>
              <View style={[styles.vanPin, { borderColor: isLive ? '#10B981' : '#64748B' }]}>
                <MaterialCommunityIcons name="bus-school" size={26} color={isLive ? '#10B981' : '#64748B'} />
                {isLive && <View style={styles.livePulse} />}
              </View>
            </Marker>
          )}

          {(myPickup || tempPickup) && isParent && (
            <Marker coordinate={tempPickup || myPickup} zIndex={50}>
              <View style={styles.pickupPin}><Ionicons name="location" size={24} color="#EF4444" /></View>
            </Marker>
          )}

          {!isParent && parentPickups.map(p => (
            <Marker key={p.parent_id} coordinate={{ latitude: parseFloat(p.pickup_lat), longitude: parseFloat(p.pickup_lng) }}>
              <View style={styles.childPin}><MaterialCommunityIcons name="account-child" size={20} color="#F59E0B" /></View>
              <Callout><View style={styles.callout}><Text style={styles.calloutName}>{p.users?.name}</Text></View></Callout>
            </Marker>
          ))}

          {routePath.length > 0 && <Polyline coordinates={routePath} strokeWidth={4} strokeColor="#3B82F680" lineDashPattern={[5,5]} />}
        </MapView>

        {/* ── Floating Header Card ── */}
        <Animated.View style={[styles.floatingHeader, { opacity: fadeAnim }]}>
           <View style={styles.headerCard}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                 <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                 <Text style={styles.systemNameText}>{system?.name || 'Tracking'}</Text>
                 <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: themeColor }]} />
                    <Text style={[styles.statusText, { color: themeColor }]}>{statusText}</Text>
                 </View>
              </View>
              <View style={styles.busIconBox}>
                 <MaterialCommunityIcons name="bus-side" size={24} color="#fff" />
              </View>
           </View>
        </Animated.View>
      </View>

      {/* ── Bottom Controls ── */}
      <Animated.View style={[styles.bottomArea, { opacity: fadeAnim }]}>
        {isDriver ? (
            <View style={styles.driverControlCard}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>STATUS</Text>
                        <Text style={[styles.statValue, { color: themeColor }]}>{isTracking ? 'ONLINE' : 'OFFLINE'}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>PASSENGERS</Text>
                        <Text style={styles.statValue}>{parentPickups.length}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.mainActionBtn]} 
                    onPress={isTracking ? stopDriverTracking : startDriverTracking}
                    activeOpacity={0.8}
                >
                    <LinearGradient 
                        colors={isTracking ? ['#EF4444', '#DC2626'] : ['#3B82F6', '#2563EB']} 
                        style={styles.actionBtnGradient}
                    >
                        <MaterialCommunityIcons name={isTracking ? 'stop-circle-outline' : 'play-circle-outline'} size={28} color="#fff" />
                        <Text style={styles.actionBtnText}>{isTracking ? 'STOP TRACKING' : 'START TRACKING'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.parentControlCard}>
                {isSettingLocation ? (
                    <View style={styles.settingMode}>
                        <Text style={styles.promptText}>Long-press on map to place your pickup pin.</Text>
                        <View style={styles.modeButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsSettingLocation(false); setTempPickup(null); }}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { opacity: tempPickup ? 1 : 0.6 }]} 
                                disabled={!tempPickup || savingPickup}
                                onPress={savePickupLocation}
                            >
                                {savingPickup ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Pin</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.setPickupBtn} onPress={() => setIsSettingLocation(true)}>
                        <LinearGradient colors={['#10B981', '#059669']} style={[styles.actionBtnGradient, { borderRadius: 25 }]}>
                            <Ionicons name="location-outline" size={24} color="#fff" />
                            <Text style={styles.actionBtnText}>{myPickup ? 'Change Pickup Spot' : 'Set My Pickup Spot'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  map: { flex: 1 },
  
  // Parent Hero Bg
  parentHeaderBg: { height: 200, width: '100%', position: 'absolute', top: 0 },
  headerHeroImg: { width: '100%', height: '100%', opacity: 0.5 },

  // Map Container
  mapWrapper: { flex: 1, overflow: 'hidden' },
  mapWrapperRounded: { marginTop: 100, borderTopLeftRadius: 40, borderTopRightRadius: 40, backgroundColor: '#fff' },

  // Floating Header
  floatingHeader: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 100 },
  headerCard: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    padding: 12, borderRadius: 25,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 15 },
  systemNameText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  busIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },

  // Markers
  vanPin: { backgroundColor: '#fff', padding: 8, borderRadius: 25, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  livePulse: { position: 'absolute', width: 45, height: 45, borderRadius: 22, borderLines: 2, borderColor: '#10B981', borderWidth: 2, opacity: 0.5 },
  pickupPin: { backgroundColor: '#fff', padding: 5, borderRadius: 15, elevation: 5 },
  childPin: { backgroundColor: '#fff', padding: 5, borderRadius: 15, borderWidth: 2, borderColor: '#F59E0B' },
  callout: { padding: 8, borderRadius: 10 },
  calloutName: { fontWeight: '800', fontSize: 13 },

  // Bottom Area
  bottomArea: { position: 'absolute', bottom: 35, left: 20, right: 20 },
  driverControlCard: { backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: 35, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25 },
  statItem: { alignItems: 'center' },
  statLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },

  parentControlCard: { backgroundColor: '#fff', borderRadius: 35, padding: 15, elevation: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  
  mainActionBtn: { borderRadius: 25, overflow: 'hidden' },
  actionBtnGradient: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

  // Parent Setting View
  settingMode: { padding: 10 },
  promptText: { textAlign: 'center', color: '#1E293B', fontWeight: '700', marginBottom: 15 },
  modeButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, height: 55, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 2, height: 55, borderRadius: 20, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  btnText: { fontWeight: '900', color: '#1E293B' },
  setPickupBtn: { borderRadius: 25, overflow: 'hidden' },
});
