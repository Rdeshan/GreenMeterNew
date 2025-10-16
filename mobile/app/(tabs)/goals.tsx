import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons'; 
import { TouchableOpacity, StyleSheet, FlatList, View,Button, TextInput, Alert, Text, Modal, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Goal } from '../../components/goals/types/goal';
import MorphingAddGoal from '../../components/goals/MorphingAddGoal';
import DateTimePicker from '@react-native-community/datetimepicker';
import AiGenerate from '../../../backend/src/config/geminiGoals.config';
import GenerateGoalScreen from '../../components/goals/GenerateGoalScreen';
import { StatusSlider } from '../../components/goals/StatusSlider';
import { API_BASE} from '../../constants/index'

const BASE_URL = `${API_BASE}/goals`; // replace with PC's LAN IP

export default function GoalsIndex() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [allDevices, setAllDevices] = useState<{_id: string, device_name: string}[]>([]);
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Completed' | 'Archived'>('Active');

  const userId = useAuthStore(state => state.user?.user._id);
  const token = useAuthStore(state => state.user?.token);
  // Fetch goals
  useEffect(() => {
    if (!userId) return;
    const fetchGoals = async () => {
      try {
        const res = await fetch(`${BASE_URL}?userId=${userId}` , {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        setGoals(data);
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [userId]);

// Fetch all devices once
useEffect(() => {
  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-all-devices`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      const payload = Array.isArray(data?.devices) ? data.devices : [];
      setAllDevices(payload);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setAllDevices([]);
    }
  };
  fetchDevices();
}, []);

  // Add goal
  const handleAddGoal = async (goal: Goal) => {
    if (!userId) {
      Alert.alert('Error', 'No user ID found. Please login again.');
      return;
    }
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...goal, userId }),
      });
      if (!res.ok) throw new Error('Failed to add goal');

      const savedGoal = res.status !== 204 ? await res.json() : null;
      if (savedGoal) setGoals(prev => [...prev, savedGoal]);
    } catch (err) {
      console.error('Error adding goal:', err);
      Alert.alert('Error', (err instanceof Error ? err.message : 'Failed to add goal'));
    }
  };

  // State for edit modal
const [editTitle, setEditTitle] = useState('');
const [editNotes, setEditNotes] = useState('');
const [editPriority, setEditPriority] = useState<'Low'|'Medium'|'High'>('Medium');
const [editFrequency, setEditFrequency] = useState<'Daily'|'Weekly'|'Monthly'>('Daily');
const [editDevices, setEditDevices] = useState<string[]>([]);
const [editDate, setEditDate] = useState<Date>(new Date());
const [editTime, setEditTime] = useState<Date>(new Date());
const [showEditDatePicker, setShowEditDatePicker] = useState(false);
const [showEditTimePicker, setShowEditTimePicker] = useState(false);

const [generateModalVisible, setGenerateModalVisible] = useState(false);

const openGenerateGoalScreen = () => setGenerateModalVisible(true);
const closeGenerateGoalScreen = () => setGenerateModalVisible(false);


// Open modal and populate fields
const openEditModal = (goal: Goal) => {
  setCurrentGoal(goal);
  setEditTitle(goal.title);
  setEditNotes(goal.notes || '');
  setEditPriority(goal.priority ?? 'Medium');
  setEditFrequency(goal.timeFrequency ?? 'Daily');
  setEditDevices(goal.devices || []);
  setEditDate(new Date(goal.date));
  const [hour, minute] = (goal.time ?? '00:00').split(':').map(Number);
  const time = new Date();
  time.setHours(hour, minute);
  setEditTime(time);

  setEditModalVisible(true);
};

// Handle device toggle
const toggleEditDevice = (id: string) => {
  setEditDevices(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
};

// Save edited goal
const saveEdit = async () => {
  if (!currentGoal) return;

  const updatedGoal = {
    ...currentGoal,
    title: editTitle,
    notes: editNotes,
    priority: editPriority,
    timeFrequency: editFrequency,
    devices: editDevices,
    date: editDate.toISOString().split('T')[0],
    time: editTime.toTimeString().slice(0,5),
  };

  try {
    const res = await fetch(`${BASE_URL}/${currentGoal.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updatedGoal),
    });
    if (!res.ok) throw new Error('Failed to update goal');

    const saved = await res.json();
    setGoals(prev => prev.map(g => g.id === currentGoal.id ? saved : g));
    setEditModalVisible(false);
  } catch (err) {
    console.error('Error updating goal:', err);
  }
};

  // Delete goal
  const deleteGoal = (id: string) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/${id}`, {
              method: 'DELETE',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok) throw new Error('Failed to delete goal');
            setGoals(prev => prev.filter(g => g.id !== id));
          } catch (err) {
            console.error('Error deleting goal:', err);
          }
        },
      },
    ]);
  };

  // Priority color helper
  const getPriorityColor = (priority?: 'Low' | 'Medium' | 'High') => {
  switch (priority?.toLowerCase()) {
    case 'low': return '#4CAF50';
    case 'medium': return '#FFC107';
    case 'high': return '#F44336';
    default: return '#888';
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

 const changeStatus = async (goal: Goal, status: 'Active' | 'Completed') => {
  try {
    const res = await fetch(`${BASE_URL}/${goal.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...goal, status }),
    });
    if (!res.ok) throw new Error('Failed to update status');

    const updated = await res.json();
    setGoals(prev => prev.map(g => g.id === goal.id ? updated : g));
  } catch (err) {
    console.error('Error updating status:', err);
  }
};

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.titleColor} type="title">Goals</ThemedText>
      <AIButton label="Generate AI Goal" onPress={openGenerateGoalScreen} />
     <Modal visible={generateModalVisible} animationType="slide">
  <GenerateGoalScreen onClose={closeGenerateGoalScreen} onAddGoal={handleAddGoal} />
