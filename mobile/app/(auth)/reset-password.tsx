import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native'
import axios from 'axios'
import { API_BASE } from '../../constants/index'
import { Link, useRouter } from 'expo-router'

export default function ResetPassword () {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async () => {
    if (!token) {
      Alert.alert('Missing token', 'Please paste the reset token from your email')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_BASE}/auth/reset-password`, { token, newPassword })
      Alert.alert('Success', 'Password reset successful. You can now login.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ])
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
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          placeholder='Paste token here'
          style={styles.input}
          value={token}
          onChangeText={setToken}
          autoCapitalize='none'
        />
        <TextInput
          placeholder='New password (min 8 chars)'
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          placeholder='Confirm new password'
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={onSubmit} activeOpacity={0.8} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>
        <Text style={styles.linkText}>Back to <Link href='/(auth)/login'>Login</Link></Text>
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


