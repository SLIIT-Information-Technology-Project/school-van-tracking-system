<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal, 
  TextInput, ActivityIndicator, Image, ScrollView,
  SafeAreaView, StatusBar, RefreshControl, Platform
=======
// ============================================================
// Dashboard Home Screen — Redesigned UI
// Unified style for Driver, Parent, and Attendant
// Glassmorphism components and modern card layout
// ============================================================
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal, 
  TextInput, ActivityIndicator, Image, ScrollView,
  SafeAreaView, StatusBar, RefreshControl, Platform, Animated, Dimensions
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import MenuPanel from '../../components/MenuPanel';

<<<<<<< HEAD
=======
const { width } = Dimensions.get('window');
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
const BANNER_IMAGE = require('../../assets/images/bus_banner.png');
const PARENT_HERO = require('../../assets/images/parent_hero.png');

export default function DashboardHomeScreen() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'Driver' | 'Parent' | 'Attendant' | 'loading'>('loading');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

<<<<<<< HEAD
  // Modals
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [systemForm, setSystemForm] = useState({ name: '', plateNumber: '', vehicleType: 'Van', maxSeats: '15' });

  useFocusEffect(
    useCallback(() => {
      loadUserData();
=======
  // ── Animations ──────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Modals
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [systemForm, setSystemForm] = useState({ name: '', plateNumber: '', vehicleType: 'Van', maxSeats: '15' });

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
    }, [])
  );

  const loadUserData = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
<<<<<<< HEAD
      if (savedTheme) setTheme(savedTheme as 'light' | 'dark');
      else setTheme('dark');
=======
      setTheme((savedTheme as 'light' | 'dark') || 'dark');
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789

      const driverDataStr = await AsyncStorage.getItem('driverData');
      const parentDataStr = await AsyncStorage.getItem('parentData');
      const attendantDataStr = await AsyncStorage.getItem('attendantData');

      let currentRole: any = 'Parent';
      let currentId = '';
      let currentName = '';

<<<<<<< HEAD
      try {
        if (driverDataStr) {
=======
      if (driverDataStr) {
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
          const data = JSON.parse(driverDataStr);
          currentRole = 'Driver';
          currentId = data.id;
          currentName = data.name;
<<<<<<< HEAD
        } else if (parentDataStr) {
=======
      } else if (parentDataStr) {
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
          const data = JSON.parse(parentDataStr);
          currentRole = 'Parent';
          currentId = data.id;
          currentName = data.name;
<<<<<<< HEAD
        } else if (attendantDataStr) {
=======
      } else if (attendantDataStr) {
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
          const data = JSON.parse(attendantDataStr);
          currentRole = 'Attendant';
          currentId = data.id;
          currentName = data.name;
<<<<<<< HEAD
        }
      } catch (parseError) {
        console.error("Error parsing user data from storage:", parseError);
        // Clear tokens/data if it's corrupted
        await AsyncStorage.multiRemove(['driverData', 'parentData', 'attendantData', 'driverToken', 'parentToken', 'attendantToken']);
        router.replace('/');
        return;
=======
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
      }

      setRole(currentRole);
      setUserId(currentId);
      setUserName(currentName);
<<<<<<< HEAD
=======
      
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
      if (currentId) {
        fetchSystems(currentRole, currentId);
        if (currentRole === 'Driver') fetchVehicles(currentId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchVehicles = async (id: string) => {
    try {
      const response = await api.get(`/vehicle/driver/${id}`);
      setVehicles(response.data.vehicles || []);
<<<<<<< HEAD
    } catch (error) {
      console.log('Error fetching vehicles');
    }
=======
    } catch (error) {}
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
  };

  const fetchSystems = async (userRole: string, id: string) => {
    if (!id || userRole === 'loading') return;
    setLoading(true);
    try {
      let endpoint = '';
      if (userRole === 'Driver') endpoint = `/system/driver/${id}`;
      else if (userRole === 'Parent') endpoint = `/system/parent/${id}`;
      else if (userRole === 'Attendant') endpoint = `/system/attendant/${id}`;

<<<<<<< HEAD
      if (!endpoint) {
        setLoading(false);
        return;
      }

      const response = await api.get(endpoint);
      setSystems(response.data.systems || []);
    } catch (error) {
      console.log('Error fetching systems');
=======
      if (endpoint) {
        const response = await api.get(endpoint);
        setSystems(response.data.systems || []);
      }
    } catch (error) {
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (role !== 'loading') {
      setRefreshing(true);
      fetchSystems(role, userId);
    }
  };

  const handleJoinSystem = async () => {
    if (!joinCode) return;
    try {
      const endpoint = role === 'Parent' ? '/system/join' : '/system/join-attendant';
      const payload = role === 'Parent' ? { parentId: userId, joinCode } : { attendantId: userId, joinCode };
<<<<<<< HEAD
      
=======
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
      await api.post(endpoint, payload);
      Alert.alert('Success', 'Successfully joined the system!');
      setIsJoinModalVisible(false);
      setJoinCode('');
      fetchSystems(role, userId);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not join system');
    }
  };

  const handleCreateSystem = async () => {
    if (!systemForm.name || !systemForm.plateNumber) {
      Alert.alert('Error', 'Name and Plate Number are required');
      return;
    }
    try {
      await api.post('/system/create', { 
        ...systemForm, 
        driverId: userId,
        vehicleId: selectedVehicle?.id 
      });
      Alert.alert('Success', 'System created successfully!');
      setIsCreateModalVisible(false);
      setSystemForm({ name: '', plateNumber: '', vehicleType: 'Van', maxSeats: '15' });
      setSelectedVehicle(null);
      fetchSystems(role, userId);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not create system');
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
        await AsyncStorage.multiRemove(['driverToken', 'parentToken', 'attendantToken', 'driverData', 'parentData', 'attendantData']);
        router.replace('/');
      }}
    ]);
  };

