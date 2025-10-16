import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { API_BASE } from '../constants/index';
import BackArrow from '@/components/CostThreeButtons/BackArrow';

const Profile = () => {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const auth = useAuthStore((state) => state.user);
  const user = auth?.user;
  const initials = (() => {
    const nameStr = (user?.name || '').trim();
    if (!nameStr) return 'U';
    const parts = nameStr.split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '';
    const val = (first + last).toUpperCase();
    return val || 'U';
  })();
  const token = useAuthStore((state) => state.user?.token);
  const setUser = useAuthStore((state) => state.setUser);

  const [editVisible, setEditVisible] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
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
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
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
      <ScrollView style={styles.container}>

        <View style={styles.backRow}>
          <BackArrow/>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'No Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'No Email'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <Text style={styles.cardText}>
            Joined:{' '}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : 'Unknown'}
          </Text>
          <Text style={styles.cardText}>
            Role: {user?.provider || 'Standard User'}
          </Text>
          <Text style={styles.cardText}>Status: Active</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenEdit}>
          <Text style={styles.primaryBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setPwdModal(true)}
        >
          <Text style={styles.secondaryBtnText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* === Edit Profile Modal === */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              style={styles.input}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              style={styles.input}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={saving}
                onPress={handleSaveProfile}
                style={[styles.modalBtn, styles.saveBtn]}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* === Change Password Modal === */}
      <Modal
        visible={pwdModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPwdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              value={currentPwd}
              onChangeText={setCurrentPwd}
              placeholder="Current Password"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              value={newPwd}
              onChangeText={setNewPwd}
              placeholder="New Password (min 8 chars)"
              secureTextEntry
              style={styles.input}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setPwdModal(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={changingPwd}
                onPress={handleChangePassword}
                style={[styles.modalBtn, styles.saveBtn]}
              >
                {changingPwd ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f5',
    padding: 16,
    paddingTop:40
  },
  backRow: {
    
    position:'absolute',
    top:40
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#2d6a4f',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d6a4f',
  },
  profileEmail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  primaryBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: '#15803d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: '#da2424ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutBtnText: {
    color: '#ffff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d6a4f',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: '#e5e5e5',
  },
  saveBtn: {
    backgroundColor: '#15803d',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
