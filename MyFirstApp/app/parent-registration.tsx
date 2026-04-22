// ============================================================
// Parent Registration — Redesigned Chatbot UI
// Modern dark gradient theme with emerald accents
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { registerParent } from '../services/registrationService';

const { width } = Dimensions.get('window');

interface Question {
  id: string;
  type: string;
  text: string;
}

const questions: Question[] = [
  { id: 'name',             type: 'text',     text: "Hello! Let's get you registered as a Parent. What is your full name?" },
  { id: 'username',         type: 'text',     text: 'Choose a username (e.g. mary_parent).' },
  { id: 'phone',            type: 'phone',    text: 'What is your phone number?' },
  { id: 'email',            type: 'email',    text: 'What is your email address?' },
  { id: 'password',         type: 'password', text: 'Please enter a secure password (min 6 characters).' },
  { id: 'childName',        type: 'text',     text: "What is your child's full name?" },
  { id: 'childGrade',       type: 'text',     text: "What is your child's grade or class? (e.g. Grade 5)" },
  { id: 'pickupLocation',   type: 'text',     text: 'What is the pickup location for your child?' },
  { id: 'dropLocation',     type: 'text',     text: 'What is the drop-off location?' },
  { id: 'emergencyContact', type: 'phone',    text: 'Finally, what is your emergency contact number?' },
];

export default function ParentRegistration() {
  const [messages, setMessages]       = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText]     = useState('');
  const [formData, setFormData]       = useState<any>({});
  const [isFinished, setIsFinished]   = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
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
      const result = await registerParent(formData);
      if (!result.success) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: `❌ ${result.message}` }]);
        return;
      }
      Alert.alert('🎉 Registered!', 'Parent account created successfully!', [
        { text: 'Go to Login', onPress: () => router.push('/parent-login') },
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
      <LinearGradient colors={['#064e3b', '#065f46', '#047857']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="close-circle-outline" size={32} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Parent Registration</Text>
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
                {item.sender === 'bot' && <View style={styles.botIcon}><Ionicons name="chatbubble-ellipses" size={14} color="#fff" /></View>}
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
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGradient}>
                        <Text style={styles.submitBtnText}>{isLoading ? 'SUBMITTING...' : 'REGISTER ACCOUNT'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                   <Text style={styles.resetText}>Start over</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputArea}>
                <View style={[styles.inputWrapper, { borderColor: 'rgba(16,185,129,0.3)' }]}>
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
  container: { flex: 1, backgroundColor: '#064e3b' },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', marginTop: 10 },
  backBtn: { marginRight: 15 },
  headerText: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  headerStep: { color: '#D1FAE5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, opacity: 0.8 },

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
    backgroundColor: '#10B981', 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
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
  },
  textInput: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },

  finishContainer: { gap: 15 },
  submitBtn: { borderRadius: 20, overflow: 'hidden' },
  btnGradient: { height: 64, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  resetBtn: { alignItems: 'center', paddingVertical: 10 },
  resetText: { color: '#D1FAE5', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline', opacity: 0.8 },
});
