import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';

const Profile = () => {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();
  const auth = useAuthStore(state => state.user);
  const user = auth?.user;

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16 }}>
      <View style={{ alignItems: 'center', marginTop: 30 }}>
        <Image
          
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{user?.name || 'No Name'}</Text>
        <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 20 }}>{user?.email || 'No Email'}</Text>
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 2 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Account Details</Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</Text>
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
        }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Edit Profile</Text>
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
  );
};

export default Profile;