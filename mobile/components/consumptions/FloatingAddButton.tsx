// components/FloatingAddButton.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity,Text } from 'react-native';


interface FloatingAddButtonProps {
    onPress: () => void;
}

export default function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
    return (
        <TouchableOpacity
            style={styles.floatingButton}
            onPress={onPress}
        >
            <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        backgroundColor: '#2d6a4f',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    floatingButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});