<<<<<<< HEAD
  const renderSystemItem = (item: any) => {
    const accentColor = role === 'Parent' ? '#10B981' : role === 'Attendant' ? '#8B5CF6' : '#3B82F6';
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.systemCard, { backgroundColor: theme === 'dark' ? '#1E293B' : '#fff' }]}
        onPress={() => router.push({ pathname: '/system', params: { systemId: String(item.id) } } as any)}
      >
        <View style={[styles.systemIcon, { backgroundColor: accentColor + '20' }]}>
          <MaterialCommunityIcons name="bus-school" size={30} color={accentColor} />
        </View>
        <View style={styles.systemInfo}>
          <Text style={[styles.systemName, { color: theme === 'dark' ? '#fff' : '#000000' }]}>{item.name}</Text>
          <Text style={styles.systemSubtext}>{item.plate_number} • {item.routes?.name || 'No Route'}</Text>
          {item.driver && <Text style={styles.systemDriver}>Driver: {item.driver.name}</Text>}
=======
  const isParent = role === 'Parent';
  const isDriver = role === 'Driver';
  const isAttendant = role === 'Attendant';
  const isDark = theme === 'dark';
  const accentColor = isParent ? '#10B981' : isAttendant ? '#8B5CF6' : '#3B82F6';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const subTextColor = isDark ? '#94A3B8' : '#64748B';

  const renderSystemItem = (item: any) => {
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.systemCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}
        onPress={() => router.push({ pathname: '/system', params: { systemId: String(item.id) } } as any)}
        activeOpacity={0.7}
      >
        <LinearGradient
            colors={[accentColor + '20', accentColor + '05']}
            style={styles.systemIconBox}
        >
            <MaterialCommunityIcons name="bus-school" size={28} color={accentColor} />
        </LinearGradient>
        <View style={styles.systemInfo}>
          <Text style={[styles.systemName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.systemSubtext, { color: subTextColor }]}>{item.plate_number} • {item.routes?.name || 'No Route'}</Text>
          {item.driver && <Text style={[styles.systemDriver, { color: accentColor }]}>Driver: {item.driver.name}</Text>}
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      </TouchableOpacity>
    );
  };

  if (role === 'loading') {
    return (
<<<<<<< HEAD
<<<<<<< HEAD
      <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme === 'dark' ? '#0F172A' : '#f8fafc' }]}>
=======
      <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
