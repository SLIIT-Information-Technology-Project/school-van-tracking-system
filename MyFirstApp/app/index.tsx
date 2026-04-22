// ============================================================
// Welcome Screen — Redesigned UI
// Premium entrance, gradient background, modern role cards
// ============================================================
import React, { useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  SafeAreaView, StatusBar, Image, ScrollView, 
  Dimensions, Animated, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const HERO_IMAGE = require('../assets/images/van_hero.png');

export default function WelcomeScreen() {
  const router = useRouter();

  // ── Animations ──────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* ── Background Gradient ── */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── Hero Section ── */}
        <View style={styles.heroContainer}>
          <Image 
            source={HERO_IMAGE} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.8)', '#0F172A']}
            style={styles.heroOverlay}
          />
          
          <Animated.View style={[styles.badgeContainer, { opacity: fadeAnim }]}>
              <View style={styles.logoCircle}>
                 <Ionicons name="bus" size={32} color="#3B82F6" />
              </View>
          </Animated.View>
        </View>

        {/* ── Header Text ── */}
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.welcomeLabel}>WELCOME TO</Text>
          <Text style={styles.titleText}>School Van{'\n'}Tracking</Text>
          <Text style={styles.subtitleText}>
            Ensuring children's safety with real-time tracking, reliable schedules, and instant alerts.
          </Text>
        </Animated.View>

        {/* ── Role Selection ── */}
        <Animated.View style={[styles.roleSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.selectionTitle}>Who are you today?</Text>
          
          <View style={styles.roleGrid}>
            {/* Driver Card */}
            <TouchableOpacity 
              style={styles.roleCard}
              activeOpacity={0.8}
              onPress={() => router.push('/login')}
            >
              <LinearGradient colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']} style={styles.roleCardGradient}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <MaterialCommunityIcons name="steering" size={32} color="#3B82F6" />
                </View>
                <Text style={styles.roleTitle}>Driver</Text>
                <Text style={styles.roleDesc}>Manage trips</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Parent Card */}
            <TouchableOpacity 
              style={styles.roleCard}
              activeOpacity={0.8}
              onPress={() => router.push('/parent-login')}
            >
              <LinearGradient colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']} style={styles.roleCardGradient}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="people" size={32} color="#10B981" />
                </View>
                <Text style={styles.roleTitle}>Parent</Text>
                <Text style={styles.roleDesc}>Track kids</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Attendant Card */}
          <TouchableOpacity 
            style={styles.fullWidthCard}
            activeOpacity={0.8}
            onPress={() => router.push('/attendant-login')}
          >
            <LinearGradient colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.fullWidthGradient}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="shield-checkmark" size={26} color="#8B5CF6" />
              </View>
              <View style={styles.fullWidthText}>
                <Text style={styles.roleTitle}>Attendant</Text>
                <Text style={styles.roleDesc}>Onboard safety assistant</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerLabel}>New to the system?</Text>
          <TouchableOpacity 
            style={styles.registrationBtn}
            onPress={() => router.push('/registration')}
          >
            <Text style={styles.registrationText}>Register Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#3B82F6" />
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingBottom: 60 },
  
  // Hero
  heroContainer: { width: '100%', height: height * 0.45, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  badgeContainer: { position: 'absolute', top: 60, left: 30 },
  logoCircle: { 
    width: 64, height: 64, borderRadius: 24, 
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 20, elevation: 15
  },

  // Header
  headerContainer: { paddingHorizontal: 30, marginTop: -20 },
  welcomeLabel: { color: '#3B82F6', fontWeight: '900', fontSize: 13, letterSpacing: 3, marginBottom: 8 },
  titleText: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', lineHeight: 50 },
  subtitleText: { fontSize: 16, color: '#94A3B8', marginTop: 15, lineHeight: 24, fontWeight: '500' },

  // Roles
  roleSection: { paddingHorizontal: 25, marginTop: 35 },
  selectionTitle: { fontSize: 18, fontWeight: '800', color: '#F1F5F9', marginBottom: 20 },
  roleGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  
  roleCard: { flex: 1, height: 160 },
  roleCardGradient: { 
    flex: 1, borderRadius: 30, padding: 20, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'flex-start'
  },
  
  iconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  roleTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  roleDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '600' },

  fullWidthCard: { marginTop: 15, height: 90 },
  fullWidthGradient: { 
    flex: 1, borderRadius: 30, paddingHorizontal: 20, 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  fullWidthText: { flex: 1, marginLeft: 15 },

  // Footer
  footer: { marginTop: 40, alignItems: 'center', gap: 8 },
  footerLabel: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  registrationBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  registrationText: { color: '#3B82F6', fontWeight: '900', fontSize: 17 },
});
