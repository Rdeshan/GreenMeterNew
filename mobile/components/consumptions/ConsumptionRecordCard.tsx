// components/ConsumptionRecordCard.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity,View,Text } from 'react-native';
import { router } from 'expo-router';

interface ConsumptionRecord {
    id: string;
    deviceId: string;
    device_name: string;
    hours: number;
    minutes: number;
    energyConsumed: number;
    timestamp: Date;
}

interface Device {
    id: string;
    device_name: string;
    location: string;
    powerUsage: number;
}

interface ConsumptionRecordCardProps {
    record: ConsumptionRecord;
    device?: Device;
    onEdit?: (record: ConsumptionRecord) => void;
    onDelete?: (recordId: string) => void;
}

export default function ConsumptionRecordCard({ record, device, onEdit, onDelete }: ConsumptionRecordCardProps) {

    const getDeviceIcon = (deviceName: string): string => {
        const name = deviceName.toLowerCase();
        if (name.includes('bulb') || name.includes('light')) return '💡';
        if (name.includes('tv') || name.includes('television')) return '📺';
        if (name.includes('air') || name.includes('ac')) return '❄️';
        if (name.includes('fridge') || name.includes('refrigerator')) return '🧊';
        if (name.includes('wash')) return '👕';
        if (name.includes('microwave')) return '🔥';
        return '⚡';
    };

    return (
        <TouchableOpacity onPress={() => router.push(`/consumption-detail/${record.id}` as any)}>
        <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
                <View style={styles.deviceIcon}>
                    <Text style={styles.deviceIconText}>
                        {getDeviceIcon(record.device_name)}
                    </Text>
                </View>
                <View style={styles.recordInfo}>
                    <Text style={styles.categoryText}>
                        Category: Electricity
                    </Text>
                    <Text style={styles.device_name}>
                        Device name: {record.device_name}
                    </Text>
                    <Text style={styles.recordDetails}>
                        Active for: {record.hours}h {record.minutes}m
                    </Text>
                    <Text style={styles.recordDetails}>
                        Power usage: {device?.powerUsage}W
                    </Text>
                    <Text style={styles.recordDetails}>
                        Energy consumed: {record.energyConsumed.toFixed(3)} kWh
                    </Text>
                    <Text style={styles.statusText}>
                        Units burned {(record.energyConsumed/1000).toFixed(2)}
                    </Text>
                    <Text style={styles.statusText}>
                        Created At {record.timestamp.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.recordActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onEdit?.(record)}
                    >
                        <Text style={styles.actionButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onDelete?.(record.id)}
                    >
                        <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    recordCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    recordHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    deviceIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    deviceIconText: {
        fontSize: 20,
    },
    recordInfo: {
        flex: 1,
    },
    categoryText: {
        fontSize: 10,
        textTransform: 'uppercase',
        opacity: 0.6,
        letterSpacing: 0.5,
        color: '#64748B',
    },
    device_name: {
        fontSize: 16,
        marginTop: 2,
        marginBottom: 4,
        color: '#1E293B',
    },
    recordDetails: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 2,
        color: '#475569',
    },
    statusText: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
        color: '#64748B',
    },
    recordActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    actionButtonText: {
        fontSize: 16,
    },
});