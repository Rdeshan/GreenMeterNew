import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { DeviceItem } from "@/components/device_management/display_home/type/DeviceItem";

type EditDeviceModalProps = {
  visible: boolean;
  device: DeviceItem | null;
  onClose: () => void;
  onSave: (updated: DeviceItem) => void;
  saving: boolean;
};

export default function EditDeviceModal({
  visible,
  device,
  onClose,
  onSave,
  saving,
}: EditDeviceModalProps) {
  const [formData, setFormData] = useState({
    device_name: "",
    type: "",
    location: "",
    consumption: 0,
  });

  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name || "",
        type: device.type || "",
        location: device.location || "",
        consumption: device.consumption || 0,
      });
    }
  }, [device]);

  const handleChange = (key: keyof DeviceItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (device) {
      onSave({ ...device, ...formData });
    }
  };

  if (!visible || !device) return null;

  return (
    <SafeAreaView style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Device</Text>

            <TextInput
              style={styles.input}
              value={formData.device_name}
              onChangeText={(t) => handleChange("device_name", t)}
              placeholder="Device name"
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              value={formData.type}
              onChangeText={(t) => handleChange("type", t)}
              placeholder="Type (e.g., Electric)"
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(t) => handleChange("location", t)}
              placeholder="Location"
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              value={String(formData.consumption)}
              onChangeText={(t) =>
                handleChange("consumption", t === "" ? 0 : Number(t) || 0)
              }
              placeholder="Consumption (Watts)"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 16,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#16a34a",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