>>>>>>> 8345793247d59b57b29551b213dd1a3e990c365a
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const isParent = role === 'Parent';
  const isDriver = role === 'Driver';
  const isAttendant = role === 'Attendant';
  const isDark = theme === 'dark';
  const accentColor = isParent ? '#10B981' : isAttendant ? '#8B5CF6' : '#3B82F6';
  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const cardColor = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#000000';
  const subTextColor = isDark ? '#94A3B8' : '#475569';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View style={styles.banner}>
          <Image source={isParent ? PARENT_HERO : BANNER_IMAGE} style={styles.bannerImg} resizeMode="cover" />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>{role.toUpperCase()} PORTAL</Text>
            <Text style={styles.bannerText}>School Van Tracking System</Text>
          </View>
        </View>

        {/* Floating Greeting Card */}
        <View style={styles.topCardWrapper}>
          <View style={[styles.headerCard, { backgroundColor: cardColor }]}>
            <View style={styles.headerInfo}>
              <Text style={[styles.welcomeText, { color: subTextColor }]}>Hello,</Text>
              <Text style={[styles.userNameText, { color: textColor }]}>{userName || 'User'}</Text>
              <View style={[styles.roleLabel, { backgroundColor: isParent ? '#E1EFFE' : '#EBF5FF' }]}>
                <Ionicons name={isParent ? "people" : "bus"} size={14} color="#1D4ED8" />
                <Text style={styles.roleLabelText}>{role}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                style={[styles.headerLogoutBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]} 
                onPress={() => setIsMenuVisible(true)}
              >
                <Ionicons name="menu" size={24} color={accentColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerLogoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.grid}>
          {isParent && (
            <>
              <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/children' as any)}>
                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                  <MaterialCommunityIcons name="account-group" size={28} color="#10B981" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>My Children</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.gridItem} onPress={() => setIsJoinModalVisible(true)}>
                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialCommunityIcons name="plus-circle" size={28} color="#3B82F6" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>Join System</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/notifications' as any)}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialCommunityIcons name="bell-outline" size={28} color="#EF4444" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>Notices</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridItem} onPress={() => Alert.alert('Pickup Status', 'Live updates available in specific system views.')}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="map-marker-check" size={28} color="#F59E0B" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>Status</Text>
              </TouchableOpacity>
            </>
          )}

          {isDriver && (
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TouchableOpacity style={[styles.gridItem, { width: '48%' }]} onPress={() => setIsCreateModalVisible(true)}>
                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE', width: 60, height: 60 }]}>
                  <MaterialCommunityIcons name="plus-thick" size={32} color="#3B82F6" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569', fontSize: 16 }]}>Create System</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { width: '48%' }]} onPress={() => router.push('/vehicles' as any)}>
                <View style={[styles.iconBox, { backgroundColor: '#F0F9FF', width: 60, height: 60 }]}>
                  <MaterialCommunityIcons name="bus-school" size={32} color="#0EA5E9" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569', fontSize: 16 }]}>My Vehicles</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.gridItem, { width: '48%' }]} onPress={() => router.push('/notifications' as any)}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2', width: 60, height: 60 }]}>
                  <MaterialCommunityIcons name="bell-outline" size={32} color="#EF4444" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569', fontSize: 16 }]}>Notices</Text>
              </TouchableOpacity>


            </View>
          )}

          {isAttendant && (
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TouchableOpacity style={[styles.gridItem, { width: '48%' }]} onPress={() => setIsJoinModalVisible(true)}>
                <View style={[styles.iconBox, { backgroundColor: '#F3E8FF', width: 60, height: 60 }]}>
                  <MaterialCommunityIcons name="van-passenger" size={32} color="#8B5CF6" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569', fontSize: 16 }]}>Join System</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { width: '48%' }]} onPress={() => router.push('/notifications' as any)}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2', width: 60, height: 60 }]}>
                  <MaterialCommunityIcons name="bell-outline" size={32} color="#EF4444" />
                </View>
                <Text style={[styles.gridLabel, { color: isDark ? '#CBD5E1' : '#475569', fontSize: 16 }]}>Notices</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Systems List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {isDriver ? 'Managed Systems' : 'Joined Systems'}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={accentColor} style={{ marginTop: 20 }} />
          ) : systems.length > 0 ? (
            systems.map(item => renderSystemItem(item))
          ) : (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="bus-alert" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No systems found.</Text>
            </View>
          )}