</Modal>

      <View style={styles.filterRow}>
  {(['Active','Completed','Archived'] as const).map(s => (
    <TouchableOpacity
      key={s}
      onPress={() => setStatusFilter(s)}
      style={[styles.filterButton, statusFilter === s && styles.selectedFilterButton]}
    >
      <Text style={{ color: statusFilter === s ? '#000' : '#fff', fontWeight: 'bold' }}>{s}</Text>
    </TouchableOpacity>
  ))}
</View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2d6a4f" />
        </View>
      ) : (
        <FlatList
          data={goals.filter(g => g.status === statusFilter)}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.goalItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                {item.notes ? <Text style={styles.goalNotes} numberOfLines={2}>{item.notes}</Text> : null}

                <View style={styles.goalMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                  
                  <Text style={styles.metaText}>📅 {item.date?.split('T')[0]}</Text>
                  <Text style={styles.metaText}>⌛ {item.time}</Text>
                  <Text style={styles.metaText}>🔁 {item.timeFrequency}</Text>
                </View>
                <StatusSlider
                  status={item.status === 'Completed' ? 'Completed' : 'Active'}
                  onChange={(newStatus) => {
                    changeStatus(item, newStatus);
                    Alert.alert('Status Updated', `Goal marked as ${newStatus}`);
                  }} 
                />

                {/* Devices */}
                {Array.isArray(item.devices) && item.devices.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.devicesRow}>
                  {item.devices.map(dId => {
                    const device = (allDevices || []).find(dev => dev._id === dId); // find full device
                    const name = device ? device.device_name : dId; // show name if found, fallback to ID
                    return (
                      <View key={dId} style={styles.deviceChip}>
                        <Text style={styles.deviceText}>{name}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              </View>
              

              <View style={styles.goalButtons}>
                <Ionicons name="create-outline" size={24} color="#4CAF50" onPress={() => openEditModal(item)} />
                <Ionicons name="trash-outline" size={24} color="red" onPress={() => deleteGoal(item.id!)} />
              </View>
              
            </View>
          )}
      />
      )}

      {/* Add Goal */}
      <MorphingAddGoal onAddGoal={handleAddGoal} />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <ScrollView style={[styles.modalBox, { maxHeight: '90%' }]}>
      <Text style={styles.modalTitle}>Edit Goal</Text>

      {/* Title & Notes */}
      <TextInput value={editTitle} onChangeText={setEditTitle} placeholder="Title" style={styles.modalInput} />
      <TextInput value={editNotes} onChangeText={setEditNotes} placeholder="Notes" style={[styles.modalInput, { height: 100 }]} multiline textAlignVertical="top" />

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowEditDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{editDate.toDateString()}</Text>
      </TouchableOpacity>
      {showEditDatePicker && (
        <DateTimePicker
          value={editDate}
          mode="date"
          display="default"
          onChange={(_, selected) => { setShowEditDatePicker(false); if(selected) setEditDate(selected); }}
        />
      )}

      {/* Time Picker */}
      <TouchableOpacity onPress={() => setShowEditTimePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{editTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})}</Text>
      </TouchableOpacity>
      {showEditTimePicker && (
        <DateTimePicker
          value={editTime}
          mode="time"
          display="default"
          onChange={(_, selected) => { setShowEditTimePicker(false); if(selected) setEditTime(selected); }}
        />
      )}

      {/* Priority */}
      <Text style={styles.label}>Priority:</Text>
      <View style={styles.pickerRow}>
        {(['Low','Medium','High'] as const).map(p => (
          <TouchableOpacity key={p} onPress={() => setEditPriority(p)} style={[styles.priorityButton, editPriority==p && styles.selectedButton]}>
            <Text style={{ color: editPriority===p ? '#000' : '#fff' }}>{p.charAt(0).toUpperCase()+p.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Frequency */}
      <Text style={styles.label}>Frequency:</Text>
      <View style={styles.pickerRow}>
        {(['Daily','Weekly','Monthly'] as const).map(f => (
          <TouchableOpacity key={f} onPress={() => setEditFrequency(f)} style={[styles.frequencyButton, editFrequency===f && styles.selectedButton]}>
            <Text style={{ color: editFrequency===f ? '#000' : '#fff' }}>{f.charAt(0).toUpperCase()+f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Devices */}
      <Text style={[styles.label, { marginTop: 12 }]}>Devices:</Text>
      <FlatList
        data={allDevices}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent:'space-between', marginBottom:12 }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleEditDevice(item._id)} style={[styles.deviceCard, editDevices.includes(item._id) && styles.selectedDevice]}>
            <Text>{item.device_name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Buttons */}
      <View style={styles.modalButtons}>
        <Button title="Save" onPress={saveEdit} />
        <Button title="Cancel" color="red" onPress={() => setEditModalVisible(false)} />
      </View>
    </ScrollView>
  </View>
</Modal>

    </ThemedView>
  );
}

// --- Animated AI Button (matches Add device with AI style) ---
const { width: screenWidth } = Dimensions.get('window');

const Particle = ({ delay, duration }: { delay: number; duration: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0);

      const randomX = (Math.random() - 0.5) * 100;
      const randomY = -50 - Math.random() * 30;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.5 + Math.random() * 0.5, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: randomY, duration: duration, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: randomX, duration: duration, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: duration / 2, delay: duration / 2, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(animate, Math.random() * 2000));
    };
    animate();
  }, [delay, duration, translateY, translateX, opacity, scale]);

  return (
    <Animated.View
      style={{
        position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#ffffff',
        shadowColor: '#667eea', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4,
        transform: [{ translateX }, { translateY }, { scale }], opacity,
      }}
    />
  );
};

