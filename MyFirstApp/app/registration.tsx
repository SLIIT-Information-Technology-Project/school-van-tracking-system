// ============================================================
// Registration Selection Screen — Redesigned UI
// Premium entrance, gradient background, modern choice cards
// ============================================================
import React, { useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  SafeAreaView, StatusBar, Image, ScrollView, 
  Animated, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const REG_BANNER = require('../assets/images/registration_bus.png');

export default function RegistrationScreen() {
  const router = useRouter();
  
  // ── Animations ──────────────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDriverRegistration = () => router.push('/driver-registration');
  const handleParentRegistration = () => router.push('/parent-registration');
  const handleAttendantRegistration = () => router.push('/attendant-registration');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* ── Background Gradient ── */}
      <LinearGradient
        colors={['#1e1b4b', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── Top Hero Area ── */}
        <View style={styles.heroArea}>
          <Image source={REG_BANNER} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(30, 27, 75, 0.4)', 'rgba(15, 23, 42, 0.95)', '#0f172a']}
            style={styles.heroOverlay}
          />
          
          <Animated.View style={[styles.navHeader, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.heroText, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.mainTitle}>Join Our{'\n'}Community</Text>
            <Text style={styles.mainSubtitle}>Choose your role to get started with the tracking system.</Text>
          </Animated.View>
        </View>

        {/* ── Selection Cards ── */}
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionHeading}>Registration Options</Text>
          
          {/* Driver Card */}
          <TouchableOpacity 
            style={styles.regCard} 
            activeOpacity={0.8}
            onPress={handleDriverRegistration}
          >
            <LinearGradient colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.cardInner}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <MaterialCommunityIcons name="steering" size={28} color="#3B82F6" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Register as Driver</Text>
                <Text style={styles.cardDesc}>Manage your van, route, and children's safety.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Parent Card */}
          <TouchableOpacity 
            style={styles.regCard} 
            activeOpacity={0.8}
            onPress={handleParentRegistration}
          >
            <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.cardInner}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="people" size={28} color="#10B981" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Register as Parent</Text>
                <Text style={styles.cardDesc}>Add students to track their live journey daily.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#10B981" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Attendant Card */}
          <TouchableOpacity 
            style={styles.regCard} 
            activeOpacity={0.8}
            onPress={handleAttendantRegistration}
          >
            <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.cardInner}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="shield-checkmark" size={28} color="#8B5CF6" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Register as Attendant</Text>
                <Text style={styles.cardDesc}>Monitor on-board safety and attendance.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#64748B" />
              <Text style={styles.helpText}>Takes less than 2 minutes to complete.</Text>
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingBottom: 50 },
  
  // Hero
  heroArea: { height: 420, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  
  navHeader: { position: 'absolute', top: 50, left: 20 },
  backBtn: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  
  heroText: { position: 'absolute', bottom: 40, left: 30, right: 30 },
  mainTitle: { fontSize: 40, fontWeight: '900', color: '#fff', lineHeight: 46 },
  mainSubtitle: { fontSize: 16, color: '#94A3B8', marginTop: 12, fontWeight: '500', lineHeight: 24 },

  // Content
  content: { paddingHorizontal: 25, marginTop: 10 },
  sectionHeading: { fontSize: 18, fontWeight: '800', color: '#F1F5F9', marginBottom: 20, letterSpacing: 0.5 },

  regCard: { marginBottom: 16, height: 110 },
  cardInner: { 
    flex: 1, borderRadius: 32, paddingHorizontal: 20, 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  iconBox: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 20, marginRight: 10 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  cardDesc: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 18, fontWeight: '500' },

  helpContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 25, opacity: 0.7 },
  helpText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