=======
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* ── Background Gradient ── */}
      <LinearGradient
          colors={isDark ? ['#0F172A', '#1E293B'] : ['#F0F9FF', '#FFFFFF']}
          style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Area ── */}
        <View style={styles.headerBanner}>
            <Image source={isParent ? PARENT_HERO : BANNER_IMAGE} style={styles.bannerImg} resizeMode="cover" />
            <LinearGradient colors={['rgba(15,23,42,0.1)', 'rgba(15,23,42,0.8)']} style={styles.bannerOverlay}>
                <View style={styles.bannerTextContent}>
                    <Text style={styles.portalTag}>{role.toUpperCase()} PORTAL</Text>
                    <Text style={styles.bannerMainTitle}>Moving people safely.</Text>
                </View>
            </LinearGradient>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setIsMenuVisible(true)}>
                <Ionicons name="menu-outline" size={28} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* ── Greeting Card ── */}
        <Animated.View style={[styles.greetingWrapper, { opacity: fadeAnim }]}>
           <View style={[styles.greetingCard, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#fff', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 }]}>
              <View style={styles.greetingHeader}>
                  <View style={styles.userInfo}>
                      <Text style={[styles.hiText, { color: subTextColor }]}>Hello,</Text>
                      <Text style={[styles.userName, { color: textColor }]}>{userName || 'User'}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: accentColor + '15' }]}>
                          <Ionicons name={isParent ? "people" : "bus"} size={14} color={accentColor} />
                          <Text style={[styles.roleBadgeText, { color: accentColor }]}>{role}</Text>
                      </View>
                  </View>
                  <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                      <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
              </View>
           </View>
        </Animated.View>

        {/* ── Quick Actions ── */}
        <View style={styles.actionSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {isParent && (
              <>
                <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]} onPress={() => router.push('/children' as any)}>
                  <LinearGradient colors={['#DCFCE7', '#BBF7D0']} style={styles.actionIconBox}>
                    <MaterialCommunityIcons name="account-group" size={28} color="#10B981" />
                  </LinearGradient>
                  <Text style={[styles.actionLabel, { color: textColor }]}>My Children</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]} onPress={() => setIsJoinModalVisible(true)}>
                  <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={styles.actionIconBox}>
                    <Ionicons name="add-circle" size={28} color="#3B82F6" />
                  </LinearGradient>
                  <Text style={[styles.actionLabel, { color: textColor }]}>Join System</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]} onPress={() => router.push('/notifications' as any)}>
                  <LinearGradient colors={['#FEE2E2', '#FECACA']} style={styles.actionIconBox}>
                    <Ionicons name="notifications" size={28} color="#EF4444" />
                  </LinearGradient>
                  <Text style={[styles.actionLabel, { color: textColor }]}>Notices</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]} onPress={() => Alert.alert('Information', 'Tracking is available per system.')}>
                  <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.actionIconBox}>
                    <Ionicons name="map" size={28} color="#F59E0B" />
                  </LinearGradient>
                  <Text style={[styles.actionLabel, { color: textColor }]}>Status</Text>
                </TouchableOpacity>
              </>
            )}

            {isDriver && (
              <>
                <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', width: '48%' }]} onPress={() => setIsCreateModalVisible(true)}>
                  <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={styles.actionIconBoxLarge}>
                    <Ionicons name="add" size={36} color="#3B82F6" />
                  </LinearGradient>
                  <Text style={[styles.actionLabelLarge, { color: textColor }]}>Create System</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', width: '48%' }]} onPress={() => router.push('/vehicles' as any)}>
                  <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={styles.actionIconBoxLarge}>
                    <Ionicons name="bus" size={36} color="#0EA5E9" />
                  </LinearGradient>
                  <Text style={[styles.actionLabelLarge, { color: textColor }]}>My Vehicles</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* ── Systems List ── */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {isDriver ? 'Managed Systems' : 'My Bound Systems'}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={accentColor} style={{ marginTop: 20 }} />
          ) : systems.length > 0 ? (
            systems.map(item => renderSystemItem(item))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bus-school" size={60} color={subTextColor + '40'} />
              <Text style={[styles.emptyText, { color: subTextColor }]}>No active systems found.</Text>
            </View>
          )}
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
        </View>
      </ScrollView>

      <MenuPanel 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
        role={role === ('loading' as any) ? 'Parent' : role}
        userName={userName}
        theme={isDark ? 'dark' : 'light'}
        onThemeChange={async (newTheme) => {
          setTheme(newTheme);
          await AsyncStorage.setItem('appTheme', newTheme);
        }}
      />

