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
}

export const PagerBody: React.FC<PagerBodyProps> = ({
    onSelect,
    onBack,
    onNavigateUp,
    onNavigateDown,
    onMenu,
    onNavigateLeft,
    onNavigateRight
}) => {
    return (
        <View style={styles.wrapper}>
            {/* Outer metallic frame - matching button style */}
            <LinearGradient
                colors={['#000', '#A0A0A0']}
                style={styles.outerGradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            >
                {/* Inner highlight layer - matching button style */}
                <LinearGradient
                    colors={['#FAFAFA', '#d1d1d1ff', '#d1d1d1ff']}
                    style={styles.innerGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
                
                {/* Main body surface - matching button style */}
                <LinearGradient
                    colors={['#d1d1d1ff', '#d1d1d1ff']}
                    style={styles.bodyGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                >
                    {/* Inner black recessed area */}
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
                                />
                                
                            </View>
                        </LinearGradient>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: '60%',
        position: 'relative',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    outerGradient: {
        flex: 1,
        borderRadius: 20,
        padding: 1.25,
    },
    innerGradient: {
        position: 'absolute',
        top: 1,
        left: 1,
        right: 1,
        bottom: 1,
        borderRadius: 20,
    },
    bodyGradient: {
        flex: 1,
        // margin: 2.5,
        borderRadius: 18,
        padding: 16,
        paddingBottom: 32,
        overflow: 'hidden',
    },
    innerRecess: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        // Inner shadow effect for depth
        // borderWidth: 2,
        borderTopColor: '#2a2a2a',
        borderLeftColor: '#2a2a2a',
        borderRightColor: '#0a0a0a',
        borderBottomColor: '#0a0a0a',
    },
    recessGradient: {
        flex: 1,
    },
    contentArea: {
        flex: 1,
        justifyContent: 'flex-start',
        position: 'relative',
    },
    logoContainer: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});
