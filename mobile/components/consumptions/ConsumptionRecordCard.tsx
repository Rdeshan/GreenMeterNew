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
            <View style={styles.deviceCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.deviceIconRound}>
                        <Text style={styles.iconText}>{getDeviceIcon(record.device_name)}</Text>
                    </View>
                    <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{record.device_name}</Text>
                        <Text style={styles.deviceMeta}>
                            ⏱ {record.hours}h {record.minutes}m • ⚡ {device?.powerUsage}W
                        </Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit?.(record)}>
                            <Text style={styles.actionBtnText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete?.(record.id)}>
                            <Text style={styles.actionBtnText}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <View style={styles.statsRow}> 
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Energy</Text>
                            <Text style={styles.statValue}>{record.energyConsumed.toFixed(3)} kWh</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Units</Text>
                            <Text style={styles.statValue}>{(record.energyConsumed/1000).toFixed(2)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Created</Text>
                            <Text style={styles.statValue}>{record.timestamp.toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    deviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 12,
    },
    deviceIconRound: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F9F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconText: { fontSize: 22 },
    deviceInfo: { flex: 1 },
    deviceName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    deviceMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionBtn: { padding: 8 },
    actionBtnText: { fontSize: 16 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' },
    statValue: { fontSize: 14, color: '#374151', fontWeight: '600', marginTop: 2 },
});