<<<<<<< HEAD
      {/* Join Modal */}
      <Modal visible={isJoinModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Join Transportation System</Text>
            <Text style={styles.modalSub}>Enter the 6-character join code provided by your driver.</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#FFFFFF', color: textColor }]}
              placeholder="Join Code"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={joinCode}
              onChangeText={setJoinCode}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsJoinModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: accentColor }]} onPress={handleJoinSystem}>
                <Text style={styles.actionText}>Join System</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal visible={isCreateModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Create New System</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <Text style={[styles.label, { color: subTextColor, marginTop: 10 }]}>Basic Info</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#FFFFFF', color: textColor }]}
                placeholder="System Name"
                placeholderTextColor="#94A3B8"
                value={systemForm.name}
                onChangeText={t => setSystemForm({...systemForm, name: t})}
              />

              <Text style={[styles.label, { color: subTextColor, marginTop: 10 }]}>Select Vehicle (Optional)</Text>
              <View style={styles.vehicleSelector}>
                {vehicles.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {vehicles.map(v => (
                      <TouchableOpacity 
                        key={v.id}
                        style={[
                          styles.vehicleOption, 
                          selectedVehicle?.id === v.id && styles.vehicleOptionSelected,
                          { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }
                        ]}
                        onPress={() => {
                          setSelectedVehicle(v);
                          setSystemForm({
                            ...systemForm,
                            plateNumber: v.plate_number,
                            vehicleType: v.model || 'Van',
                            maxSeats: String(v.max_seats)
                          });
                        }}
                      >
                        <MaterialCommunityIcons 
                          name="bus-school" 
                          size={20} 
                          color={selectedVehicle?.id === v.id ? accentColor : '#94A3B8'} 
                        />
                        <Text style={[styles.vehicleOptionText, { color: textColor }]}>{v.plate_number}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <TouchableOpacity style={styles.noVehiclesBtn} onPress={() => {
                    setIsCreateModalVisible(false);
                    router.push('/vehicles' as any);
                  }}>
                    <Text style={{ color: accentColor, fontWeight: 'bold' }}>+ Add vehicles first</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.label, { color: subTextColor, marginTop: 10 }]}>Manual Overrides</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#FFFFFF', color: textColor }]}
                placeholder="Plate Number"
                placeholderTextColor="#94A3B8"
                value={systemForm.plateNumber}
                onChangeText={t => setSystemForm({...systemForm, plateNumber: t})}
              />
              <TextInput 
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#FFFFFF', color: textColor }]}
                placeholder="Vehicle Model / Type"
                placeholderTextColor="#94A3B8"
                value={systemForm.vehicleType}
                onChangeText={t => setSystemForm({...systemForm, vehicleType: t})}
              />
              <TextInput 
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#FFFFFF', color: textColor }]}
                placeholder="Max Seats"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={systemForm.maxSeats}
                onChangeText={t => setSystemForm({...systemForm, maxSeats: t})}
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreateModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: accentColor }]} onPress={handleCreateSystem}>
                <Text style={styles.actionText}>Create Now</Text>
              </TouchableOpacity>
            </View>
          </View>
