import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NumPad } from './NumPad';

interface PagerBodyProps {
    onSelect: () => void;
    onBack: () => void;
    onNavigateUp: () => void;
    onNavigateDown: () => void;
    onMenu: () => void;
    onNavigateLeft?: () => void;
    onNavigateRight?: () => void;
    onNumberPress?: (number: string) => void;
    onCall?: () => void;
    soundEnabled?: boolean;
    vibrateEnabled?: boolean;
}

export const PagerBody: React.FC<PagerBodyProps> = ({
    onSelect,
    onBack,
    onNavigateUp,
    onNavigateDown,
    onMenu,
    onNavigateLeft,
    onNavigateRight,
    onNumberPress,
    onCall,
    soundEnabled = true,
    vibrateEnabled = true
}) => {
    return (
        <View style={styles.wrapper}>
            <View style={styles.innerRecess}>
                <LinearGradient
                    colors={['#c1c1c1ff', '#c1c1c1ff', '#c1c1c1ff']}
                    style={styles.recessGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <View style={styles.contentArea}>
                        <NumPad
                            onSelect={onSelect}
                            onBack={onBack}
                            onNavigateUp={onNavigateUp}
                            onNavigateDown={onNavigateDown}
                            onMenu={onMenu}
                            onNavigateLeft={onNavigateLeft}
                            onNavigateRight={onNavigateRight}
                            onNumberPress={onNumberPress}
                            onCall={onCall}
                            soundEnabled={soundEnabled}
                            vibrateEnabled={vibrateEnabled}
                        />
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        borderRadius: 20,
        borderBottomEndRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        margin: 12,
        marginTop: 0,
    },
    innerRecess: {
        flex: 1,
        borderRadius: 14,
        borderBottomLeftRadius: "15%",
        borderBottomRightRadius: "15%",
        overflow: 'hidden',
    },
    recessGradient: {
        flex: 1,
    },
    contentArea: {
        flex: 1,
    },
});
