// components/StatsContainer.tsx
import React from 'react';
import { StyleSheet,Text,View } from 'react-native';



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

interface StatsContainerProps {
    consumptionRecords: ConsumptionRecord[];
    devices: Device[];
}

export default function StatsContainer({ consumptionRecords, devices }: StatsContainerProps) {
    const calculateTotalConsumption = (): string => {
        const total = consumptionRecords.reduce((sum, record) => sum + record.energyConsumed, 0);
        return total.toFixed(3);
    };

    const calculateCost = (): string => {
        const totalKwh = parseFloat(calculateTotalConsumption()) / 1000;
        const costPerKwh = 30;
        return (totalKwh * costPerKwh).toFixed(2);
    };

    return (
        <>
            {/* Header Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {calculateTotalConsumption()} Wh
                    </Text>
                    <Text style={styles.statLabel}>Total Consumption</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        LKR {calculateCost()}
                    </Text>
                    <Text style={styles.statLabel}>Est. Cost</Text>
                </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text >Energy Records</Text>
                <Text style={styles.subtitle}>
                    Track your device usage and consumption
                </Text>
            </View>

            {/* Bottom Stats */}
            <View style={styles.bottomStats}>
                <View style={styles.bottomStatCard}>
                    <Text style={styles.bottomStatNumber}>
                        {consumptionRecords.length}
                    </Text>
                    <Text style={styles.bottomStatLabel}>Total Records</Text>
                </View>
                <View style={styles.bottomStatCard}>
                    <Text style={styles.bottomStatNumber}>
                        {devices.length}
                    </Text>
                    <Text style={styles.bottomStatLabel}>Available Devices</Text>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#10B981',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 4,
    },
    titleContainer: {
        marginBottom: 20,
        padding: 10,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        marginTop: 4,
    },
    bottomStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 10,
    },
    bottomStatCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    bottomStatNumber: {
        fontSize: 24,
        color: '#F59E0B',
    },
    bottomStatLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 4,
        color: '#64748B',
    },
});