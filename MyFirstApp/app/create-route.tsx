import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Modal, ScrollView, TextInput, Alert, Dimensions, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// 1. Stub 2-3 examples 
const INITIAL_ROUTES = [
  { id: '1', name: 'Home to Office', start: 'Kottawa', end: 'Colombo 03' },
  { id: '2', name: 'Kottawa Express', start: 'High Level Road', end: 'SLIIT Campus' }
];

export default function CreateRouteScreen() {
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Creation form state
  const [startPoint, setStartPoint] = useState<any>(null);
  const [endPoint, setEndPoint] = useState<any>(null);
  const [routePath, setRoutePath] = useState<any[]>([]);
  const [routeName, setRouteName] = useState('');
  const [startName, setStartName] = useState('');
  const [endName, setEndName] = useState('');
  const [step, setStep] = useState<'start' | 'end' | 'confirm'>('start');
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  // Dynamic Map Markers mapping & OSMR API fetching
  const handleMapPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    if (step === 'start') {
      setStartPoint(coord);
      setStartName(`Lat: ${coord.latitude.toFixed(4)}, Lng: ${coord.longitude.toFixed(4)}`);
    } else if (step === 'end') {
      setEndPoint(coord);
      setEndName(`Lat: ${coord.latitude.toFixed(4)}, Lng: ${coord.longitude.toFixed(4)}`);
      fetchRoute(startPoint, coord);
      setStep('confirm');
    }
  };

  const fetchRoute = async (start: any, end: any) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: any) => ({
          latitude: c[1], longitude: c[0],
        }));
        setRoutePath(coords);
        setTimeout(() => {
          mapRef.current?.fitToCoordinates([start, end], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      }
    } catch (e) {
      console.log('Error fetching route');
    }
  };

  const handleSave = () => {
    if (!startPoint || !endPoint || !routeName.trim()) {
      Alert.alert('Missing Fields', 'Please select a start and end point on the map, and enter a route name.');
      return;
    }
    const newRoute = {
      id: Math.random().toString(),
      name: routeName,
      start: startName,
      end: endName
    };
    setRoutes(prev => [newRoute, ...prev]);
    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    // Reset Form
    setStartPoint(null);
    setEndPoint(null);
    setRoutePath([]);
    setRouteName('');
    setStartName('');
    setEndName('');
    setStep('start');
  };

  const handleGeocode = async (type: 'start' | 'end') => {
     const addr = type === 'start' ? startName : endName;
     if (!addr) return;
     setLoading(true);
     try {
       const res = await Location.geocodeAsync(addr);
       if (res.length > 0) {
         const coord = { latitude: res[0].latitude, longitude: res[0].longitude };
         if (type === 'start') {
           setStartPoint(coord);
         } else {
           setEndPoint(coord);
           if (startPoint) {
              fetchRoute(startPoint, coord);
              setStep('confirm');
           }
         }
         mapRef.current?.animateToRegion({
           ...coord, latitudeDelta: 0.05, longitudeDelta: 0.05
         }, 1000);
       }
     } catch (e) {
        Alert.alert('Geocoding Error');
     } finally {
       setLoading(false);
     }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & FAB */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Managed Routes</Text>
        {/* Prominent '+ Create New Route' Button */}
        <TouchableOpacity style={styles.fabBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.fabText}>Create Route</Text>
        </TouchableOpacity>
      </View>

      {/* 1. Routes List UI */}
      <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {routes.map(r => (
          <View key={r.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <MaterialCommunityIcons name="routes" size={24} color="#3B82F6" />
              <Text style={styles.routeName}>{r.name}</Text>
            </View>
            <View style={styles.routeRow}>
              <Ionicons name="location" size={16} color="#10B981" />
              <Text style={styles.routeText} numberOfLines={1}>{r.start}</Text>
            </View>
            <View style={styles.routeRow}>
              <Ionicons name="flag" size={16} color="#EF4444" />
              <Text style={styles.routeText} numberOfLines={1}>{r.end}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 3. Form Modal (Popup) Logic */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
               <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Route Form</Text>
            <TouchableOpacity onPress={handleSave}>
               <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Map Viewer - Dynamic map markers & polyline */}
          <View style={[styles.modalMapContainer, { zIndex: 1 }]}>
             <MapView 
               ref={mapRef}
               style={{ flex: 1 }}
               onPress={handleMapPress}
               initialRegion={{
                 latitude: 6.9271,
                 longitude: 79.8612,
                 latitudeDelta: 0.1,
                 longitudeDelta: 0.1
               }}
             >
                {startPoint && <Marker coordinate={startPoint} pinColor="#10B981" title="Start" />}
                {endPoint && <Marker coordinate={endPoint} pinColor="#EF4444" title="End" />}
                {routePath.length > 0 && <Polyline coordinates={routePath} strokeColor="#3B82F6" strokeWidth={4} />}
             </MapView>
             <View style={styles.instructionFloating}>
                <Text style={styles.instructionFloatingText}>
                   {step === 'start' ? 'Tap map to set START' : step === 'end' ? 'Tap map to set END' : 'Review Route and Save'}
                </Text>
                {step === 'start' && startPoint && (
                   <TouchableOpacity style={styles.nextMapBtn} onPress={() => setStep('end')}>
                     <Text style={{color:'#fff', fontWeight: 'bold'}}>Next: Set END</Text>
                   </TouchableOpacity>
                )}
             </View>
          </View>

          {/* Form ScrollView - strictly preserved internal scrolling & z-index */}
          <ScrollView 
            style={[styles.modalFormBox, { zIndex: 10 }]} // Downward/upward opening z-index logic preserved
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
             <View style={{ zIndex: 3, elevation: 3, marginBottom: 15 }}>
               <Text style={styles.formLabel}>Route Name</Text>
               <TextInput 
                 style={styles.inputStyle} 
                 placeholder="e.g. Morning Pickup Route"
                 value={routeName}
                 onChangeText={setRouteName}
               />
             </View>

             {loading && <ActivityIndicator color="#3B82F6" style={{ marginVertical: 10 }} />}

             <View style={{ zIndex: 2, elevation: 2, marginBottom: 15 }}>
               <Text style={styles.formLabel}>Start Location</Text>
               <TextInput 
                 style={styles.inputStyle} 
                 placeholder="Search or tap map..."
                 value={startName}
                 onChangeText={setStartName}
                 onSubmitEditing={() => handleGeocode('start')}
               />
             </View>
             
             <View style={{ zIndex: 1, elevation: 1, marginBottom: 40 }}>
               <Text style={styles.formLabel}>End Location</Text>
               <TextInput 
                 style={styles.inputStyle} 
                 placeholder="Search or tap map..."
                 value={endName}
                 onChangeText={setEndName}
                 onSubmitEditing={() => handleGeocode('end')}
               />
             </View>
          </ScrollView>

        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  fabBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    elevation: 3, shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 5
  },
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  listContainer: { padding: 15 },
  routeCard: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 16, 
    marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
  },
  routeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  routeName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginLeft: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  routeText: { color: '#64748B', fontSize: 13, marginLeft: 6, flex: 1 },
  
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#e2e8f0', zIndex: 20
  },
  cancelText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  saveText: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  
  modalMapContainer: { width: '100%', height: height * 0.4, position: 'relative' },
  instructionFloating: {
    position: 'absolute', top: 15, alignSelf: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: 12, borderRadius: 12,
    alignItems: 'center', zIndex: 10
  },
  instructionFloatingText: { color: '#fff', fontWeight: 'bold' },
  nextMapBtn: { marginTop: 8, backgroundColor: '#3B82F6', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
  
  modalFormBox: { flex: 1, backgroundColor: '#fff', padding: 20 },
  formLabel: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 6 },
  inputStyle: {
    backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 15,
    height: 50, color: '#1E293B', fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0'
  }
});