function AIButton({ label, onPress }: { label: string; onPress: () => void }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const waveValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glowAnimation = Animated.loop(Animated.sequence([
      Animated.timing(glowValue, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(glowValue, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ]));
    const waveAnimation = Animated.loop(Animated.timing(waveValue, { toValue: 1, duration: 3000, useNativeDriver: true }));
    glowAnimation.start();
    waveAnimation.start();
    return () => { glowAnimation.stop(); waveAnimation.stop(); };
  }, []);

  const handlePressIn = () => {
    Animated.spring(animatedValue, { toValue: 1, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(animatedValue, { toValue: 0, useNativeDriver: true }).start();
    onPress();
  };

  const scale = animatedValue.interpolate({ inputRange: [0, 0.95], outputRange: [0.9, 0.95] });
  const glowOpacity = glowValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const waveScale = waveValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.02, 1] });
  const waveOpacity = waveValue.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.8, 0.8, 0] });

  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <Animated.View style={{ position: 'absolute', width: screenWidth * 0.8, height: 60, borderRadius: 30, backgroundColor: '#667eea', shadowColor: '#667eea', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 10, opacity: glowOpacity }} />
      <Animated.View style={{ position: 'absolute', width: screenWidth * 0.8 + 6, height: 66, borderRadius: 33, borderWidth: 2, borderColor: '#667eea', backgroundColor: 'transparent', opacity: waveOpacity, transform: [{ scale: waveScale }] }} />
      <Animated.View style={{ position: 'absolute', width: screenWidth * 0.8 + 12, height: 72, borderRadius: 36, borderWidth: 1, borderColor: '#764ba2', opacity: waveOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }), transform: [{ scale: waveScale.interpolate({ inputRange: [1, 1.02], outputRange: [1.01, 1.03] }) }] }} />

      <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: 12 }).map((_, idx) => (
          <Particle key={idx} delay={idx * 200} duration={1500 + Math.random() * 1000} />
        ))}
      </View>

      <Animated.View style={{ width: screenWidth * 0.8, height: 60, borderRadius: 30, transform: [{ scale }] }}>
        <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex: 1, borderRadius: 30, overflow: 'hidden' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, backgroundColor: '#667eea' }}>
            <View style={{ marginRight: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, color: '#fff' }}>✨</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text>
            <View style={{ position: 'absolute', right: 16, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' }} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingLeft:16,paddingRight:16,paddingTop:40, backgroundColor: '#ecf6edff',},
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#4CAF50' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
filterButton: { padding: 8, borderRadius: 8, backgroundColor: '#4CAF50' },
selectedFilterButton: { backgroundColor: '#2d6a4f' },

goalStatusRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
statusButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#888' },
selectedStatusButton: { backgroundColor: '#2d6a4f' },
  goalItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 12,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
 
  goalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
   titleColor:{
    color:'#2d6a4f',
  },
  goalNotes: { fontSize: 14, color: '#666', marginVertical: 6 },
  goalMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  priorityText: { fontSize: 12, color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' },
  metaText: { fontSize: 12, color: '#555' },
  devicesRow: { flexDirection: 'row', marginTop: 4 },
  deviceChip: { backgroundColor: '#e0f0ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 6 },
  deviceText: { fontSize: 12, color: '#333' },
  goalButtons: { flexDirection: 'row', gap: 12 },

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
  modalBox: { width: '80%', backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  dateButton: {
    backgroundColor: '#a7c957',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateText: {
    color: '#fff',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#777',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#777',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#a7c957',
  },
  deviceCard: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedDevice: {
    backgroundColor: '#a7c957',
  },
 statusSliderContainer: { marginTop: 8, alignItems: 'center' },
statusLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
statusSliderTrack: { width: 120, height: 32, borderRadius: 16, position: 'relative' },
statusSliderBackground: { flexDirection: 'row', position: 'absolute', width: '100%', height: '100%' },
statusSegment: { flex: 1 },
statusSliderKnob: {
  position: 'absolute',
  width: '50%',
  height: '100%',
  backgroundColor: '#4CAF50',
  borderRadius: 16,
},


});