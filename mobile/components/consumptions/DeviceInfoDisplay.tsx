// components/DeviceInfoDisplay.tsx
import React from 'react';
import { StyleSheet,View,Text } from 'react-native';


interface Device {
    id: string;
    device_name: string;
    location: string;
    powerUsage: number;
}

interface DeviceInfoDisplayProps {
    device: Device;
    hours: string;
    minutes: string;
}

export default function DeviceInfoDisplay({ device, hours, minutes }: DeviceInfoDisplayProps) {
    const totalHours = parseFloat(hours || '0') + parseFloat(minutes || '0') / 60;
    const estimatedConsumption = (device.powerUsage * totalHours) / 1000;

    return (
        <View style={styles.deviceInfoContainer}>
            <Text style={styles.deviceInfoTitle}>Device Info:</Text>
            <Text style={styles.deviceInfoText}>
                Power: {device.powerUsage}W
            </Text>
            <Text style={styles.deviceInfoText}>
                Location: {device.location}
            </Text>
            {totalHours > 0 && (
                <Text style={styles.deviceInfoText}>
                    Estimated consumption: {estimatedConsumption.toFixed(3)} kWh
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    deviceInfoContainer: {
        backgroundColor: '#F0F9F4',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    deviceInfoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d6a4f',
        marginBottom: 8,
    },
    deviceInfoText: {
        fontSize: 14,
        color: '#2d6a4f',
        marginBottom: 4,
    },
});