import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { API_BASE } from '../constants/index'

const Profile = () => {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();
  const auth = useAuthStore(state => state.user);
  const user = auth?.user;
  const token = useAuthStore(state => state.user?.token);
  const setUser = useAuthStore(state => state.setUser);

  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(''); // removed from profile update flow
  const [pwdModal, setPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword('');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Error', err.message || `Failed (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data?.user) {
        setUser({ ...(auth as any), user: { ...user, ...data.user } });
      }
      setEditVisible(false);
      Alert.alert('Success', 'Profile updated');
    } catch (e) {
      console.log('Update profile error', e);
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPwd || newPwd.length < 8) {
      Alert.alert('Validation', 'New password must be at least 8 characters');
      return;
    }
    try {
      setChangingPwd(true);
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Error', err.message || `Failed (${res.status})`);
        return;
      }
      Alert.alert('Success', 'Password updated');
      setPwdModal(false);
      setCurrentPwd('');
      setNewPwd('');
    } catch (e) {
      console.log('Change password error', e);
      Alert.alert('Error', 'Could not change password.');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
  <>
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16 }}>
      <View style={{ alignItems: 'center', marginTop: 30 }}>
        <Image
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{user?.name || 'No Name'}</Text>
        <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 20 }}>
          {user?.email || 'No Email'}
        </Text>
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 2 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Account Details</Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Role: {user?.provider || 'User'}</Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Status: Active</Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#3B82F6',
          borderRadius: 12,
          paddingVertical: 14,
          marginTop: 24,
          alignItems: 'center',
        }}
        onPress={handleOpenEdit}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#111827',
          borderRadius: 12,
          paddingVertical: 14,
          marginTop: 12,
          alignItems: 'center',
        }}
        onPress={() => setPwdModal(true)}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#EF4444',
          borderRadius: 12,
          paddingVertical: 14,
          marginTop: 16,
          alignItems: 'center',
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>

    {/* ✅ Modal inside the same fragment */}
    <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' }}>
        <View style={{ width:'90%', backgroundColor:'#fff', borderRadius:12, padding:16 }}>
          <Text style={{ fontSize:18, fontWeight:'700', marginBottom:12 }}>Edit Profile</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Name"
            style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10, marginBottom:10 }} />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email"
            keyboardType="email-address" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10, marginBottom:10 }} />
          {/* Password field removed from profile update */}

          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <TouchableOpacity onPress={() => setEditVisible(false)}
              style={{ padding:12, borderRadius:8, backgroundColor:'#ddd', flex:1, marginRight:8, alignItems:'center' }}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={saving} onPress={handleSaveProfile}
              style={{ padding:12, borderRadius:8, backgroundColor:'#16a34a', flex:1, marginLeft:8, alignItems:'center' }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    <Modal visible={pwdModal} transparent animationType="slide" onRequestClose={() => setPwdModal(false)}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' }}>
        <View style={{ width:'90%', backgroundColor:'#fff', borderRadius:12, padding:16 }}>
          <Text style={{ fontSize:18, fontWeight:'700', marginBottom:12 }}>Change Password</Text>
          <TextInput value={currentPwd} onChangeText={setCurrentPwd} placeholder="Current Password" secureTextEntry style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10, marginBottom:10 }} />
          <TextInput value={newPwd} onChangeText={setNewPwd} placeholder="New Password (min 8 chars)" secureTextEntry style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10, marginBottom:16 }} />

          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <TouchableOpacity onPress={() => setPwdModal(false)} style={{ padding:12, borderRadius:8, backgroundColor:'#ddd', flex:1, marginRight:8, alignItems:'center' }}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={changingPwd} onPress={handleChangePassword} style={{ padding:12, borderRadius:8, backgroundColor:'#16a34a', flex:1, marginLeft:8, alignItems:'center' }}>
              {changingPwd ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>Update</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </>
);

};

export default Profile;