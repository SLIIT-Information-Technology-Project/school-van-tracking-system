// ============================================================
// Parent Login Screen — Redesigned UI
// Modern gradient background, animated card, styled inputs
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { loginParent } from '../services/loginService';

const { height } = Dimensions.get('window');

export default function ParentLoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  // ── Entrance animations ──────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Login logic (unchanged) ──────────────────────────────
  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Missing Details', 'Please enter your email/username and password.');
      return;
    }
    setLoading(true);
    try {
      const result: any = await loginParent(identifier, password);
      if (!result.success) {
        Alert.alert('Login Failed', result.message);
        return;
      }
      router.replace({
        pathname: '/(dashboard)/home' as any,
        params: { role: 'Parent', parentId: result.parent?.id },
      });
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen gradient background ── */}
      <LinearGradient
        colors={['#064e3b', '#065f46', '#047857']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Decorative blurred circles ── */}
      <View style={[styles.blob, { top: -80, left: -60, backgroundColor: '#10B98180' }]} />
      <View style={[styles.blob, { bottom: 100, right: -80, backgroundColor: '#34D39960', width: 220, height: 220 }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>

          {/* ── Back button ── */}
          <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? 50 : 20 }}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Hero header ── */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconRing}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.iconRingGradient}>
                <Ionicons name="people" size={36} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Parent Portal</Text>
            <Text style={styles.heroSubtitle}>Real-time peace of mind for parents</Text>
          </Animated.View>

          {/* ── Login card ── */}
          <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Parent Login</Text>
              <Text style={styles.cardDesc}>Sign in to track your child's vehicle and manage alerts safely.</Text>

              {/* Email / Username field */}
              <View style={[styles.inputWrapper, focusedField === 'id' && styles.inputWrapperFocused]}>
                <Ionicons name="person-outline" size={20} color={focusedField === 'id' ? '#10B981' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email or Username"
                  placeholderTextColor="#64748B"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('id')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password field */}
              <View style={[styles.inputWrapper, focusedField === 'pw' && styles.inputWrapperFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'pw' ? '#10B981' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('pw')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Help', 'Please contact admin to reset password.')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Gradient login button */}
              <TouchableOpacity
                style={[styles.loginBtnWrapper, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Text style={styles.loginBtnText}>LOGIN TO PORTAL</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                      </>
                  }
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Footer */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>New here?</Text>
                <TouchableOpacity onPress={() => router.push('/parent-registration')}>
                  <Text style={styles.footerLink}>Register Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // Decorative blobs
  blob: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.25 },

  // Back button
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: 36 },
  iconRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(16,185,129,0.4)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  iconRingGradient: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 0.5, marginBottom: 6 },
  heroSubtitle: { fontSize: 15, color: '#D1FAE5', fontWeight: '500', opacity: 0.8 },

  // Card
  cardWrapper: { paddingHorizontal: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 32, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 20, marginBottom: 24 },

  // Inputs
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, marginBottom: 14,
  },
  inputWrapperFocused: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 18, fontSize: 15, color: '#F1F5F9', fontWeight: '500' },

  // Forgot
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 22 },
  forgotText: { color: '#10B981', fontWeight: '600', fontSize: 13 },

  // Login button
  loginBtnWrapper: { borderRadius: 20, overflow: 'hidden', marginBottom: 22 },
  loginBtn: {
    paddingVertical: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: '#475569', fontSize: 12, marginHorizontal: 12, fontWeight: '600' },

  // Footer
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerText: { color: '#94A3B8', fontSize: 14 },
  footerLink: { color: '#10B981', fontWeight: '700', fontSize: 14 },
});
