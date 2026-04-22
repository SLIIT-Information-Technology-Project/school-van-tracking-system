// ============================================================
// Driver Registration — Redesigned Chatbot UI
// Modern dark gradient theme with glassmorphism chat bubbles
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, Animated, Image, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { registerDriver } from '../services/registrationService';

const { width } = Dimensions.get('window');

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
}

const questions: Question[] = [
  { id: 'name', type: 'text', text: 'Hello! Let\'s get you registered as a Driver. What is your full name?' },
  { id: 'phone', type: 'phone', text: 'Great. What is your phone number?' },
  { id: 'email', type: 'email', text: 'What is your email address?' },
  { id: 'password', type: 'password', text: 'Please enter a secure password.' },
  { id: 'licenseNumber', type: 'text', text: 'What is your driving license number?' },
  { id: 'emergencyContact', type: 'phone', text: 'Finally, what is your emergency contact number?' },
];

export default function DriverRegistration() {
  const [messages, setMessages]     = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText]   = useState('');
  const [formData, setFormData]     = useState<any>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const router = useRouter();
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    setMessages([{ id: '0', sender: 'bot', text: questions[0].text }]);
  }, []);

  const handleSend = (forcedValue: string | null = null) => {
    const value = forcedValue !== null ? forcedValue : inputText.trim();
    if (!value) return;

    const currentQ = questions[currentStep];
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: value }]);
    setInputText('');

    const updatedFormData = { ...formData, [currentQ.id]: value };
    setFormData(updatedFormData);

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: questions[currentStep + 1].text }]);
        setCurrentStep(currentStep + 1);
      }, 450);
    } else {
      setIsFinished(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '✅ All done! Please review and submit your registration below.' }]);
      }, 450);
    }
  };

  const handleReset = () => {
    setMessages([{ id: '0', sender: 'bot', text: questions[0].text }]);
    setCurrentStep(0);
    setFormData({});
    setIsFinished(false);
    setInputText('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await registerDriver(formData);
      if (!result.success) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: `❌ ${result.message}` }]);
        return;
      }
      Alert.alert('🎉 Registered!', 'Driver account created successfully!', [
        { text: 'Go to Login', onPress: () => router.push('/login') },
      ]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '❌ An error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* ── Background Gradient ── */}
      <LinearGradient colors={['#1e1b4b', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="close-circle-outline" size={32} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Driver Setup</Text>
                <Text style={styles.headerStep}>Step {currentStep + 1} of {questions.length}</Text>
            </View>
        </View>

        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                {item.sender === 'bot' && <View style={styles.botIcon}><MaterialCommunityIcons name="robot" size={16} color="#fff" /></View>}
                <Text style={[styles.bubbleText, item.sender === 'user' && styles.userBubbleText]}>{item.text}</Text>
              </View>
            )}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={styles.chatContainer}
          />

          <View style={styles.footer}>
            {isFinished ? (
              <View style={styles.finishContainer}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.btnGradient}>
                        <Text style={styles.submitBtnText}>{isLoading ? 'SUBMITTING...' : 'COMPLETE REGISTRATION'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                   <Text style={styles.resetText}>Restart process</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputArea}>
                <View style={styles.inputWrapper}>
                   <TextInput
                      style={styles.textInput}
                      placeholder="Type your answer..."
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={inputText}
                      onChangeText={setInputText}
                      secureTextEntry={currentQ?.type === 'password'}
                      keyboardType={currentQ?.type === 'phone' ? 'numeric' : currentQ?.type === 'email' ? 'email-address' : 'default'}
                      autoCapitalize={currentQ?.type === 'email' || currentQ?.type === 'password' ? 'none' : 'words'}
                      onSubmitEditing={() => handleSend()}
                    />
                    <TouchableOpacity
                      style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                      onPress={() => handleSend()}
                      disabled={!inputText.trim()}
                    >
                      <Ionicons name="arrow-up" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', marginTop: 10 },
  backBtn: { marginRight: 15 },
  headerText: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  headerStep: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },

  chatContainer: { padding: 20, paddingBottom: 100 },
  bubble: { maxWidth: '85%', padding: 16, borderRadius: 24, marginBottom: 15 },
  botBubble: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    alignSelf: 'flex-start', 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  userBubble: { 
    backgroundColor: '#3B82F6', 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 4,
    elevation: 5,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  botIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  bubbleText: { fontSize: 15, color: '#f1f5f9', lineHeight: 22, fontWeight: '500' },
  userBubbleText: { color: '#fff', fontWeight: '600' },

  footer: { paddingBottom: 30, paddingHorizontal: 20 },
  inputArea: { marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  textInput: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },

  finishContainer: { gap: 15 },
  submitBtn: { borderRadius: 20, overflow: 'hidden' },
  btnGradient: { height: 64, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  resetBtn: { alignItems: 'center', paddingVertical: 10 },
  resetText: { color: '#64748B', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
