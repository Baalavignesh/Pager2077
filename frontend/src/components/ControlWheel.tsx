import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ControlWheelProps {
    onSelect: () => void;
    onBack: () => void;
    onNavigateUp: () => void;
    onNavigateDown: () => void;
    onMenu: () => void;
}

export const ControlWheel: React.FC<ControlWheelProps> = ({
    onSelect,
    onBack,
    onNavigateUp,
    onNavigateDown,
    onMenu
}) => {
    return (
        <View style={styles.controlWheel}>
            {/* Outer ring */}
            <View style={styles.outerRing}>
                {/* Top - Up Arrow */}
                <Pressable 
                    style={[styles.button, styles.topButton]}
                    onPress={onNavigateUp}
                >
                    <Text style={styles.arrow}>⇡</Text>
                </Pressable>

                {/* Right - Green Select Dot */}
                <Pressable 
                    style={[styles.button, styles.rightButton]}
                    onPress={onSelect}
                >
                    {/* <View style={[styles.dot, styles.greenDot]} /> */}
                    <Text style={styles.btnText}>SELECT</Text>
                </Pressable>

                {/* Bottom - Down Arrow */}
                <Pressable 
                    style={[styles.button, styles.bottomButton]}
                    onPress={onNavigateDown}
                >
                    <Text style={styles.arrow}>⇣</Text>
                </Pressable>

                {/* Left - Red Back Dot */}
                <Pressable 
                    style={[styles.button, styles.leftButton]}
                    onPress={onBack}
                >
                    {/* <View style={[styles.dot, styles.redDot]} /> */}
                                        <Text style={styles.btnText}>BACK</Text>

                </Pressable>
            </View>

            {/* Center Menu Button */}
            <Pressable 
                style={styles.centerButton}
                onPress={onMenu}
            >
                {/* <Text style={styles.menuText}>MENU</Text> */}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    controlWheel: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    outerRing: {
        width: 280,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#434343ff',
        borderWidth: 2,
        borderColor: '#d1d1d1ff',
        position: 'relative',
    },
    button: {
        position: 'absolute',
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    topButton: {
        top: 0,
        left: '50%',
        marginLeft: -22,
    },
    rightButton: {
        right: 18,
        top: '50%',
        marginTop: -22,
    },
    bottomButton: {
        bottom: 0,
        left: '50%',
        marginLeft: -22,
    },
    leftButton: {
        left: 16,
        top: '50%',
        marginTop: -22,
    },
    arrow: {
        fontSize: 20,
        color: '#c6c6c6ff',
        fontWeight: 'bold',
    },
    btnText: {
        fontSize: 8,
        color: '#c6c6c6ff',
        fontWeight: 'bold',
        fontFamily: "Chicago"
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    greenDot: {
        backgroundColor: '#4CAF50',
    },
    redDot: {
        backgroundColor: '#F44336',
    },
    centerButton: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#d1d1d1ff',
        justifyContent: 'center',
        alignItems: 'center',
        top: '50%',
        left: '50%',
        marginTop: -40,
        marginLeft: -40,
    },
});
