import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native'
import { useRouter, Link } from 'expo-router'
import axios from 'axios'
import { API_BASE } from '../../constants/index'

export default function ForgotPassword () {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address')
      return
    }
    try {
      setLoading(true)
      await axios.post(`${API_BASE}/auth/forgot-password`, { email })
      Alert.alert('Check your email', 'If the email exists, a reset link has been sent. The email also contains a token you can paste on the next screen.')
      router.push('/(auth)/reset-password')
    } catch (err: any) {
      console.log(err.response?.data || err.message)
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Image source={require('../../assets/images/authscreens.png')} style={styles.banner} />
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput
          placeholder='Email'
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={onSubmit} activeOpacity={0.8} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
        </TouchableOpacity>
        <Text style={styles.linkText}>Remembered? <Link href='/(auth)/login'>Back to login</Link></Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  banner: { width: 900, resizeMode: 'contain', alignSelf: 'center', marginBottom: 0 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 8 },
  btn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  linkText: { textAlign: 'center', marginTop: 20 }
})