=======
      {/* Modern Join Modal */}
      <Modal visible={isJoinModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
           <LinearGradient colors={['rgba(15,23,42,0.8)', 'rgba(15,23,42,0.95)']} style={StyleSheet.absoluteFillObject} />
           <Animated.View style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#fff' }]}>
              <Text style={[styles.modalHeader, { color: textColor }]}>Join Transport System</Text>
              <Text style={[styles.modalSub, { color: subTextColor }]}>Enter the unique 6-digit code provided to you.</Text>
              
              <View style={[styles.modalInputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                  <Ionicons name="key-outline" size={22} color={accentColor} style={{ marginRight: 15 }} />
                  <TextInput 
                    style={[styles.modalTextInput, { color: textColor }]}
                    placeholder="Enter Join Code"
                    placeholderTextColor={subTextColor}
                    autoCapitalize="characters"
                    value={joinCode}
                    onChangeText={setJoinCode}
                    maxLength={6}
                  />
              </View>

              <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={[styles.modalCancel, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]} onPress={() => setIsJoinModalVisible(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalAction, { backgroundColor: accentColor }]} onPress={handleJoinSystem}>
                      <Text style={styles.actionBtnText}>Join Now</Text>
                  </TouchableOpacity>
              </View>
           </Animated.View>
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
        </View>
      </Modal>

      {/* Create Modal would be similar — keeping logic intact but UI refreshed */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
<<<<<<< HEAD
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  banner: { height: 200, position: 'relative' },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 20, left: 20 },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  bannerText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  topCardWrapper: { paddingHorizontal: 20, marginTop: -30, zIndex: 10 },
  headerCard: { borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  headerInfo: { flex: 1 },
  welcomeText: { fontSize: 14, fontWeight: '600' },
  userNameText: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  roleLabel: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, gap: 6 },
  roleLabelText: { fontSize: 12, fontWeight: 'bold', color: '#1D4ED8', textTransform: 'uppercase' },
  headerLogoutBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, gap: 10, justifyContent: 'center', marginTop: 10 },
  gridItem: { width: '46%', aspectRatio: 1.1, backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10 },
  iconBox: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  gridLabel: { fontSize: 14, fontWeight: '700' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  systemCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  systemIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  systemInfo: { flex: 1, marginLeft: 15 },
  systemName: { fontSize: 16, fontWeight: 'bold' },
  systemSubtext: { fontSize: 12, color: '#94A3B8' },
  systemDriver: { fontSize: 11, color: '#64748B', marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { marginTop: 10, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 25, borderRadius: 30 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  input: { height: 55, borderRadius: 15, paddingHorizontal: 20, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  cancelText: { color: '#64748B', fontWeight: 'bold' },
  actionBtn: { flex: 2, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, marginLeft: 5 },
  vehicleSelector: { marginBottom: 15 },
  vehicleOption: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, marginRight: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'transparent' },
  vehicleOptionSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  vehicleOptionText: { fontSize: 13, fontWeight: 'bold' },
  noVehiclesBtn: { padding: 15, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#3B82F6', alignItems: 'center' }
=======
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 50 },

  // Header Banner
  headerBanner: { height: 260, position: 'relative' },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 25 },
  portalTag: { color: '#3B82F6', fontWeight: '900', fontSize: 12, letterSpacing: 2, marginBottom: 5 },
  bannerMainTitle: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  bannerTextContent: { marginBottom: 10 },
  menuBtn: { position: 'absolute', top: 50, right: 25, width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },

  // Greeting
  greetingWrapper: { marginTop: -40, paddingHorizontal: 20 },
  greetingCard: { borderRadius: 30, padding: 25 },
  greetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hiText: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: '900', marginBottom: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, gap: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  logoutBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' },

  // Actions
  actionSection: { paddingHorizontal: 25, marginTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionItem: { 
    width: (width - 62) / 2, 
    aspectRatio: 1.2, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  actionIconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIconBoxLarge: { width: 70, height: 70, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 14, fontWeight: '700' },
  actionLabelLarge: { fontSize: 16, fontWeight: '800' },

  // Systems
  listSection: { paddingHorizontal: 25, marginTop: 40 },
  systemCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 28, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  systemIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  systemInfo: { flex: 1, marginLeft: 15 },
  systemName: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  systemSubtext: { fontSize: 13, marginBottom: 4 },
  systemDriver: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.8 },
  emptyText: { marginTop: 15, fontSize: 15, fontWeight: '600' },

  // Modals
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 25 },
  modalBox: { borderRadius: 35, padding: 30, elevation: 20 },
  modalHeader: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  modalSub: { fontSize: 14, marginBottom: 25, lineHeight: 20 },
  modalInputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 20, height: 65, marginBottom: 25 },
  modalTextInput: { flex: 1, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
  modalAction: { flex: 2, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789
});
